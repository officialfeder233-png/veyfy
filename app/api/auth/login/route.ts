import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { signToken } from '@/lib/auth'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Benutzername und Passwort erforderlich' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ username: username.toLowerCase().trim() })

    if (!user) {
      return NextResponse.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 })
    }

    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin,
    })

    const res = NextResponse.json({
      success: true,
      user: { username: user.username, isAdmin: user.isAdmin },
    })

    res.cookies.set('veyfy_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Server Fehler' }, { status: 500 })
  }
}
