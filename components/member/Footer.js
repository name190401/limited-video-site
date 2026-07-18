/** フッター（§6）。QUALIA ワードマーク小＋castle クレジット＋ハブ/トップへ戻る。 */
export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-navy-700 to-navy-900 px-5 py-12 text-center">
      <p className="gold-clip font-cinzel font-semibold text-[22px] tracking-[0.14em] leading-none">QUALIA</p>
      {/* castle 紋章（producer ブランド・白単色エンブレム／"Castle"文言は produced by castle に一本化） */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/castle-emblem-full-white.png"
        alt="Castle — Team Ryo Ishii"
        width="96"
        height="79"
        className="mx-auto mt-5 w-[96px] h-auto opacity-95"
      />
      <p className="mt-3 font-cormorant text-navy-300 text-[11px] tracking-[0.34em] [font-variant:small-caps]">produced by castle</p>
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
