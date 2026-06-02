/**
 * 「準備中」ピル（§7）。薄地サーフェス上の既定（金500罫／金700字）。
 * ハブタイル・ComingSoonCard で共用。文脈で色・寸法が違う場所（タブ内・紺地メニュー）は個別実装のまま。
 */
export default function SoonPill() {
  return (
    <span className="inline-block border border-gold-500 text-gold-700 text-[10px] font-medium tracking-[0.14em] rounded-full px-2.5 py-0.5">
      準備中
    </span>
  )
}
