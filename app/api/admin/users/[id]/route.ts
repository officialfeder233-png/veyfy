import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getTokenFromRequest } from '@/lib/auth'
import User from '@/models/User'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = getTokenFromRequest(req)
  if (!payload?.isAdmin) {
    return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })
  }

  await connectDB()
  await User.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
