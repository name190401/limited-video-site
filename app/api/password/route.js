import { NextResponse } from 'next/server';
import { getPasswordsForDays } from '@/lib/password';

export async function POST(request) {
  try {
    const body = await request.json();
    const { adminPassword } = body;

    // 管理者パスワードをチェック
    const expectedAdminPassword = process.env.ADMIN_PASSWORD;
    
    if (!expectedAdminPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin password not configured' 
      }, { status: 500 });
    }

    if (adminPassword !== expectedAdminPassword) {
      return NextResponse.json({ success: false, error: 'Invalid admin password' });
    }

    // 今後7日間のパスワードを取得
    const passwords = getPasswordsForDays(7);

    return NextResponse.json({ success: true, passwords });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
