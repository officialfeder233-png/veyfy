import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { getTokenFromRequest } from '@/lib/auth'
import User from '@/models/User'

// POST /api/admin/users  – nur für Admins
export async function POST(req: NextRequest) {
  const payload = getTokenFromRequest(req)
  if (!payload?.isAdmin) {
    return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })
  }

  const { username, password, isAdmin } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username und Passwort erforderlich' }, { status: 400 })
  }

  await connectDB()

  const existing = await User.findOne({ username: username.toLowerCase() })
  if (existing) {
    return NextResponse.json({ error: 'Benutzername bereits vergeben' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await User.create({
    username: username.toLowerCase().trim(),
    password: hashed,
    isAdmin: isAdmin ?? false,
  })

  return NextResponse.json({
    success: true,
    user: { id: user._id, username: user.username, isAdmin: user.isAdmin },
  })
}

// GET /api/admin/users  – alle User auflisten
export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req)
  if (!payload?.isAdmin) {
    return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })
  }

  await connectDB()
  const users = await User.find({}, '-password').sort({ createdAt: -1 })
  return NextResponse.json({ users })
}
