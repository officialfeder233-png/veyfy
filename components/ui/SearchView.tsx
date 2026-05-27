'use client'
import { useState, useRef } from 'react'
import { Song } from '../layout/AppShell'

interface Props {
  onPlay: (song: Song) => void
  currentSong: Song | null
}

interface YtResult {
  youtubeId: string
  title: string
  channel: string
  thumbnail: string
}

export default function SearchView({ onPlay, currentSong }: Props) {
  const [query, setQuery] = useState('')
  const [dbResults, setDbResults] = useState<Song[]>([])
  const [ytResults, setYtResults] = useState<YtResult[]>([])
  const [searching, setSearching] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function doSearch(q: string) {
    if (!q.trim()) { setDbResults([]); setYtResults([]); setSearched(false); return }
    setSearching(true)
    setSearched(true)
    const res = await fetch(`/api/songs/search?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setDbResults(data.dbResults ?? [])
    setYtResults(data.ytResults ?? [])
    setSearching(false)
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(v), 500)
  }

  async function handleDownload(yt: YtResult) {
    setDownloading(yt.youtubeId)
    setDownloadError(null)
    try {
      const res = await fetch('/api/songs/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeId: yt.youtubeId,
          title: yt.title,
          artist: yt.channel,
          coverUrl: yt.thumbnail,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Refresh DB results
      const searchRes = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}`)
      const searchData = await searchRes.json()
      setDbResults(searchData.dbResults ?? [])
      setYtResults(prev => prev.filter(r => r.youtubeId !== yt.youtubeId))
      // Auto-play
      if (data.song) onPlay(data.song)
    } catch (err: any) {
      setDownloadError(err.message || 'Download fehlgeschlagen')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="p-8 fade-up max-w-3xl">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
        Suche
      </h1>

      {/* Search bar */}
      <div className="relative mb-8">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={onInput}
          placeholder="Nach Songs suchen, z.B. AK Ausserkontrolle..."
          className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm outline-none transition-all"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: '15px',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        {searching && (
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}>
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        )}
      </div>

      {downloadError && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {downloadError}
        </div>
      )}

      {/* DB Results */}
      {dbResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
            </svg>
            BEREITS IN DER BIBLIOTHEK
          </h2>
          <div className="space-y-1">
            {dbResults.map(song => (
              <div
                key={song._id}
                onClick={() => onPlay(song)}
                className="song-card flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer"
                style={{
                  background: currentSong?._id === song._id ? 'rgba(108,99,255,0.1)' : 'var(--card)',
                  border: `1px solid ${currentSong?._id === song._id ? 'rgba(108,99,255,0.2)' : 'var(--border)'}`,
                }}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--border)' }}>
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', opacity: 0.7 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: currentSong?._id === song._id ? 'var(--accent2)' : 'var(--text)' }}>
                    {song.title}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{song.artist}</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--accent2)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Abspielen
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YouTube Results */}
      {ytResults.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--muted)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#ff4444' }}>
              <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-.3C16.8 4 12 4 12 4s-4.8 0-6.8.1c-.6-.9-1.9-.9-3 .3C1.3 5 1 7 1 7S.7 9.1.7 11.2v2c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 21.6 12 21.6 12 21.6s4.8 0 6.8-.2c.6.9 1.9.9 3-.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.2v-2C23.3 9.1 23 7 23 7zM9.7 15.5V8.4l6.6 3.6-6.6 3.5z"/>
            </svg>
            VON YOUTUBE HERUNTERLADEN
          </h2>
          <div className="space-y-2">
            {ytResults.map(yt => {
              const isDownloading = downloading === yt.youtubeId
              return (
                <div key={yt.youtubeId}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <img src={yt.thumbnail} alt="" className="w-14 h-10 object-cover rounded-lg shrink-0"
                    style={{ background: 'var(--border)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{yt.title}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{yt.channel}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(yt)}
                    disabled={isDownloading || !!downloading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
                    style={{
                      background: isDownloading ? 'var(--border)' : 'linear-gradient(135deg, var(--accent), var(--accent2))',
                      color: 'white',
                      opacity: (!isDownloading && !!downloading) ? 0.4 : 1,
                      cursor: isDownloading || !!downloading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                        Wird geladen...
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Hinzufügen
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {searched && !searching && dbResults.length === 0 && ytResults.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-3">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--border)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Keine Ergebnisse für „{query}"</p>
        </div>
      )}
    </div>
  )
}
