'use client'

import { useEffect } from 'react'

export default function SecurityGuard({ children }) {
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

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return <>{children}</>
}
