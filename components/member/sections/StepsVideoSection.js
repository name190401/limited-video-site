import ChapterHeader from '../ChapterHeader'
import BackToHub from '../BackToHub'
import ComingSoonCard from '../ComingSoonCard'
import VideoPlayer from '../../ui/VideoPlayer'

/**
 * 11 登録の流れ / 12 使い方（§6）。
 * 章扉→動画1本＋金丸数字ステップ（縦）＋末尾に金アウトライン CTA。
 * 動画未収録なら ComingSoonCard。
 *
 * @param {string} num     '11' | '12'
 * @param {string} title
 * @param {Array}  steps   [{label, desc}]
 * @param {Object} video   { youtube_id, title } | null
 * @param {string} cta     末尾 CTA テキスト（任意）
 */
export default function StepsVideoSection({ num, title, steps = [], video = null, cta }) {
  const ready = video?.youtube_id
  return (
    <section className="bg-navy-50 px-5 py-14 md:px-10">
      <div className="md:max-w-[680px] md:mx-auto">
        <ChapterHeader num={num} title={title} />

        <div className="max-w-[640px] mx-auto">
          {ready ? (
            <VideoPlayer videoId={video.youtube_id} title={video.title || title} />
          ) : (
            <ComingSoonCard title={`${title}の動画`} month="6月" />
          )}

          {steps.length > 0 && (
            <ol className="mt-6 space-y-4">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 w-8 h-8 rounded-full border border-gold-400 text-gold-600 font-serif flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <p className="font-semibold text-navy-900 text-[15px]">{s.label}</p>
                    {s.desc && <p className="mt-0.5 text-navy-900/80 text-[14px] leading-[1.8]">{s.desc}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}

          {cta && (
            <div className="mt-8 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400 text-gold-600 font-semibold text-[14px] px-6 py-3">
                {cta}
              </span>
            </div>
          )}
        </div>
        <BackToHub />
      </div>
    </section>
  )
}
