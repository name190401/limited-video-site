import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const sections = [
  {
    title: 'リーダー紹介',
    href: '/leaders',
    description: '成功を収めたリーダーたちのストーリーと実績をご覧ください。',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    badge: null,
  },
  {
    title: '事業説明動画',
    href: '/videos',
    description: 'ビジネスモデルと収益構造について詳しく解説します。',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
      </svg>
    ),
    badge: 'パスワード必要',
  },
  {
    title: 'クロージング',
    href: '/closers',
    description: 'トップクローザーのプレゼンテーションをご覧いただけます。',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    badge: null,
  },
]

export default async function MemberPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName = user?.user_metadata?.display_name || 'メンバー'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Welcome Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/20 mb-6">
          <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
          <span className="text-gold-400 text-sm font-medium">MEMBER AREA</span>
        </div>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
          style={{ fontFamily: "'Noto Serif JP', serif" }}
        >
          ようこそ、
          <span className="text-gold-gradient">{displayName}</span>
          <span className="text-gray-300"> さん</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          限定コンテンツをご用意しています。下記のセクションからご覧ください。
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group relative bg-dark-400 border border-gold-400/15 rounded-2xl p-8 hover:border-gold-400/40 transition-all duration-300 glow-gold-hover"
          >
            {/* Badge */}
            {section.badge && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold-400/15 text-gold-400 border border-gold-400/20">
                  {section.badge}
                </span>
              </div>
            )}

            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 mb-6 group-hover:bg-gold-400/15 transition-colors">
              {section.icon}
            </div>

            {/* Content */}
            <h2
              className="text-xl font-bold text-white mb-3 group-hover:text-gold-400 transition-colors"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              {section.title}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {section.description}
            </p>

            {/* Arrow */}
            <div className="flex items-center text-gold-400/60 group-hover:text-gold-400 transition-colors">
              <span className="text-sm font-medium mr-2">詳しく見る</span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Bottom gold line accent */}
            <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent group-hover:via-gold-400/60 transition-all" />
          </Link>
        ))}
      </div>

      {/* Decorative bottom element */}
      <div className="mt-20 flex justify-center">
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
      </div>
    </div>
  )
}
