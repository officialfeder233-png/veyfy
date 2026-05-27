import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getTokenFromRequest } from '@/lib/auth'
import Song from '@/models/Song'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = getTokenFromRequest(req)
  if (!payload) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  await connectDB()
  await Song.findByIdAndUpdate(params.id, { $inc: { playCount: 1 } })
  return NextResponse.json({ success: true })
}
