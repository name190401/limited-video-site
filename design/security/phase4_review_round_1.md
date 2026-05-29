# Security/機能 Review — Phase 1+2+4 (＋3一部) Round 1

対象: Phase 1（Layer1 認証）/ Phase 2（データ層・RLS）/ Phase 4（Layer2 プラン配信・レート制限）＋ Phase 3 の「保護 ID をクライアントへ出さない」部分。
レビュアー: security-reviewer（攻撃者視点・PASS/FAIL 二値・実ファイル突合・疑わしきは FAIL）。

## 総合判定: FAIL

致命的理由（3行以内）:
1. レガシー API `app/api/password/route.js` が live route として残存（build 出力 `λ /api/password`）。管理者 PW を `adminPassword !== expectedAdminPassword`（**非定数時間・ENV直叩き・DB settings 無視**）で照合し、誤入力でも **HTTP 200** を返す（カテゴリ7・9・10 で ✗）。
2. このエンドポイントは認証成功時に **7 日分の日替わりパス（getPasswordsForDays）を JSON で返す** — Layer2 を突破する高価値リーク経路。レート制限も無い。
3. 孤立クライアント `components/auth/PasswordGate.js` が存在しない `/api/password/verify` を叩き、`sessionStorage` に認証フラグを置く旧 Layer2 思想の残骸（カテゴリ10 ✗）。

> Phase 1/2/4 の**新規実装コア（layer1/plan/content・crypto-token・date・ratelimit・content・RLS・middleware）は全て閾値クリア**。FAIL の原因はリビルドで削除されるべきレガシー資産の残存（カテゴリ10）と、それに付随する 7・9 違反。新規コードのロジック自体は堅牢。

## カテゴリ別判定

| # | カテゴリ | 結果 | 証跡 |
|---|----------|------|------|
| 1 | 動画ID非漏洩 | ✓ | `content.js:33-38,50-55` layer2 行は `youtube_id:null,locked:true`。出口は `/api/plan/content` のみで `verifyPlanToken` 後に `getPlanVideos()`（`route.js:14-23`）。`page.js:34` planOpen=`!x.locked && x.youtube_id`（layer2 不混入）。`PlanSection.js`：locked 時 `planVideos=[]`、ID は `/api/plan/content` から取得（埋め込み無し）。`grep -rln "eyJ\|service_role" .next/static` → 検出0。現 DB の plan 動画は coming_soon/id=null のため SSR HTML にも実 ID 無し。 |
| 2 | トークン署名・失効 | ✓ | `crypto-token.js:46-78` HMAC-SHA256 署名＋`crypto.subtle.verify` 検証。`layer2.js:25-32` payload に `d=getJstDateString()`,`exp=getJstMidnightExpiryEpoch()` 埋込。`layer2.js:42-46` `p.t==='plan'`＋`p.d===今日`＋`exp>now` を全検証。改竄署名/ペイロードは `verifyToken`→null→401（`content/route.js:15-21`）。 |
| 3 | Layer1 Cookie | ✓ | `layer1.js:34-42` httpOnly:true / secure:prod / sameSite:lax / path:/。検証は `crypto-token`（Web Crypto）で Edge 互換、`middleware.js:2,26` から import（Node `crypto` 不使用：`grep node:crypto` → none）。build に `ƒ Middleware 42.1 kB`。未署名/改竄は `verifyToken`→null→`/enter` redirect。署名検証は `crypto.subtle.verify`（定数時間）。 |
| 4 | レート制限の実効 | ✓ | `ratelimit.js:34-81` Supabase `rate_limits` テーブルで永続カウント（メモリ内カウンタ不使用）。キー `scope:ip:jstDate`（`:35`）。layer1=20/15分（`layer1/route.js:16`）、layer2=10/15分（`plan/route.js:23`）、閾値で `locked_until` セット→次回 429。**注**: レガシー `/api/password` にはレート制限が無い（カテゴリ7 へ計上）。 |
| 5 | service-roleキー秘匿 | ✓ | `admin.js:1` `import '../server-only-guard'`＋`:17` `SUPABASE_SERVICE_ROLE_KEY`（NEXT_PUBLIC_ でない）。`server-only-guard.js:6-10` window 検出で throw。`grep -rn "SUPABASE_SERVICE_ROLE_KEY" .next/static` → 検出0。`.env.local` は untracked かつ `.gitignore:27`。 |
| 6 | RLS | ✓ | `002_rebuild_schema.sql:105-110` 全6テーブル（sections/instructors/videos/faqs/settings/rate_limits）`enable row level security`。`:111` コメント通り `create policy` は **0 件**（`grep -c "create policy"`＝0）。旧 auth.uid/profiles 系は `:14-22` で drop。 |
| 7 | 管理API認可 | ✗ | `app/api/password/route.js:10-21` が live route（build `λ /api/password`）。`adminPassword !== process.env.ADMIN_PASSWORD` の**素の `!==` 比較**で `verifyAdminPassword`（`server.js:33`）も DB settings も経由せず、**誤 PW でも `{success:false}` + HTTP 200**（401/403 でない）。Phase 4/5 の正規 admin 認可方針と矛盾。 |
| 8 | JST境界 | ✓ | `date.js:17-23` UTC+9 固定で暦日算出。単体検証：UTC 00:00→2026-05-29 / UTC 前日23:59→2026-05-29 / UTC 14:59→2026-05-28 / UTC 15:00→2026-05-29（UTC 0:00=JST 9:00 で日付不変を確認）。`getJstMidnightExpiryEpoch` → `2026-05-29T15:00:00Z`（=翌 JST 0:00）で当日 24:00 失効が正確。 |
| 9 | 入力・エラー処理 | ✗ | `/api/plan/content` は `Cache-Control: no-store`（`route.js:19,26`）✓、新 API は `verifyLayer1Password`/`verifyPassword` が定数時間（`server.js:10-15` safeEqual、`password.js:74` `timingSafeEqual`）✓、500 で stack 非返却✓。**ただし** `app/api/password/route.js:19` は非定数時間 `!==` 比較、かつ `:28` `console.error(error)` でログに内部情報。新規分は ✓ だが当該レガシーで閾値割れ。 |
| 10 | 依存整合 | ✗ | `app/api/verify` 無し✓、Supabase Auth 残骸（supabase.auth/auth.uid/@supabase/ssr）grep 検出0✓。**しかし** リビルドで削除されるべきレガシーが2点残存：(a) `app/api/password/route.js`（旧 admin 一覧 API・ENV 直照合・7日分パス返却）、(b) `components/auth/PasswordGate.js`（存在しない `/api/password/verify` を fetch・`sessionStorage` フラグ＝旧 Layer2 思想）。後者は import 元 0（孤立）だが、コード資産として残ると誤再利用・誤デプロイの温床。 |

## 実装への指示（FAIL の場合）

1. ✗ カテゴリ7/9/10 — `app/api/password/route.js` を**削除**する。Phase 5 で日替わりパス一覧を出すなら、`verifyAdminPassword`（`lib/auth/server.js:33`、定数時間・DB settings 対応）でゲートし、誤 PW は **401**、レート制限（`checkAndIncrement` scope='admin'）を通す新エンドポイントとして作り直すこと。現状の `adminPassword !== process.env.ADMIN_PASSWORD`（`route.js:19`）は非定数時間・ENV 限定・誤入力で 200 を返し、かつ 7 日分パスを無制限に試行可能で Layer2 を実質バイパスできる。
2. ✗ カテゴリ10 — `components/auth/PasswordGate.js` を**削除**する。叩き先 `/api/password/verify`（`PasswordGate.js:16`）は存在せず、`sessionStorage`（`:25`）による Layer2 認可は新方針（HttpOnly トークン・localStorage/sessionStorage 不使用）に反する旧実装。import 元は 0 だが資産として残すと誤再利用リスク。削除後、build に `/api/password` が出ないことを再確認。
3. （再レビュー時）上記2ファイル削除後に `npm run build` を再実行し、Route 一覧に `/api/password` が無いこと・`grep -rn "PasswordGate\|/api/password" app components` が 0 件であることを証跡として添付。

## 補足（新規実装で特に堅牢だった点）
- crypto-token を Web Crypto 単一実装にし、middleware（Edge）と route（Node）で同一署名検証経路を共有 — Edge で Node `crypto` を踏む事故を構造的に排除。
- layer2 の youtube_id を「DB→content.js で null 化」「出口は token 検証後の単一 API のみ」「page.js で locked/!id フィルタ」と多層で封じており、現データ（coming_soon/id=null）と相まって SSR HTML・client bundle 双方に実 ID 0。
- JST 境界（00:00=JST9:00 不変、24:00 失効 epoch）が単体検証レベルで正確。

---
**コマンド証跡抜粋**
- `grep -rn "SUPABASE_SERVICE_ROLE_KEY" .next/static` → 検出0
- `grep -rln "eyJ\|service_role" .next/static` → 検出0
- `grep -c "create policy" 002_rebuild_schema.sql` → 0、`enable row level security` ×6
- `git ls-files --error-unmatch .env.local` → not tracked、`.gitignore:27` 該当
- `npm run build` → ✓ Compiled successfully（Route に `λ /api/password` 残存を確認）
- JST 境界 node 検証 → 全期待値一致（expiry `2026-05-29T15:00:00Z`）
