import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getTokenFromRequest } from '@/lib/auth'
import Song from '@/models/Song'

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req)
  if (!payload) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const sort = searchParams.get('sort') ?? 'downloadedAt'

  await connectDB()

  const sortObj: any = {}
  if (sort === 'plays') sortObj.playCount = -1
  else if (sort === 'title') sortObj.title = 1
  else if (sort === 'artist') sortObj.artist = 1
  else sortObj.downloadedAt = -1

  const total = await Song.countDocuments()
  const songs = await Song.find()
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  return NextResponse.json({ songs, total, page, pages: Math.ceil(total / limit) })
}

export async function DELETE(req: NextRequest) {
  const payload = getTokenFromRequest(req)
  if (!payload?.isAdmin) return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })

  const { id } = await req.json()
  await connectDB()
  await Song.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
