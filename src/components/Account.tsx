import { useState } from 'react'
import { Cloud, CloudOff, Crown, LogOut, RefreshCw } from 'lucide-react'
import { cloudEnabled, signIn, signOut, signUp, useCloud } from '../lib/cloud'
import { useStore } from '../store'
import { Bento, ICON, Pill, Segmented, cx, fmtBand } from './ui'

export function SyncDot() {
  const status = useCloud((c) => c.status)
  if (status === 'off' || status === 'signed-out') return null
  return <span aria-label={`Cloud sync: ${status}`} className={cx('absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white', status === 'synced' ? 'bg-emerald-500' : status === 'error' ? 'bg-rose-500' : 'bg-gold')} />
}

export function AccountPanel() {
  const { session, status, error, lastSync } = useCloud()
  const name = useStore((s) => s.name)
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  if (!cloudEnabled) return <div className="flex items-start gap-3 rounded-[20px] bg-white p-4 text-sm"><CloudOff className="mt-0.5 shrink-0" size={18} {...ICON} /><div><b>Cloud sync is not configured</b><p className="text-ink/70">Progress is saved in this browser only.</p></div></div>
  if (session) return (
    <div className="rounded-[20px] bg-mint p-4 text-sm">
      <div className="flex items-center gap-3"><Cloud size={18} {...ICON} /><div className="min-w-0 flex-1"><b className="block truncate">{session.user.email}</b><span className="text-ink/70">{status === 'syncing' ? 'Saving…' : status === 'error' ? `Sync problem: ${error}` : lastSync ? `Saved to your account at ${new Date(lastSync).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Connected'}</span></div>
        {status === 'syncing' && <RefreshCw size={16} className="animate-spin" {...ICON} />}</div>
      <button onClick={() => signOut()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold"><LogOut size={15} {...ICON} /> Sign out</button>
    </div>
  )
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg('')
    if (mode === 'in') setMsg(await signIn(email.trim(), pw))
    else { const r = await signUp(email.trim(), pw, name); setMsg(r.error || (r.confirm ? 'Account created. Open the confirmation link we emailed you, then sign in here.' : '')); if (r.confirm) setMode('in') }
    setBusy(false)
  }
  return (
    <form onSubmit={submit} className="grid gap-3 rounded-[20px] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><b>Save your progress online</b><p className="text-xs text-ink/60">Sign in to sync across devices and join the live leaderboard.</p></div>
        <Segmented value={mode} onChange={setMode} options={[{ value: 'in', label: 'Sign in' }, { value: 'up', label: 'Create account' }]} /></div>
      <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" className="h-12 rounded-2xl border border-black/10 px-4" />
      <input type="password" required minLength={6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password (6+ characters)" aria-label="Password" className="h-12 rounded-2xl border border-black/10 px-4" />
      {msg && <p role="status" className="rounded-2xl bg-butter p-3 text-sm">{msg}</p>}
      <Pill type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'}</Pill>
      {mode === 'up' && <p className="text-xs text-ink/60">A new account starts from zero — the sample progress is not uploaded.</p>}
    </form>
  )
}

export function Leaderboard() {
  const { session, leaders } = useCloud()
  if (!cloudEnabled) return null
  return (
    <Bento className="bg-white">
      <div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-2 font-bold"><Crown size={17} {...ICON} /> Community</span><span className="flex items-center gap-1.5 text-xs font-semibold text-ink/60"><i className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />live</span></div>
      {!session ? <p className="text-sm text-ink/70">Sign in from your profile (top right) to see how your XP compares with other learners.</p>
        : leaders.length === 0 ? <p className="text-sm text-ink/70">No learners yet — you are the first.</p>
        : <ol className="grid gap-1.5">{leaders.map((l, i) => (
          <li key={l.id} className={cx('flex items-center gap-3 rounded-2xl px-3 py-2 text-sm', l.id === session.user.id ? 'bg-lav font-bold' : 'bg-cream')}>
            <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold', i === 0 ? 'bg-gold' : 'bg-white')}>{i + 1}</span>
            <span className="min-w-0 flex-1 truncate">{l.display_name}{l.id === session.user.id && ' (you)'}</span>
            {l.overall != null && <span className="text-xs text-ink/60">Band {fmtBand(l.overall)}</span>}
            <span className="tabnum font-bold">{l.xp.toLocaleString()} XP</span>
          </li>))}</ol>}
    </Bento>
  )
}
