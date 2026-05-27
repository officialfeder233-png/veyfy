'use client'
import { useEffect, useState } from 'react'
import { Song } from '../layout/AppShell'

interface Props {
  onPlay: (song: Song, queue: Song[]) => void
  currentSong: Song | null
}

function formatDuration(sec?: number) {
  if (!sec) return '--:--'
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`
}

export default function LibraryView({ onPlay, currentSong }: Props) {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('downloadedAt')

  async function loadSongs() {
    setLoading(true)
    const res = await fetch(`/api/songs?sort=${sort}&limit=200`)
    const data = await res.json()
    setSongs(data.songs ?? [])
    setLoading(false)
  }

  useEffect(() => { loadSongs() }, [sort])

  return (
    <div className="p-8 fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Bibliothek
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {songs.length} Songs
          </p>
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <option value="downloadedAt">Zuletzt hinzugefügt</option>
          <option value="title">Titel A–Z</option>
          <option value="artist">Künstler A–Z</option>
          <option value="plays">Meistgespielt</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl shimmer" />
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Noch keine Songs. Suche nach Musik!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-[2rem_1fr_1fr_4rem] gap-4 px-4 pb-2 text-xs font-medium"
            style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
            <span>#</span>
            <span>TITEL</span>
            <span>KÜNSTLER</span>
            <span className="text-right">LÄNGE</span>
          </div>

          {songs.map((song, i) => {
            const isActive = currentSong?._id === song._id
            return (
              <div
                key={song._id}
                onDoubleClick={() => onPlay(song, songs)}
                onClick={() => onPlay(song, songs)}
                className="song-card grid grid-cols-[2rem_1fr_1fr_4rem] gap-4 px-4 py-3 rounded-xl cursor-pointer"
                style={{
                  background: isActive ? 'rgba(108,99,255,0.1)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(108,99,255,0.2)' : 'transparent'}`,
                }}
              >
                <span className="text-sm flex items-center" style={{ color: isActive ? 'var(--accent)' : 'var(--muted)' }}>
                  {isActive ? (
                    <span className="flex gap-0.5 items-end h-4">
                      <span className="wave-bar" style={{ height: '10px' }} />
                      <span className="wave-bar" style={{ height: '14px' }} />
                      <span className="wave-bar" style={{ height: '10px' }} />
                    </span>
                  ) : i + 1}
                </span>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                    style={{ background: 'var(--border)' }}>
                    {song.coverUrl ? (
                      <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', opacity: 0.6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium truncate" style={{ color: isActive ? 'var(--accent2)' : 'var(--text)' }}>
                    {song.title}
                  </span>
                </div>

                <span className="text-sm truncate flex items-center" style={{ color: 'var(--muted)' }}>
                  {song.artist}
                </span>

                <span className="text-sm text-right flex items-center justify-end tabular-nums" style={{ color: 'var(--muted)' }}>
                  {formatDuration(song.duration)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
