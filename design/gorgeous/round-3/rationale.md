# Rationale — QUALIA ゴージャス化 Round 3

## Round 3 の位置づけ
Round 2 で PASS（連続1）。Round 3 は方向転換ではなく、**Round 2 で carry した ⚠2件を確定し、spec を完全にロックして連続2PASSを成立させる**ラウンド。新案・スコープ拡張はしない。

## ⚠2件への対応
- ⚠1 Cinzel/Cormorant のクラス登録方法未明記 → §G に **tailwind.config.js への fontFamily 追加（実コード）** を確定。`font-cinzel` / `font-cormorant` を生成し、A表/C表の family 指定を Tailwind クラスに一意対応させる。
- ⚠2 drop-shadow の Safari/Chrome 微差 → §B に **実機確認チェックリスト**＋差が出た場合のフォールバック判断（::after 複製方式へ切替）を確定。

## 不変（Round 1→2→3）
案の哲学（B骨格＋A箔を①④限定）・A表（タイポ階層）・C表（9要素採用）・D（ボタン状態）・E（再描画負荷）・F（13章eyebrow）はすべて Round 2 で確定済みのため**そのまま継承**。Round 3 は G を足し、A表/C表の family 表記を Tailwind クラス名に揃えるだけ。

## 捨てた選択肢（不変）
WebGL／色相変更／全要素shimmer／情報設計変更。
