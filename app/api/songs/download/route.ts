import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getTokenFromRequest } from '@/lib/auth'
import Song from '@/models/Song'

const WORKER_URL = process.env.WORKER_URL!
const WORKER_SECRET = process.env.WORKER_SECRET!

export async function POST(req: NextRequest) {
  const payload = getTokenFromRequest(req)
  if (!payload) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const { youtubeId, title, artist, coverUrl } = await req.json()

  if (!youtubeId) {
    return NextResponse.json({ error: 'youtubeId fehlt' }, { status: 400 })
  }

  await connectDB()

  // Check if already in DB
  const existing = await Song.findOne({ youtubeId })
  if (existing) {
    return NextResponse.json({ success: true, song: existing, cached: true })
  }

  // Send to download worker
  try {
    const workerRes = await fetch(`${WORKER_URL}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Worker-Secret': WORKER_SECRET,
      },
      body: JSON.stringify({ youtubeId, title, artist, coverUrl }),
    })

    if (!workerRes.ok) {
      const err = await workerRes.json()
      return NextResponse.json({ error: err.error || 'Worker Fehler' }, { status: 500 })
    }

    const { audioUrl, duration, detectedTitle, detectedArtist } = await workerRes.json()

    // Save to MongoDB
    const song = await Song.create({
      title: detectedTitle || title || 'Unbekannter Titel',
      artist: detectedArtist || artist || 'Unbekannter Künstler',
      coverUrl: coverUrl || null,
      audioUrl,
      youtubeId,
      duration,
    })

    return NextResponse.json({ success: true, song, cached: false })
  } catch (err) {
    console.error('Download error:', err)
    return NextResponse.json({ error: 'Download fehlgeschlagen' }, { status: 500 })
  }
}
