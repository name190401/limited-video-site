'use client'

import { useState } from 'react'
import Link from 'next/link'
import VideoPlayer from '@/components/ui/VideoPlayer'

const leaders = [
  {
    id: 1,
    name: '田中太郎',
    age: 35,
    initials: '田中',
    profile: '元大手IT企業のエンジニア。独立後わずか1年で月収500万円を達成。論理的なアプローチと誠実な人柄で多くの仲間を惹きつける。',
    videoId: 'dQw4w9WgXcQ',
  },
  {
    id: 2,
    name: '鈴木花子',
    age: 28,
    initials: '鈴木',
    profile: '元看護師。副業として始め、半年で本業の収入を超える。女性ならではの視点とコミュニケーション力が強み。',
    videoId: 'dQw4w9WgXcQ',
  },
  {
    id: 3,
    name: '佐藤健一',
    age: 42,
    initials: '佐藤',
    profile: '元営業マネージャー。20年の営業経験を活かし、チームビルディングのプロフェッショナル。月間MVPを3回連続受賞。',
    videoId: 'dQw4w9WgXcQ',
  },
  {
    id: 4,
    name: '山田美咲',
    age: 31,
    initials: '山田',
    profile: '元アパレル店長。SNSマーケティングのスキルを活かし、オンラインで圧倒的な成果を出す。チーム全体の売上を牽引。',
    videoId: 'dQw4w9WgXcQ',
  },
]

export default function LeadersPage() {
  const [activeVideo, setActiveVideo] = useState(null)
  const [watchedVideos, setWatchedVideos] = useState(new Set())

  const handleOpenVideo = (leaderId) => {
    setActiveVideo(leaderId)
  }

  const handleCloseVideo = (leaderId) => {
    setActiveVideo(null)
    setWatchedVideos((prev) => new Set([...prev, leaderId]))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/20 mb-6">
          <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <span className="text-gold-400 text-sm font-medium">LEADERS</span>
        </div>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-gradient mb-4"
          style={{ fontFamily: "'Noto Serif JP', serif" }}
        >
          リーダー紹介
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          実績を持つリーダーたちのメッセージをお聴きください
        </p>
      </div>

      {/* Leader Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
        {leaders.map((leader) => (
          <div
            key={leader.id}
            className="bg-dark-400 border border-gold-400/15 rounded-2xl overflow-hidden hover:border-gold-400/30 transition-all duration-300"
          >
            {/* Video Area (shown when active) */}
            {activeVideo === leader.id && (
              <div className="relative">
                <VideoPlayer videoId={leader.videoId} title={`${leader.name}の紹介動画`} />
                <button
                  onClick={() => handleCloseVideo(leader.id)}
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 border border-gold-400/30 flex items-center justify-center text-white hover:bg-black hover:border-gold-400/60 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/20 border-2 border-gold-400/30 flex items-center justify-center">
                  <span className="text-gold-400 font-bold text-lg">{leader.initials[0]}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {leader.name}
                    </h3>
                    <span className="text-xs text-gray-500 bg-dark-200 px-2 py-0.5 rounded-full">
                      {leader.age}歳
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mt-2">
                    {leader.profile}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                {activeVideo === leader.id ? null : (
                  <button
                    onClick={() => handleOpenVideo(leader.id)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold-400/10 border border-gold-400/25 text-gold-400 font-medium text-sm hover:bg-gold-400/20 hover:border-gold-400/40 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    動画を見る
                  </button>
                )}
              </div>

              {/* Post-watch CTA */}
              {watchedVideos.has(leader.id) && activeVideo !== leader.id && (
                <div className="mt-4 p-4 rounded-xl bg-gold-400/5 border border-gold-400/15">
                  <p className="text-gold-400/90 text-sm text-center mb-3">
                    それでは新規事業説明会を聞いてください
                  </p>
                  <Link
                    href="/videos"
                    className="flex items-center justify-center gap-2 text-sm font-medium text-dark-600 bg-gold-gradient px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    事業説明動画へ
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <div className="inline-block p-8 rounded-2xl bg-dark-400/50 border border-gold-400/10">
          <p className="text-gray-400 mb-4">リーダーの動画をご覧になりましたか？</p>
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gold-gradient text-dark-600 font-bold hover:opacity-90 transition-opacity"
          >
            事業説明動画へ進む
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
