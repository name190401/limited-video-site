import { NextResponse } from 'next/server';
import { verifyPlanToken, PLAN_COOKIE } from '@/lib/auth/layer2';
import { getPlanVideos } from '@/lib/content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 保護プラン動画（layer2）の唯一の出口。
 * qualia_plan トークンを検証してからのみ、layer2 の youtube_id を返す。
 * 無効/改竄/未認証は 401。レスポンスは Cache-Control: no-store（中間キャッシュ禁止）。
 */
export async function GET(request) {
  const token = request.cookies.get(PLAN_COOKIE)?.value;
  const ok = await verifyPlanToken(token);
  if (!ok) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const videos = await getPlanVideos();
  return NextResponse.json(
    { videos },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
