import { verifyPassword } from '@/lib/password';
import { issuePlanToken, planCookieOptions, PLAN_COOKIE } from '@/lib/auth/layer2';
import { handlePasswordAuth } from '@/lib/auth/password-route';

export const runtime = 'nodejs';

/**
 * Layer2 解除（04/08/09 共通の合言葉）。当日の日替わりパスを照合し、
 * 成功で qualia_plan httpOnly トークン Cookie を発行（JST 24:00 失効）。
 * レート制限（10回/15分→429）含む共通フローは handlePasswordAuth を参照。
 */
export async function POST(request) {
  return handlePasswordAuth(request, {
    scope: 'layer2',
    max: 10,
    windowMin: 15,
    verify: verifyPassword,
    cookieName: PLAN_COOKIE,
    issueCookieValue: issuePlanToken,
    cookieOptions: planCookieOptions,
  });
}
