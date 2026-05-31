# Rationale — QUALIA ゴージャス化 Round 2

## Round 1 reviewer FAIL への対応方針
reviewer の ✗3件・⚠4件すべてに正面から対応。Round 2 の中核は「実装者がコピペで組める確定 spec」化:
- ✗1 → §A に **タイポ確定 px スケール表**（375px→md、family/weight/size/lh/ls 全列）を新設。
- ✗2 → §B 案A①ワードマークの立体感を **filter: drop-shadow() 方式（clipと併用可）を第一手**に、::after 複製方式を代替として**実コードで確定**。background-clip:text と text-shadow が併用不可な点の正規回避。
- ✗3 → §C に **採用版ハイブリッド「9要素×採用案＋確定CSS」を1行1要素の表**で確定。これが FINAL の中核。
- ⚠4(375px折返し) → §A に clamp 確定値（min/vw/max）と各案 letter-spacing での「QUALIA」7字の収まり。
- ⚠5(disabled/focus) → §D に金ボタンの state（default/hover/focus-visible/disabled）を確定。
- ⚠6(再描画負荷) → §E に「箔グラデを使う要素の上限・アニメは background-position/transform 限定」を確定。
- ⚠7(13章eyebrow) → §F に全13章の英 small-caps eyebrow 語彙を確定。

## 案の哲学は維持
Round 1 の推奨（案B骨格＋案A箔を主役2点に限定投下するハイブリッド）を継続。reviewer も「案A全振り回避は妥当」と評価。Round 2 は新方向を出すのではなく、**この方向を実装可能粒度に確定**するラウンド。

## 捨てた選択肢（Round 1 から不変）
WebGL箔シェーダ／色相変更／全要素shimmer／情報設計変更 — いずれも不採用（制約・scope）。
