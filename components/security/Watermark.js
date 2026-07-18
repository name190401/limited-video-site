'use client'

import { useEffect, useState } from 'react'

/** 動画上に表示時刻入りの薄いウォーターマークを重ねる。 */
export default function Watermark() {
  const [label, setLabel] = useState(null)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const pad = (value) => String(value).padStart(2, '0')
      setLabel(`QUALIA ${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`)
    }

    update()
    const timer = setInterval(update, 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  if (!label) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div className="absolute -inset-8 grid grid-cols-3 grid-rows-3 -rotate-[18deg] place-items-center gap-8 text-[11px] font-medium tracking-[0.08em] text-white opacity-[0.08]">
        {Array.from({ length: 9 }, (_, index) => <span key={index} className="whitespace-nowrap">{label}</span>)}
      </div>
    </div>
  )
}
