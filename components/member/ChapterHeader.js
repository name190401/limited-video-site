/**
 * 48px 薄型章扉（§4）。
 * 金 1px ライン（上）＋ 金章番号（01..13）＋ セリフ章タイトル。
 * id="sec-NN" を付与し、IntersectionObserver（SectionMenu）の監視対象・アンカー先を兼ねる。
 *
 * @param {string} num   - '01'〜'13'
 * @param {string} title - 章タイトル
 * @param {string} badge - 任意の件数バッジ等（09/10 用、例 "公開 2 / 予定 7"）
 * @param {boolean} onGradient - グラデ地（紺）の上に置くか（金テキスト可）。既定は薄地。
 */
export default function ChapterHeader({ num, title, badge, onGradient = false }) {
  return (
    <div
      id={`sec-${num}`}
      data-section={num}
      className="scroll-anchor pt-7 pb-3 mb-6 border-t border-gold-400/70"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-gold-400 text-[11px] md:text-[12px] font-bold tracking-[0.12em]">
          {num}
        </span>
        {badge && (
          <span className="text-gold-400 text-[11px] md:text-[12px] font-bold tracking-[0.12em] whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>
      <h2
        className={`mt-1 font-serif text-[26px] md:text-[32px] font-semibold tracking-[0.04em] ${
          onGradient ? 'text-white' : 'text-navy-900'
        }`}
      >
        {title}
      </h2>
    </div>
  )
}
