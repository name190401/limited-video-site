# Design Review — Round 1

## 総合判定: FAIL

致命的理由（3行以内）:
1. ②タイポ grade up が「フォント名＋letter-spacing」止まりで、**font-size 階層が px の表として確定していない**（H1/H2/H3/eyebrow/番号/本文の確定スケールが無い）。実装者がそのまま組めない。
2. 案A①ワードマークの擬似エンボス（`::after` 同字複製）が**実装手順未確定**（content の与え方・background-clip:text と影の両立の具体コードが無い）。「実装可能粒度」を名乗る spec として突合不能。
3. 推奨ハイブリッドが文章宣言のみで、**9要素それぞれ「A採用かB採用か」の確定表が無い**。実装者が要素ごとに迷う。

## 基準別スコア
| カテゴリ | 結果 | 詳細 |
|----------|------|------|
| 参照根拠 | ✓ | 案A 2件(#5,#6/#7)・案B 3件(#1,#2/#3,#8)・案C 3件(#2,#1,#6)。各案最低2件クリア |
| 参照妥当性 | ✓ | curl再検証: aman/belmond/ritzcarlton/font5/MDN2/csstricks=全200。Four Seasons screenshot 実在(1.5MB)。Rolex系403はbotブロックで実在ブランド=質感一次ソースとして許容 |
| 要素網羅 | ✗ | 9要素は全案で言及あり=網羅自体は可。**ただしタイポの font-size 階層が px 確定表として無く、案A①の疑似エンボスが手順未確定**。「実装に移せる粒度」基準で不足 |
| 多様性 | ✓ | A=盛る(箔全振り)/B=品格(罫+small-caps)/C=引く(余白+影)。哲学が本質的に異なる。色違いではない |
| トレードオフ | ✓ | 全案で強み/弱み/375px破綻/刺さる層・取りこぼす層を明示 |
| 要件整合 | ⚠ | 紺×金維持✓・モバイルファースト言及✓・WebGL不使用✓。ただし**金メタリックの再描画負荷の定量配慮が hover background-position の1点のみ**で、箔グラデ多用時の paint コスト評価が薄い |
| 形容詞濫用 | ✓ | NGワード grep 0件。具体CSS/px/フォント名で記述 |
| scope 逸脱 | ✓ | 2画面9要素のビジュアルに限定。新機能/章追加なし |
| 想定ユーザー | ✓ | 全案で刺さる層・取りこぼす層を記述 |

## 案別 element-level 評価

### 案A（箔押しメタリック）
| 要素 | 判定 | コメント |
|------|------|----------|
| ①ワードマーク | ✗ | Cinzel600+var(--gold-text)clip は具体。しかし**擬似エンボスの実装手順が未確定**（background-clip:text と text-shadow併用不可は正しく指摘したが、代替の::after複製の content・配置・z-indexの実コードが無い）。突合不能 |
| ②見出し階層 | ✗ | フォント/tracking は具体だが H1 54/H2 30/eyebrow 11 と数字が散発で、**確定スケール表が無い**。md/375px両対応の clamp も①以外欠落 |
| ③区切り線 | ✓ | h-[2px]+var(--gold-hairline)+box-shadow艶。実装可能 |
| ④金ボタン | ✓ | var(--gold-foil)+inset/外側box-shadow+::before光沢。具体的で実装可能 |
| ⑤アクロスティック枠 | ✓ | border-box箔(padding-box/border-box二重背景)。正しい手法 |
| ⑥講師丸縁 | ✓ | border-box箔リング+影。可 |
| ⑦ChapterHeader | ⚠ | 箔バー+Cinzel番号は可だが、番号と既存tracking[0.12em]の整合・onGradient時(紺地)のclip可読性未検証 |
| ⑧Hubタイル/ピル | ✓ | border-box箔+inset/影。可 |
| ⑨金ロックUI | ✓ | 箔バー+箔リング+塗り箔ボタン。可 |

### 案B（エディトリアル）
| 要素 | 判定 | コメント |
|------|------|----------|
| ①ワードマーク | ⚠ | Cormorant500 ls0.30em+italic小見出しは具体。ただし**375pxで「QUALIA」7字×0.30em が折返さない最大font-size の確定値が無い**（clampのみ言及） |
| ②見出し階層（主役） | ✗ | eyebrow small-caps(11px/ls0.34em/#C5A55A)は具体。しかし**H2/番号/本文の px 確定スケール表が無い**。主役と謳う割に階層が表で確定していない |
| ③区切り線 | ✓ | 中央寄せ1pxヘアライン+菱形オーナメント(::before 4px回転#D4AF37)。具体 |
| ④金ボタン | ⚠ | border-image:var(--gold-hairline)1 は機能するが、**border-image とテキストclipの併用時のフォーカスリング/disabled時の見えは未記述**（enter は disabled状態を持つ） |
| ⑤アクロスティック | ✓ | 角枠廃止→頭文字clip+下罫。雑誌組みとして具体 |
| ⑥講師丸縁 | ✓ | 1pxヘアラインリング+肩書small-caps併記。可 |
| ⑦ChapterHeader（見せ場） | ✓ | eyebrow英small-caps(ORIGIN等)+番号Cormorant+title Noto Serif JP。雑誌章扉として具体。ただし全13章の英eyebrow語彙リストは未提示（⚠寄りだが致命ではない） |
| ⑧Hubタイル/ピル | ✓ | ヘアライン枠+COMING SOON small-caps。可 |
| ⑨金ロックUI | ✓ | ヘアライン+オーナメント+アウトラインボタン+セリフコピー。可 |

### 案C（ミニマル）
| 要素 | 判定 | コメント |
|------|------|----------|
| 全般 | ⚠ | 各要素の指定はあるが、設計上「2軸を引く」案のため**ユーザー要望(金メタリック/タイポgrade up)との整合が弱い**ことを designer 自身が弱みとして明記済み。候補としては妥当だが採用時は要件未達 |
| ④金ボタン | ✓ | navy-800塗り+金ヘアライン枠+gold-300文字+影。実装可能 |
| ⑧タイル | ✓ | 枠なし+二段box-shadowで分離。具体 |

## designer への指示（FAIL）
1. ✗ **②タイポ階層の確定 px スケール表を全案に追加**: H1(ワードマーク)/H2(章見出し)/H3(小見出し)/eyebrow/章番号/本文/キャプション について、375px(モバイル)→md(768px+) の font-size・font-weight・line-height・letter-spacing・font-family を**1枚の表**で確定させる。実装者がコピペで `tailwind` クラス or CSS に落とせる粒度に。
2. ✗ **案A①ワードマーク擬似エンボスの実コードを確定**: background-clip:text の金文字に立体感を出す方法を、(a)::after で同テキスト複製しオフセット影色を敷く完全な CSS（content の与え方・position・z-index・aria-hidden）か、(b)併用可能な `filter: drop-shadow()` での代替か、どちらかに**実コードで確定**。突合できる形に。
3. ✗ **推奨ハイブリッドの「9要素×A/B採用」確定表を追加**: ①〜⑨それぞれ「案A採用／案B採用／案C採用」と、採用した具体CSS値を1要素1行で確定。これが最終 FINAL の中核。実装者がこの表だけ見れば組める状態に。
4. ⚠ **375pxワードマーク折返し検証値**: 「QUALIA」(英7字) を 案の letter-spacing(A:0.16em / B:0.30em / C:0.38em)で375px幅に収める最大 font-size(px)を各案で明示。clamp() の min/preferred(vw)/max を確定値で。
5. ⚠ **enter ボタンの disabled / focus 状態**: 金ボタンは `disabled`(password空)と `focus-visible` を持つ。各案の金ボタンで disabled時(現状opacity-50)・focusリング(キーボード操作)の見えを確定。
6. ⚠ **再描画負荷の定量配慮**: 箔グラデ(var(--gold-foil))を何要素まで・どこに使うと paint が重くなるか、アニメーションは何に限定するか(background-position/transform限定等)を1段落で確定。
7. ⚠ **ChapterHeader 全13章の英 eyebrow 語彙**（案B採用時）: 名前の由来=ORIGIN 等、13章ぶんの small-caps 英ラベルを確定（実装者が章ごとに迷わないよう）。

（次ラウンドは round-2/ に出力。前ラウンドを上書きしない）

## PASS の場合のコメント
（今回 FAIL のため無し。光った点として、金メタリックの素材プリミティブ(--gold-foil/--gold-hairline/--gold-text)を共通トークン化した設計と、ネットワークビジネス文脈で「盛りすぎ=胡散臭さ事故」を見越して案A全振りを避けた判断は妥当。次ラウンドで上記7点を確定すれば PASS 圏内。）

# Reviewer Round 1 完了
- 判定: FAIL
- 出力: design/gorgeous/round-1/review_round_1.md
- 主要 ✗: 3件 / ⚠: 4件
- orchestrator に投げる準備 OK
