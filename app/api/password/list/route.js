import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPasswordsForDays } from '@/lib/password'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Check user role (leader/admin) once profiles table is set up
    const passwords = getPasswordsForDays(7, 3)
    return NextResponse.json({ passwords })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
