'use client'

import { useState } from 'react'
import SectionShell from '../SectionShell'
import ComingSoonCard from '../ComingSoonCard'
import TabBar from '../TabBar'
import VideoCard from '../VideoCard'
import { isPublished } from '@/lib/video'

/**
 * 09 製品（§6）。
 * 章扉に件数バッジ「公開 N / 予定 N」→ 公開済を通常カード（ショート/ロング トグル）＋
 * 準備中を横スクロール予告ストリップ。ショート=ミュート自動ループ / ロング=タップ再生。
 *
 * @param {Array} videos  section_key='products' の videos（layer1）
 */
export default function ProductsSection({ videos = [] }) {
  const published = videos.filter(isPublished)
  const soon = videos.filter((v) => !isPublished(v))
  const hasShort = published.some((v) => v.variant === 'short')
  const hasLong = published.some((v) => v.variant === 'long')
  const [tab, setTab] = useState(hasShort ? 'short' : 'long')

  const shown = published.filter((v) => v.variant === tab)
  const badge = `公開 ${published.length} / 予定 ${soon.length}`

  return (
    <SectionShell num="09" title="製品" badge={badge}>
      {published.length > 0 ? (
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
      )}

      {/* 準備中=横スクロール予告ストリップ */}
      {soon.length > 0 && (
        <div className="scroll-strip flex gap-3 overflow-x-auto mt-6 pb-2">
          {soon.map((v, i) => (
            <ComingSoonCard key={v.id || i} title={v.title} month="7月" compact />
          ))}
        </div>
      )}
    </SectionShell>
  )
}
