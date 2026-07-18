import ChapterHeader from './ChapterHeader'
import BackToHub from './BackToHub'

/**
 * 全セクション共通の外殻（§6）。
 * 紺地サーフェス＋区切り罫 → 中央 680幅 → 章扉（ChapterHeader）→ 本文 → ハブに戻る。
 * 章扉を持たない Hero / Hub / Footer は対象外（個別に組む）。
 *
 * @param {string} num     - '01'〜'12'
 * @param {string} title   - 章タイトル
 * @param {string} badge   - 任意の件数バッジ（08/09 等）
 * @param {string} eyebrow - 任意の英ラベル（未指定なら num から既定）
 */
export default function SectionShell({ num, title, badge, eyebrow, children }) {
  return (
    <section className="relative section-surface section-divider px-5 py-14 md:px-10">
      <div className="md:max-w-[680px] md:mx-auto">
        <ChapterHeader num={num} title={title} badge={badge} eyebrow={eyebrow} />
        {children}
        <BackToHub />
      </div>
    </section>
  )
}
