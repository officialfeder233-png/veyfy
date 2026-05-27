import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getTokenFromRequest } from '@/lib/auth'
import Song from '@/models/Song'

const YT_API_KEY = process.env.YOUTUBE_API_KEY!

async function searchYouTube(query: string) {
  // Search specifically for "official audio" versions
  const searchQuery = `${query} official audio`
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoCategoryId=10&maxResults=10&key=${YT_API_KEY}`

  const res = await fetch(url)
  const data = await res.json()

  if (!data.items?.length) return []

  // Score results: prefer "official audio" in title/channel, avoid music videos
  const scored = data.items.map((item: any) => {
    const title: string = item.snippet.title.toLowerCase()
    const channel: string = item.snippet.channelTitle.toLowerCase()
    const desc: string = item.snippet.description?.toLowerCase() ?? ''

    let score = 0
    if (title.includes('official audio')) score += 10
    if (title.includes('official')) score += 4
    if (title.includes('audio')) score += 3
    if (title.includes('lyrics')) score += 2
    if (title.includes('music video') || title.includes('mv') || title.includes('official video')) score -= 8
    if (title.includes('live')) score -= 3
    if (title.includes('cover')) score -= 5
    if (channel.includes('vevo')) score += 3
    if (channel.includes('official')) score += 2
    if (desc.includes('official audio')) score += 2

    return { item, score }
  })

  scored.sort((a: any, b: any) => b.score - a.score)

  return scored.map(({ item }: any) => ({
    youtubeId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url,
    publishedAt: item.snippet.publishedAt,
  }))
}

export async function GET(req: NextRequest) {
  const payload = getTokenFromRequest(req)
  if (!payload) return NextResponse.json({ error: 'Nicht eingeloggt' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q) return NextResponse.json({ error: 'Suchbegriff fehlt' }, { status: 400 })

  await connectDB()

  // 1. Search in own DB first
  const dbResults = await Song.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(10)
    .lean()

  // 2. Search YouTube for suggestions
  let ytResults: any[] = []
  try {
    ytResults = await searchYouTube(q)
  } catch (err) {
    console.error('YouTube search error:', err)
  }

  return NextResponse.json({
    dbResults: dbResults.map((s: any) => ({ ...s, inLibrary: true })),
    ytResults: ytResults.slice(0, 8),
  })
}
