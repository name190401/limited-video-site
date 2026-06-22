/**
 * ヒーロー（§6 ヒーロー）ゴージャス版。章扉なし。紺グラデ全面。
 * QUALIA 箔ワードマーク（Cinzel・gold-clip）＋アクロスティック（金clip頭文字＋ヘアライン短罫）
 * ＋主役（castle講師）丸写真72px（金ヘアラインリング）＋「メニューへ↓」。
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
      {/* 上端ハイライト（金ヘアライン） */}
      <span className="absolute inset-x-0 top-0 h-px gold-hairline" />

      <h1 className="wordmark gold-clip font-cinzel font-semibold leading-none">
        QUALIA
      </h1>

      {/* アクロスティック（B案: 枠廃止・金clip頭文字＋ヘアライン短罫） */}
      <div className="mt-8 flex justify-center gap-3 md:gap-4">
        {ACROSTIC.map((a, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="gold-clip font-cinzel font-medium text-[18px] md:text-[22px] leading-none">
              {a.c}
            </span>
            <span className="mt-1.5 h-px w-5 gold-hairline" />
            <span className="mt-1.5 text-navy-300 text-[8px] md:text-[9px] tracking-[0.12em] font-sansjp">
              {a.w}
            </span>
          </div>
        ))}
      </div>

      {/* 主役（castle講師）丸写真：金ヘアラインリング */}
      {lead && (
        <div className="mt-12 flex flex-col items-center">
          <div
            className="rounded-full p-px gold-hairline"
            style={{ boxShadow: '0 6px 18px -6px rgba(12,21,48,0.5)' }}
          >
            {lead.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lead.photo_url}
                alt={lead.name}
                className="block w-[72px] h-[72px] rounded-full object-cover"
              />
            ) : (
              <span className="w-[72px] h-[72px] rounded-full bg-navy-800 flex items-center justify-center text-gold-300 font-cinzel text-xl">
                {lead.name?.[0]}
              </span>
            )}
          </div>
          <span className="mt-3 text-white font-serifjp text-[16px]">{lead.name}</span>
          <span className="mt-1 text-gold-300 text-[11px] font-medium tracking-[0.12em]">castle 講師</span>
          <span className="mt-1 font-cormorant text-gold-500 text-[10px] tracking-[0.34em] [font-variant:small-caps]">
            CASTLE INSTRUCTOR
          </span>
        </div>
      )}

      {/* メニューへ↓ */}
      <a href="#hub" className="mt-12 inline-flex flex-col items-center text-navy-100 text-[12px] tracking-[0.12em] font-sansjp">
        メニューへ
        <svg className="mt-1 animate-bounce" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3v9M8 12l-4-4M8 12l4-4" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  )
}
