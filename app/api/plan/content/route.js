import { NextResponse } from 'next/server';
import { verifyPlanToken, PLAN_COOKIE } from '@/lib/auth/layer2';
import { verifyLayer1CookieValue, LAYER1_COOKIE } from '@/lib/auth/layer1';
import { getProtectedVideos } from '@/lib/content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 保護動画（layer2）の唯一の出口。
 * qualia_site・qualia_plan トークンを検証してからのみ、layer2 の youtube_id を返す。
 * 無効/改竄/未認証は 401。レスポンスは Cache-Control: no-store（中間キャッシュ禁止）。
 */
export async function GET(request) {
  const layer1Token = request.cookies.get(LAYER1_COOKIE)?.value;
  const planToken = request.cookies.get(PLAN_COOKIE)?.value;
  const [layer1Ok, planOk] = await Promise.all([
    verifyLayer1CookieValue(layer1Token),
    verifyPlanToken(planToken),
  ]);
  if (!layer1Ok || !planOk) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const videos = await getProtectedVideos();
  return NextResponse.json(
    { videos },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
