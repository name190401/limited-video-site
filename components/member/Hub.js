import SectionIcon from './SectionIcon'

/** 公開予定月の極小表示用（key→月）。準備中タイルにのみ出す。後で管理画面/DBに移せる。 */
const PLANNED_MONTH = {
  ear_opening: '6月',
  plan_intro: '6月',
  closing: '6月',
  plan: '6月',
  bonus: '7月',
  products: '7月',
  training: '7月',
  registration: '6月',
  how_to_use: '6月',
}

function pad(n) {
  return String(n).padStart(2, '0')
}

/**
 * ハブ（§5・hero 直下の核）。13 セクションのタイルグリッド。
 * タイルタップ → #sec-NN へ smooth scroll。
 * 準備中タイル=金「準備中」ピル＋opacity0.7＋公開月。07=金鍵（解除後チェックは Phase4 で client 化）。
 */
export default function Hub({ sections }) {
  return (
    <section id="hub" className="scroll-anchor relative section-surface section-divider px-5 py-12 md:px-10">
      <div className="md:max-w-[680px] md:mx-auto">
        <p className="text-center font-cormorant text-gold-500 text-[11px] tracking-[0.34em] [font-variant:small-caps] mb-1">
          Contents
        </p>
        <p className="text-center text-navy-400 text-[12px] tracking-[0.12em] mb-6 font-sansjp">
          見たい項目を選んでください
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sections.map((s) => {
            const num = pad(s.sort_order)
            const soon = s.status === 'coming_soon'
            const isPlan = s.key === 'plan'
            return (
              <a
                key={s.key}
                href={`#sec-${num}`}
                style={{ boxShadow: '0 1px 2px rgba(12,21,48,0.05), 0 10px 24px -14px rgba(12,21,48,0.18)' }}
                className={`tile-glow relative flex flex-col gap-2 rounded-xl border border-gold-400/50 bg-white p-3.5 min-h-[96px] transition-[transform,opacity] hover:-translate-y-0.5 ${
                  soon ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="gold-clip font-cinzel font-medium text-[14px] tracking-[0.10em] leading-none">{num}</span>
                  {isPlan ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M7 11V8a5 5 0 0110 0v3M5 11h14v9H5z" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <SectionIcon sectionKey={s.key} className="w-5 h-5" />
                  )}
                </div>
                <span className="font-serifjp font-semibold text-navy-900 text-[14px] leading-snug">{s.title}</span>
                {soon && (
                  <div className="mt-auto flex items-center justify-between">
                    <span className="inline-block border border-gold-500 text-gold-700 text-[10px] font-medium tracking-[0.14em] rounded-full px-2.5 py-0.5">
                      準備中
                    </span>
                    {PLANNED_MONTH[s.key] && (
                      <span className="text-navy-400 text-[11px] tracking-[0.04em]">{PLANNED_MONTH[s.key]}</span>
                    )}
                  </div>
                )}
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
