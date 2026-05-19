import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ChefHat } from 'lucide-react'

export default function AuthView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async () => {
    setLoading(true)
    setMessage('')
    const fn = mode === 'signin'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })
    const { error } = await fn
    if (error) {
      setMessage(error.message)
    } else if (mode === 'signup') {
      setMessage('Check your email to confirm your account.')
    }
    setLoading(false)
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>
          <ChefHat size={36} color="#f97316" />
          <h1 style={s.title}>Cooking App</h1>
          <p style={s.sub}>AI-powered recipes & meal planning</p>
        </div>
        <input
          style={s.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={s.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        {message && <p style={s.msg}>{message}</p>}
        <button style={s.btn} onClick={submit} disabled={loading}>
          {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
        <button style={s.toggle} onClick={() => setMode(m => m === 'signin' ? 'signup' : 'signin')}>
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: '#111827', padding: '24px' },
  card: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '360px' },
  logo: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  title: { margin: 0, fontSize: '24px', fontWeight: 700, color: '#f9fafb' },
  sub: { margin: 0, fontSize: '14px', color: '#6b7280' },
  input: { background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '14px 16px', color: '#f9fafb', fontSize: '16px', outline: 'none' },
  btn: { background: '#f97316', border: 'none', borderRadius: '10px', padding: '14px', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
  toggle: { background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', textAlign: 'center' },
  msg: { color: '#f87171', fontSize: '14px', margin: 0, textAlign: 'center' },
}
