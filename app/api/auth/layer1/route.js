import { verifyLayer1Password } from '@/lib/auth/server';
import { issueLayer1CookieValue, layer1CookieOptions, LAYER1_COOKIE } from '@/lib/auth/layer1';
import { handlePasswordAuth } from '@/lib/auth/password-route';

export const runtime = 'nodejs';

/** Layer1（サイト全体）の共通パスワード認証。共通フローは handlePasswordAuth を参照。 */
export async function POST(request) {
  return handlePasswordAuth(request, {
    scope: 'layer1',
    max: 20,
    windowMin: 15,
    verify: verifyLayer1Password,
    cookieName: LAYER1_COOKIE,
    issueCookieValue: issueLayer1CookieValue,
    cookieOptions: layer1CookieOptions,
  });
}
