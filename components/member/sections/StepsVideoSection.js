import SectionShell from '../SectionShell'
import ComingSoonCard from '../ComingSoonCard'
import VideoPlayer from '../../ui/VideoPlayer'
import StepChain from '../StepChain'
import PillButton from '../PillButton'

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
    <SectionShell num={num} title={title}>
      <div className="max-w-[640px] mx-auto">
        {ready ? (
          <VideoPlayer videoId={video.youtube_id} title={video.title || title} />
        ) : (
          <ComingSoonCard title={`${title}の動画`} month="6月" />
        )}

        {steps.length > 0 && <StepChain steps={steps} size="sm" className="mt-6" />}

        {cta && (
          <div className="mt-8 text-center">
            <PillButton>{cta}</PillButton>
          </div>
        )}
      </div>
    </SectionShell>
  )
}
