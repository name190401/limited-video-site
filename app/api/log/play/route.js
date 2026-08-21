import { NextResponse } from 'next/server';
import { readLayer1Payload, LAYER1_COOKIE } from '@/lib/auth/layer1';
import { clientIp } from '@/lib/ratelimit';
import { logPlay } from '@/lib/logs';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const token = request.cookies.get(LAYER1_COOKIE)?.value;
    const payload = await readLayer1Payload(token);
    if (!payload) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { videoId, title } = await request.json().catch(() => ({}));
    if (typeof videoId !== 'string' || !/^[\w-]{11}$/.test(videoId)) {
      return NextResponse.json({ error: 'invalid_video_id' }, { status: 400 });
    }

    await logPlay({
      youtubeId: videoId,
      title: typeof title === 'string' ? title.slice(0, 100) : null,
      ip: clientIp(request),
      ua: request.headers.get('user-agent') || null,
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405 });
}
