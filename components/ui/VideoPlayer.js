'use client'

import { useState } from 'react'

const EMBED_PARAMS = 'modestbranding=1&rel=0&showinfo=0&cc_load_policy=0'

/**
 * 動画プレイヤー（§9 タップ再生方式）。
 *
 * - 既定: サムネ（YouTube hqdefault or 指定 thumbnail）＋ 金リング Play ボタンを表示し、
 *   **初回タップで初めて youtube-nocookie iframe を生成**（autoplay=1）。
 *   → 多数動画の全先読み（eager load）を回避。
 * - muted=true（09 製品ショート）: タップ不要で **ミュート自動ループ** 再生。
 * - 右クリック抑止（onContextMenu）は維持。
 */
export default function VideoPlayer({ videoId, title, thumbnail, duration, muted = false }) {
  const [active, setActive] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!videoId) {
    return (
      <div className="aspect-video bg-navy-100 rounded-xl flex items-center justify-center border border-navy-200">
        <p className="text-navy-400 text-sm">動画が設定されていません</p>
      </div>
    )
  }

  // 製品ショート: ミュート自動ループ（タップ不要）
  if (muted) {
    return (
      <div
        className="aspect-video bg-navy-900 rounded-xl overflow-hidden relative no-select"
        onContextMenu={(e) => e.preventDefault()}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?${EMBED_PARAMS}&autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&playsinline=1`}
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

  if (!active) {
    return (
      <div className="video-frame relative rounded-xl">
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`${title || '動画'}を再生`}
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
    )
  }

  return (
    <div className="video-frame relative rounded-xl">
      <div
        className="aspect-video bg-navy-900 rounded-xl overflow-hidden shadow-lg relative no-select"
        onContextMenu={(e) => e.preventDefault()}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?${EMBED_PARAMS}&autoplay=1`}
          width="100%"
          height="100%"
          allow="accelerometer; autoplay; encrypted-media; gyroscope"
          allowFullScreen
          style={{ border: 'none' }}
          title={title || '限定動画'}
        />
        <div className="absolute inset-0 z-10" onContextMenu={(e) => e.preventDefault()} style={{ pointerEvents: 'none' }} />
      </div>
    </div>
  )
}
