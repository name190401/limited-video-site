'use client'

import { useEffect, useState } from 'react'

export default function SecurityGuard({ children }) {
  const [captureWarning, setCaptureWarning] = useState(false)

  useEffect(() => {
    // 右クリック無効化
    const handleContextMenu = (e) => {
      e.preventDefault()
    }

    // キーボードショートカット抑止（F12, Ctrl+Shift+I/J/C, Ctrl+U）
    const handleKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault()
      }
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) {
        e.preventDefault()
      }
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
      }
      // Mac: Cmd+Option+I/J/C
      if (e.metaKey && e.altKey && ['i', 'j', 'c'].includes(e.key)) {
        e.preventDefault()
      }
    }

    // Windows の PrintScreen は keyup でのみ捕捉できる端末があるため、別イベントで監視する。
    // Mac の OS スクショ（Cmd+Shift+3/4/5）はブラウザへキーイベントが届かず検知できない。
    const handleKeyUp = (e) => {
      if (e.key !== 'PrintScreen') return
      e.preventDefault()
      setCaptureWarning(true)
      // Clipboard API は権限・ブラウザ制約で失敗し得るため best-effort とする。
      try {
        navigator.clipboard?.writeText('')?.catch(() => {})
      } catch (_) {}
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <>
      {children}
      {captureWarning && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-navy-900/95 px-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="capture-warning-title"
        >
          <div className="w-full max-w-sm rounded-xl border border-gold-400/70 bg-navy-900 px-6 py-8 text-center shadow-2xl">
            <h2 id="capture-warning-title" className="font-serifjp text-xl text-gold-300">
              スクリーンショットは禁止されています
            </h2>
            <p className="mt-4 text-[13px] leading-[1.8] text-navy-100/80">
              本サイトのコンテンツの複製・転載は固く禁じられています。
            </p>
            <button
              type="button"
              onClick={() => setCaptureWarning(false)}
              className="btn-gold mt-6 rounded-full px-8 py-3 text-[14px] font-semibold"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
}
