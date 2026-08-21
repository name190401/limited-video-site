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
| `PASSWORD_SECRET_KEY` | ✅ | **入口の日替わり6桁コードの生成キー。これがサイトの鍵そのもの** |
| `ADMIN_PASSWORD` | ✅ | 管理画面（`/admin`）用。**初期値**（下記の注意参照）。**8文字以上**にすること |
| `SESSION_SECRET` | ✅ | セッション Cookie の署名鍵 |
| `USE_LOCAL_CONTENT` | ✅ | **`true` 必須**。`lib/content-local.js` を正本にする（下記の注意参照） |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | ✅ | アクセスログ用 |
| `ENABLE_ACCESS_LOGS` | ✅ | `true` でログ記録を有効化。**ローカル検証時は必ず `false`** |

> ⚠️ `USE_LOCAL_CONTENT` を `false` にすると Supabase からコンテンツを読みにいくが、**DB スキーマは現行構成に追随していない**（`videos` に `tab_label` 列が無い、`compliance`／`kitamura` セクション行が無い、動画 id 34・35 が無い）。**`true` のまま運用すること。**

> ⚠️ `ADMIN_PASSWORD` は **DB（`settings.admin_password`）が正本**で、環境変数は**行が無いときのブートストラップ値**にすぎない。`/admin` から一度でも変更すると DB 側が優先され、環境変数を書き換えても反映されない。**8文字以上**は必須（入口コードが6文字なので、下限が両者の衝突を構造的に防いでいる）。

> ⚠️ `PASSWORD_SECRET_KEY` を変えると**全日付の入口コードが一斉に変わる**。配布済みのコードが全部無効になるので、通常は固定。意図的にコードを無効化したいときだけ差し替える（その場合は Vercel とローカル `.env.local` を**同時に**変えること。ずれると検証スクリプトの自前算出が合わなくなる）。

## コンテンツの編集

**動画・セクション・講師・FAQ の正本は `lib/content-local.js` の1ファイル。** 動画を1本足すだけなら他のファイルは触らなくてよい（サムネイルは YouTube から自動生成、ハブ目次とメニューはデータ駆動）。

```js
vid(id, section_key, title, sort_order, {
  subtitle, youtube_id, variant, tab_label, audio_muted, status,
})
```

- `youtube_id` は **11文字のベアID のみ**。共有リンクの `?si=...` は必ず落としてから貼る（正規化コードは無い）
- `tab_label` は §08 のタブ名（ローカル専用フィールド。DB には列が無い）

### 落とし穴（過去に事故が起きた箇所）

- **`middleware.js` の matcher 除外に `docs/` を足さない。** 足すとコンプライアンス資料 PDF が未認証で公開される
- **§08 のタブは 375px 幅の余白が約11px しかない。** 5本目を足すとラベル短縮では収まらないので、2段折返しへ切り替える

## 認証の仕組み（1層・日替わり）

2026-08-21 に **2層（固定の会員合言葉 ＋ 一部セクションの日替わりロック）から 1層**へ作り替えた。入口を通れば全セクションがそのまま見える。

- **入口の合言葉 ＝ その日の6桁コード**。`SHA256(PASSWORD_SECRET_KEY + JST日付 + グループ番号0)` から紛らわしい文字（I/O/0/1）を除いた32文字種で生成する（`lib/password.js`）。**DB を一切参照しない**
- 照合は `lib/auth/server.js`。入力は `NFKC` 正規化 → `trim()` してから渡す（全角入力と、LINE 転記で混ざる前後の空白を吸収するため）。大文字小文字は `verifyPassword` 側が吸収する
- 照合成功で署名付き HttpOnly セッション Cookie（`qualia_site`）を発行。payload は `{v:2, t:'l1', d:JST日付, exp:翌JST0:00}`
  - **`d` と `exp` は必ず単一の `now` から算出する**。別々に `new Date()` を引くと JST 00:00 をまたいだ瞬間に食い違い、発行直後から無効な Cookie ができる
  - **`v === 2` を必須にしている**。これが 1層化のデプロイ時に旧 Cookie を一斉失効させた仕組みで、ここを緩めると「全員ログアウト」の要件が無言で失われる
- `middleware.js` が全ルートで Cookie を検証する。**ネットワーク I/O は無い**（署名・日付・期限だけを見る）。`/enter` と `/admin` 以外は未認証で 307。`public/docs/` の PDF も対象
  - 期限切れ（署名は正しいが日付が今日でない）だけ `/enter?e=day` へ送り、「日付が変わりました」と案内する。署名不正は `/enter`（クエリなし）
- **入口は `/enter` に一本化**。会員コードと管理者パスワードを同一エンドポイントで判定する
  - **判定順は会員が先**。コードの照合自体は DB 不要なので、**Supabase がエラーを返す状態なら会員はログインできる**（レート制限がフェイルオープンで素通しになる）。ただし**無応答のブラウンアウトでは待たされる**（「既知の申し送り」を参照）。管理者判定だけが `settings.admin_password` を必要とし、こちらはフェイルクローズで 503
  - 順序を入れ替えても安全なのは、入口コードが6文字固定・管理者パスワードが8文字以上を強制されているため（構造的に衝突しない）
- **日付基準は JST**（`lib/date.js` が単一の真実）
- レート制限は DB（`rate_limits`）で数え、**DB 障害時はログイン不能を避けるためフェイルオープン**で素通しにする。キーには環境識別子を前置し、ローカル検証が本番の行を汚さない。`layer1` は 50回/15分、`admin-password` は 10回/15分
  - 上限が 50 なのは、携帯キャリアの CGNAT で多数の会員が同一 IP になりうるため。32^6 ≒ 10.7億通りの空間に対して総当たりは非現実的
- **DB がエラーを返している最中に会員が誤コードを入れると、401 ではなく 503 になる**。会員判定に落ちたあと管理者判定が `settings` を要求するため。**正しいコードなら常に 200** なので入場は阻害されない

### 管理者パスワード

- 正本は Supabase の `settings.admin_password`。行が無いときだけ環境変数 `ADMIN_PASSWORD` にフォールバックする（`lib/settings.js`）
- **DB に到達できないときは環境変数へ落とさず例外**（`SettingsUnavailableError`）にする。フォールバックさせると「管理画面で変更したはずの古いパスワード」が復活するため
- `/admin` から変更でき、**世代番号**（`settings.admin_password_version`）を +1 することで**他端末の管理セッションを即座に失効**させる。パスワード行と世代行は **1回の upsert** で同時に書く（片方だけ書けた状態を構造的に作らない）
- 世代の読み取りは `getPasswordVersion`（毎回フレッシュ・DB エラーは例外）。照合は `===`

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
| `verify-auth.cjs` | **認証の総合**（日替わりコードの照合と入力正規化・前日/翌日の拒否・発行 Cookie の payload と Set-Cookie 属性・**`SESSION_SECRET` で自作署名した Cookie による旧 v1 の一斉失効／昨日の日付／署名改竄の分類**・Layer2 撤去の確認・抑止パッケージ・ログアウト）。旧固定合言葉の拒否は、`.env.local` に `SITE_PASSWORD` が残っている間だけ実値で当てる（消したあとは任意文字列の 401 が同じ意図を担う）。**入っていないのは 429 の実発火だけ**（同一 IP から 51 回叩くと本番 `rate_limits` に残骸行が残り、自動清掃もできないため意図的に外している。必要なときは合成 IP を `x-forwarded-for` に載せて手で測る） |
| `verify-db-outage.cjs` | **Supabase 障害耐性**。サービスロールキーを不正値にした 2 つ目のインスタンスを自分で `:3102` に起動し、障害中でも**当日コードで会員ログインが 200**・`/` が閲覧できることを測る。陰性対照として「障害中の誤コードが 503（401 なら障害が再現できていない）」を先に通す。**要 `:3100` の正常インスタンス**（誤コードが 401 であることの陽性対照に使う）／**`:3102` が空いていること**（前回の中断で残ったインスタンスがいると、それを測って偽の緑になるため preflight で exit 2 する）。DB が健全な状態では原理的に測れないので `verify-auth.cjs` とは別建て |
| `verify-req0721.cjs` | 7/21要望（§03/§05 改名・講師ふりがな・§09 担当者名） |
| `verify-req0728.cjs` | 7/28要望（§12・§13・§14・製品タブ・PDF会員ゲート） |
| `verify-req0805.cjs` | 8/05要望（福利厚生差し替え・全15品改称・§09 の表示） |
| `verify-req0817.cjs` | 8/17要望（BMT差し替え・製品4タブと375px座標・§13 動画） |
| `verify-android-autoplay.cjs` | Android の自動再生ブロックを再現してミュートフォールバックを検証 |
| `verify-player.cjs` / `verify-player2.cjs` | ライトボックスと自前プレーヤーの状態遷移 |
| `verify-logs.cjs` | アクセスログ E2E（要 Supabase 稼働＋`ENABLE_ACCESS_LOGS=true`） |
| `shoot-funnel.cjs` / `shoot-sec02.cjs` | スクショ撮影（出力は `../_screenshots/`） |

型チェック・lint・ユニットテストは無い（TypeScript 不使用）。品質保証は上記の実測スクリプトと独立レビュアーで担保している。

## 使い方

**閲覧者**：サイトにアクセス → **その日の6桁コード**を入力 → 全セクションの動画を視聴。日付が変わると入り直しになる

**管理者**：`/enter` で管理者パスワードを入力 → `/admin` で**当日を含む7日分**（当日＋今後6日。`getPasswordsForDays(7, 1)`）の入口コード、管理者パスワード、ログイン履歴、動画再生回数を確認。管理者パスワードでのログインは、コード配布が滞ったときの break-glass としても使える

**コードの配布**：`/admin` の 7 日分一覧を見て、管理者 → リーダー → 会員・紹介者へ人手で配る。**JST 00:00 に全員が同時にログアウトし、必要なコードも変わる**ので、夜間の視聴者を締め出さないよう**前夜のうちに翌日分を配っておく**。

**画面共有時の注意**：`/admin` は**7日分の玄関の鍵**と管理者パスワードの実値をページに含む（管理者パスワードの伏字は表示上のものだけで、ソースには値が入っている）。打ち合わせ等で画面を共有するときは `/admin` を開いたままにしない。

**管理者パスワードの変更**：`/admin` の「管理者パスワード」セクションの「変更」から行う（`POST /api/admin/password`）。現在の管理者パスワードの再入力が必要。8〜64 文字・**半角の印字可能文字のみ**。変更すると**他端末の管理セッションは即座に切れる**（世代失効）。Vercel の環境変数を触る必要はない。会員の入口コードはコードで算出するので、変更という操作は存在しない。

## デプロイ

**`git push origin main` で Vercel が自動デプロイする**（CLI 実行は不要）。環境変数は Vercel ダッシュボード → Settings → Environment Variables で設定済み。

デプロイ後は本番で実測する（未認証で `/`・PDF が 307／当日コードでログイン 200／ログイン後に §04・§08 の動画 8 本が出る）。本番検証はログ行が増えるので、**ログイン 1 回**に留める。

## 既知の申し送り

- `/api/log/play` にレート制限が無い（認証済み会員によるDB増殖ベクトル・低リスク）
- 管理 Cookie の payload に `exp` が無く、失効が Max-Age のみに依存している（会員 Cookie とは非対称）。世代番号で「管理者パスワードを変えたら失効」はできる
- Supabase 無料枠は長期未アクセスで一時停止される。ダッシュボードから Restore すれば復旧する
- **`settings` テーブルに残っている `site_password` / `site_password_version` の 2 行は旧機構の残骸**で、現行コードからは参照されない。DB を直接見たときに「まだ固定合言葉がある」と誤読しないこと
- **Vercel の環境変数 `SITE_PASSWORD` と `PLAN_TOKEN_SECRET` も未使用**。デプロイ後に削除してよい
- **`lib/supabase/admin.js` 経由の supabase-js にタイムアウトが無い。**Supabase が「エラーも返さず応答しない」状態（ブラウンアウト）だと、管理者ログイン・`/admin`・変更 API に加えて、**会員ログインもレート制限の DB 読み取り（`lib/ratelimit.js` が会員判定より前にある）でプラットフォームの実行時間上限まで待つ**（無応答ホストで 60 秒経っても解決しないことを実測済み）。**フェイルオープンが効くのは「エラーが返る」障害だけ**（接続拒否・TLS 未完了なら undici の connect timeout 約 10.5 秒で error になり素通しされる）
  - **ログイン済み会員の閲覧は影響を受けない**（middleware はネットワーク I/O ゼロ、コンテンツは `USE_LOCAL_CONTENT` でローカル供給）
  - 「DB が落ちていても会員は入れる」を無条件に真にするなら、`lib/supabase/admin.js` の client に `AbortSignal.timeout` 付きの fetch を渡すのが本筋（削除した `session-version.js` が 1.5 秒で同じことをしていた）。**未対応**
  - **エラーが返る側の障害には回帰テストがある**（`scripts/verify-db-outage.cjs`）。判定順を管理者優先に戻す・レート制限のフェイルオープンを外す、のどちらの変異でもこのスクリプトが落ちることを実測済み
- **`ADMIN_PASSWORD` を環境変数で与えるときの 8 文字下限は検査されていない**。`/api/admin/password` 経由の変更でしか強制されないので、ブートストラップ値は人が守る必要がある

## ライセンス

Private（QUALIA / castle 専用）
