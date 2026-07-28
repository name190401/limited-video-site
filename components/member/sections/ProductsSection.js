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
 * 08 製品（§6）。
 * 章扉に件数バッジ → 公開済を動画ごとのタブ（タップ再生）＋
 * 準備中があれば横スクロール予告ストリップ。
 *
 * @param {Array} videos  section_key='products' の伏せ済み videos
 */
export default function ProductsSection({ videos = [] }) {
  const { status, merge } = usePlanGate()
  const mergedVideos = merge(videos)
  const published = mergedVideos.filter(isPublished)
  const soon = mergedVideos.filter((v) => !isPublished(v))
  const tabs = published.map((v) => ({ key: String(v.id), label: v.tab_label ?? v.title }))
  const firstTab = tabs[0]?.key ?? null
  const [tab, setTab] = useState(firstTab)

  useEffect(() => {
    if (status === 'unlocked') setTab(firstTab)
  }, [firstTab, status])

  const shown = published.filter((v) => String(v.id) === tab)
  const badge = soon.length === 0 ? `全 ${published.length} 本` : `公開 ${published.length} / 予定 ${soon.length}`

  return (
    <SectionShell num="08" title="製品" badge={badge}>
      {status === 'locked' && <UnlockGate />}
      {status === 'checking' && <div className="h-24 rounded-xl bg-navy-100/50 animate-pulse" />}
      {status === 'unlocked' && (published.length > 0 ? (
        <>
          {published.length >= 2 && (
            <TabBar
              tabs={tabs}
              active={tab}
              onChange={setTab}
              scrollable={published.length >= 3}
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
