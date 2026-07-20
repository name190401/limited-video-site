'use client'

import { useState } from 'react'
import SectionShell from '../SectionShell'
import ComingSoonCard from '../ComingSoonCard'
import TabBar from '../TabBar'
import VideoCard from '../VideoCard'
import { isPublished } from '@/lib/video'

/**
 * 05 クロージング（§6）。
 * 「担当を選ぶ」属性タブ（選択中=金下線）→ 対応担当の動画（2列グリッド）に差し替え。
 * 担当・動画が未登録なら ComingSoonCard。
 *
 * @param {Array} closers  type='closer' の担当（attribute_tags 等）
 * @param {Array} videos   クロージング動画（subtitle で担当紐付け）
 */
export default function ClosingSection({ closers = [], videos = [] }) {
  const tabs = closers.length ? closers : []
  const [active, setActive] = useState(tabs[0]?.id ?? null)

  const activeCloser = tabs.find((c) => c.id === active)
  const activeVideos = activeCloser
    ? videos.filter((v) => v.subtitle === activeCloser.name && isPublished(v))
    : []

  const tabItems = tabs.map((c) => ({
    key: c.id,
    label: (
      <>
        {c.name}
        {c.status === 'coming_soon' && (
          <span className="border border-gold-400 text-gold-600 text-[9px] font-bold rounded-full px-1.5 py-0.5">
            準備中
          </span>
        )}
      </>
    ),
  }))

  return (
    <SectionShell num="05" title="エンディング">
      {tabs.length ? (
        <>
          <TabBar tabs={tabItems} active={active} onChange={setActive} scrollable />
          {activeVideos.length ? (
            <div key={active} className="grid grid-cols-2 gap-3 animate-fade-in">
              {activeVideos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          ) : (
            <ComingSoonCard title={`${activeCloser?.name ?? '担当'}のエンディング動画`} month="6月" />
          )}
        </>
      ) : (
        <ComingSoonCard title="エンディング動画" month="6月" />
      )}
    </SectionShell>
  )
}
