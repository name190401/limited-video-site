/** 各セクション末尾の「ハブに戻る↑」金リンク（§6 共通）。 */
export default function BackToHub() {
  return (
    <div className="mt-10 text-center">
      <a
        href="#hub"
        className="inline-flex items-center gap-1.5 text-gold-600 text-[13px] font-semibold tracking-[0.04em] hover:text-gold-500 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 10V2M6 2L2 6M6 2l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        ハブに戻る
      </a>
    </div>
  )
}
