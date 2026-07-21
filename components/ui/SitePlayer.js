'use client'

import { useEffect, useRef, useState } from 'react'
import { loadYouTubeAPI } from './ytapi'
import Watermark from '../security/Watermark'

/**
 * YouTube非依存の自前プレーヤー（サイト内完結・YouTube chrome 完全非表示）。
 *
 * IFrame Player API で動画を読み込み、YouTube のUIを一切見せない：
 * - controls=0 で標準UIを消し、生成 iframe を pointer-events:none にして
 *   ロゴ/タイトル/「Watch on YouTube」/終了時の関連動画への**クリック到達を物理遮断**。
 * - YouTube は controls=0 でも「再生開始直後の数秒」「一時停止時」「終了時」に
 *   タイトル/チャンネル/ロゴ/関連動画を出すため、**その瞬間を紺カバーで覆って隠す**。
 *   映像を見せるのは「定常再生中（ホバー不可＝chrome出ない）」だけ。
 * - 再生/シーク/時間/ミュートは自前UI（紺×金）。終了画面も自前。
 */
const fmt = (s) => {
  s = Math.floor(s || 0)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function SitePlayer({ videoId, title }) {
  const holderRef = useRef(null)
  const playerRef = useRef(null)
  const tickRef = useRef(null)
  const revealTimerRef = useRef(null)
  const firstPlayRef = useRef(false)
  const playLoggedRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [revealed, setRevealed] = useState(false) // 映像を見せてよい状態（定常再生中のみ）
  const [muted, setMuted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadYouTubeAPI().then((YT) => {
      if (cancelled || !YT || !holderRef.current) return
      playerRef.current = new YT.Player(holderRef.current, {
        videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1, controls: 0, modestbranding: 1, rel: 0,
          iv_load_policy: 3, playsinline: 1, fs: 0, disablekb: 1, color: 'white',
        },
        events: {
          onReady: (e) => {
            if (cancelled) return
            setDur(e.target.getDuration() || 0)
            try { e.target.playVideo() } catch (_) {}
            tickRef.current = setInterval(() => {
              const p = playerRef.current
              if (!p || !p.getCurrentTime) return
              setCur(p.getCurrentTime() || 0)
              setDur(p.getDuration() || 0)
            }, 250)
          },
          onStateChange: (e) => {
            const s = e.data // 1=playing 2=paused 0=ended 3=buffering
            if (s === 1) {
              setPlaying(true); setEnded(false)
              if (firstPlayRef.current) {
                setRevealed(true) // 一時停止からの再開: タイトルは再表示されないので即reveal
              } else {
                if (!playLoggedRef.current) {
                  playLoggedRef.current = true
                  fetch('/api/log/play', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ videoId, title }),
                    keepalive: true,
                  }).catch(() => {})
                }
                if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
                revealTimerRef.current = setTimeout(() => {
                  firstPlayRef.current = true
                  setRevealed(true) // 開始タイトルが消えてから映像を見せる
                }, 1800)
              }
            } else if (s === 2) {
              setPlaying(false); setRevealed(false)
              if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
            } else if (s === 0) {
              setPlaying(false); setEnded(true); setRevealed(false)
            } else if (s === 3) {
              setRevealed(false)
            }
          },
        },
      })
    })
    return () => {
      cancelled = true
      if (tickRef.current) clearInterval(tickRef.current)
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
      try { playerRef.current && playerRef.current.destroy() } catch (_) {}
      playerRef.current = null
    }
  }, [videoId])

  const toggle = () => {
    const p = playerRef.current
    if (!p) return
    if (playing) p.pauseVideo()
    else p.playVideo()
  }
  const replay = (e) => {
    e.stopPropagation()
    const p = playerRef.current
    if (!p) return
    p.seekTo(0, true); p.playVideo(); setEnded(false)
  }
  const toggleMute = (e) => {
    e.stopPropagation()
    const p = playerRef.current
    if (!p) return
    if (p.isMuted && p.isMuted()) { p.unMute(); setMuted(false) }
    else { p.mute(); setMuted(true) }
  }
  const seek = (e) => {
    e.stopPropagation()
    const p = playerRef.current
    if (!p || !dur) return
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    p.seekTo(frac * dur, true); setCur(frac * dur)
  }

  const pct = dur ? Math.min(100, (cur / dur) * 100) : 0
  const masked = !revealed || ended // YouTube chrome を隠す紺カバーを出すか

  return (
    <div className="absolute inset-0 bg-navy-900">
      {/* YT iframe（API が holder を置換）— pointer-events:none で YouTube UI を一切触らせない */}
      <div className="absolute inset-0 [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:pointer-events-none">
        <div ref={holderRef} className="h-full w-full" />
      </div>

      {/* 紺カバー（YouTube chrome が出る瞬間=開始直後/一時停止/終了 を覆って隠す。視覚専用） */}
      <div
        className={`pointer-events-none absolute inset-0 bg-navy-900 transition-opacity duration-300 ${masked ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* 初期ロード中（再生中だが未reveal）: シマー */}
        {playing && !revealed && !ended && (
          <span aria-hidden="true" className="absolute inset-0 video-skeleton animate-shimmer opacity-40" />
        )}
      </div>

      {/* 映像・紺カバーの上、クリックシールド・操作UIの下に常時表示 */}
      <Watermark />

      {/* クリックシールド＝タップで再生/一時停止（YouTube へのクリック到達を遮断） */}
      <button
        type="button"
        aria-label={playing ? '一時停止' : '再生'}
        onClick={toggle}
        className="absolute inset-0 flex items-center justify-center focus:outline-none"
      >
        {!playing && !ended && (
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400 bg-navy-900/45 backdrop-blur-sm">
            <svg width="22" height="24" viewBox="0 0 20 22" fill="white" aria-hidden="true"><path d="M1 1.5v19l17-9.5L1 1.5z" /></svg>
          </span>
        )}
      </button>

      {/* 終了オーバーレイ（YouTube の関連動画グリッドを隠してサイト内で完結） */}
      {ended && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-900">
          <button
            type="button"
            onClick={replay}
            aria-label="もう一度見る"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-400 text-gold-300 transition-colors hover:bg-navy-800"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12a8 8 0 108-8M4 12V6m0 6h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="font-serifjp text-[13px] text-navy-100">もう一度見る</span>
        </div>
      )}

      {/* 自前コントロールバー（YouTube 非依存） */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 bg-gradient-to-t from-navy-900/90 to-transparent px-3 pb-2.5 pt-8 sm:px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={toggle} aria-label={playing ? '一時停止' : '再生'} className="shrink-0 text-white">
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 20 22" fill="currentColor" aria-hidden="true"><path d="M1 1.5v19l17-9.5L1 1.5z" /></svg>
          )}
        </button>
        <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-navy-100/90">{fmt(cur)}</span>
        <div className="group/track relative h-3 flex-1 cursor-pointer" onClick={seek}>
          <span className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-navy-100/25" />
          <span className="pointer-events-none absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gold-400" style={{ width: `${pct}%` }} />
          <span className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300 opacity-0 transition-opacity group-hover/track:opacity-100" style={{ left: `${pct}%` }} />
        </div>
        <span className="w-9 shrink-0 text-[11px] tabular-nums text-navy-100/90">{fmt(dur)}</span>
        <button type="button" onClick={toggleMute} aria-label={muted ? 'ミュート解除' : 'ミュート'} className="shrink-0 text-white">
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9v6h3l4 4V5L7 9H4z" fill="currentColor" /><path d="M15 9l5 6m0-6l-5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9v6h3l4 4V5L7 9H4z" fill="currentColor" /><path d="M15 8.5a4 4 0 010 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          )}
        </button>
      </div>
    </div>
  )
}
