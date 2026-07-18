import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions } from '@/lib/auth/admin';
import { LAYER1_COOKIE, layer1CookieOptions } from '@/lib/auth/layer1';
import { PLAN_COOKIE, planCookieOptions } from '@/lib/auth/layer2';

export const runtime = 'nodejs';

/** 会員・プラン・管理者の全 Cookie を破棄する。 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(LAYER1_COOKIE, '', { ...layer1CookieOptions(), maxAge: 0 });
  res.cookies.set(PLAN_COOKIE, '', { ...planCookieOptions(), maxAge: 0 });
  res.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions(), maxAge: 0 });
  return res;
}
