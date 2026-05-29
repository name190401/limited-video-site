import { NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/password'

export async function POST(request) {
  try {
    const { password, groupIndex = 0 } = await request.json()

    if (!password) {
      return NextResponse.json({ success: false, error: 'No password provided' })
    }

    const isValid = verifyPassword(password, groupIndex)
    return NextResponse.json({ success: isValid })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
