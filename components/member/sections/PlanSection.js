'use client'

import { useEffect, useState } from 'react'
import ChapterHeader from '../ChapterHeader'
import BackToHub from '../BackToHub'
import ComingSoonCard from '../ComingSoonCard'
import VideoPlayer from '../../ui/VideoPlayer'

/**
 * 07 プラン — 合言葉ロックの状態機械（§8）。
 *
 * バックエンド配線（実機 = lib/auth/layer2.js / Phase4 の API）:
 * - unlocked 判定: GET /api/plan/content（qualia_plan httpOnly Cookie を verifyPlanToken。
 *   200=解除済（保護動画 ID 含む JSON）/ 401=未解除）。localStorage は使わない。
 * - 解除: POST /api/auth/plan { password } → サーバが日替わりパス照合＋レート制限（429）→
 *   成功で qualia_plan Cookie 発行（JST 24:00 失効）。
 * - 保護動画 ID は解除後に /api/plan/content からのみ受け取る（ビルド時埋め込みなし）。
 *
 * @param {Array} openVideos  locked でも開放するショート等（protection=layer1・id あり）
 */
export default function PlanSection({ openVideos = [] }) {
  const [unlocked, setUnlocked] = useState(false)
  const [planVideos, setPlanVideos] = useState([])
  const [pw, setPw] = useState('')
  const [fails, setFails] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState('short')

  // 再訪時: まず status で解除状態だけ確認し（常に 200）、解除済のときだけ保護動画を取得。
  // 未解除で /api/plan/content を叩くと 401 がコンソールに出るため、content は解除済確認後のみ。
  useEffect(() => {
    let alive = true
    fetch('/api/plan/status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!alive || !s?.unlocked) return null
        setUnlocked(true)
        return fetch('/api/plan/content', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null))
      })
      .then((d) => {
        if (alive && d?.videos) setPlanVideos(d.videos)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  async function handleUnlock(e) {
    e.preventDefault()
    if (busy || !pw.trim()) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/auth/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw.trim() }),
      })
      if (res.ok) {
        const content = await fetch('/api/plan/content', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null))
        setPlanVideos(content?.videos || [])
        setUnlocked(true)
        setPw('')
      } else if (res.status === 429) {
        setError('アクセスが集中しています。しばらく時間をおいてからお試しください。')
      } else {
        const n = fails + 1
        setFails(n)
        setError(n >= 3 ? '紹介者にもう一度確認してみてください。' : '合言葉が違うようです。もう一度どうぞ。')
      }
    } catch {
      setError('通信に失敗しました。もう一度お試しください。')
    } finally {
      setBusy(false)
    }
  }

  const shorts = planVideos.filter((v) => v.variant === 'short')
  const longs = planVideos.filter((v) => v.variant === 'long')

  return (
    <section className="bg-navy-50 px-5 py-14 md:px-10">
      <div className="md:max-w-[680px] md:mx-auto">
        <ChapterHeader num="07" title="プラン" />

        {/* 上半分（locked でも開放）: ショート＋プラン概要 */}
        {openVideos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 mb-2">
            {openVideos.map((v) => (
              <div key={v.id}>
                <VideoPlayer videoId={v.youtube_id} title={v.title} />
                <p className="mt-2 text-navy-900 text-[14px] font-medium">{v.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-navy-900/80 text-[14px] leading-[1.8] mb-2">
            QUALIA のプランは、無理なく続けられる設計です。続きは紹介者からお伝えします。
          </p>
        )}

        {!unlocked ? (
          /* ── locked: 金1px 区切り線 ＋ ハードカットのゲートブロック ── */
          <div className="mt-6">
            <div className="border-t border-gold-400" />
            <div className="relative rounded-b-xl bg-navy-900 px-6 py-12 text-center overflow-hidden">
              {/* 背後に "もっとある" の輪郭（うっすら） */}
              <div className="absolute inset-x-6 bottom-0 h-20 opacity-10 pointer-events-none">
                <div className="h-full rounded-lg bg-navy-100" />
              </div>
              {/* 鍵アイコン 28px */}
              <span className="relative inline-flex items-center justify-center w-7 h-7 rounded-full border border-gold-400 mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 11V8a5 5 0 0110 0v3M5 11h14v9H5z" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="relative text-navy-100 text-[14px] mb-6">続きは紹介者から合言葉を聞いて開けます</p>

              <form onSubmit={handleUnlock} className="relative flex flex-col items-center">
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="合言葉"
                  className="w-full max-w-[280px] text-center bg-transparent border border-navy-400 rounded-lg px-4 py-3 text-white placeholder-navy-300 focus:border-gold-400 focus:outline-none"
                />
                {error && <p className="mt-3 text-navy-400 text-[12px]">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-5 rounded-full border border-gold-400 text-gold-400 font-semibold text-[14px] px-8 py-3 disabled:opacity-50"
                >
                  {busy ? '確認中…' : '解除する'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ── unlocked: ショート/ロング タブ ── */
          <div className="mt-6 animate-[fadeIn_250ms_ease-out]">
            <div className="flex gap-4 border-b border-navy-200 mb-5">
              {[
                { k: 'short', label: 'ショート' },
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
            <div className="grid grid-cols-1 gap-4">
              {(tab === 'short' ? shorts : longs).length > 0 ? (
                (tab === 'short' ? shorts : longs).map((v) => (
                  <div key={v.id}>
                    <VideoPlayer videoId={v.youtube_id} title={v.title} />
                    <p className="mt-2 text-navy-900 text-[14px] font-medium">{v.title}</p>
                  </div>
                ))
              ) : (
                <ComingSoonCard title={tab === 'short' ? 'ショートプラン動画' : 'ロングプラン動画'} month="6月" />
              )}
            </div>
          </div>
        )}

        <BackToHub />
      </div>
    </section>
  )
}
