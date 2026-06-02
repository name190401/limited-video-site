import SectionShell from '../SectionShell'
import ComingSoonCard from '../ComingSoonCard'
import VideoCard from '../VideoCard'
import { publishedVideos } from '@/lib/video'

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
  const published = publishedVideos(videos)
  const slots = []
  for (let i = 0; i < Math.max(desired, published.length); i++) {
    slots.push(published[i] || null)
  }
  const wide = (i) => (slots.length % 2 === 1 && i === slots.length - 1 ? 'col-span-2' : '')

  return (
    <SectionShell num={num} title={title}>
      {lead && <p className="text-navy-900/80 text-[14px] mb-5">{lead}</p>}
      <div className="grid grid-cols-2 gap-3">
        {slots.map((v, i) =>
          v ? (
            <div key={v.id} className={wide(i)}>
              <VideoCard video={v} />
            </div>
          ) : (
            <div key={`cs-${i}`} className={wide(i)}>
              <ComingSoonCard title={`動画 ${i + 1}`} month={month} />
            </div>
          )
        )}
      </div>
    </SectionShell>
  )
}
