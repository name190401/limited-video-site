/**
 * ヒーロー（§6 ヒーロー）。章扉なし。紺グラデ全面。
 * QUALIA ワードマーク＋アクロスティック＋主役（castle講師）丸写真72px＋「メニューへ↓」。
 */
const ACROSTIC = [
  { c: 'Q', w: 'Quality' },
  { c: 'U', w: 'Unique' },
  { c: 'A', w: 'Authentic' },
  { c: 'L', w: 'Liberty' },
  { c: 'I', w: 'Inspire' },
  { c: 'A', w: 'Ascend' },
]

export default function Hero({ lead }) {
  return (
    <section className="relative bg-gradient-to-b from-navy-900 via-navy-700 to-navy-500 px-5 pt-20 pb-16 md:px-10 text-center overflow-hidden">
      {/* 上端ハイライト（navy-400 の薄い縁） */}
      <span className="absolute inset-x-0 top-0 h-px bg-navy-400/60" />

      <h1 className="font-serif text-white text-[40px] md:text-[56px] font-semibold tracking-[0.18em]">
        QUALIA
      </h1>

      {/* アクロスティック */}
      <div className="mt-7 flex justify-center gap-2 md:gap-3">
        {ACROSTIC.map((a, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 border border-gold-400/80 text-gold-400 font-serif text-[15px] md:text-[18px]">
              {a.c}
            </span>
            <span className="mt-1 text-navy-100 text-[8px] md:text-[9px] tracking-[0.08em]">{a.w}</span>
          </div>
        ))}
      </div>

      {/* 主役（castle講師）丸写真 */}
      {lead && (
        <div className="mt-10 flex flex-col items-center">
          {lead.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lead.photo_url}
              alt={lead.name}
              className="w-[72px] h-[72px] rounded-full object-cover border border-gold-400"
            />
          ) : (
            <span className="w-[72px] h-[72px] rounded-full border border-gold-400 bg-navy-800 flex items-center justify-center text-gold-400 font-serif text-xl">
              {lead.name?.[0]}
            </span>
          )}
          <span className="mt-2 text-white font-serif text-[15px]">{lead.name}</span>
          <span className="mt-1 text-gold-400 text-[11px] font-bold tracking-[0.12em]">castle 講師</span>
        </div>
      )}

      {/* メニューへ↓ */}
      <a href="#hub" className="mt-12 inline-flex flex-col items-center text-navy-100 text-[12px] tracking-[0.12em]">
        メニューへ
        <svg className="mt-1 animate-bounce" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3v9M8 12l-4-4M8 12l4-4" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  )
}
