'use client'

import { useEffect, useState } from 'react'
import SectionShell from '../SectionShell'
import ComingSoonCard from '../ComingSoonCard'
import TabBar from '../TabBar'
import VideoCard from '../VideoCard'
import { isPublished } from '@/lib/video'
import UnlockGate from '../UnlockGate'
import { usePlanGate } from '../PlanGateProvider'

/**
 * 09 製品（§6）。
 * 章扉に件数バッジ「公開 N / 予定 N」→ 公開済を通常カード（ショート/ロング トグル）＋
 * 準備中を横スクロール予告ストリップ。ショート=ミュート自動ループ / ロング=タップ再生。
 *
 * @param {Array} videos  section_key='products' の伏せ済み videos
 */
export default function ProductsSection({ videos = [] }) {
  const { status, merge } = usePlanGate()
  const mergedVideos = merge(videos)
  const published = mergedVideos.filter(isPublished)
  const soon = mergedVideos.filter((v) => !isPublished(v))
  const hasShort = published.some((v) => v.variant === 'short')
  const hasLong = published.some((v) => v.variant === 'long')
  const [tab, setTab] = useState(hasShort ? 'short' : 'long')

  useEffect(() => {
    if (status === 'unlocked' && hasShort) setTab('short')
  }, [hasShort, status])

  const shown = published.filter((v) => v.variant === tab)
  const badge = `公開 ${published.length} / 予定 ${soon.length}`

  return (
    <SectionShell num="09" title="製品" badge={badge}>
      {status === 'locked' && <UnlockGate />}
      {status === 'checking' && <div className="h-24 rounded-xl bg-navy-100/50 animate-pulse" />}
      {status === 'unlocked' && (published.length > 0 ? (
        <>
          {hasShort && hasLong && (
            <TabBar
              tabs={[
                { key: 'short', label: 'ショート（音声なし）' },
                { key: 'long', label: 'ロング' },
              ]}
              active={tab}
              onChange={setTab}
            />
          )}
          <div key={tab} className="grid grid-cols-1 gap-4 animate-fade-in">
            {shown.map((v) => (
              <VideoCard key={v.id} video={v} muted={v.variant === 'short' && v.audio_muted} />
            ))}
          </div>
        </>
      ) : (
        <p className="text-navy-900/80 text-[14px] mb-5">製品ラインナップを順次公開します。</p>
      ))}

      {/* 準備中=横スクロール予告ストリップ */}
      {status === 'unlocked' && soon.length > 0 && (
        <div className="scroll-strip flex gap-3 overflow-x-auto mt-6 pb-2">
          {soon.map((v, i) => (
            <ComingSoonCard key={v.id || i} title={v.title} month="近日" compact />
          ))}
        </div>
      )}
    </SectionShell>
  )
}
