# Security/機能 Review — Phase 1+2+4 Round 2（確認ラウンド）

レビュー対象: Phase 1（Layer1 認証＋middleware）/ Phase 2（データ層・スキーマ）/ Phase 4（Layer2 プラン配信＋レート制限）
ラウンド: Round 2（連続2ラウンドPASSの2本目・確認ラウンド）
レビュア: security-reviewer（攻撃者視点・PASS/FAIL二値・疑わしきはFAIL）
日時: 2026-05-29

## 総合判定: **PASS**

Round 1 の致命 3✗ の根因（レガシー `app/api/password/route.js` と `components/auth/PasswordGate.js`）は
実ファイル・grep・ビルド Route 一覧の3経路すべてで **完全消失** を確認。10カテゴリ全てを実ファイル突合＋
静的/動的証跡で再実証し、閾値割れ・✗ともに **0件**。甘さ排除のためゼロベースで再検証済み。

---

## レガシー削除の確認（Round 1 FAIL 根因の解消）

| 検証 | 証跡 | 結果 |
|------|------|------|
| `app/api/password/route.js` 実在しない | `ls app/api/password` → `No such file or directory` | ✓ |
| `components/auth/PasswordGate.js` 実在しない | `ls` → `No such file or directory`／`components/auth` ディレクトリ自体が無い | ✓ |
| `find` で両者ヒット無し | `find app components -iname "*password*"` → 0行／`find . -iname "*PasswordGate*"` → 0行 | ✓ |
| `grep -rn "api/password" app components lib` = 0件 | exit=1（ヒット0） | ✓ |
| `grep -rn "PasswordGate"`（node_modules/.next 除く）= 0件 | exit=1（ヒット0） | ✓ |
| ビルド Route 一覧に `/api/password` 無し | `next build` 出力に `/api/auth/layer1`・`/api/auth/plan`・`/api/plan/content` の **3本のみ** | ✓ |
| ビルド成果物に `api/password`/`PasswordGate`/`api/verify` 痕跡無し | `grep -rln ... .next`（.map除く）→ 0件 | ✓ |

`app/api` 配下の live route は **3本のみ**：
```
app/api/auth/layer1/route.js
app/api/auth/plan/route.js
app/api/plan/content/route.js
```

---

## カテゴリ別判定

| # | カテゴリ | 結果 | 証跡 |
|---|----------|------|------|
| 1 | 動画ID非漏洩 | ✓ | `app/(member)/page.js:34` `planOpen = v('plan').filter(x=>!x.locked && x.youtube_id)`（layer1のみ）。`lib/content.js:33-37,50-56` で layer2 行は `youtube_id:null, locked:true` に伏せる。layer2 実IDの出口は `/api/plan/content`（`getPlanVideos()`）のみで、これは `verifyPlanToken` 通過後。seed（002）に layer2 の `youtube_id` 値は1件も無く、`.next/static` に youtube ID リーク経路なし |
| 2 | トークン署名・失効 | ✓ | `lib/auth/layer2.js:25-32` HMAC署名トークンに `d=JST日付`・`exp=JST24:00エポック` 埋込み。`:39-47` で `t!=='plan'`／`d!==今日`／`exp<=now` を全て拒否。`lib/crypto-token.js:60-77` `verifyToken` が署名不一致・不正形式で `null`（=401）。`/api/plan/content` は token無効で 401（`route.js:14-21`） |
| 3 | Layer1 Cookie | ✓ | `lib/auth/layer1.js:34-42` httpOnly/secure(prod)/sameSite=lax/path=/。検証は `verifyLayer1CookieValue`→`crypto-token.verifyToken`（Web Crypto `crypto.subtle.verify`＝定数時間）。`middleware.js` は Node `crypto` を import せず Web Crypto のみ＝Edge互換。未署名/改竄は `verifyToken` が null→`/enter` リダイレクト |
| 4 | レート制限の実効 | ✓ | `lib/ratelimit.js` Supabase `rate_limits` テーブルで永続カウント（メモリ内カウンタ不使用）。キー `${scope}:${ip}:${jstDate}`（`:35`）。layer2=10回/15分（`api/auth/plan/route.js:19-25`）、layer1=20回/15分（`api/auth/layer1/route.js:12-18`）、閾値到達で `locked_until` 設定→`allowed:false`→429 |
| 5 | service-roleキー秘匿 | ✓ | `lib/supabase/admin.js:1` `import '../server-only-guard'`。`SUPABASE_SERVICE_ROLE_KEY` 文字列は `.next/static`（クライアント）に **0件**（server bundle のみ、かつ `process.env.SUPABASE_SERVICE_ROLE_KEY` 参照でリテラル値はインライン化されない）。実キー値(len41)を `.next/static` で grep → **NO LEAK**。client componentからの supabase/admin/content/settings import **0件** |
| 6 | RLS | ✓ | `002_rebuild_schema.sql:105-110` 全6テーブル（sections/instructors/videos/faqs/settings/rate_limits）に `enable row level security`。`:111` コメント通り `create policy` は **意図的に1件も無し**（公開 select ポリシー0）→ anon/browser 直読不可。旧 `auth.users` トリガ・`profiles`・`handle_new_user` は冒頭で drop |
| 7 | 管理API認可 | ✓ | `app/api/admin/*` の live route は **存在しない**（`find app/api -path "*admin*" -name route.js` → 0件、`find app -path "*admin*"` → 0件）。Phase 5 未実装であり、認可漏れの admin エンドポイントは残存していない。middleware は `/admin` を Layer1 免除するが、保護対象の live admin ルート自体が無いため現状リスク無し |
| 8 | JST境界 | ✓ | `lib/date.js` が単一の真実。Node 実検証：UTC0:00 May29(=JST9:00)→`2026-05-29`（前日にならず）、UTC15:00(=JST24:00)→`2026-05-30` でロール、`getJstMidnightExpiryEpoch` は常に次のJST深夜（UTC15:00）を返す。トークン `exp` と日替わりパス日付が同一基準 |
| 9 | 入力・エラー処理 | ✓ | Layer1: `lib/auth/server.js:10-16` `safeEqual` XOR定数時間比較（長さ先チェック）。Layer2: `lib/password.js:67-75` `crypto.timingSafeEqual`（長さ差は先に false）。例外は全 catch で `{error:'server_error'}` の500のみ（stack非開示・`route.js:37-39,43-45`）。`/api/plan/content` は 401/200 とも `Cache-Control: no-store`（`route.js:19,26`） |
| 10 | 依存整合 | ✓ | Supabase Auth 残骸: `auth.uid/@supabase/ssr/auth-helpers/signInWith/supabase.auth/getSession/onAuthStateChange` の grep → **0件**。重複API `api/verify` → 0件。孤立クライアント PasswordGate → 0件。`createClient` は `lib/supabase/admin.js`（service-role・server-only）のみ。client component の server-only import → 0件。`next build` 成功（型・lint通過） |

---

## 動的証跡（サーバ未起動のためビルド成果物＋コード根拠で代替・明記）

開発サーバ起動による live `curl` は未実施。代替として `next build` 成果物の静的 grep（鍵・ID・削除確認）と
コード経路の突合、JST境界の Node 実行検証で実証した。401/429/no-store/Cookie属性はコード行で確定済み。

主要コマンド出力:
- `next build` → `✓ Compiled successfully`、Route一覧に API 3本のみ、Middleware 42.1kB
- `.next/static` の SUPABASE_SERVICE_ROLE_KEY 文字列 → 0件 / 実キー値 → NO LEAK
- 5種シークレット値（PLAN_TOKEN_SECRET/SESSION_SECRET/PASSWORD_SECRET_KEY/ADMIN_PASSWORD/SITE_PASSWORD）→ いずれも `.next/static` で NO LEAK

---

## PASS の場合のコメント（特に堅牢だった点）

1. **同型(isomorphic)分割が正しく機能**：`crypto-token.js` を Web Crypto 縛りにし、Cookie検証ロジック（layer1.js/layer2.js）を server-only から分離したことで middleware が Edge 互換のまま定数時間署名検証を実現。Node `crypto` の混入も grep で0確認。
2. **layer2 ID の単一出口設計が二重に堅牢**：`getSectionVideos`/`getAllSectionVideos` が layer2 を構造的に null 化し、さらに SSR 側 `planOpen` フィルタで二重に layer1 限定。実IDは token検証後の `/api/plan/content` のみ。seed にも layer2 ID 不在で攻撃面ゼロ。
3. **RLS の「公開ポリシー0」徹底**：全テーブル RLS 有効＋ポリシー意図的に未作成という最も安全側の設計で、anon キー経路が存在しても直読不能。
