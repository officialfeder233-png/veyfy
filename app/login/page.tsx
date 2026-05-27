'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()
      console.log('Response status:', res.status)
      console.log('Response data:', JSON.stringify(data))

      if (!res.ok) {
        setError(data.error || 'Fehler beim Login')
        setLoading(false)
        return
      }

      if (data.token) {
        localStorage.setItem('veyfy_token', data.token)
        console.log('Token gespeichert, leite weiter...')
        window.location.href = '/'
      } else {
        console.log('Kein Token in Response!')
        setError('Kein Token erhalten')
        setLoading(false)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Verbindungsfehler')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #6c63ff 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
      </div>

      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="text-center mb-12 fade-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-accent"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
                <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
              veyfy
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Deine private Musikwelt</p>
        </div>

        <div className="glass rounded-2xl p-8 fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Willkommen zurück
          </h2>

          <form onSubmit={handleLogin} className="space-y-4" action="#">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>BENUTZERNAME</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="dein_name"
                autoComplete="username"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>PASSWORT</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => handleLogin({ preventDefault: () => {} } as any)}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all mt-2"
              style={{
                background: loading ? 'var(--border)' : 'linear-gradient(135deg, var(--accent), var(--accent2))',
                color: 'white',
                boxShadow: loading ? 'none' : '0 4px 20px var(--accent-glow)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Einloggen...
                </span>
              ) : 'Einloggen'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--muted)' }}>
          Kein Account? Frag den Admin.
        </p>
      </div>
    </div>
  )
}
