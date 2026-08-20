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
| `SITE_PASSWORD` | ✅ | Layer1 の会員共通合言葉 |
| `ADMIN_PASSWORD` | ✅ | 管理画面（`/admin`）用 |
| `PASSWORD_SECRET_KEY` | ✅ | 日替わり6桁コードの生成キー |
| `SESSION_SECRET` | ✅ | Layer1 Cookie の署名鍵 |
| `PLAN_TOKEN_SECRET` | ✅ | Layer2 トークンの署名鍵 |
| `USE_LOCAL_CONTENT` | ✅ | **`true` 必須**。`lib/content-local.js` を正本にする（下記の注意参照） |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | ✅ | アクセスログ用 |
| `ENABLE_ACCESS_LOGS` | ✅ | `true` でログ記録を有効化。**ローカル検証時は必ず `false`** |

> ⚠️ `USE_LOCAL_CONTENT` を `false` にすると Supabase からコンテンツを読みにいくが、**DB スキーマは現行構成に追随していない**（`videos` に `tab_label` 列が無い、`compliance`／`kitamura` セクション行が無い、動画 id 34・35 が無い）。**`true` のまま運用すること。**

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

- **Layer1**：`SITE_PASSWORD` をサーバー照合 → 署名付き HttpOnly セッション Cookie（`qualia_site`・exp 12時間）→ `middleware.js` が Edge 互換（Web Crypto）で全ルート検証。`/enter` と `/admin` 以外は未認証で 307
- **Layer2**：日替わり6桁コード＝`SHA256(PASSWORD_SECRET_KEY + JST日付 + グループ番号)` から紛らわしい文字を除いて生成（`lib/password.js`・**DB 不要**）。照合成功で **JST 24:00 失効の HMAC トークン**（`qualia_plan`）を発行し、保護動画の実IDは `/api/plan/content` からのみ配信
- **日付基準は JST**（`lib/date.js` が単一の真実）
- **入口は `/enter` に一本化**。会員／管理者を同一エンドポイントで判定し、管理者なら両方の Cookie を発行する

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

## デプロイ

**`git push origin main` で Vercel が自動デプロイする**（CLI 実行は不要）。環境変数は Vercel ダッシュボード → Settings → Environment Variables で設定済み。

デプロイ後は本番で実測する（未認証 307／保護8IDの非漏洩／解除で8本配信／PDF の会員ゲート）。本番検証はログ行が増えるので、ログイン1回＋解除1回に留める。

## 既知の申し送り

- `USE_LOCAL_CONTENT=true` のとき **`lib/ratelimit.js` のレート制限が素通しになる**（合言葉への総当たりに制限がかからない）。要対応
- `/api/log/play` にレート制限が無い（認証済み会員によるDB増殖ベクトル・低リスク）
- 管理 Cookie の payload に `exp` が無く、失効が Max-Age のみに依存している（Layer1/Layer2 とは非対称）
- Supabase 無料枠は長期未アクセスで一時停止される。ダッシュボードから Restore すれば復旧する

## ライセンス

Private（QUALIA / castle 専用）
