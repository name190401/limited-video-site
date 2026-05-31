# References — QUALIA ゴージャス化 Round 2

> Round 1 と同経路（既存Lazywebスクショ再利用 + curl実在確認）。Round 2 で技術根拠を追加。

## Round 1 から継続（再検証済・全live / screenshot実在）
| # | 出典 | 検証 | 採用パターン |
|---|------|------|--------------|
| 1 | Four Seasons hero (`design/member/round-1/references/four-seasons-luxury-hero.png`) | screenshot on disk 1.5MB | small-caps eyebrow・ハイコントラスト display セリフ・1px罫・余白 |
| 2 | Aman https://www.aman.com | curl 200 | 大字間細セリフ・抑制された金・余白 |
| 3 | Belmond https://www.belmond.com | curl 200 | エディトリアル大見出し・small-caps ナビ・hairline rule |
| 4 | Ritz-Carlton https://www.ritzcarlton.com | curl 200 | 紺〜黒地に金/ベージュ細罫 |
| 5 | Rolex/Cartier/Tiffany | curl 403(botブロック=実在) | メタリックゴールド・箔縦ハイライト帯（質感一次ソース） |
| 6 | MDN background-clip https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip | curl 200 | text への金グラデclip |
| 7 | CSS-Tricks Gradient Text https://css-tricks.com/snippets/css/gradient-text/ | curl 200 | linear-gradient+background-clip:text |
| 8 | MDN font-variant-caps https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-caps | curl 200 | 真正 small-caps |

## Round 2 追加（✗2 擬似エンボスの技術根拠）
| # | 出典 | 検証 | 採用パターン |
|---|------|------|--------------|
| 9 | MDN filter: drop-shadow() https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/drop-shadow | curl確認 | background-clip:text の金文字に **drop-shadow** で立体影（text-shadow併用不可問題の正規回避） |
| 10 | MDN text-shadow https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow | curl確認 | clipしない要素のエンボス用（::after複製方式の根拠） |

## フォント（再検証済・全200）
Cormorant Garamond / Cinzel / Playfair Display / EB Garamond / Noto Serif JP — Round 1 references.md 参照。

## 既存実装（突合済）
tailwind.config.js(gold/navy)・globals.css(.text-gold-gradient等)・enter/page.js・Hero.js・ChapterHeader.js・Hub.js・PlanSection.js — Round 1 で全読込・突合済。
