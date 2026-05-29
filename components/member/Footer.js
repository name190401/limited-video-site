/** フッター（§6）。QUALIA ワードマーク小＋castle クレジット＋ハブ/トップへ戻る。 */
export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-navy-700 to-navy-900 px-5 py-12 text-center">
      <p className="font-serif text-white text-[22px] tracking-[0.18em]">QUALIA</p>
      <p className="mt-2 text-navy-300 text-[11px] tracking-[0.12em]">produced by castle</p>
      <div className="mt-6 flex items-center justify-center gap-6">
        <a href="#hub" className="text-gold-400 text-[13px] font-semibold">ハブに戻る</a>
        <a href="#top" className="inline-flex items-center gap-1 text-gold-400 text-[13px] font-semibold">
          トップへ
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 10V2M6 2L2 6M6 2l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </footer>
  )
}
