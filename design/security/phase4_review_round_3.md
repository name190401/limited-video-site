# Security/機能 Review — Phase 1+2+4 Round 3

レビュアー: security-reviewer（独立・攻撃者視点・ゼロベース再検証）
対象ルート: `/Users/hajime/Desktop/限定公開/video-site/`
日時基準: JST 2026-05-29
前提: R1=FAIL（レガシー `app/api/password/route.js`・`components/auth/PasswordGate.js` 残存）→ 2ファイル削除 → R2=PASS。本 R3 が PASS なら **R2+R3 連続2ラウンドPASS** 成立。R2 PASS に依存せず実ファイルを全て開いて再突合した。

## 総合判定: PASS

10カテゴリすべて閾値クリア。レガシー2ファイルは実体・git追跡・参照のすべてで消失を再確認。ビルド Route 一覧は API 3本のみ（`/api/password` 不在）。service-role キー / Layer2 youtube_id はクライアントバンドル・SSR 経路に検出0。

---

## レガシー消失の再確認（R1 致命要因の恒久確認）

| 項目 | コマンド | 結果 |
|------|---------|------|
| `app/api/password` 不在 | `find app/api/password` | `No such file or directory` ✓ |
| `components/auth` 不在 | `find components/auth` | `No such file or directory` ✓ |
| コード参照0 | `grep -rn "api/password\|PasswordGate" app components lib` | EXIT=1（一致0）✓ |
| git 追跡からも消失 | `git ls-files app/api/password components/auth` | 出力空（追跡0）✓ |
| API 3本のみ | `find app -name route.js` | `auth/layer1`・`auth/plan`・`plan/content` の3本のみ ✓ |
| ビルド Route 一覧 | `npm run build` | `λ /api/auth/layer1`・`λ /api/auth/plan`・`λ /api/plan/content` のみ。`/api/password` 行なし ✓ |
| admin live route 不在 | `find app/api/admin` | `No such file or directory` ✓ |
| `app/api/verify` 不在 | `find app -name verify*` / `grep "api/verify"` | 一致0 ✓ |

---

## カテゴリ別判定

| # | カテゴリ | 結果 | 証跡 |
|---|----------|------|------|
| 1 | 動画ID非漏洩 | ✓ | `getSectionVideos`/`getAllSectionVideos`（`lib/content.js:32-38,50-56`）が `protection==='layer2'` 行の `youtube_id` を `null` 化し `locked:true`。実IDは `getPlanVideos`（同 64-74）のみが返し、それは `app/api/plan/content/route.js` のトークン検証後（GET 14-21）からしか呼ばれない。クライアントバンドル `.next/static/.../page-*.js` を確認＝PlanSection は `youtube_id` を fetch 結果(`d.videos`)からのみ参照（ビルド埋め込みなし）。`grep getPlanVideos\|layer2 .next/static`＝EXIT=1（検出0）。seed（migration 149-151）の plan行は coming_soon かつ youtube_id 未設定で漏洩元なし。 |
| 2 | トークン署名・失効 | ✓ | `lib/auth/layer2.js`：`issuePlanToken`(25-32) が `signToken` で HMAC 署名＋`d=JST日付`＋`exp=JST24:00エポック`を埋込。`verifyPlanToken`(39-47) は ①署名 `verifyToken` ②`t==='plan'` ③`p.d===getJstDateString()`（前日トークン拒否）④`p.exp>nowEpoch()` を全AND。改竄→`crypto.subtle.verify` false→`verifyToken` null→`/api/plan/content` 401（route 16-21）。署名は `lib/crypto-token.js:60-78` の `crypto.subtle.verify`（定数時間）。 |
| 3 | Layer1 Cookie/Edge互換 | ✓ | `layer1CookieOptions`（`lib/auth/layer1.js:34-42`）= httpOnly/secure(prod)/sameSite lax/path=/。検証 `verifyLayer1CookieValue`(27-31) は `verifyToken`(Web Crypto) のみ。Edge鎖（`middleware.js`→`lib/auth/layer1.js`→`lib/crypto-token.js`→`lib/date.js`）に node `crypto` も `server-only-guard` も**無し**（`grep "from 'crypto'\|server-only-guard" これら3ファイル`＝EXIT=1）。node `crypto`/guard は Node ランタイム専用ファイル群（ratelimit/server/password/admin/content/settings）にのみ存在し middleware から到達不能。matcher(40) が `api/` と静的を除外、`/enter`・`/admin` のみ exempt（14-16）。 |
| 4 | レート制限の実効 | ✓ | `lib/ratelimit.js`：Supabase `rate_limits` テーブルへ `upsert`/`delete`（69-78）で永続カウント。メモリ内カウンタ不使用。キー `scope:ip:jstDate`(35)。ロック中は429（layer1 route 19-24=max20、plan route 26-31=max10）。`registerFailure` が attempts>=max で `locked_until` 設定(67-68)。 |
| 5 | service-roleキー秘匿 | ✓ | `lib/supabase/admin.js`：先頭 `import '../server-only-guard'`(1)、`SUPABASE_SERVICE_ROLE_KEY`(17) を `NEXT_PUBLIC_` でなく直接参照。**サニタイズ実証**：sentinel 値 `service_role_key_SENTINEL_12345` でビルド後 `grep -rn ... .next/static`＝EXIT=1、`.next` 全体でも検出0（実行時 process.env 読みのためバンドル非混入）。client component からの import 無し（content/ratelimit/settings/admin は全て server-only-guard 配下）。 |
| 6 | RLS 公開ポリシー0 | ✓ | `002_rebuild_schema.sql:105-110`：sections/instructors/videos/faqs/settings/rate_limits の6テーブル全てに `enable row level security`。`create policy` 文は SQL 全体に0件（111行コメントで「意図的に書かない」）。旧 profiles/auth ベースは drop（14-22）。→ anon/browser から直接読取不可、service-role のみ。 |
| 7 | 管理API認可 | ✓ | `app/api/admin/*` は**未実装＝不在**（`find app/api/admin`＝Not found）。Phase 5 未着手。現状 DB 書込み API は公開されておらず未認証経路なし。`verifyAdminPassword`（`lib/auth/server.js:33-36`）は定数時間比較で準備済（Phase 5 で各ハンドラ冒頭検証に使う前提）。スコープ上の管理 live route 不在を確認。 |
| 8 | JST境界 | ✓ | `lib/date.js`：`+9h` して UTC暦日読み(17-24)。node 検証 → UTC05-29 00:00(=JST09:00)=05-29（境界跨がず）、UTC05-28 14:59(JST23:59)=05-28、UTC05-28 15:00(JST00:00)=05-29。`getJstMidnightExpiryEpoch` は JST23:59 時点で 2026-05-28T15:00:00Z（=JST翌0:00）を返し exp>now（残≈60秒）。UTC0:00で日付不変・JST24:00で前日失効を実証。 |
| 9 | 入力・エラー処理 | ✓ | Layer1=`safeEqual`定数時間風（長さ差即false・XOR累積、`lib/auth/server.js:10-16`）、Layer2 日替わり=`crypto.timingSafeEqual`＋長さ事前チェック（`lib/password.js:67-75`）。`/api/plan/content` は 200/401 とも `Cache-Control: no-store`（route 19,26）。各 route の catch は `{error:'server_error'}` 500 でスタック非露出（layer1 37-39 / plan 43-45）。 |
| 10 | 依存整合 | ✓(⚠1) | `@supabase/ssr` が package.json に残存するが `createServerClient`/`createBrowserClient`/`supabase.auth`/`auth.uid`/`signInWith` の参照は全て0（grep EXIT=1）。anon キー client も無し（`createClient` は admin.js の service-role 1箇所のみ）。Supabase Auth 残骸・重複 `api/verify` 無し。`@supabase/ssr` は未使用依存=セキュリティ脅威ではないが cleanup 推奨（⚠）。 |

---

## 新観点での粗探し（前2ラウンドの見落とし確認）

- **`getInstructors`(`lib/content.js:76-86) が `youtube_id` を無条件 select** → 講師紹介/クロージング動画は要件上 layer1（共通PW通過後に視聴可）であり layer2 保護対象ではない。`instructors` テーブルに protection 概念は無く、Layer1 Cookie 通過済みユーザー向けの公開動画。スコープ（Layer2 保護IDの非漏洩）の違反ではない。✓（要件内）
- **PlanSection の "localStorage は使わない"** はソースのコメント文字列のみ（grep一致は doc コメント）。実コードに localStorage 使用なし。Cookie ベースのみ。✓
- **`planCookieOptions` の maxAge** = `getJstMidnightExpiryEpoch()-nowEpoch()` を下限60秒でクランプ(layer2.js:51)。Cookie 自体が JST24:00 で失効し、かつ token 内 `exp`/`d` でも二重に当日限定。✓
- **middleware exempt の `/admin`** は Layer1 免除だが、Phase5 で admin 自前PWゲート前提。現状 `/admin` ルート未実装のため到達先なし。スコープ上の穴ではない。✓
- **`getSitePassword`/`getAdminPassword` の DB→ENV フォールバック**(settings.js:31-46) は設計どおり。DB 値は service-role 経由でのみ取得。✓
- **client bundle 実体 grep**：`page-*.js` を全文確認し、youtube_id 11桁リテラル・secret・layer2 文字列いずれも非混入を目視＋grep двойで確認。✓

新規の致命的欠陥（✗）は検出されなかった。

## PASS の場合のコメント（特に堅牢だった点）

1. **Edge/Node ランタイム分離が厳密**：同型な `crypto-token.js`/`layer1.js`/`date.js`（Web Crypto のみ）と server-only な照合・DB層を明確に分け、middleware の Edge 鎖に node `crypto`/`server-only-guard` が一切混入しない（grep で実証）。Layer1 Cookie 検証が Edge で確実に動く構造。
2. **Layer2 youtube_id の出口が単一**：`getPlanVideos` をトークン検証後の `/api/plan/content` 経由に限定し、通常取得経路では必ず `null` 化。クライアントバンドル・SSR・seed のどこにも実IDが乗らない多層防御。
3. **トークンの三重失効**（署名・`d===今日`・`exp>now`）と JST 単一真実（`lib/date.js`）により、前日トークン流用・UTC ずれ事故を構造的に封じている。

---

## 静的・動的証跡コマンドログ（抜粋）

```
$ find app/api/password ; find components/auth
bfs: error: app/api/password: No such file or directory.
bfs: error: components/auth: No such file or directory.

$ grep -rn "api/password\|PasswordGate" app components lib   → EXIT=1（0件）
$ git ls-files app/api/password components/auth              → （空）
$ find app -name route.js
app/api/auth/layer1/route.js / app/api/auth/plan/route.js / app/api/plan/content/route.js

$ npm run build  (Route 一覧)
λ /  λ /api/auth/layer1  λ /api/auth/plan  λ /api/plan/content  ○ /enter
ƒ Middleware 42.1 kB    （/api/password 行なし）

$ grep -rn "service_role_key_SENTINEL_12345" .next/static    → EXIT=1（0件）
$ grep -rln "service_role_key_SENTINEL_12345" .next          → EXIT=1（0件）
$ grep -rn "getPlanVideos\|layer2" .next/static              → EXIT=1（0件）

$ grep "from 'crypto'\|server-only-guard" lib/crypto-token.js lib/auth/layer1.js lib/date.js  → EXIT=1（0件＝Edge安全）

$ node (JST境界) →
  UTC05-29 00:00(JST09:00)=2026-05-29 / UTC05-28 14:59=2026-05-28 / UTC05-28 15:00=2026-05-29
  expiry(JST05-28 23:59)=2026-05-28T15:00:00Z  exp>now=true

$ grep -rn "@supabase/ssr" app components lib middleware.js   → EXIT=1（未使用）
```
