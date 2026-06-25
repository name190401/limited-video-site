'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import SitePlayer from './SitePlayer'

const EMBED_BASE = 'https://www.youtube-nocookie.com/embed/'
const EMBED_PARAMS = 'modestbranding=1&rel=0&showinfo=0&cc_load_policy=0'

/**
 * 動画プレイヤー（§9 タップ再生方式）。
 *
 * - 既定: サムネ（YouTube hqdefault or 指定 thumbnail）＋ 金リング Play ボタンを表示し、
 *   **タップで画面全体を覆うフルスクリーンのライトボックス**を開いて再生する
 *   （iPhone Safari は任意要素の requestFullscreen 不可のため、ビューポート全面の
 *   オーバーレイ＝全デバイスで確実に効く方式。YouTube の ⛶ で真の OS 全画面にも行ける）。
 *   → 多数動画の全先読み（eager load）を回避（開いた時に初めて iframe 生成）。
 *   閉じる: ×ボタン / 背景タップ / ESC。表示中は背景スクロールをロック。
 * - muted=true（09 製品ショート）: タップ不要で **ミュート自動ループ** 再生（インライン据置）。
 * - 右クリック抑止（onContextMenu）は維持。
 */
export default function VideoPlayer({ videoId, title, thumbnail, duration, muted = false }) {
  const [active, setActive] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // 全画面表示中: ESC で閉じる ＋ 背景スクロールをロック。
  useEffect(() => {
    if (!active) return
    const onKey = (e) => { if (e.key === 'Escape') setActive(false) }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [active])

  if (!videoId) {
    return (
      <div className="aspect-video bg-navy-100 rounded-xl flex items-center justify-center border border-navy-200">
        <p className="text-navy-400 text-sm">動画が設定されていません</p>
      </div>
    )
  }

  // 製品ショート: ミュート自動ループ（タップ不要・インライン据置）
  if (muted) {
    return (
      <div
        className="aspect-video bg-navy-900 rounded-xl overflow-hidden relative no-select"
        onContextMenu={(e) => e.preventDefault()}
      >
        <iframe
          src={`${EMBED_BASE}${videoId}?${EMBED_PARAMS}&autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&playsinline=1`}
          width="100%"
          height="100%"
          allow="autoplay; encrypted-media"
          style={{ border: 'none', pointerEvents: 'none' }}
          title={title || '製品ショート'}
        />
        <div className="absolute inset-0 z-10" onContextMenu={(e) => e.preventDefault()} />
      </div>
    )
  }

  const thumbSrc = thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

  // 全画面ライトボックス（body 直下に portal で出す＝カード/section の transform・overflow に影響されない）
  const overlay =
    active && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-navy-900/95 backdrop-blur-sm p-4 sm:p-8 animate-fade-in"
            onClick={() => setActive(false)}
            role="dialog"
            aria-modal="true"
            aria-label={title || '動画'}
          >
            {/* 閉じる × */}
            <button
              type="button"
              onClick={() => setActive(false)}
              aria-label="閉じる"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-gold-400/60 bg-navy-900/70 text-gold-300 transition-colors hover:bg-navy-800 hover:text-gold-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            {/* プレーヤー（16:9・最大幅。動画部のクリックは閉じない・YouTube非依存の自前UI） */}
            <div
              className="relative w-full max-w-[1100px] aspect-video overflow-hidden rounded-xl shadow-2xl no-select"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
            >
              <SitePlayer videoId={videoId} title={title} />
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <>
      <div className="video-frame relative rounded-xl">
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`${title || '動画'}を全画面で再生`}
          className="group aspect-video w-full rounded-xl overflow-hidden relative no-select bg-navy-900 block"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* 読込スケルトン（shimmer・ロード完了でフェードアウト） */}
          <span
            aria-hidden="true"
            className={`absolute inset-0 video-skeleton animate-shimmer transition-opacity duration-300 ${loaded ? 'opacity-0' : 'opacity-100'}`}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbSrc}
            alt={title || ''}
            onLoad={() => setLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-[opacity,transform] duration-[240ms] ease-out"
            loading="lazy"
          />
          <span className="absolute inset-0 bg-navy-900/25" />
          {/* 金リング内 白 Play 三角（直径 56px・hover で拡大） */}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full border border-gold-400 bg-navy-900/40 backdrop-blur-sm transition-transform duration-[240ms] ease-out group-hover:scale-110">
            <svg width="20" height="22" viewBox="0 0 20 22" fill="white" aria-hidden="true">
              <path d="M1 1.5v19l17-9.5L1 1.5z" />
            </svg>
          </span>
          {/* 尺ラベル（左下・navy-400 キャプション） */}
          {duration && (
            <span className="absolute left-2 bottom-2 px-1.5 py-0.5 rounded bg-navy-900/70 text-[12px] text-navy-100">
              {duration}
            </span>
          )}
        </button>
      </div>
      {overlay}
    </>
  )
}
