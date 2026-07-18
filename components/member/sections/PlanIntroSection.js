'use client'

import SectionShell from '../SectionShell'
import UnlockGate from '../UnlockGate'
import VideoCard from '../VideoCard'
import { usePlanGate } from '../PlanGateProvider'

/** 04 プラン説明。Layer2 解除後に新規事業説明会の動画を表示する。 */
export default function PlanIntroSection({ videos = [] }) {
  const { status, merge } = usePlanGate()
  const mergedVideos = merge(videos)

  return (
    <SectionShell num="04" title="プラン説明">
      <p className="text-navy-900/80 text-[14px] mb-5">新規事業説明会の動画です。</p>
      {status === 'locked' && <UnlockGate />}
      {status === 'checking' && <div className="h-24 rounded-xl bg-navy-100/50 animate-pulse" />}
      {status === 'unlocked' && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          {mergedVideos.map((video) => <VideoCard key={video.id} video={video} />)}
        </div>
      )}
    </SectionShell>
  )
}
