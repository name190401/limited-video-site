'use client'

import { useState } from 'react'
import ChapterHeader from '../ChapterHeader'
import BackToHub from '../BackToHub'
import ComingSoonCard from '../ComingSoonCard'
import VideoPlayer from '../../ui/VideoPlayer'

/**
 * 05 クロージング（§6）。
 * 「担当を選ぶ」属性タブ（選択中=金下線）→ 対応担当の動画（2列グリッド）に差し替え。
 * 担当・動画が未登録なら ComingSoonCard。
 *
 * @param {Array} closers  type='closer' の担当（attribute_tags 等）
 * @param {Object} videosByCloser  { [closerName]: video[] }（subtitle で担当紐付け）
 */
export default function ClosingSection({ closers = [], videos = [] }) {
  const tabs = closers.length ? closers : []
  const [active, setActive] = useState(tabs[0]?.id ?? null)

  const activeCloser = tabs.find((c) => c.id === active)
  const activeVideos = activeCloser
    ? videos.filter((v) => v.subtitle === activeCloser.name && v.status === 'published' && v.youtube_id)
    : []

  return (
    <section className="relative section-surface section-divider px-5 py-14 md:px-10">
      <div className="md:max-w-[680px] md:mx-auto">
        <ChapterHeader num="05" title="クロージング" />

        {tabs.length ? (
          <>
            <div className="scroll-strip flex gap-4 overflow-x-auto border-b border-navy-200 mb-5">
              {tabs.map((c) => {
                const soon = c.status === 'coming_soon'
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActive(c.id)}
                    className={`shrink-0 pb-2 text-[14px] font-semibold flex items-center gap-1.5 border-b-2 -mb-px transition-colors ${
                      active === c.id ? 'border-gold-400 text-navy-900' : 'border-transparent text-navy-400'
                    }`}
                  >
                    {c.name}
                    {soon && (
                      <span className="border border-gold-400 text-gold-600 text-[9px] font-bold rounded-full px-1.5 py-0.5">
                        準備中
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {activeVideos.length ? (
              <div key={active} className="grid grid-cols-2 gap-3 animate-fade-in">
                {activeVideos.map((v) => (
                  <div key={v.id}>
                    <VideoPlayer videoId={v.youtube_id} title={v.title} />
                    <p className="mt-2 text-navy-900 text-[14px] font-medium">{v.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <ComingSoonCard title={`${activeCloser?.name ?? '担当'}のクロージング動画`} month="6月" />
            )}
          </>
        ) : (
          <ComingSoonCard title="クロージング動画" month="6月" />
        )}

        <BackToHub />
      </div>
    </section>
  )
}
