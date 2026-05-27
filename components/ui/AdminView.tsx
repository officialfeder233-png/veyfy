'use client'
import { useEffect, useState } from 'react'
import { JWTPayload } from '@/lib/auth'

interface Props { user: JWTPayload }
interface User { _id: string; username: string; isAdmin: boolean; createdAt: string }

export default function AdminView({ user }: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [newUser, setNewUser] = useState({ username: '', password: '', isAdmin: false })
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function loadUsers() {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users ?? [])
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setMsg(null)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setMsg({ type: 'error', text: data.error }); return }
    setMsg({ type: 'success', text: `Account "${data.user.username}" erstellt!` })
    setNewUser({ username: '', password: '', isAdmin: false })
    loadUsers()
  }

  async function deleteUser(id: string, username: string) {
    if (!confirm(`User "${username}" wirklich löschen?`)) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    loadUsers()
  }

  return (
    <div className="p-8 fade-up max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Admin</h1>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Benutzerverwaltung</p>
        </div>
      </div>

      {/* Create user form */}
      <div className="glass rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--accent2)' }}>
          NEUEN ACCOUNT ERSTELLEN
        </h2>
        <form onSubmit={createUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>BENUTZERNAME</label>
              <input
                value={newUser.username}
                onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))}
                placeholder="username"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>PASSWORT</label>
              <input
                type="password"
                value={newUser.password}
                onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setNewUser(p => ({ ...p, isAdmin: !p.isAdmin }))}
              className="w-10 h-5 rounded-full relative transition-all"
              style={{ background: newUser.isAdmin ? 'var(--accent)' : 'var(--border)', boxShadow: newUser.isAdmin ? '0 0 10px var(--accent-glow)' : 'none' }}>
              <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                style={{ left: newUser.isAdmin ? '22px' : '2px' }} />
            </div>
            <span className="text-sm">Admin-Rechte</span>
          </label>

          {msg && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                color: msg.type === 'success' ? '#4ade80' : '#f87171',
              }}>
              {msg.text}
            </div>
          )}

          <button type="submit" disabled={creating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: creating ? 'var(--border)' : 'linear-gradient(135deg, var(--accent), var(--accent2))',
              color: 'white',
              cursor: creating ? 'not-allowed' : 'pointer',
            }}>
            {creating ? (
              <><svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Erstelle...</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Account erstellen</>
            )}
          </button>
        </form>
      </div>

      {/* Users list */}
      <h2 className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>
        ALLE ACCOUNTS ({users.length})
      </h2>
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)
        ) : (
          users.map(u => (
            <div key={u._id} className="flex items-center gap-4 px-4 py-3 rounded-xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: u.isAdmin ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--border)', color: 'white' }}>
                {u.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{u.username}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {u.isAdmin ? '👑 Admin · ' : ''}
                  Erstellt {new Date(u.createdAt).toLocaleDateString('de-DE')}
                </p>
              </div>
              {u.username !== user.username && (
                <button onClick={() => deleteUser(u._id, u.username)}
                  className="p-2 rounded-lg transition-all"
                  style={{ color: 'var(--muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
