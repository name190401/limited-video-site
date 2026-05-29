'use client'

import { useState } from 'react'
import Link from 'next/link'
import VideoPlayer from '@/components/ui/VideoPlayer'

const closers = [
  {
    id: 1,
    name: '中村直樹',
    age: 38,
    initials: '中村',
    profile: 'クロージング成功率92%。相手の不安を的確に解消し、信頼関係を築くプロフェッショナル。月間成約数チームNo.1。',
    videoId: 'dQw4w9WgXcQ',
  },
  {
    id: 2,
    name: '高橋さくら',
    age: 29,
    initials: '高橋',
    profile: '元コンサルタント。データに基づいた説得力のあるプレゼンが武器。入会3ヶ月で月収100万円突破。',
    videoId: 'dQw4w9WgXcQ',
  },
  {
    id: 3,
    name: '渡辺一郎',
    age: 45,
    initials: '渡辺',
    profile: '20年以上の営業キャリアを持つベテラン。穏やかな語り口で安心感を与えるクロージングスタイルが特徴。',
    videoId: 'dQw4w9WgXcQ',
  },
  {
    id: 4,
    name: '小林真理',
    age: 33,
    initials: '小林',
    profile: '元教師。わかりやすい説明と寄り添う姿勢で高い信頼を獲得。チーム全体の育成にも尽力。',
    videoId: 'dQw4w9WgXcQ',
  },
]

export default function ClosersPage() {
  const [activeVideo, setActiveVideo] = useState(null)
  const [watchedVideos, setWatchedVideos] = useState(new Set())

  const handleOpenVideo = (closerId) => {
    setActiveVideo(closerId)
  }

  const handleCloseVideo = (closerId) => {
    setActiveVideo(null)
    setWatchedVideos((prev) => new Set([...prev, closerId]))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/20 mb-6">
          <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
          <span className="text-gold-400 text-sm font-medium">CLOSING</span>
        </div>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-gradient mb-4"
          style={{ fontFamily: "'Noto Serif JP', serif" }}
        >
          クロージング
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          トップクローザーたちの実践的なプレゼンテーション
        </p>
      </div>

      {/* Closer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {closers.map((closer) => (
          <div
            key={closer.id}
            className="bg-dark-400 border border-gold-400/10 rounded-2xl overflow-hidden hover:border-gold-400/25 transition-all duration-300 group"
          >
            {/* Video Area */}
            {activeVideo === closer.id && (
              <div className="relative">
                <VideoPlayer videoId={closer.videoId} title={`${closer.name}のクロージング動画`} />
                <button
                  onClick={() => handleCloseVideo(closer.id)}
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
                {/* Avatar - slightly different style from leaders */}
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400/25 to-gold-700/15 border border-gold-400/20 flex items-center justify-center">
                  <span className="text-gold-400 font-bold text-lg">{closer.initials[0]}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {closer.name}
                    </h3>
                    <span className="text-xs text-gold-400/70 bg-gold-400/10 px-2 py-0.5 rounded-full border border-gold-400/15">
                      {closer.age}歳
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mt-2">
                    {closer.profile}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                {activeVideo === closer.id ? null : (
                  <button
                    onClick={() => handleOpenVideo(closer.id)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-400/10 to-gold-600/10 border border-gold-400/20 text-gold-400 font-medium text-sm hover:from-gold-400/20 hover:to-gold-600/20 hover:border-gold-400/35 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    動画を見る
                  </button>
                )}
              </div>

              {/* Post-watch CTA */}
              {watchedVideos.has(closer.id) && activeVideo !== closer.id && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-gold-400/5 to-gold-600/5 border border-gold-400/15">
                  <p
                    className="text-gold-gradient text-center font-bold text-lg mb-1"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    一緒に始めましょう
                  </p>
                  <p className="text-gray-500 text-xs text-center">
                    あなたの新しいスタートを応援します
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Encouragement */}
      <div className="mt-16 text-center">
        <div className="inline-block p-10 rounded-2xl bg-dark-400/50 border border-gold-400/10 max-w-lg">
          <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-dark-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <h2
            className="text-gold-gradient text-2xl font-bold mb-3"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            一緒に始めましょう
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            クローザーの動画をご覧いただきありがとうございます。<br />
            あなたの成功への第一歩を、私たちがサポートします。
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/member"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gold-400/25 text-gold-400 text-sm font-medium hover:bg-gold-400/10 transition-colors"
            >
              メンバーページへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
