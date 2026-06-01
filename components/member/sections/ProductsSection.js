'use client'

import { useState } from 'react'
import ChapterHeader from '../ChapterHeader'
import BackToHub from '../BackToHub'
import ComingSoonCard from '../ComingSoonCard'
import VideoPlayer from '../../ui/VideoPlayer'

/**
 * 09 製品（§6）。
 * 章扉に件数バッジ「公開 N / 予定 N」→ 公開済を通常カード（ショート/ロング トグル）＋
 * 準備中を横スクロール予告ストリップ。ショート=ミュート自動ループ / ロング=タップ再生。
 *
 * @param {Array} videos  section_key='products' の videos（layer1）
 */
export default function ProductsSection({ videos = [] }) {
  const published = videos.filter((v) => v.status === 'published' && v.youtube_id)
  const soon = videos.filter((v) => v.status !== 'published' || !v.youtube_id)
  const hasShort = published.some((v) => v.variant === 'short')
  const hasLong = published.some((v) => v.variant === 'long')
  const [tab, setTab] = useState(hasShort ? 'short' : 'long')

  const shown = published.filter((v) => v.variant === tab)
  const badge = `公開 ${published.length} / 予定 ${soon.length}`

  return (
    <section className="relative section-surface section-divider px-5 py-14 md:px-10">
      <div className="md:max-w-[680px] md:mx-auto">
        <ChapterHeader num="09" title="製品" badge={badge} />

        {published.length > 0 ? (
          <>
            {hasShort && hasLong && (
              <div className="flex gap-4 border-b border-navy-200 mb-5">
                {[
                  { k: 'short', label: 'ショート（音声なし）' },
                  { k: 'long', label: 'ロング' },
                ].map((t) => (
                  <button
                    key={t.k}
                    type="button"
                    onClick={() => setTab(t.k)}
                    className={`pb-2 text-[14px] font-semibold border-b-2 -mb-px transition-colors ${
                      tab === t.k ? 'border-gold-400 text-navy-900' : 'border-transparent text-navy-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
            <div key={tab} className="grid grid-cols-1 gap-4 animate-fade-in">
              {shown.map((v) => (
                <div key={v.id}>
                  <VideoPlayer videoId={v.youtube_id} title={v.title} muted={v.variant === 'short' && v.audio_muted} />
                  <p className="mt-2 text-navy-900 text-[14px] font-medium">{v.title}</p>
                </div>
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

        <BackToHub />
      </div>
    </section>
  )
}
