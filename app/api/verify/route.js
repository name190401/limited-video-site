import { NextResponse } from 'next/server';
import { verifyPassword, getTodayPassword } from '@/lib/password';
import crypto from 'crypto';

// トークン生成
function generateToken(password) {
  const today = new Date().toISOString().split('T')[0];
  const secret = process.env.PASSWORD_SECRET_KEY;
  return crypto.createHash('sha256').update(`${secret}${password}${today}`).digest('hex').substring(0, 32);
}

// トークン検証
function verifyToken(token) {
  const todayPassword = getTodayPassword();
  const expectedToken = generateToken(todayPassword);
  return token === expectedToken;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { password, token } = body;

    // トークンでの認証（動画ページからのリクエスト）
    if (token) {
      const isValid = verifyToken(token);
      return NextResponse.json({ success: isValid });
    }

    // パスワードでの認証（ログインページからのリクエスト）
    if (password) {
      const isValid = verifyPassword(password);
      
      if (isValid) {
        const authToken = generateToken(password);
        return NextResponse.json({ success: true, token: authToken });
      }
      
      return NextResponse.json({ success: false, error: 'Invalid password' });
    }

    return NextResponse.json({ success: false, error: 'No credentials provided' });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
