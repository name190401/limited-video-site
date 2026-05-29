'use client'

export default function VideoPlayer({ videoId, title }) {
  if (!videoId) {
    return (
      <div className="aspect-video bg-dark-400 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">動画が設定されていません</p>
      </div>
    )
  }

  return (
    <div
      className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl glow-gold relative no-select"
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&cc_load_policy=0`}
        width="100%"
        height="100%"
        allow="accelerometer; autoplay; encrypted-media; gyroscope"
        allowFullScreen
        style={{ border: 'none' }}
        title={title || '限定動画'}
      />
      {/* 右クリック防止用の透明オーバーレイ */}
      <div
        className="absolute inset-0 z-10"
        onContextMenu={(e) => e.preventDefault()}
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  )
}
