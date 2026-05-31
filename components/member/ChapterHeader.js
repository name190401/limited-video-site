/**
 * 章扉（§4）ゴージャス版。
 * 金ヘアライン罫＋中央菱形オーナメント → 英 eyebrow（Cormorant small-caps）
 * → 章タイトル（Noto Serif JP）＋ 金clip 章番号（Cinzel）。
 * id="sec-NN" を付与し、IntersectionObserver（SectionMenu）の監視対象・アンカー先を兼ねる。
 *
 * @param {string} num     - '01'〜'13'
 * @param {string} title   - 章タイトル
 * @param {string} badge   - 任意の件数バッジ等（09/10 用、例 "公開 2 / 予定 7"）
 * @param {string} eyebrow - 英ラベル。未指定なら num から既定値を引く。
 * @param {boolean} onGradient - グラデ地（紺）の上に置くか。既定は薄地。
 */
const EYEBROW = {
  '01': 'ORIGIN',
  '02': 'INSTRUCTORS',
  '03': 'INTRODUCTION',
  '04': 'THE PLAN',
  '05': 'CLOSING',
  '06': 'SOCIAL',
  '07': 'MEMBERS PLAN',
  '08': 'REWARDS',
  '09': 'PRODUCTS',
  '10': 'TRAINING',
  '11': 'HOW TO JOIN',
  '12': 'GUIDE',
  '13': 'QUESTIONS',
}

export default function ChapterHeader({ num, title, badge, eyebrow, onGradient = false }) {
  const label = eyebrow ?? EYEBROW[num] ?? ''
  return (
    <div id={`sec-${num}`} data-section={num} className="scroll-anchor pt-8 pb-3 mb-6">
      {/* 金ヘアライン罫＋中央菱形オーナメント */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="h-px w-10 gold-hairline" />
        <span className="w-1 h-1 rotate-45 bg-gold-400" />
        <span className="h-px w-10 gold-hairline" />
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          {label && (
            <p
              className={`font-cormorant font-semibold text-[11px] md:text-[12px] leading-[1.4] tracking-[0.34em] [font-variant:small-caps] ${
                onGradient ? 'text-gold-300' : 'text-gold-500'
              }`}
            >
              {label}
            </p>
          )}
          <h2
            className={`mt-1.5 font-serifjp text-[26px] md:text-[32px] font-semibold leading-[1.3] tracking-[0.04em] ${
              onGradient ? 'text-white' : 'text-navy-900'
            }`}
          >
            {title}
          </h2>
        </div>
        <span className="gold-clip font-cinzel font-medium text-[22px] md:text-[26px] leading-none tracking-[0.10em] shrink-0">
          {num}
        </span>
      </div>

      {badge && (
        <p
          className={`mt-2 text-[11px] md:text-[12px] font-medium tracking-[0.08em] ${
            onGradient ? 'text-gold-300' : 'text-navy-400'
          }`}
        >
          {badge}
        </p>
      )}
    </div>
  )
}
