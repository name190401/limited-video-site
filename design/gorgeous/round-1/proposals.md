# デザイン提案 — QUALIA メンバーサイト ゴージャス化 Round 1

## サマリ
既存実装済みの /enter と会員ページ13章の「金=1pxベタ塗り」「見出し=デフォルト字間」を、①金メタリック箔質感 ②セリフ・タイポ階層 の2軸で格上げする。紺×金は維持。全提案は Tailwind + globals.css + JSX に落ちる具体CSS値で記述。3案は「金とタイポをどれだけ強く出すか」で本質的に分岐。

---

## 共通基盤（3案共通で先に定義するトークン拡張）

### globals.css に追加する金メタリックの素材定義
```css
/* === GOLD METALLIC PRIMITIVES ============================ */
/* 箔の縦ハイライト帯付きグラデ（面・ボタン用）。暗い金→明るい箔ハイライト→暗い金 */
:root {
  --gold-foil: linear-gradient(
    100deg,
    #876E2F 0%,    /* gold-700 影 */
    #D4AF37 22%,   /* gold-400 */
    #F5E6A3 46%,   /* ハイライト箔 */
    #FBF7EC 52%,   /* 最強光沢の細帯 */
    #E0C57B 60%,   /* gold-300 */
    #C5A55A 78%,   /* gold-500 */
    #A68A3E 100%   /* gold-600 影 */
  );
  /* 罫・縁用の薄い箔（細い線でも箔の明暗が出る） */
  --gold-hairline: linear-gradient(90deg, transparent 0%, #876E2F 8%, #D4AF37 30%, #F5E6A3 50%, #D4AF37 70%, #876E2F 92%, transparent 100%);
  /* テキスト用メタリック（縦方向で上明・下暗、立体的に見せる） */
  --gold-text: linear-gradient(180deg, #FBF7EC 0%, #E0C57B 28%, #D4AF37 50%, #A68A3E 78%, #876E2F 100%);
}
```

### Web フォント（追加 import）
既存 import に Cormorant Garamond と Cinzel を追加（日本語は Noto Serif JP 継続）:
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Cinzel:wght@400;500;600&family=Noto+Serif+JP:wght@400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap');
```
- 英字ワードマーク/英ラベル: 案により Cormorant Garamond か Cinzel
- 日本語見出し: Noto Serif JP（ウェイトで階層化）
- 本文: Noto Sans JP 継続

---

## 案A: 箔押しメタリック（GOLD FOIL／質感全振り）

> コンセプト1行: 金を「インクの平面」から「箔押しの立体」へ。光沢帯・陰影を最大投下して触れそうな金にする。

### 採用参照
- Rolex/Cartier/Tiffany ブランドサイト（references #5, curl 403=botブロックだが実在ブランド）— メタリックワードマーク・箔の縦ハイライト帯
- MDN `background-clip` / CSS-Tricks Gradient Text（#6,#7, curl 200）— `background-clip:text` で金グラデを文字へ流す実装根拠

### 画面要素（after 具体仕様）
- **① ワードマーク QUALIA（enter / Hero）**: フォント Cinzel 600（ローマンキャピタルで碑文感）。`background:var(--gold-text); -webkit-background-clip:text; color:transparent;` ＋立体のため `text-shadow:0 1px 0 rgba(255,255,255,.25), 0 2px 3px rgba(0,0,0,.45);`（background-clip:text と text-shadow は併用不可なので、影は `::after` の同字複製を 1px 下にずらし `color:#4A3B17` で擬似エンボス）。letter-spacing `0.16em`。サイズ enter=clamp(40px,12vw,56px) / Hero=clamp(40px,11vw,56px)。
- **② セリフ見出し階層**: H2(ChapterHeader)=Noto Serif JP 600 / 26→32px / tracking 0.04em。英字混在見出しは Cinzel。number は Cinzel 500。階層は H1(54)→H2(30)→eyebrow(11 small-caps)。
- **③ 金メタリック区切り線**: 現 `border-t border-gold-400`(1px平面) を **高さ2pxの箔バー**へ: `<span class="block h-[2px]" style="background:var(--gold-hairline)">` ＋ 直下に `box-shadow:0 1px 0 rgba(255,255,255,.15)` で艶。
- **④ 金ボタン**: enter「はいる」/ plan「解除する」共通: `background:var(--gold-foil); color:#0C1530;` ＋ `box-shadow: inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 4px rgba(74,59,23,.5), 0 4px 14px rgba(212,175,55,.30);` ＋ 上面に `::before` で `linear-gradient(180deg,rgba(255,255,255,.5),transparent 45%)` の光沢オーバーレイ。hover で background-position を 2% ずらし箔が動く（transition 250ms、再描画は background-position のみで軽い）。
- **⑤ アクロスティック枠（Q U A L I A）**: 1px枠→ `border:1px solid transparent; background:linear-gradient(#0C1530,#0C1530) padding-box, var(--gold-foil) border-box;` で枠だけ箔。文字は `var(--gold-text)` clip。
- **⑥ 講師丸写真の金縁**: 同 border-box 箔リング＋外側 `box-shadow:0 0 0 1px rgba(212,175,55,.25), 0 6px 18px rgba(0,0,0,.4)`。
- **⑦ ChapterHeader**: 上罫を③の箔バーに。番号は Cinzel + `var(--gold-text)` clip。
- **⑧ Hubタイル / 準備中ピル**: タイル枠を border-box 箔（細）＋ `box-shadow:0 1px 0 rgba(255,255,255,.6) inset, 0 8px 20px -8px rgba(12,21,48,.18)`。準備中ピルも箔枠。
- **⑨ 金ロックUI**: 区切りを箔バー。鍵円枠を border-box 箔リング。「解除する」ボタンは④の塗り箔（塗りなし→塗りに変更で主役化）。

### トレードオフ
- 強み: 「高級」が一目で最大。金が主役のブランドに最適。
- 弱み: **盛りすぎでチープ/胡散臭く振れるリスク最大**（ネットワークビジネス文脈では逆効果になりうる）。箔の擬似エンボス（::after複製）は要素数が増え保守コスト高。
- 375px破綻リスク: ワードマーク clamp で対応可だが text-shadow/二重要素が小画面で滲む可能性。
- 想定ユーザー: 「分かりやすい豪華さ」を好む層に刺さる。/ 取りこぼし: 落ち着いた本物志向・警戒心の強い見込み客には「やりすぎ」に映る。

---

## 案B: エングレービング・エディトリアル（雑誌品格／タイポ全振り）

> コンセプト1行: 金は面積を絞り「細罫＋small-caps＋ハイコントラスト・セリフ」で雑誌の品格を出す。Four Seasons/Aman の系譜。

### 採用参照
- Four Seasons hero（#1, screenshot on disk 目視確認済）— small-caps エンブロウ「FOR THE CURIOUS」大字間・ハイコントラスト display セリフ・1px 罫・余白
- Aman / Belmond（#2,#3, curl 200）— 大字間細セリフ・hairline rule・抑制された金
- MDN `font-variant-caps`（#8, curl 200）— small-caps の真正実装

### 画面要素（after 具体仕様）
- **① ワードマーク QUALIA**: Cormorant Garamond 500（繊細・高コントラスト）。**金は箔にしすぎず** `var(--gold-text)` を控えめ（上明下暗のみ、光沢帯なし）か、enter は白セリフ＋金は下のヘアラインのみ。letter-spacing **0.30em**（大字間で品格）。下に Cormorant italic 400 のサブ「Members Only」を small-caps tracking 0.4em で eyebrow 配置。
- **② セリフ見出し階層（本案の主役）**: eyebrow=英 small-caps 11px / `font-variant-caps:small-caps; letter-spacing:0.34em; color:#C5A55A`。H2=Noto Serif JP 600、ただし **行頭に金ヘアライン短罫（幅24px・var(--gold-hairline)）** を置く雑誌的レイアウト。number は Cormorant 600 大きめ（28px）＋極小ラベル。コントラスト比を上げるため見出しは navy-900、本文は navy-700。
- **③ 金メタリック区切り線**: フル幅の太い箔ではなく **中央寄せ 1px のヘアライン（var(--gold-hairline)で両端フェード）** ＋ 中央に菱形/小ドットのオーナメント（`::before` の 4px 回転四角 #D4AF37）。エディトリアルな「章の区切り」感。
- **④ 金ボタン**: enter「はいる」は **塗りを抑え**、`border:1px solid; border-image:var(--gold-hairline) 1; color: var(--gold-text) clip; background:rgba(212,175,55,.06);` のアウトライン上質ボタン＋ hover で `background:rgba(212,175,55,.12)`。plan「解除する」も同系アウトライン（現状のアウトライン路線を磨く）。文字は Cormorant 600 small-caps 「ENTER」併記も可。
- **⑤ アクロスティック枠**: 角枠を**やめ**、文字 Cinzel/Cormorant の頭文字を `var(--gold-text)` clip ＋ 下に 1px ヘアライン短罫のみ（枠線を引かず罫で締める雑誌組み）。
- **⑥ 講師丸写真の金縁**: 1px ヘアラインリング（var(--gold-hairline)）＋ 名前を Noto Serif JP、肩書「castle 講師」を small-caps 英字併記 tracking 0.3em。
- **⑦ ChapterHeader（本案の見せ場）**: 上罫=②の短ヘアライン＋オーナメント。number を大きく Cormorant、title を Noto Serif JP、その上に英 small-caps eyebrow（例 ORIGIN / INSTRUCTORS）。雑誌の章扉。
- **⑧ Hubタイル / 準備中ピル**: タイルは白地＋1pxヘアライン枠＋極薄影。番号 Cormorant・タイトル Noto Serif JP。準備中ピルは塗りなし small-caps「COMING SOON」＋金ヘアライン下線。
- **⑨ 金ロックUI**: 区切りヘアライン＋オーナメント。鍵円枠は1pxヘアライン。コピーをセリフに。「解除する」は④アウトライン。「続きは紹介者から」を Noto Serif JP で品よく。

### トレードオフ
- 強み: 「本物・信頼・上品」が最も出る。**警戒されやすい文脈で胡散臭さが最小**。タイポ階層が全章に効き一貫性が高い。375pxでも罫と字間中心なので破綻しにくい。
- 弱み: 「ぱっと見の豪華さ」は案Aに劣る。Cormorant の細さは小サイズ日本語と混ぜると視認性に注意。small-caps の英字を多用すると英語苦手層に距離感。
- 375px破綻リスク: 低（罫・字間ベース）。ただし大字間ワードマークは375pxで折返さない最大字数の検証が必要。
- 想定ユーザー: 落ち着いた本物志向・上質さで信頼したい見込み客に刺さる。/ 取りこぼし: 「キラキラした派手な豪華さ」を期待する層には地味に映る。

---

## 案C: ジュエリー・ミニマル（陰影と余白／引き算の高級）

> コンセプト1行: 金もタイポも足さず、深い紺グラデ・上質な影・大きな余白・少数の金で「静かな高級」。Aman 寄り。

### 採用参照
- Aman（#2, curl 200）— 静謐・余白・抑制された金・少数アクセント
- Four Seasons の暗部セクション（#1, screenshot）— 深い紺地に少量の金罫
- MDN background-clip（#6, curl 200）— ごく一部の金文字にのみ clip 適用

### 画面要素（after 具体仕様）
- **① ワードマーク QUALIA**: Cormorant Garamond 400・letter-spacing 0.38em・白（金にしない）。下にごく細い金ヘアライン1本のみ。**金は引く**。
- **② セリフ見出し階層**: H2 Noto Serif JP 500（重くしない）・余白を大きく（章間 py を現状+30%）。金は見出しに使わず navy-900 のまま、eyebrow にだけ gold-600 small-caps。
- **③ 金区切り線**: 中央 32px の極短ヘアライン1本（var(--gold-hairline)・両端フェード）のみ。線を減らし余白で章を分ける。
- **④ 金ボタン**: enter「はいる」は **navy-800 の塗り＋1px金ヘアライン枠＋文字 gold-300**、`box-shadow:0 8px 24px -10px rgba(12,21,48,.5)`（金の面でなく上質な影で立たせる）。plan も同様。
- **⑤ アクロスティック枠**: 枠も罫も最小化、頭文字 Cormorant 白＋下に極小 gold ドット。
- **⑥ 講師丸写真の金縁**: 縁を 1px gold-400/40 に弱め、代わりに `box-shadow:0 10px 30px -8px rgba(0,0,0,.5)` で浮遊感。
- **⑦ ChapterHeader**: number gold-600・title Noto Serif JP・上罫は③の極短ヘアライン。余白多め。
- **⑧ Hubタイル / 準備中ピル**: タイルは白地＋枠なし、`box-shadow:0 1px 2px rgba(12,21,48,.06),0 8px 24px -12px rgba(12,21,48,.15)` の柔影で分離。番号 gold-600。準備中ピルは塗りなしグレー＋極小金ドット。
- **⑨ 金ロックUI**: 紺グラデ深め＋鍵は gold-400/60 線、区切りは③ヘアライン。影で奥行き。

### トレードオフ
- 強み: 最も上品で警戒されにくい。実装が軽い（影中心・要素少）。375px破綻ほぼなし。
- 弱み: **ユーザー要望の「金メタリック質感」「タイポ grade up」を最も満たさない**（引き算なので2軸が弱い）。「ゴージャス」感が物足りないと評価されるリスク。
- 375px破綻リスク: 最小。
- 想定ユーザー: 高所得・本物志向の静かな層。/ 取りこぼし: 「高級＝豪華・金ピカ」を期待する大多数の見込み客には地味すぎる可能性。

---

## 推奨

**案B（エングレービング・エディトリアル）を骨格にし、案Aの箔表現を「ワードマーク QUALIA」と「解除する／はいるボタン」の主役2点に限定投下するハイブリッド** を推奨。

理由:
- ユーザーの2軸（金メタリック・タイポ grade up）を両方満たすのは A と B。C は2軸が弱く却下。
- ネットワークビジネス文脈は「胡散臭さ＝チープ化」が最大の事故。案A全振りはその事故に最も近い。よって**全面箔（A）は避け、品格の骨格（B）＋主役だけ箔（A）**が最適点。
- 具体配分: ワードマーク=案A箔（Cinzel or Cormorant + var(--gold-text)）/ ボタン主役=案A塗り箔 / 区切り・ChapterHeader・Hub・ピル・アクロスティック=案B（ヘアライン＋small-caps＋雑誌組み）。

---

# Designer Round 1 完了
- 出力先: design/gorgeous/round-1/
- 案数: 3（A箔全振り / Bエディトリアル / Cミニマル）＋推奨ハイブリッド
- 採用参照数: 13（Lazyweb由来1=Four Seasons screenshot / curl実在確認 luxury 3・font 5・技術doc 3・ブランド一次1）
- reviewer に投げる準備 OK
