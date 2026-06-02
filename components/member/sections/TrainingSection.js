import SectionShell from '../SectionShell'
import VideoPlayer from '../../ui/VideoPlayer'
import { isPublished, publishedVideos } from '@/lib/video'
import { pad2 } from '@/lib/format'

/**
 * 10 トレーニング（§6）。章扉（件数バッジ）→ 9項目を2列タイルグリッド。
 * 各タイル: 番号＋タイトル＋担当（subtitle）＋状態ピル。公開済はタイル内に動画、準備中はピル＋opacity0.7。
 *
 * @param {Array} videos  section_key='training' の videos（sort_order 順）
 */
export default function TrainingSection({ videos = [] }) {
  const badge = `公開 ${publishedVideos(videos).length} / 全 ${videos.length}`

  return (
    <SectionShell num="10" title="トレーニング" badge={badge}>
      <div className="grid grid-cols-2 gap-3">
        {videos.map((v, i) => {
          const ready = isPublished(v)
          return (
            <div
              key={v.id}
              className={`rounded-xl border border-gold-400/70 bg-white p-3.5 flex flex-col ${ready ? '' : 'opacity-70'}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-gold-600 text-[11px] font-bold tracking-[0.12em]">{pad2(i + 1)}</span>
                {!ready && (
                  <span className="border border-gold-400 text-gold-600 text-[10px] font-bold rounded-full px-2 py-0.5">
                    準備中
                  </span>
                )}
              </div>
              <p className="mt-1.5 font-semibold text-navy-900 text-[14px] leading-snug">{v.title}</p>
              {v.subtitle && <p className="mt-1 text-navy-400 text-[12px]">担当：{v.subtitle}</p>}
              {ready && (
                <div className="mt-2">
                  <VideoPlayer videoId={v.youtube_id} title={v.title} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </SectionShell>
  )
}
