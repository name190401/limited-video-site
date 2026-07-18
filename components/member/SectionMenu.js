'use client'

import { useEffect, useState } from 'react'
import { pad2 } from '@/lib/format'

/**
 * 右上常駐ハンバーガー（§5）。
 * - 固定 44×44・紺半透明丸＋金3本線。横に現在章名を常時ラベル。
 * - 開: 全画面オーバーレイ（navy-900/95）。最上部「ハブに戻る」＋12項目番号付きリスト。
 *   準備中項目=金ピル＋opacity0.7。現在地=金ハイライト。
 * - IntersectionObserver で現在セクションを検出。
 */
export default function SectionMenu({ sections, isAdmin = false }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('[data-section]'))
    if (!targets.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setCurrent(visible[0].target.dataset.section)
      },
      { rootMargin: '-72px 0px -55% 0px', threshold: [0, 0.25, 0.5] }
    )
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const currentTitle = sections.find((s) => pad2(s.sort_order) === current)?.title

  function jump(num) {
    setOpen(false)
    const el = document.getElementById(`sec-${num}`)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/enter'
  }

  return (
    <>
      {/* 常駐ハンバーガー */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        {currentTitle && !open && (
          <span className="hidden sm:inline px-2 py-1 rounded-full bg-navy-900/70 backdrop-blur text-navy-100 text-[11px] tracking-[0.08em]">
            {currentTitle}
          </span>
        )}
        <button
          type="button"
          aria-label="メニューを開く"
          onClick={() => setOpen(true)}
          className="w-11 h-11 rounded-full bg-navy-900/70 backdrop-blur flex flex-col items-center justify-center gap-[5px]"
        >
          <span className="block w-5 h-px bg-gold-400" />
          <span className="block w-5 h-px bg-gold-400" />
          <span className="block w-5 h-px bg-gold-400" />
        </button>
      </div>

      {/* オーバーレイ */}
      {open && (
        <div className="fixed inset-0 z-50 bg-navy-900/95 backdrop-blur-sm overflow-y-auto">
          <div className="flex justify-end p-4">
            <button
              type="button"
              aria-label="閉じる"
              onClick={() => setOpen(false)}
              className="w-11 h-11 rounded-full border border-gold-400/60 text-gold-400 flex items-center justify-center text-xl"
            >
              ×
            </button>
          </div>

          <nav className="px-6 pb-24 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => jump('hub')}
              className="w-full text-left mb-4 pb-4 border-b border-gold-400/30 text-gold-400 font-serif text-lg tracking-[0.04em]"
            >
              ↑ ハブに戻る
            </button>
            <ul className="space-y-1">
              {sections.map((s) => {
                const num = pad2(s.sort_order)
                const soon = s.status === 'coming_soon'
                const active = current === num
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => jump(num)}
                      className={`w-full flex items-center gap-3 py-3 text-left ${soon ? 'opacity-70' : ''}`}
                    >
                      <span className={`text-[12px] font-bold tracking-[0.12em] ${active ? 'text-gold-400' : 'text-navy-300'}`}>
                        {num}
                      </span>
                      <span className={`flex-1 text-[16px] ${active ? 'text-gold-400 font-semibold' : 'text-white'}`}>
                        {s.title}
                      </span>
                      {soon && (
                        <span className="border border-gold-400 text-gold-400 text-[10px] font-bold tracking-[0.1em] rounded-full px-2 py-0.5">
                          準備中
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>

            {/* 管理者のみ：管理者ページへの導線（統一ログインで管理者PWを入れた人だけ表示） */}
            {isAdmin && (
              <a
                href="/admin"
                className="mt-6 flex items-center gap-3 border-t border-gold-400/30 pt-5"
              >
                <span className="text-[12px] font-bold tracking-[0.12em] text-gold-400">★</span>
                <span className="flex-1 text-[16px] font-semibold text-gold-300">管理者ページ</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M5 3l4 4-4 4" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}

            <button
              type="button"
              onClick={logout}
              className="mt-5 min-h-11 w-full flex items-center gap-3 border-t border-navy-300/30 pt-5 text-left text-navy-200"
            >
              <span className="text-[12px] font-bold tracking-[0.12em]">↪</span>
              <span className="flex-1 text-[16px] font-medium">ログアウト</span>
            </button>
          </nav>
        </div>
      )}
    </>
  )
}
