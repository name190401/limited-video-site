import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  issueAdminCookieValue,
  readAdminPayload,
} from '@/lib/auth/admin';
import {
  LAYER1_COOKIE,
  issueLayer1CookieValue,
  layer1CookieOptions,
  readLayer1Payload,
} from '@/lib/auth/layer1';
import { verifyAdminPassword } from '@/lib/auth/server';
import {
  ADMIN_PV_KEY,
  SITE_PV_KEY,
  invalidateVersionCache,
  isVersionCurrent,
  readPasswordVersion,
} from '@/lib/auth/session-version';
import { getJstDateString } from '@/lib/date';
import { checkAndIncrement, clientIp } from '@/lib/ratelimit';
import {
  SettingsUnavailableError,
  getAdminPassword,
  getPasswordVersion,
  getSitePassword,
  setSettings,
} from '@/lib/settings';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    // ローカルモードでは現在素通しだが、レート制限復旧時に自動で有効になる配線を保つ。
    const gate = await checkAndIncrement({
      scope: 'admin-password',
      ip: clientIp(request),
      jstDate: getJstDateString(),
      max: 10,
      windowMin: 15,
    });
    if (!gate.allowed) {
      return NextResponse.json({ error: 'too_many_attempts' }, { status: 429 });
    }

    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const payload = await readAdminPayload(token);
    if (!payload) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const adminVersion = await readPasswordVersion(ADMIN_PV_KEY);
    if (!isVersionCurrent(payload, adminVersion)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { target, current, next, confirm } = body;
    if (target !== 'site' && target !== 'admin') {
      return NextResponse.json({ error: 'invalid_target' }, { status: 400 });
    }

    if (!(await verifyAdminPassword(current))) {
      await gate.registerFailure();
      return NextResponse.json({ error: 'invalid_current' }, { status: 401 });
    }

    // 型チェックを先に置く（未入力だと next === confirm === undefined が成立し、
    // 後段の判定に落ちて実態と違うエラー名を返してしまうため）。
    if (typeof next !== 'string' || typeof confirm !== 'string') {
      return NextResponse.json({ error: 'missing' }, { status: 400 });
    }
    if (next !== confirm) {
      return NextResponse.json({ error: 'mismatch' }, { status: 400 });
    }
    if (next.trim() !== next) {
      return NextResponse.json({ error: 'whitespace' }, { status: 400 });
    }
    if (next.length < 8 || next.length > 64) {
      return NextResponse.json({ error: 'length' }, { status: 400 });
    }
    if (!/^[\x21-\x7e]+$/.test(next)) {
      return NextResponse.json({ error: 'charset' }, { status: 400 });
    }

    const passwordKey = target === 'site' ? 'site_password' : 'admin_password';
    const versionKey = target === 'site' ? SITE_PV_KEY : ADMIN_PV_KEY;
    const currentPassword = target === 'site' ? await getSitePassword() : await getAdminPassword();
    if (next === currentPassword) {
      return NextResponse.json({ error: 'same_as_current' }, { status: 400 });
    }

    const otherPassword = target === 'site' ? await getAdminPassword() : await getSitePassword();
    // layer1 は管理者を先に判定するため、同値だと会員ログインが機能しなくなる。
    if (next === otherPassword) {
      return NextResponse.json({ error: 'conflict' }, { status: 400 });
    }

    await gate.registerSuccess();

    // 世代の読み取りに readPasswordVersion を使わないこと。あちらは DB 不達時に
    // 古い値（または 0）を返すフェイルオープンなので、+1 しても現行より小さい値で
    // 上書きしてしまい、失効させたはずのセッションが復活する。書き込み経路では
    // getPasswordVersion（DB エラーで例外＝フェイルクローズ）から読む。
    const currentVersion = await getPasswordVersion(versionKey);
    const newVersion = currentVersion + 1;
    await setSettings([
      [passwordKey, next],
      [versionKey, String(newVersion)],
    ]);

    invalidateVersionCache(versionKey);
    // 書き込み後に読み直さない。ここで読むと、変更は成立しているのに読み取り失敗で
    // 503 を返す窓ができる（画面の「最終変更」は /admin の再描画時に取り直される）。
    const response = NextResponse.json({ success: true, target });
    if (target === 'site') {
      const layer1Payload = await readLayer1Payload(
        request.cookies.get(LAYER1_COOKIE)?.value
      );
      // 目的は既に有効な自分の会員セッションを維持することであり、管理者へ新規付与はしない。
      if (layer1Payload && isVersionCurrent(layer1Payload, currentVersion)) {
        response.cookies.set(
          LAYER1_COOKIE,
          await issueLayer1CookieValue(newVersion),
          layer1CookieOptions()
        );
      }
    } else {
      response.cookies.set(
        ADMIN_COOKIE,
        await issueAdminCookieValue(newVersion),
        adminCookieOptions()
      );
    }
    return response;
  } catch (err) {
    if (err instanceof SettingsUnavailableError || err?.name === 'SettingsUnavailableError') {
      return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405 });
}

export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
