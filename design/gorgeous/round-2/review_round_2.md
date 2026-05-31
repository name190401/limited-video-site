# Design Review — Round 2

## 総合判定: PASS

Round 1 の ✗3件・⚠4件をすべて確定 spec で解消。実ファイル突合（ChapterHeader onGradient・enter disabled・tailwind/ globals）と参照 URL 再検証（全live）も通過。残課題は ⚠2件のみで、いずれも実装着手をブロックしない（PASS は ⚠ を carry できる）。

## 基準別スコア
| カテゴリ | 結果 | 詳細 |
|----------|------|------|
| 参照根拠 | ✓ | 案A 2件/案B 3件/案C 3件 維持。追加 #9 drop-shadow・#10 text-shadow（curl 200） |
| 参照妥当性 | ✓ | reviewer 再curl: aman/MDN drop-shadow/MDN font-variant-caps/Cinzel = 全200。Four Seasons screenshot 実在。Rolex系403=botブロック許容 |
| 要素網羅 | ✓ | A の px スケール表（9トークン×family/weight/375px/md/lh/ls/色）確定。C の 9要素×採用案×確定CSS 表確定。実装者がコピペ可能粒度 |
| 多様性 | ✓ | A盛る/B品格/C引き算 を再掲・採用根拠明示。本質的差分維持 |
| トレードオフ | ✓ | 採用ハイブリッドの強み/弱み/375px/刺さる層・取りこぼす層を明示 |
| 要件整合 | ✓ | 紺×金維持・モバイル375px clamp確定・WebGL不使用・再描画負荷を E で定量確定（箔塗りはボタン+locked縁のみ、アニメは background-position/transform 限定） |
| 形容詞濫用 | ✓ | NGワード grep 0件（モダン/洗練/シンプル/美しい/きれい等） |
| scope 逸脱 | ✓ | 2画面9要素のビジュアルに限定。新機能/章追加なし |
| 想定ユーザー | ✓ | 採用案で刺さる層・取りこぼす層を記述 |

## Round 1 ✗ の解消確認（実突合）
| Round1 ✗ | 解消 | 確認 |
|----------|------|------|
| ✗1 タイポ px 階層表なし | ✓ | §A に9トークン確定表。375px/md 両列・clamp(40,11.2vw,56)確定 |
| ✗2 案A①擬似エンボス手順未確定 | ✓ | §B に drop-shadow 第一手（clip併用可・MDN#9根拠）の実CSS + ::after複製フォールバックの実JSX。background-clip:text と text-shadow 併用不可問題を正規回避 |
| ✗3 ハイブリッド9要素採用表なし | ✓ | §C に ①〜⑨×採用案×確定CSS を1要素1行で確定。①④=A箔/その他=B骨格 |
| ⚠4 375px折返し | ✓ | §A で ls0.14em+clamp 確定（Round1の0.16/0.30から圧縮し収まり改善） |
| ⚠5 disabled/focus | ✓ | §D に default/hover/focus-visible/disabled の4状態確定。現状 opacity-50 を filter+opacity に置換 |
| ⚠6 再描画負荷 | ✓ | §E に箔塗り面積上限・アニメ限定を確定 |
| ⚠7 13章eyebrow | ✓ | §F に01-13の英small-caps語彙確定（ORIGIN〜QUESTIONS） |

## 採用ハイブリッド element-level 評価
| 要素 | 判定 | コメント |
|------|------|----------|
| ①ワードマーク | ✓ | Cinzel600 .gold-clip + drop-shadow 2層。clip+影併用問題を解決済。clamp確定。実装可能 |
| ②見出し階層 | ✓ | §A表で全トークン確定。ChapterHeader 組順(eyebrow→番号→title)明確 |
| ③区切り線 | ✓ | ヘアライン+菱形オーナメントの実HTML/CSS（rotate-45 bg-gold-400）確定 |
| ④金ボタン | ✓ | var(--gold-foil)+inset/外影+::before光沢、§Dで4状態。enterとplan統一。突合可 |
| ⑤アクロスティック | ✓ | 角枠廃止→Cinzel頭文字clip+短ヘアライン。雑誌組み具体 |
| ⑥講師丸縁 | ✓ | padding1px+var(--gold-hairline)外殻リング+影。CASTLE INSTRUCTOR併記 |
| ⑦ChapterHeader | ✓ | onGradient時 title=白/eyebrow=#E0C57B。**実ファイル(ChapterHeader.js:30 onGradient?text-white:text-navy-900)と突合一致** |
| ⑧Hubタイル/ピル | ✓ | ヘアライン枠+二段box-shadow、COMING SOON small-caps。具体 |
| ⑨金ロックUI | ✓ | ③区切り+1pxリング鍵+④塗り箔ボタン主役化+navy-900 radial 1枚(E)。実装可能 |

## carry する ⚠（PASSをブロックしない・FINALに注記）
1. ⚠ **Cinzel/Cormorant のクラス登録方法が未明記**: tailwind.config.js に `fontFamily` キーが無い（実確認済＝`font-serif`はTailwind既定serif、h1-h3はglobals.cssでNoto Serif JP上書き）。Cinzel/Cormorant は import 済(0-2)だが、適用は (a) tailwind.config に `fontFamily:{ cinzel:['Cinzel','serif'], cormorant:['"Cormorant Garamond"','serif'] }` を足して `font-cinzel`/`font-cormorant`、または (b) 任意値クラス `font-['Cinzel']`、または (c) inline `style` のいずれか。実装時に (a) を推奨（再利用性）。spec として家族名は確定しているので着手はブロックしない。
2. ⚠ **drop-shadow のレンダリング微差**: Safari/Chrome で drop-shadow の gold-clip 文字への乗り方に1px級の差が出うる。実機(iPhone/iPad Safari)で①ワードマークの艶/影を目視確認すること。

## PASS の場合のコメント（光った点）
- background-clip:text と text-shadow の併用不可という実装事故ポイントを designer 自ら指摘し、drop-shadow 正規回避＋::after フォールバックの二段で確定したのは堅実。
- 「箔塗りは①④に限定」という面積制約を、ブランド毀損回避（胡散臭さ事故）と再描画負荷の両方の根拠で確定した判断が、ネットワークビジネス文脈に合致。
- ChapterHeader の onGradient 分岐が実ファイルと完全一致しており、spec が実装に接地している。

# Reviewer Round 2 完了
- 判定: PASS
- 出力: design/gorgeous/round-2/review_round_2.md
- 主要 ✗: 0件 / carry ⚠: 2件
- orchestrator に投げる準備 OK（連続PASS判定へ）
