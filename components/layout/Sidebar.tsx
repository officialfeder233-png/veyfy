'use client'
import { useRouter } from 'next/navigation'
import { View } from './AppShell'
import { JWTPayload } from '@/lib/auth'

interface Props {
  view: View
  setView: (v: View) => void
  user: JWTPayload
}

const navItems = [
  { id: 'library', label: 'Bibliothek', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M3 12h18M3 18h18"/>
    </svg>
  )},
  { id: 'search', label: 'Suche', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )},
]

export default function Sidebar({ view, setView, user }: Props) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 flex flex-col py-6 px-4 shrink-0" style={{
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
            <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <span className="text-xl font-bold gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
          veyfy
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
            style={{
              background: view === item.id ? 'rgba(108,99,255,0.15)' : 'transparent',
              color: view === item.id ? 'var(--accent2)' : 'var(--muted)',
              borderLeft: view === item.id ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        {user.isAdmin && (
          <button
            onClick={() => setView('admin')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left mt-2"
            style={{
              background: view === 'admin' ? 'rgba(108,99,255,0.15)' : 'transparent',
              color: view === 'admin' ? 'var(--accent2)' : 'var(--muted)',
              borderLeft: view === 'admin' ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Admin
          </button>
        )}
      </nav>

      {/* User */}
      <div className="border-t pt-4 mt-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: 'white' }}>
            {user.username[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.username}</p>
            {user.isAdmin && <p className="text-xs" style={{ color: 'var(--accent)' }}>Admin</p>}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs w-full transition-all"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Ausloggen
        </button>
      </div>
    </aside>
  )
}
