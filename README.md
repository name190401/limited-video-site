# QUALIA サイト（video-site）

QUALIA オンラインプレゼンテーションシステムの実装本体（Next.js 14 / App Router）。
プロジェクト全体の概要・要件は、親ディレクトリの [`../README.md`](../README.md) と [`../要件定義第一弾`](../要件定義第一弾) を参照。

## 現状

- 日替わりパスワードで動画をロック／解除する**機構（デモ）が稼働中**。
- 要件定義 v2（QUALIA版）に沿って、**本番仕様へ拡張中**（紺金デザイン・13セクション・認証の本番グレード強化）。
- ⚠️ 未コミットの変更が多数あります（v2構成の `app/(member)/`・`app/(auth)/`・`components/`・`lib/supabase/`・`middleware.js` 等）。

## 技術スタック

- **Next.js 14.1**（App Router）
- **React 18**
- **Supabase**（`@supabase/ssr` / `@supabase/supabase-js`）：動画メタ情報・ロックパス管理等
- **Tailwind CSS 3.4**
- **動画**：YouTube限定公開（埋め込み）
- **デプロイ**：Vercel

## セットアップ

```bash
npm install
cp .env.example .env.local   # 値を編集
npm run dev                  # http://localhost:3000
```

### 環境変数（`.env.local`）

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `PASSWORD_SECRET_KEY` | ✅ | 日替わりパスワード生成用のシークレットキー |
| `ADMIN_PASSWORD` | ✅ | 管理者ページ（パスワード一覧）のアクセス用 |
| `NEXT_PUBLIC_YOUTUBE_ID` | 任意 | 表示する動画ID（デフォルトはサンプル） |

> 🔜 本番強化に伴い、アクセストークン署名鍵・Supabase接続情報などを追加予定（要件定義 §7参照）。

## 認証の仕組み（2層）

- **Layer1（サイト全体）**：共通パスワード1つ。サーバー側で照合し、署名付きCookieを `middleware.js` で検証。
- **Layer2（プラン）**：当日の日替わりパスワード（6文字英数字）。
  - 生成：`SHA256(シークレットキー + 日付 + グループ番号)` → 紛らわしい文字（I/O/0/1）除外（`lib/password.js`）
  - 保護：パスワード照合 → 署名付き短命トークン発行 → 動画URLをサーバー側から遅延配信

### 計画中の強化（要件定義 v2）

- 日替わりの境界を **UTC → JST基準** へ変更（現状はUTC 0:00切替）
- 解除状態を `sessionStorage` フラグ → **サーバー発行の署名付きトークン**へ
- 動画URLの**遅延配信API**新設（`/api/plan/unlock`・`/api/plan/content`）
- **レート制限**（試行回数制限）の追加

## 使い方

### 閲覧者
1. サイトにアクセス → Layer1の共通パスワードを入力
2. プランを開く → 管理者から共有された当日のロックパス（6文字）を入力
3. 動画を視聴

### 管理者
1. 管理画面にアクセス → 管理者パスワードでログイン
2. 今後7日分のパスワードを確認し、紹介者へ共有

## デプロイ（Vercel）

```bash
npx vercel          # プレビュー
npx vercel --prod   # 本番
```

Vercel ダッシュボード → Settings → Environment Variables で上記の環境変数を設定する。

## ライセンス

Private（QUALIA / castle 専用）
