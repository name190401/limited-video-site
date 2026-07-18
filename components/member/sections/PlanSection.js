'use client'

import { useState } from 'react'
import SectionShell from '../SectionShell'
import ComingSoonCard from '../ComingSoonCard'
import TabBar from '../TabBar'
import VideoCard from '../VideoCard'
import UnlockGate from '../UnlockGate'
import { usePlanGate } from '../PlanGateProvider'

/**
 * 07 プラン — 共通 Layer2 ゲートとショート/ロング表示（§8）。
 *
 * 解除状態と保護動画 ID は PlanGateProvider から受け取り、localStorage は使わない。
 *
 * @param {Array} openVideos  locked でも開放するショート等（protection=layer1・id あり）
 */
export default function PlanSection({ openVideos = [] }) {
  const { status, videosFor } = usePlanGate()
  const [tab, setTab] = useState('short')
  const planVideos = videosFor('plan')
  const shorts = planVideos.filter((v) => v.variant === 'short')
  const longs = planVideos.filter((v) => v.variant === 'long')
  const tabVideos = tab === 'short' ? shorts : longs

  return (
    <SectionShell num="07" title="プラン">
        {/* 上半分（locked でも開放）: ショート＋プラン概要 */}
        {openVideos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 mb-2">
            {openVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        ) : (
          <p className="text-navy-900/80 text-[14px] leading-[1.8] mb-2">
            QUALIA のプランは、無理なく続けられる設計です。続きは紹介者からお伝えします。
          </p>
        )}

        {status === 'locked' && <UnlockGate />}
        {status === 'checking' && <div className="mt-6 h-24 rounded-xl bg-navy-100/50 animate-pulse" />}
        {status === 'unlocked' && (
          /* ── unlocked: ショート/ロング タブ ── */
          <div className="mt-6 animate-[fadeIn_250ms_ease-out]">
            <TabBar
              tabs={[
                { key: 'short', label: 'ショート' },
                { key: 'long', label: 'ロング' },
              ]}
              active={tab}
              onChange={setTab}
            />
            <div key={tab} className="grid grid-cols-1 gap-4 animate-fade-in">
              {tabVideos.length > 0 ? (
                tabVideos.map((v) => <VideoCard key={v.id} video={v} />)
              ) : (
                <ComingSoonCard title={tab === 'short' ? 'ショートプラン動画' : 'ロングプラン動画'} month="近日" />
              )}
            </div>
          </div>
        )}
    </SectionShell>
  )
}
