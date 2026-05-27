'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { JWTPayload } from '@/lib/auth'
import Sidebar from './Sidebar'
import Player from '../player/Player'
import SearchView from '../ui/SearchView'
import LibraryView from '../ui/LibraryView'
import AdminView from '../ui/AdminView'

export interface Song {
  _id: string
  title: string
  artist: string
  album?: string
  duration?: number
  coverUrl?: string
  audioUrl: string
  playCount?: number
}

export type View = 'home' | 'search' | 'library' | 'admin'

interface Props {
  user: JWTPayload
}

export default function AppShell({ user }: Props) {
  const [view, setView] = useState<View>('library')
  const [queue, setQueue] = useState<Song[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const currentSong = currentIndex >= 0 ? queue[currentIndex] : null

  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    if (newQueue) {
      setQueue(newQueue)
      const idx = newQueue.findIndex(s => s._id === song._id)
      setCurrentIndex(idx >= 0 ? idx : 0)
    } else {
      setQueue(prev => {
        const exists = prev.findIndex(s => s._id === song._id)
        if (exists >= 0) { setCurrentIndex(exists); return prev }
        const next = [...prev, song]
        setCurrentIndex(next.length - 1)
        return next
      })
    }
  }, [])

  const playNext = useCallback(() => {
    setCurrentIndex(i => (i + 1 < queue.length ? i + 1 : i))
  }, [queue.length])

  const playPrev = useCallback(() => {
    setCurrentIndex(i => (i - 1 >= 0 ? i - 1 : i))
  }, [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <Sidebar view={view} setView={setView} user={user} />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '100px' }}>
          {view === 'library' && (
            <LibraryView onPlay={playSong} currentSong={currentSong} />
          )}
          {view === 'search' && (
            <SearchView onPlay={playSong} currentSong={currentSong} />
          )}
          {view === 'admin' && user.isAdmin && (
            <AdminView user={user} />
          )}
        </div>

        {/* Player bar */}
        <Player
          song={currentSong}
          onNext={playNext}
          onPrev={playPrev}
          hasNext={currentIndex < queue.length - 1}
          hasPrev={currentIndex > 0}
        />
      </main>
    </div>
  )
}
