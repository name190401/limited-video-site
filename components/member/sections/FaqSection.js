'use client'

import { useState } from 'react'
import SectionShell from '../SectionShell'
import PillButton from '../PillButton'

/**
 * 13 FAQ（§6）。plus(+) 開閉アコーディオン＋末尾に金アウトライン「紹介者に質問する」。
 * 着地面は薄地（navy-50）。公開分のみ表示。
 *
 * @param {Array} faqs  [{ id, question, answer }]
 */
export default function FaqSection({ faqs = [] }) {
  const [open, setOpen] = useState(null)

  const fallback = [
    { id: 'f1', question: 'QUALIA はどんなグループですか？', answer: '製品の体験とコミュニティを大切にする教育型のグループです。詳しくは紹介者にお尋ねください。' },
    { id: 'f2', question: '費用はかかりますか？', answer: '関わり方によって異なります。無理のない範囲で始められます。' },
  ]
  const items = faqs.length ? faqs : fallback

  return (
    <SectionShell num="13" title="よくある質問">
      <ul className="max-w-[640px] mx-auto divide-y divide-navy-200 border-y border-navy-200">
        {items.map((f) => {
          const isOpen = open === f.id
          return (
            <li key={f.id} className={`transition-colors ${isOpen ? 'bg-gold-50/40' : ''}`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : f.id)}
                className="w-full flex items-center justify-between gap-3 py-4 px-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-navy-900 text-[15px]">{f.question}</span>
                <span className={`shrink-0 text-gold-500 text-xl leading-none transition-transform ${isOpen ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              <div className={`acc-panel ${isOpen ? 'is-open' : ''}`}>
                <div>
                  <p className="pb-4 px-3 text-navy-900/80 text-[14px] leading-[1.8]">{f.answer}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 text-center">
        <PillButton>紹介者に質問する</PillButton>
      </div>
    </SectionShell>
  )
}
