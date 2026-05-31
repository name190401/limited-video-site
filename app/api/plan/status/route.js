import { NextResponse } from 'next/server';
import { verifyPlanToken, PLAN_COOKIE } from '@/lib/auth/layer2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 解除状態の確認専用エンドポイント。
 * 保護動画 ID は一切返さず、qualia_plan トークンの有効/無効だけを返す。
 * 未解除でも 401 にせず常に 200（クライアントの状態復元プローブ用）。
 * 保護コンテンツの唯一の出口は /api/plan/content（そちらは未認証 401 のまま）。
 */
export async function GET(request) {
  const token = request.cookies.get(PLAN_COOKIE)?.value;
  const unlocked = await verifyPlanToken(token);
  return NextResponse.json(
    { unlocked: !!unlocked },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
