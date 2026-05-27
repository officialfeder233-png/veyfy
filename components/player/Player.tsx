'use client'
import { useEffect, useRef, useState } from 'react'
import { Song } from '../layout/AppShell'
import Image from 'next/image'

interface Props {
  song: Song | null
  onNext: () => void
  onPrev: () => void
  hasNext: boolean
  hasPrev: boolean
}

function formatTime(sec: number) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Player({ song, onNext, onPrev, hasNext, hasPrev }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [loading, setLoading] = useState(false)
  const countedRef = useRef<string | null>(null)

  // Load new song
  useEffect(() => {
    if (!song || !audioRef.current) return
    audioRef.current.src = song.audioUrl
    audioRef.current.volume = volume
    audioRef.current.load()
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    setCurrentTime(0)
    setDuration(0)
    setLoading(true)
  }, [song?._id])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = muted ? 0 : volume
  }, [volume, muted])

  async function countPlay() {
    if (!song || countedRef.current === song._id) return
    countedRef.current = song._id
    await fetch(`/api/songs/${song._id}/play`, { method: 'POST' })
  }

  function togglePlay() {
    if (!audioRef.current || !song) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().then(() => setPlaying(true))
    }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    if (!audioRef.current) return
    const t = parseFloat(e.target.value)
    audioRef.current.currentTime = t
    setCurrentTime(t)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!song) {
    return (
      <div className="h-20 flex items-center justify-center glass-strong"
        style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Kein Song ausgewählt</p>
      </div>
    )
  }

  return (
    <div className="glass-strong shrink-0" style={{ borderTop: '1px solid var(--border)', height: '88px' }}>
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onDurationChange={() => { setDuration(audioRef.current?.duration ?? 0); setLoading(false) }}
        onEnded={onNext}
        onCanPlay={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => { setPlaying(true); setLoading(false); countPlay() }}
        onPause={() => setPlaying(false)}
      />

      <div className="h-full flex items-center px-6 gap-6">
        {/* Song info */}
        <div className="flex items-center gap-3 w-56 shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative"
            style={{ background: 'var(--border)' }}>
            {song.coverUrl ? (
              <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
            )}
            {playing && (
              <div className="absolute inset-0 flex items-center justify-center gap-0.5"
                style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div className="wave-bar h-3" />
                <div className="wave-bar h-4" />
                <div className="wave-bar h-3" />
                <div className="wave-bar h-2" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{song.title}</p>
            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{song.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1.5 max-w-lg mx-auto">
          <div className="flex items-center gap-5">
            <button onClick={onPrev} disabled={!hasPrev}
              className="transition-all"
              style={{ color: hasPrev ? 'var(--text)' : 'var(--border)', opacity: hasPrev ? 1 : 0.3 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 20L9 12l10-8v16zM5 4h2v16H5z"/>
              </svg>
            </button>

            <button onClick={togglePlay}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', boxShadow: '0 0 16px var(--accent-glow)' }}>
              {loading ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
              ) : playing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginLeft: '2px' }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button onClick={onNext} disabled={!hasNext}
              className="transition-all"
              style={{ color: hasNext ? 'var(--text)' : 'var(--border)', opacity: hasNext ? 1 : 0.3 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 4l10 8-10 8V4zm14 0h2v16h-2z"/>
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full flex items-center gap-2">
            <span className="text-xs tabular-nums w-8 text-right" style={{ color: 'var(--muted)' }}>
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={currentTime}
                onChange={seek}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, var(--accent) ${progress}%, var(--border) ${progress}%)`,
                  height: '3px',
                  borderRadius: '99px',
                  outline: 'none',
                  border: 'none',
                  padding: 0,
                }}
              />
            </div>
            <span className="text-xs tabular-nums w-8" style={{ color: 'var(--muted)' }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-36 justify-end shrink-0">
          <button onClick={() => setMuted(m => !m)} style={{ color: 'var(--muted)' }}>
            {muted || volume === 0 ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false) }}
            className="w-20"
            style={{
              background: `linear-gradient(to right, var(--accent) ${(muted ? 0 : volume) * 100}%, var(--border) ${(muted ? 0 : volume) * 100}%)`,
              height: '3px',
              borderRadius: '99px',
              outline: 'none',
              border: 'none',
              padding: 0,
            }}
          />
        </div>
      </div>
    </div>
  )
}
