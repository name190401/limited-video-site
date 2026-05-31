import { NextResponse } from 'next/server';
import { LAYER1_COOKIE, verifyLayer1CookieValue } from '@/lib/auth/layer1';

/**
 * Layer1 ゲート：有効な共通パスワード Cookie が無ければ /enter へリダイレクト。
 *
 * - Cookie 検証は Web Crypto（lib/crypto-token.js）で行うため Edge ランタイムで動く。
 * - /api/* は matcher 除外（各 API ハンドラが自前で認証・認可する）。
 * - /enter（ゲート画面）は素通し。
 * - /admin（管理画面）は Layer1 を免除し、管理者パスワードで自前ゲートする
 *   （保守する人が共通パスワードと管理者パスワードの両方を覚えなくて済むように）。
 */

function isExempt(pathname) {
  return pathname === '/enter' || pathname.startsWith('/admin');
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (isExempt(pathname)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(LAYER1_COOKIE)?.value;
  const ok = await verifyLayer1CookieValue(cookie);

  if (!ok) {
    const url = request.nextUrl.clone();
    url.pathname = '/enter';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // 静的アセット・画像・favicon・robots・api を除く全ルートを保護
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|api/).*)'],
};
