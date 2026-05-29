'use client'

import { useState, useEffect, useCallback } from 'react'
import PasswordGate from '@/components/auth/PasswordGate'
import VideoPlayer from '@/components/ui/VideoPlayer'

const VIDEO_GROUPS = [
  {
    name: '基本セット',
    videos: [
      { title: 'フルバージョン', duration: '90分', videoId: 'dQw4w9WgXcQ' },
      { title: '単体版', duration: '30分', videoId: 'dQw4w9WgXcQ' },
      { title: 'ボーナス解説', duration: '15分', videoId: 'dQw4w9WgXcQ' },
    ],
  },
  {
    name: '製品・トレーニング',
    videos: [
      { title: '製品説明', duration: '45分', videoId: 'dQw4w9WgXcQ' },
      { title: 'トレーニング', duration: '60分', videoId: 'dQw4w9WgXcQ' },
      { title: '実践ガイド', duration: '40分', videoId: 'dQw4w9WgXcQ' },
    ],
  },
  {
    name: '応用セット',
    videos: [
      { title: '応用戦略', duration: '50分', videoId: 'dQw4w9WgXcQ' },
      { title: 'ケーススタディ', duration: '35分', videoId: 'dQw4w9WgXcQ' },
      { title: 'Q&A', duration: '25分', videoId: 'dQw4w9WgXcQ' },
    ],
  },
]

export default function VideosPage() {
  const [unlockedGroups, setUnlockedGroups] = useState({})
  const [expandedGroup, setExpandedGroup] = useState(null)
  const [activeVideo, setActiveVideo] = useState(null)
  const [gateGroupIndex, setGateGroupIndex] = useState(null)

  // Check sessionStorage on mount for previously unlocked groups
  useEffect(() => {
    const unlocked = {}
    VIDEO_GROUPS.forEach((_, index) => {
      if (sessionStorage.getItem(`video_group_${index}_auth`) === 'true') {
        unlocked[index] = true
      }
    })
    setUnlockedGroups(unlocked)
  }, [])

  const handleGroupClick = (groupIndex) => {
    if (unlockedGroups[groupIndex]) {
      // Toggle expand/collapse
      setExpandedGroup(expandedGroup === groupIndex ? null : groupIndex)
      setActiveVideo(null)
    } else {
      // Show password gate
      setGateGroupIndex(groupIndex)
    }
  }

  const handleUnlock = useCallback((groupIndex) => {
    sessionStorage.setItem(`video_group_${groupIndex}_auth`, 'true')
    setUnlockedGroups((prev) => ({ ...prev, [groupIndex]: true }))
    setGateGroupIndex(null)
    setExpandedGroup(groupIndex)
  }, [])

  const handlePlayVideo = (groupIndex, videoIndex) => {
    const video = VIDEO_GROUPS[groupIndex].videos[videoIndex]
    setActiveVideo({ groupIndex, videoIndex, ...video })
  }

  return (
    <div className="min-h-screen bg-dark-600">
      {/* Header */}
      <header className="border-b border-gold-400/20">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gold-gradient tracking-wide">
            Business Presentation
          </h1>
          <a
            href="/member"
            className="text-gold-400/60 hover:text-gold-400 text-sm transition-colors"
          >
            メンバーページへ戻る
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gold-gradient mb-2">
            限定動画コンテンツ
          </h2>
          <p className="text-gold-400/50 text-sm">
            各グループのパスワードを入力してロックを解除してください
          </p>
        </div>

        {/* Video Groups */}
        <div className="space-y-4">
          {VIDEO_GROUPS.map((group, groupIndex) => {
            const isUnlocked = unlockedGroups[groupIndex]
            const isExpanded = expandedGroup === groupIndex

            return (
              <div
                key={groupIndex}
                className={`rounded-2xl border transition-all duration-300 ${
                  isUnlocked
                    ? 'border-gold-400/30 glow-gold'
                    : 'border-gold-400/10'
                } ${isExpanded ? 'bg-dark-400' : 'bg-dark-400/60'}`}
              >
                {/* Group Header */}
                <button
                  onClick={() => handleGroupClick(groupIndex)}
                  className="w-full px-6 py-5 flex items-center justify-between group glow-gold-hover rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Lock / Unlock Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isUnlocked
                          ? 'bg-gold-400/20'
                          : 'bg-dark-200'
                      }`}
                    >
                      {isUnlocked ? (
                        <svg
                          className="w-5 h-5 text-gold-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gold-400/50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white group-hover:text-gold-400 transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-gold-400/40 text-sm">
                        {group.videos.length}本の動画
                      </p>
                    </div>
                  </div>

                  {/* Expand Arrow */}
                  <svg
                    className={`w-5 h-5 text-gold-400/40 transition-transform duration-300 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Expanded Video List */}
                {isExpanded && isUnlocked && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-gold-400/10 pt-4 space-y-2">
                      {group.videos.map((video, videoIndex) => {
                        const isActive =
                          activeVideo?.groupIndex === groupIndex &&
                          activeVideo?.videoIndex === videoIndex

                        return (
                          <button
                            key={videoIndex}
                            onClick={() =>
                              handlePlayVideo(groupIndex, videoIndex)
                            }
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                              isActive
                                ? 'bg-gold-400/20 border border-gold-400/40'
                                : 'hover:bg-dark-200/80 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Play Icon */}
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  isActive
                                    ? 'bg-gold-400 text-dark-600'
                                    : 'bg-dark-200 text-gold-400/60'
                                }`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                              <span
                                className={`font-medium ${
                                  isActive ? 'text-gold-400' : 'text-white/80'
                                }`}
                              >
                                {video.title}
                              </span>
                            </div>
                            <span className="text-gold-400/40 text-sm">
                              {video.duration}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Video Player Area */}
                    {activeVideo && activeVideo.groupIndex === groupIndex && (
                      <div className="mt-6">
                        <VideoPlayer
                          videoId={activeVideo.videoId}
                          title={activeVideo.title}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      {/* Password Gate Modal */}
      {gateGroupIndex !== null && (
        <PasswordGate
          groupIndex={gateGroupIndex}
          groupName={VIDEO_GROUPS[gateGroupIndex].name}
          onSuccess={() => handleUnlock(gateGroupIndex)}
          onClose={() => setGateGroupIndex(null)}
        />
      )}
    </div>
  )
}
