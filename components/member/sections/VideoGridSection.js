import ChapterHeader from '../ChapterHeader'
import BackToHub from '../BackToHub'
import ComingSoonCard from '../ComingSoonCard'
import VideoPlayer from '../../ui/VideoPlayer'

/**
 * 03 耳開け / 04 プラン説明（§6）。章扉→1行リード→動画×3（2列グリッド）。
 * 未収録枠は ComingSoonCard をグリッド内に混ぜる（公開済の動画行があればそれを優先）。
 *
 * @param {string} num   '03' | '04'
 * @param {string} title
 * @param {string} lead  1行リード
 * @param {Array}  videos  該当セクションの videos（layer1）
 * @param {number} desired 想定本数（既定3）
 * @param {string} month   準備中カードの公開月
 */
export default function VideoGridSection({ num, title, lead, videos = [], desired = 3, month = '6月' }) {
  const published = videos.filter((v) => v.status === 'published' && v.youtube_id)
  const slots = []
  for (let i = 0; i < Math.max(desired, published.length); i++) {
    slots.push(published[i] || null)
  }

  return (
    <section className="bg-navy-50 px-5 py-14 md:px-10">
      <div className="md:max-w-[680px] md:mx-auto">
        <ChapterHeader num={num} title={title} />
        {lead && <p className="text-navy-900/80 text-[14px] mb-5">{lead}</p>}
        <div className="grid grid-cols-2 gap-3">
          {slots.map((v, i) =>
            v ? (
              <div key={v.id} className={slots.length % 2 === 1 && i === slots.length - 1 ? 'col-span-2' : ''}>
                <VideoPlayer videoId={v.youtube_id} title={v.title} />
                <p className="mt-2 text-navy-900 text-[14px] font-medium">{v.title}</p>
              </div>
            ) : (
              <div key={`cs-${i}`} className={slots.length % 2 === 1 && i === slots.length - 1 ? 'col-span-2' : ''}>
                <ComingSoonCard title={`動画 ${i + 1}`} month={month} />
              </div>
            )
          )}
        </div>
        <BackToHub />
      </div>
    </section>
  )
}
