import { NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/auth/server';
import { handlePasswordAuth } from '@/lib/auth/password-route';
import { ADMIN_COOKIE, issueAdminCookieValue, adminCookieOptions } from '@/lib/auth/admin';

export const runtime = 'nodejs';

/**
 * 管理画面ログイン。ADMIN_PASSWORD を照合し、成功で qualia_admin httpOnly Cookie を発行。
 * レート制限（10回/15分→429）含む共通フローは handlePasswordAuth を参照。
 */
export async function POST(request) {
  return handlePasswordAuth(request, {
    scope: 'admin',
    max: 10,
    windowMin: 15,
    verify: verifyAdminPassword,
    cookieName: ADMIN_COOKIE,
    issueCookieValue: issueAdminCookieValue,
    cookieOptions: adminCookieOptions,
  });
}

/** 管理画面ログアウト（Cookie 破棄）。 */
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions(), maxAge: 0 });
  return res;
}
