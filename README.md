# 限定動画視聴サイト

パスワード保護された動画視聴サイトです。パスワードは毎日自動で変更されます。

## 機能

- 🔐 毎日自動で変わるパスワード
- 📺 YouTube限定公開動画の埋め込み
- 👤 管理者画面で今後7日間のパスワードを確認
- 🚀 Vercel/Netlifyで簡単デプロイ

## セットアップ

### 1. リポジトリをクローン

```bash
git clone <your-repo-url>
cd video-password-site
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境変数を設定

`.env.example` をコピーして `.env.local` を作成：

```bash
cp .env.example .env.local
```

`.env.local` を編集：

```env
# パスワード生成用のシークレットキー（必須）
# ランダムな文字列を設定してください
PASSWORD_SECRET_KEY=your-random-secret-key-12345

# 管理者ページのパスワード（必須）
ADMIN_PASSWORD=admin123

# YouTube動画ID（任意）
NEXT_PUBLIC_YOUTUBE_ID=your-youtube-video-id
```

### 4. ローカルで起動

```bash
npm run dev
```

http://localhost:3000 でアクセス

## デプロイ（Vercel）

### 1. Vercelにログイン

```bash
npx vercel login
```

### 2. デプロイ

```bash
npx vercel
```

### 3. 環境変数を設定

Vercelダッシュボード → Settings → Environment Variables で以下を設定：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `PASSWORD_SECRET_KEY` | ランダムな文字列 | パスワード生成用 |
| `ADMIN_PASSWORD` | 管理者パスワード | 管理画面アクセス用 |
| `NEXT_PUBLIC_YOUTUBE_ID` | YouTube動画ID | 表示する動画 |

### 4. 本番デプロイ

```bash
npx vercel --prod
```

## デプロイ（Netlify）

### 1. netlify.toml を作成（ルートに追加）

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 2. Netlifyにデプロイ

GitHubリポジトリを連携するか、CLIでデプロイ：

```bash
npx netlify deploy --prod
```

### 3. 環境変数を設定

Netlifyダッシュボード → Site settings → Environment variables で設定

## 使い方

### 閲覧者向け

1. サイトにアクセス
2. 管理者から共有されたパスワード（6文字）を入力
3. 動画を視聴

### 管理者向け

1. `/admin` にアクセス
2. 管理者パスワードでログイン
3. 今日のパスワードを確認してLINEやメールで共有

## パスワードの仕組み

```
シークレットキー + 今日の日付 → SHA256ハッシュ → 6文字のパスワード
```

- パスワードは毎日 0:00 UTC に自動で変わります
- 同じシークレットキーを使う限り、同じ日付なら同じパスワードが生成されます
- 紛らわしい文字（I, O, 0, 1）は除外されています

## セキュリティについて

- シークレットキーはサーバーサイドでのみ使用（クライアントに露出しません）
- 認証トークンは日付ベースで、翌日には無効になります
- 管理画面は別途パスワード保護されています

## カスタマイズ

### 動画を変更する

環境変数 `NEXT_PUBLIC_YOUTUBE_ID` を変更するか、`app/video/page.js` を編集

### デザインを変更する

Tailwind CSSを使用しています。各ページの className を編集してください。

## ライセンス

MIT
