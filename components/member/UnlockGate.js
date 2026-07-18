'use client'

import { useState } from 'react'
import DividerWithDiamond from './DividerWithDiamond'
import { usePlanGate } from './PlanGateProvider'

/** Layer2 共通の合言葉入力ゲート。 */
export default function UnlockGate({ message = '続きは紹介者から合言葉を聞いて開けます' }) {
  const { unlock } = usePlanGate()
  const [password, setPassword] = useState('')
  const [fails, setFails] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy || !password.trim()) return
    setBusy(true)
    setError('')
    const result = await unlock(password.trim())
    if (result.ok) {
      setPassword('')
    } else if (result.status === 429) {
      setError('アクセスが集中しています。しばらく時間をおいてからお試しください。')
    } else if (result.status === 0) {
      setError('通信に失敗しました。もう一度お試しください。')
    } else {
      const nextFails = fails + 1
      setFails(nextFails)
      setError(nextFails >= 3 ? '紹介者にもう一度確認してみてください。' : '合言葉が違うようです。もう一度どうぞ。')
    }
    setBusy(false)
  }

  return (
    <div className="mt-6">
      <DividerWithDiamond />
      <div
        className="relative mt-4 rounded-xl px-6 py-12 text-center overflow-hidden"
        style={{ background: 'radial-gradient(120% 80% at 50% 0%, #1B2A52, #0C1530)' }}
      >
        <div className="absolute inset-x-6 bottom-0 h-20 opacity-10 pointer-events-none">
          <div className="h-full rounded-lg bg-navy-100" />
        </div>
        <span className="relative inline-flex mb-4 rounded-full p-px gold-hairline">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-navy-900">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 11V8a5 5 0 0110 0v3M5 11h14v9H5z" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
        <p className="relative font-serifjp text-white text-[15px] leading-[1.9] mb-6">{message}</p>

        <form onSubmit={handleSubmit} className="relative flex flex-col items-center">
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="合言葉"
            className="w-full max-w-[280px] text-center bg-transparent border border-navy-400 rounded-lg px-4 py-3 text-white placeholder-navy-300 focus:border-gold-400 focus:outline-none"
          />
          {error && <p className="mt-3 text-navy-400 text-[12px]">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="btn-gold mt-5 rounded-full font-sansjp font-semibold text-[14px] tracking-[0.06em] px-8 py-3"
          >
            {busy ? '確認中…' : '解除する'}
          </button>
        </form>
      </div>
    </div>
  )
}
