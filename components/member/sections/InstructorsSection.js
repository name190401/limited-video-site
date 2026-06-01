'use client'

import { useMemo, useState } from 'react'
import ChapterHeader from '../ChapterHeader'
import BackToHub from '../BackToHub'

/**
 * 02 講師紹介（§6）。
 * 主役 石井諒 の単独カード（丸128px・金2pxリング・castle講師ラベル・プロフィール）→
 * 属性フィルタ横スクロール金チップ → 講師丸写真グリッド（石壁テクスチャ背景）。
 * 丸タップで bio アコーディオン展開（画面遷移なし）。写真未登録者は金破線＋準備中。
 *
 * @param {Array} instructors  type='lecturer' の講師（sort_order 順）
 */
export default function InstructorsSection({ instructors = [] }) {
  const lead = instructors[0]
  const rest = instructors.slice(1)
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)

  const tags = useMemo(() => {
    const set = new Set()
    rest.forEach((i) => (i.attribute_tags || []).forEach((t) => set.add(t)))
    return ['all', ...Array.from(set)]
  }, [rest])

  const filtered = filter === 'all' ? rest : rest.filter((i) => (i.attribute_tags || []).includes(filter))

  return (
    <section className="relative section-surface section-divider px-5 py-14 md:px-10">
      <div className="md:max-w-[680px] md:mx-auto">
        <ChapterHeader num="02" title="講師紹介" />

        {/* 主役カード */}
        {lead && (
          <div className="flex flex-col items-center text-center mb-10">
            <span className="rounded-full p-px gold-hairline" style={{ boxShadow: '0 8px 24px -8px rgba(12,21,48,0.5)' }}>
              {lead.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lead.photo_url} alt={lead.name} className="block w-32 h-32 rounded-full object-cover" />
              ) : (
                <span className="w-32 h-32 rounded-full bg-navy-800 flex items-center justify-center text-gold-300 font-cinzel text-3xl">
                  {lead.name?.[0]}
                </span>
              )}
            </span>
            <p className="mt-4 font-serifjp text-[22px] text-navy-900">{lead.name}</p>
            <span className="mt-1 text-gold-600 text-[11px] font-medium tracking-[0.12em]">castle 講師</span>
            <span className="mt-0.5 font-cormorant text-gold-500 text-[10px] tracking-[0.34em] [font-variant:small-caps]">CASTLE INSTRUCTOR</span>
            {(lead.region || lead.age) && (
              <p className="mt-1 text-navy-400 text-[12px]">
                {lead.region}
                {lead.region && lead.age ? '・' : ''}
                {lead.age ? `${lead.age}歳` : ''}
              </p>
            )}
            {lead.profile && (
              <p className="mt-3 max-w-[560px] text-navy-900/80 text-[14px] leading-[1.8]">{lead.profile}</p>
            )}
          </div>
        )}

        {/* 属性フィルタチップ */}
        {tags.length > 1 && (
          <div className="scroll-strip flex gap-2 overflow-x-auto pb-2 mb-4">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.04em] border transition-colors ${
                  filter === t
                    ? 'bg-gold-400 border-gold-400 text-navy-900'
                    : 'border-gold-400 text-gold-600'
                }`}
              >
                {t === 'all' ? '全員' : t}
              </button>
            ))}
          </div>
        )}

        {/* 講師グリッド（石壁テクスチャ背景） */}
        {rest.length > 0 ? (
          <div className="stone-texture rounded-xl p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((i) => {
                const open = openId === i.id
                const hasPhoto = !!i.photo_url
                return (
                  <div key={i.id} className="flex flex-col items-center text-center">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : i.id)}
                      className="flex flex-col items-center"
                    >
                      {hasPhoto ? (
                        <span className="rounded-full p-px gold-hairline">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={i.photo_url} alt={i.name} className="block w-20 h-20 rounded-full object-cover" />
                        </span>
                      ) : (
                        <span className="w-20 h-20 rounded-full border border-dashed border-gold-400 bg-navy-900/40 flex items-center justify-center text-gold-300 font-cinzel text-lg">
                          {i.name?.[0]}
                        </span>
                      )}
                      <span className="mt-2 text-white text-[13px] font-medium">{i.name}</span>
                      {!hasPhoto && <span className="text-gold-400 text-[10px] tracking-[0.1em]">準備中</span>}
                    </button>
                    {open && i.profile && (
                      <p className="mt-2 text-navy-100 text-[12px] leading-relaxed bg-navy-900/50 rounded-lg p-2 w-full">
                        {i.profile}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-navy-400 text-[13px] text-center">講師を順次ご紹介します。</p>
        )}

        <BackToHub />
      </div>
    </section>
  )
}
