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

  return (
    <SectionShell num="12" title="よくある質問">
      <ul className="max-w-[640px] mx-auto divide-y divide-navy-200 border-y border-navy-200">
        {faqs.map((f) => {
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
                  <p className="pb-4 px-3 text-navy-900/80 text-[14px] leading-[1.8] whitespace-pre-line">{f.answer}</p>
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
