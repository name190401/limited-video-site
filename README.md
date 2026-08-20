# QUALIA サイト（video-site）

QUALIA オンラインプレゼンテーションシステムの実装本体（Next.js 14 / App Router）。
プロジェクト全体の概要・構成は親の [`../README.md`](../README.md)、意思決定と各回の反映記録は [`../要件定義第一弾`](../要件定義第一弾) を参照。

**本番稼働中**：<https://castle-team-ryo.com>（Vercel プロジェクト `name190401s-projects/limited-video-site`）

## 技術スタック

- **Next.js 14.1**（App Router）／**React 18**／**Tailwind CSS 3.4**
- **Supabase**：アクセスログ専用（`login_events` / `play_events`）。コンテンツ取得には使っていない
- **動画**：YouTube 限定公開を自前プレーヤー（IFrame Player API）で再生
- **デプロイ**：Vercel（**git push で自動デプロイ**）

## セットアップ

```bash
npm install
cp .env.example .env.local   # 値を編集
npm run dev                  # http://localhost:3000
```

### 環境変数（`.env.local`）

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `SITE_PASSWORD` | ✅ | Layer1 の会員共通合言葉。**初期値**（下記の注意参照） |
| `ADMIN_PASSWORD` | ✅ | 管理画面（`/admin`）用。**初期値**（下記の注意参照） |
| `PASSWORD_SECRET_KEY` | ✅ | 日替わり6桁コードの生成キー |
| `SESSION_SECRET` | ✅ | Layer1 Cookie の署名鍵 |
| `PLAN_TOKEN_SECRET` | ✅ | Layer2 トークンの署名鍵 |
| `USE_LOCAL_CONTENT` | ✅ | **`true` 必須**。`lib/content-local.js` を正本にする（下記の注意参照） |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | ✅ | アクセスログ用 |
| `ENABLE_ACCESS_LOGS` | ✅ | `true` でログ記録を有効化。**ローカル検証時は必ず `false`** |

> ⚠️ `USE_LOCAL_CONTENT` を `false` にすると Supabase からコンテンツを読みにいくが、**DB スキーマは現行構成に追随していない**（`videos` に `tab_label` 列が無い、`compliance`／`kitamura` セクション行が無い、動画 id 34・35 が無い）。**`true` のまま運用すること。**

> ⚠️ `SITE_PASSWORD` / `ADMIN_PASSWORD` は **DB（`settings` テーブル）が正本**で、環境変数は**行が無いときのブートストラップ値**にすぎない。`/admin` から一度でも変更すると DB 側が優先され、環境変数を書き換えても反映されない。現在値の確認・変更はすべて `/admin` で行う。

## コンテンツの編集

**動画・セクション・講師・FAQ の正本は `lib/content-local.js` の1ファイル。** 動画を1本足すだけなら他のファイルは触らなくてよい（サムネイルは YouTube から自動生成、ハブ目次とメニューはデータ駆動）。

```js
vid(id, section_key, title, sort_order, {
  subtitle, youtube_id, protection, variant, tab_label, audio_muted, status,
})
```

- `youtube_id` は **11文字のベアID のみ**。共有リンクの `?si=...` は必ず落としてから貼る（正規化コードは無い）
- `protection` 省略＝`'layer1'`。`'layer2'` にすると `/api/plan/content` 経由の遅延配信になる
- `tab_label` は §08 のタブ名（ローカル専用フィールド。DB には列が無い）

### 落とし穴（過去に事故が起きた箇所）

- **§09 トレーニング・§13 法令遵守に `protection:'layer2'` を付けない。** どちらも解除UI（`UnlockGate`）を持たないため、動画が再生不能になる／無言で消える。Layer2 にしたい場合は先にセクション側へ `UnlockGate`／`usePlanGate` を入れること（各ファイルにコメントで明記済み）
- **`middleware.js` の matcher 除外に `docs/` を足さない。** 足すとコンプライアンス資料 PDF が未認証で公開される
- **§08 のタブは 375px 幅の余白が約11px しかない。** 5本目を足すとラベル短縮では収まらないので、2段折返しへ切り替える

## 認証の仕組み（2層・実装済み）

- **Layer1**：会員共通合言葉をサーバー照合 → 署名付き HttpOnly セッション Cookie（`qualia_site`・exp 12時間）→ `middleware.js` が Edge 互換（Web Crypto）で全ルート検証。`/enter` と `/admin` 以外は未認証で 307
- **Layer2**：日替わり6桁コード＝`SHA256(PASSWORD_SECRET_KEY + JST日付 + グループ番号)` から紛らわしい文字を除いて生成（`lib/password.js`・**DB 不要**）。照合成功で **JST 24:00 失効の HMAC トークン**（`qualia_plan`）を発行し、保護動画の実IDは `/api/plan/content` からのみ配信
- **日付基準は JST**（`lib/date.js` が単一の真実）
- **入口は `/enter` に一本化**。会員／管理者を同一エンドポイントで判定し、管理者なら両方の Cookie を発行する

### パスワードの保存場所と、変更したときの失効（2026-08-20 追加）

- **正本は Supabase の `settings` テーブル**（`site_password` / `admin_password`）。行が無いときだけ環境変数にフォールバックする（`lib/settings.js`）
- **DB に到達できないときは環境変数へ落とさず例外**（`SettingsUnavailableError`）にし、ログインは **503** で拒否する。フォールバックさせると「管理画面で変更したはずの古いパスワード」が復活するため
- **世代番号による即時失効**：`settings` の `site_password_version` / `admin_password_version` を変更のたびに +1 し、Cookie の payload に載せた `pv` と照合する（`lib/auth/session-version.js`）。古い `pv` の Cookie は `middleware.js`・`/api/plan/content`・`/api/log/play`・`/admin` で弾かれる
  - `middleware.js` は Edge ランタイムで `@supabase/supabase-js` を使えないため、世代の読み取りだけ **REST を `fetch`** する専用モジュールにしてある。**`lib/settings.js` を middleware から import しないこと**（Edge で動かない supabase-js を引き込むため。`server-only-guard` は `window` があるときだけ throw するので Edge では止めてくれない）
  - **この `fetch` には 1.5 秒のタイムアウトが必須**（`AbortSignal.timeout`）。middleware は matcher 配下の全リクエストで走るので、Supabase が「エラーも返さず応答しない」状態になるとサイト全体が固まる（タイムアウト無しで 240 秒無応答を実測済み）
  - **Cookie を発行する経路と世代を +1 する経路では `readPasswordVersion` を使わない**。あちらは読めないと 0 を返すため、発行時に使うと発行直後の Cookie が即失効し、更新時に使うと世代を巻き戻す。これらは `lib/settings.js` の `getPasswordVersion`（フェイルクローズ）を使う
  - 世代は **30 秒キャッシュ**。したがって失効は「即時」ではなく**最大 30 秒以内**。DB 取得に失敗したときのフォールバック値は **5 秒**だけキャッシュする（障害中に middleware が全リクエストで往復し続けるのを防ぎつつ、復旧を長く引きずらないため）
  - 照合は `pv >= 現行世代` で判定する（`===` にすると、キャッシュが古い isolate が発行直後の正しい Cookie を誤って弾く）
  - **世代の読み取りはフェイルオープン**（DB 不達なら素通し）。ログイン照合のフェイルクローズと**意図的に非対称**にしてある。閉じると Supabase 停止時に閲覧中の全会員が即ログアウトになるため
- **パスワード行と世代行は 1 回の upsert（＝1 ステートメント）で同時に書く**（`lib/settings.js` の `setSettings`）。片方だけ書けた状態＝「変更したのに失効していないが、同じ値では再変更できない」行き止まりを構造的に作らないため。**1 件だけ書く関数は意図的に置いていない**
- `settings` に行が無く Cookie に `pv` も無い状態はどちらも 0 とみなされ、**この仕組みを載せたデプロイ自体では誰もログアウトされない**

## 検証

検証スクリプトは **本番ビルドを `:3100` で起動した状態**を前提にしている。

```bash
# 1) 既存サーバを止める（プロセス名は next-server なので pkill -f "next start" は効かない）
kill $(lsof -ti :3100 -sTCP:LISTEN)

# 2) ビルド（dev 稼働中に build すると .next 競合で 500 になる。必ず止めてから）
npm run build

# 3) 起動（ENABLE_ACCESS_LOGS=false 必須。本番 Supabase にテストログを入れないため）
ENABLE_ACCESS_LOGS=false npx next start -p 3100

# 4) 実行（playwright はグローバル参照）
NODE_PATH=/Users/hajime/.npm-global/lib/node_modules node scripts/verify-req0817.cjs
```

検証前に **サーバPIDの起動時刻 > `.next/BUILD_ID` の mtime** を確認すること（古いビルドを検証し続ける事故が実際に起きている）。

| スクリプト | 内容 |
|---|---|
| `verify-layer2.cjs` | Layer2 総合（保護8IDの非漏洩・ゲート・解除・抑止パッケージ・ログアウト） |
| `verify-req0721.cjs` | 7/21要望（§03/§05 改名・講師ふりがな・§09 担当者名） |
| `verify-req0728.cjs` | 7/28要望（§12・§13・§14・製品タブ・PDF会員ゲート） |
| `verify-req0805.cjs` | 8/05要望（福利厚生差し替え・全15品改称・§09 の Layer2 解除） |
| `verify-req0817.cjs` | 8/17要望（BMT差し替え・製品4タブと375px座標・§13 動画） |
| `verify-android-autoplay.cjs` | Android の自動再生ブロックを再現してミュートフォールバックを検証 |
| `verify-player.cjs` / `verify-player2.cjs` | ライトボックスと自前プレーヤーの状態遷移 |
| `verify-logs.cjs` | アクセスログ E2E（要 Supabase 稼働＋`ENABLE_ACCESS_LOGS=true`） |
| `shoot-funnel.cjs` / `shoot-sec02.cjs` | スクショ撮影（出力は `../_screenshots/`） |

型チェック・lint・ユニットテストは無い（TypeScript 不使用）。品質保証は上記の実測スクリプトと独立レビュアーで担保している。

## 使い方

**閲覧者**：サイトにアクセス → 合言葉を入力 → プラン説明／製品を開く際に紹介者から共有された当日の6桁コードを入力 → 動画を視聴

**管理者**：`/enter` で管理者パスワードを入力 → `/admin` で当日＋今後7日分のコード、会員合言葉、ログイン履歴、動画再生回数を確認

**パスワードの変更**：`/admin` の「会員合言葉」「管理者パスワード」の各セクションにある「変更」から行う（`POST /api/admin/password`）。現在の管理者パスワードの再入力が必要。8〜64 文字・**半角の印字可能文字のみ**（全角は `/enter` の入力欄で打てないため拒否）。会員合言葉と管理者パスワードを同値にはできない（`app/api/auth/layer1/route.js` が管理者を先に判定するため、同値だと会員ログインが機能しなくなる）。変更すると**そのパスワードでログイン中の端末はすべて再ログインになる**（上記の世代失効）。Vercel の環境変数を触る必要はない。

## デプロイ

**`git push origin main` で Vercel が自動デプロイする**（CLI 実行は不要）。環境変数は Vercel ダッシュボード → Settings → Environment Variables で設定済み。

デプロイ後は本番で実測する（未認証 307／保護8IDの非漏洩／解除で8本配信／PDF の会員ゲート）。本番検証はログ行が増えるので、ログイン1回＋解除1回に留める。

## 既知の申し送り

- `USE_LOCAL_CONTENT=true` のとき **`lib/ratelimit.js` のレート制限が素通しになる**（合言葉への総当たりに制限がかからない）。要対応
- `/api/log/play` にレート制限が無い（認証済み会員によるDB増殖ベクトル・低リスク）
- 管理 Cookie の payload に `exp` が無く、失効が Max-Age のみに依存している（Layer1/Layer2 とは非対称）
- Supabase 無料枠は長期未アクセスで一時停止される。ダッシュボードから Restore すれば復旧する
- パスワード変更後の失効は世代キャッシュ（30秒）の分だけ遅れる。厳密な即時失効が要るなら TTL を縮めるか、`invalidateVersionCache` をインスタンス間へ伝える仕組みが要る
- `POST /api/admin/password` のレート制限も `USE_LOCAL_CONTENT=true` では素通し（1点目と同根。配線は入れてある）
- Supabase が「エラーも返さず応答しない」状態のとき、**打ち切りが効くのは middleware の世代読み取りだけ**（1.5秒）。`lib/supabase/admin.js` 経由の supabase-js にはタイムアウトを入れていないので、ログイン・`/admin`・変更 API はプラットフォームの実行時間上限まで待って 504 になる（503 にはならない）。会員の閲覧は middleware 側が打ち切るので継続する

## ライセンス

Private（QUALIA / castle 専用）
