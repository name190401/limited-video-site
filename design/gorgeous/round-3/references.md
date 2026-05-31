# References — QUALIA ゴージャス化 Round 3

> Round 2 と同一参照セット（全live再検証済）+ Round 3 で Tailwind fontFamily 登録の技術根拠を追加。

## 継続（Round 2 から不変・全検証済）
| # | 出典 | 検証 | 採用パターン |
|---|------|------|--------------|
| 1 | Four Seasons hero (`design/member/round-1/references/four-seasons-luxury-hero.png`) | screenshot 1.5MB on disk | small-caps eyebrow・ハイコントラストセリフ・1px罫・余白 |
| 2 | Aman https://www.aman.com | curl 200 | 大字間細セリフ・抑制金・余白 |
| 3 | Belmond https://www.belmond.com | curl 200 | エディトリアル見出し・small-caps・hairline rule |
| 4 | Ritz-Carlton https://www.ritzcarlton.com | curl 200 | 紺地に金/ベージュ細罫 |
| 5 | Rolex/Cartier/Tiffany | curl 403(botブロック=実在) | メタリックゴールド・箔縦ハイライト帯 |
| 6 | MDN background-clip https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip | curl 200 | textへ金グラデclip |
| 7 | CSS-Tricks Gradient Text https://css-tricks.com/snippets/css/gradient-text/ | curl 200 | linear-gradient+clip |
| 8 | MDN font-variant-caps https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-caps | curl 200 | 真正small-caps |
| 9 | MDN filter: drop-shadow() https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/drop-shadow | curl 200 | clip文字へ立体影 |
| 10 | MDN text-shadow https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow | curl 200 | ::after複製エンボス根拠 |

## Round 3 追加（⚠1 fontFamily登録の技術根拠）
| # | 出典 | 検証 | 採用パターン |
|---|------|------|--------------|
| 11 | Tailwind CSS Font Family docs https://tailwindcss.com/docs/font-family | curl確認 | theme.extend.fontFamily で `font-cinzel`/`font-cormorant` を生成、または任意値 `font-['Cinzel']` |

## フォント（全200・Round1 references.md参照）
Cinzel / Cormorant Garamond / Playfair Display / EB Garamond / Noto Serif JP。

## 既存実装（突合済）
tailwind.config.js（fontFamilyキー無し=要追加・実確認済）・globals.css・enter/page.js・Hero.js・ChapterHeader.js(onGradient分岐突合一致)・Hub.js・PlanSection.js。
