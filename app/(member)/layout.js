import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SecurityGuard from '@/components/security/SecurityGuard'

export const metadata = {
  title: 'メンバーエリア | プレミアムビジネスプレゼンテーション',
  description: 'メンバー限定コンテンツ',
}

const navLinks = [
  { href: '/member', label: 'メンバー' },
  { href: '/leaders', label: 'リーダー紹介' },
  { href: '/videos', label: '事業説明動画' },
  { href: '/closers', label: 'クロージング' },
]

export default async function MemberLayout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const displayName = user.user_metadata?.display_name || user.email

  // プロフィールからロールを取得
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'member'
  const isLeaderOrAdmin = userRole === 'leader' || userRole === 'admin'

  return (
    <div className="min-h-screen bg-dark-600 flex flex-col">
      {/* Header */}
      <header className="bg-dark-400/80 backdrop-blur-md border-b border-gold-400/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/member" className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gold-gradient flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-dark-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-gold-gradient font-bold text-lg sm:text-xl tracking-wide hidden sm:inline"
                style={{ fontFamily: "'Noto Serif JP', serif" }}>
                PREMIUM
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-gold-400 hover:bg-gold-400/5 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
              {isLeaderOrAdmin && (
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gold-400 hover:bg-gold-400/10 transition-all duration-200 border border-gold-400/30"
                >
                  管理者
                </Link>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-200/60 border border-gold-400/10">
                <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center">
                  <span className="text-xs font-bold text-dark-600">
                    {(displayName || '?')[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-300 max-w-[120px] truncate">
                  {displayName}
                </span>
              </div>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-xs text-gray-500 hover:text-gold-400 transition-colors px-2 py-1"
                >
                  ログアウト
                </button>
              </form>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto scrollbar-hide -mx-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-gold-400 hover:bg-gold-400/5 transition-all duration-200 whitespace-nowrap shrink-0"
              >
                {link.label}
              </Link>
            ))}
            {isLeaderOrAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-full text-xs font-medium text-gold-400 border border-gold-400/30 hover:bg-gold-400/10 transition-all duration-200 whitespace-nowrap shrink-0"
              >
                管理者
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <SecurityGuard>{children}</SecurityGuard>
      </main>

      {/* Footer */}
      <footer className="bg-dark-400/50 border-t border-gold-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gold-gradient flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-dark-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-sm text-gray-500">PREMIUM BUSINESS PRESENTATION</span>
            </div>
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} All Rights Reserved. Unauthorized access prohibited.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
