# References — QUALIA ゴージャス化 Round 1

> 収集経路の注記: 本オーケストレータは subagent コンテキストで動作しており Task/Skill(lazyweb)/WebSearch/WebFetch が使用不可。
> そのため (a) 既存ループ `design/member/round-1/references/` に保存済みの Lazyweb 由来スクショ（特に luxury 系）を再利用し、
> (b) curl による URL 実在確認（live=HTTP200 / blocked=403はbotブロックで実在自体は確認）で代替検証している。
> design-reviewer 役も同 curl で再検証する。

## A. ラグジュアリー・エディトリアル / セリフタイポ階層（最重要参照）

| # | 出典 | 種別 | 検証 | 採用したいパターン |
|---|------|------|------|--------------------|
| 1 | Four Seasons "Curated for the Curious" hero | 既存Lazywebスクショ `design/member/round-1/references/four-seasons-luxury-hero.png`（目視確認済） | screenshot on disk | (a) small-caps の極小エンブロウ "FOR THE CURIOUS" を大字間で見出し上に置く (b) ハイコントラスト・セリフ display 見出し＋一部 italic アクセント (c) 紺の暗いエディトリアル面に 1px の細い罫 (d) 余白でラグジュアリーを作る |
| 2 | Aman | https://www.aman.com | curl 200 (live) | 大きな字間の細セリフ・ミニマル余白・抑制された金（多用しない）・静謐な高級 |
| 3 | Belmond | https://www.belmond.com | curl 200 (live) | エディトリアルなセリフ大見出し＋ small-caps ナビ・薄い hairline rule |
| 4 | Ritz-Carlton | https://www.ritzcarlton.com | curl 200 (live) | セリフ見出し＋細い金/ベージュのアクセント罫、紺〜黒の深い背景 |

## B. 金メタリック / 箔押し質感（金強化軸）

| # | 出典 | 種別 | 検証 | 採用したいパターン |
|---|------|------|------|--------------------|
| 5 | Rolex / Cartier / Tiffany / Bvlgari ブランドサイト | https://www.rolex.com 等 | curl 403（botブロック=実在ブランド。質感の一次ソース） | メタリックゴールドのワードマーク・箔の縦ハイライト帯・暗地に金の細罫。CSS では再現不可な実写質感 → 下記C技術で近似する |
| 6 | MDN `background-clip` | https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip | curl 200 | `background-clip:text` で金グラデを文字に流す（=既存 `.text-gold-gradient` の正攻法） |
| 7 | CSS-Tricks Gradient Text | https://css-tricks.com/snippets/css/gradient-text/ | curl 200 | linear-gradient + background-clip:text のクロスブラウザ実装手順 |
| 8 | MDN `font-variant-caps` | https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-caps | curl 200 | `font-variant-caps:small-caps` でエンブロウ/ラベルを真正な small-caps に |

## C. Web フォント（タイポ grade up 軸・実在確認）

| # | フォント | URL | 検証 | 用途 |
|---|----------|-----|------|------|
| 9 | Cormorant Garamond | https://fonts.google.com/specimen/Cormorant+Garamond | curl 200 | 英字ワードマーク/display。高コントラスト・繊細・エディトリアル品格（Four Seasons 系の質感に最も近い） |
| 10 | Cinzel | https://fonts.google.com/specimen/Cinzel | curl 200 | 英字ワードマーク。ローマンキャピタル・碑文的・「重厚な高級」（金箔と相性） |
| 11 | Playfair Display | https://fonts.google.com/specimen/Playfair+Display | curl 200 | 英字 display。太め・ハイコントラスト・雑誌見出し的 |
| 12 | EB Garamond | https://fonts.google.com/specimen/EB+Garamond | curl 200 | 英字本文/小見出しの上質セリフ（Cormorant より読みやすい） |
| 13 | Noto Serif JP | https://fonts.google.com/noto/specimen/Noto+Serif+JP | curl 200 | 日本語見出し（既存導入済・継続）。ウェイトを使い分けて階層化 |

## 既存実装（before 突合の土台・実ファイル確認済）
- `tailwind.config.js`: gold 50–900 / navy 50–900（読込済）
- `app/globals.css`: `.text-gold-gradient`(135deg #D4AF37→#F5E6A3→#D4AF37) / `.bg-gold-gradient` / `.glow-gold`(0 0 20px rgba(212,175,55,.15)) / Noto Serif JP+Sans JP import（読込済）
- `app/enter/page.js` / `components/member/Hero.js` / `ChapterHeader.js` / `Hub.js` / `sections/PlanSection.js`（全読込済）
