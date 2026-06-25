import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions } from '@/lib/auth/admin';
import { LAYER1_COOKIE, layer1CookieOptions } from '@/lib/auth/layer1';

export const runtime = 'nodejs';

/**
 * ログアウト（統一）。管理画面の「ログアウト」から呼ばれ、会員(Layer1)・管理(Admin)の
 * 両 Cookie を破棄する。
 * ※ログイン入口は /enter に一本化したため、ここはログイン POST を持たない
 *   （管理者PWは /enter → /api/auth/layer1 が判定し Admin Cookie も併せて発行する）。
 */
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions(), maxAge: 0 });
  res.cookies.set(LAYER1_COOKIE, '', { ...layer1CookieOptions(), maxAge: 0 });
  return res;
}
