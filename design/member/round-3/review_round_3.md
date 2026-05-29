# Design Review — Round 3

## 総合判定: PASS

Round2 FAIL 主因（案B load-bearing「Fitbit Today」の claim 矛盾）と⚠2件（案B 07 Substack フェード不整合・案C Apple 裏取りの弱さ）が、3点とも正しく解消。差し替えた2参照（iOS ホーム画面 / apple.com 本体）は出典 URL を実地確認し、引用文が claim と一致。設計本体は Round2 から不変であることを参照スクショの byte 一致と本文 diff で確認。新たな ✗ なし。

---

## Round 2 指摘の解消確認（3点＝今回の修正対象）

| R2指摘 | 種別 | R3 解消判定 | 検証根拠 |
|---|---|---|---|
| 1 案B load-bearing「Fitbit Today」claim 矛盾 | ✗(FAIL主因) | **✓ 解消** | Fitbit を完全削除（references.md L113 取り消し線＋削除理由）。代替=iOS ホーム画面。出典 frankrausch.com/ios-navigation を**実地 WebFetch**し、《"The iOS Home screen…serves as a hub and a reliable 'neutral state'…"》《"To switch between the full-screen child views, you always return to the hub first."》を逐語確認。案Bの「冒頭ハブ→タイル分岐→ハブに戻る往復(spoke→hub)」claim と完全一致。Genius(タイル分岐の入口)＋iOS(往復構造)＋Confirmed(準備中予告)の3件で load-bearing 成立。閾値「各案2件以上」クリア |
| 2 案B 07 Substack フェード記述の不整合 | ⚠ | **✓ 解消** | DB スクショ `substack-paywall-blur.png` を**目視再確認**: 導入文(通常テキスト)→細い区切り線→**ハードカットの橙ゲートブロック「This post is for paid subscribers」＋Subscribe CTA**。滑らかな縦グラデフェードではない。proposals L122 を「金1pxの区切り線＋ゲートブロックで本編を遮断（ハードカットゲートに準拠）」へ修正し、フェード claim を明示撤回。スクショと記述が一致 |
| 3 案C Apple 裏取りの弱さ(Awwwards) | ⚠ | **✓ 解消** | Awwwards を load-bearing から削除（references.md L114 取り消し線）。裏取りを apple.com/airpods-pro 本体に一本化。**実地 WebFetch**で full-bleed section-by-section／各セクションがほぼビューポート高／hero「The world's best in-ear ANC」→「Get the highlights」→「Take a closer look」の順次切替／scroll-triggered product viewer を確認。proposals/references の構造記述（特に2見出し名）が本体挙動と一致 |

---

## 設計本体の不変性検証（designer 申告「3点のみ修正」の真偽）

- **参照スクショ25枚**: round-3/references/ と round-2/references/ の全ファイルが byte-identical（ファイルサイズ完全一致）。DB 由来スクショは未改変＝設計の根拠資産は不変。
- **本文 banned 形容詞**: proposals.md grep（モダン/洗練/高級感/美しい/直感的/シンプル/スタイリッシュ/エレガント）= **0件**。Round2 から悪化なし。
- **Fitbit/Awwwards 残留**: load-bearing 行には不在。残るのは全て「削除した旨」のメタ記述（取り消し線・変更ログ）のみ＝混乱を生まない。
- **「フェード」残留3箇所**は (1) 変更ログのメタ記述、(2) L70 案A unlocked の解除アニメ"フェードイン"（Substack ゲートと無関係）、(3) L122 新ゲート記述内の撤回明示。案B locked のフェード claim は完全消滅。
- 結論: 申告通り「参照整合3点のみ」の修正であり、設計本体（13セクション×3案・配色・タイポ・ロック/準備中UX）は壊れていない。惰性 PASS でなく差分を実検証した上での PASS。

---

## 基準別スコア

| カテゴリ | 結果 | 詳細 |
|----------|------|------|
| 参照根拠 | ✓ | 案A=load-bearing2(Discover/Headspace)＋トーン1。案B=load-bearing3(Genius/iOS ホーム画面/Confirmed)＋トーン1。案C=load-bearing3(Apple本体/YouTube/MasterClass)＋トーン1。各案2件以上クリア |
| 参照妥当性 | ✓ | 差し替え2件を**実地確認**: iOS=引用2文が claim と逐語一致／Apple本体=構造・見出し名が一致。補足 IxDF 定義も実地確認（"shift from one spoke to another – you must do so via the hub"）。DB スクショ25枚は Round1/2 で目視一致確認済み＋byte 一致で継続真正。live 乖離(kreativepro/substack/mytbr)は1行ずつ注記済で透明性維持。100%整合 |
| 要素網羅 | ✓ | A/B/C とも13/13独立列挙＋locked/unlocked2画面＋準備中要素まで列挙レベル。「いい感じ」級曖昧記述なし(Round2から不変) |
| 多様性 | ✓ | A線形章扉/B非線形ハブ/C没入1画面=体験順序の本質差。同一セクションの見え方差(10:A縦リスト/B2列タイル/C横ストリップ)を書き分け |
| トレードオフ | ✓ | 全案に強み/弱み/想定離脱を明示。案Cの「構造2系統化」「実装コスト最高」など自案弱点を率直記述 |
| 要件整合 | ✓ | 紺金明るめ・既存トークン・QUALIA/アクロスティック/右上ハンバーガー/castle講師/丸写真→石壁グリッド・1枚長尺・動画タップ再生・合言葉ロックを全案踏襲。矛盾0 |
| 形容詞濫用 | ✓ | proposals.md banned grep=0件。「没入」(案C概念名・具体挙動付き)/「威圧」(回避対象の要件語)は根拠紐付きで可 |
| scope逸脱 | ✓ | 13セクション内に限定。捨てた選択肢7件を確定方針との矛盾理由付きで排除 |
| 想定ユーザー | ✓ | 全案に刺さる/取りこぼすを明記(A=じっくり/せっかち、B=関心明確/受動初見、C=雰囲気判断/論理派) |

確定: 9カテゴリ全✓ → PASS。

---

## 案別 element-level 評価（今回 verify した差分箇所を中心に）

### 案B（推奨案・修正対象セクション）
| 要素 | 判定 | コメント |
|------|------|----------|
| ハブ(核) | ✓ | Round2で⚠だった往復(spoke→hub)根拠が iOS ホーム画面で充足。13タイル2/3-4列・番号+アイコン+名・準備中ピル+opacity0.7+公開月・07金鍵→解除後金チェック。Genius(分岐入口)＋iOS(往復)で構造の両側面が根拠化 |
| 07 ロック | ✓ | locked: 上半分(ショート×3+プラン概要)通常表示→**金1px区切り線＋ゲートブロックで本編遮断**(Substack スクショの実体=ハードカットゲートに一致)。本編は背後に輪郭うっすら。鍵28px金細線・文言・単一フィールド・解除下1/3。unlocked: 250msで解け区切り線消失→下半分立ち上がり、ハブ07が金チェック。フェード claim 撤回でスクショと整合 |
| 他11セクション | ✓ | Round2から不変。各頭「ハブに戻る↑」・ハンバーガー(常駐ナビ)とハブ(通過面)の役割分離維持 |

### 案C（修正対象=Apple 裏取り）
| 要素 | 判定 | コメント |
|------|------|----------|
| 01/08 読み物例外パネル | ✓ | フルブリード/snap解除の読み物パネル(由来/ボーナス)。Round2から不変 |
| 構造根拠(Apple本体) | ✓ | apple.com/airpods-pro 本体精読でフルブリード逐次 scrollytelling・各セクションほぼ全viewport高・「Get the highlights」「Take a closer look」順次切替・scroll-triggered viewer を確認。Round2で⚠だった裏取りの弱さを本体一本化で解消 |
| 07 ロック(扉) | ✓ | KreativePro型・鍵40px・中身透け・ショートは前パネルで開放・単一フィールド・金リング円周解除250ms・07ドット金実塗り。不変 |
| 他セクション | ✓ | Round2から不変 |

### 案A
- 修正対象外。Round2で全✓判定の13セクション＋48px薄型章扉＋7:2準備中の解＋ロック2状態は不変。再検証で劣化なし。

---

## PASS の場合のコメント（光った点・お世辞抜き）

- Round2 FAIL の主因を、designer 自身が**出典の引用文レベルで claim 整合を検証**して埋めた点が的確。iOS ホーム画面は「Genius=タイル分岐の入口」に対し「分岐先から必ずハブへ戻る往復」という、Round2 で欠けていた構造のもう片側をピンポイントで補っており、安易な代替でなく欠落部位を正確に同定している。
- Substack の修正が「記述を実スクショに合わせて訂正＋誤 claim を明示撤回」という正しい方向。スクショに無いフェードを取り繕わず、ハードカットゲートという実体に記述を寄せた誠実さは参照妥当性の核心に適う。
- live 乖離・代替由来`[Web代替]`・削除参照の取り消し線記録など、参照の来歴を改竄せず追跡可能に保っている。reviewer が差分を検証できる形を維持。

---

## 実装者が参照すべき FINAL design spec の要点（1〜3行）

1. **採用構造=案Bハイブリッド**(冒頭ハブ＝Genius型タイルグリッド＋iOS型 spoke→hub 往復＋案Aの48px薄型章扉で物語性/現在地補強)。13セクション・右上ハンバーガー(常駐ナビ)・紺金明るめ・既存navy/goldトークン・Noto Serif/Sans。
2. **動画**=`<img>`サムネ→初回タップで youtube-nocookie iframe 生成(全先読み禁止)。**ロック(07)**=単一フィールド＋上半分開放＋金1px区切り線＋ハードカットゲートブロック(フェード不可)、エラーは navy-400・3回でもロックアウトしない。**準備中**=`ComingSoonCard`(タイトル/担当/公開月)・グレーアウト/工事中アイコン禁止・案Bはハブタイル予告＋本体最小化。
3. **08ボーナスの数値は実数値を入れず法規制確認前プレースホルダ**のまま(コピー/数値投入段階で最新の法規制確認が別途必須)。
