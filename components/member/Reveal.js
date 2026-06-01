'use client'

import { useEffect, useRef } from 'react'

/**
 * スクロール in-view で `.reveal` → `.is-visible` を付与する汎用ラッパー（一度きり）。
 * - 初期透明化は globals.css の `@media (prefers-reduced-motion: no-preference)` 配下のみ
 *   （reduced-motion 時は CSS が効かず即表示。SSR HTML に opacity:0 を焼かない）。
 * - SectionMenu の IntersectionObserver とは別物（干渉させない）。
 *
 * @param {string} as     ラップ要素タグ（既定 'div'。'li' 等）
 * @param {number} delay  transition-delay（ms。stagger 用）
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // reduced-motion: アニメさせず即表示のまま（CSS が透明化しないので何もしない）
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
