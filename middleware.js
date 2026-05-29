import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // メンバーページは認証必須
  if (pathname.startsWith('/member') || pathname.startsWith('/leaders') || pathname.startsWith('/videos') || pathname.startsWith('/closers')) {
    const { user, supabaseResponse } = await updateSession(request)

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // 管理者ページはロールチェック
  if (pathname.startsWith('/admin')) {
    const { user, supabaseResponse } = await updateSession(request)

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // ログインページ: 既にログイン済みならメンバーページへ
  if (pathname === '/login' || pathname === '/register') {
    const { user, supabaseResponse } = await updateSession(request)

    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = '/member'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // その他のページはセッション更新のみ
  const { supabaseResponse } = await updateSession(request)
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|api/).*)',
  ],
}
