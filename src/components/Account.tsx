import { useState } from 'react'
import { Cloud, CloudOff, Crown, Download, LogOut, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
import { cloudEnabled, deleteCloudData, emailLink, isAdmin, resetPassword, setNewPassword, signIn, signOut, signUp, useCloud } from '../lib/cloud'
import { useStore } from '../store'
import { Bento, ICON, Pill, cx, fmtBand } from './ui'

const field = 'h-12 rounded-2xl border border-black/10 bg-white px-4'

export function SyncDot() {
  const status = useCloud((c) => c.status)
  if (status === 'off' || status === 'signed-out') return null
  return <span aria-label={`Cloud sync: ${status}`} className={cx('absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white', status === 'synced' ? 'bg-emerald-500' : status === 'error' ? 'bg-rose-500' : 'bg-gold')} />
}

/** A simple, honest strength hint: length and variety, not arbitrary rules. */
function strength(pw: string) {
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length
  return pw.length >= 12 && variety >= 3 ? 3 : pw.length >= 8 && variety >= 2 ? 2 : pw.length >= 8 ? 1 : 0
}

export function AccountPanel({ onAdmin }: { onAdmin?: () => void }) {
  const { session, status, error, lastSync, recovery, extended } = useCloud()
  const s = useStore()
  const [mode, setMode] = useState<'in' | 'up' | 'link' | 'forgot'>('in')
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  if (!cloudEnabled) return <div className="card flex items-start gap-3 rounded-[20px] p-4 text-sm"><CloudOff className="mt-0.5 shrink-0" size={18} {...ICON} /><div><b>Cloud sync is not configured</b><p className="text-ink/60">Progress is saved in this browser only.</p></div></div>

  if (session && recovery) return (
    <form className="card grid gap-3 rounded-[20px] p-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setMsg((await setNewPassword(pw)) || 'Password updated.'); setBusy(false); setPw('') }}>
      <b>Choose a new password</b>
      <input type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (8+ characters)" aria-label="New password" className={field} />
      {msg && <p role="status" className="rounded-2xl bg-butter p-3 text-sm">{msg}</p>}
      <Pill type="submit" disabled={busy || pw.length < 8}>Save password</Pill>
    </form>
  )

  if (session) return (
    <div className="grid gap-3">
      <div className="rounded-[20px] bg-mint p-4 text-sm">
        <div className="flex items-center gap-3"><Cloud size={18} {...ICON} /><div className="min-w-0 flex-1"><b className="block truncate">{session.user.email}</b><span className="text-ink/60">{status === 'syncing' ? 'Saving…' : status === 'error' ? `Sync problem: ${error}` : lastSync ? `Saved at ${new Date(lastSync).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Connected'}</span></div>
          {status === 'syncing' && <RefreshCw size={16} className="animate-spin" {...ICON} />}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {isAdmin(session) && onAdmin && <button onClick={onAdmin} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white"><ShieldCheck size={15} {...ICON} /> Admin dashboard</button>}
          <button onClick={() => signOut()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold"><LogOut size={15} {...ICON} /> Sign out</button>
        </div>
      </div>
      <details className="card rounded-[20px] p-4 text-sm">
        <summary className="min-h-6 cursor-pointer font-semibold">Privacy & your data</summary>
        <div className="mt-3 grid gap-3">
          <p className="text-ink/60">We store your progress and a log of completed activities (never your essay text in the log, and never audio) so you can sync devices and we can improve the course.</p>
          {extended && <label className="flex min-h-11 cursor-pointer items-center gap-3"><input type="checkbox" checked={s.showOnBoard} onChange={(e) => s.setProfile({ showOnBoard: e.target.checked })} className="h-5 w-5 accent-[#3F7566]" /> Show my first name and XP on the community board</label>}
          <button onClick={() => { const a = document.createElement('a'); const { view: _v, exam: _e, ...data } = useStore.getState() as any; a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = 'ielts-masterstudio-data.json'; a.click(); URL.revokeObjectURL(a.href) }} className="inline-flex min-h-11 items-center gap-2 justify-self-start font-semibold underline"><Download size={15} {...ICON} /> Download my data</button>
          <button onClick={async () => { if (window.confirm('Delete everything stored for you online and sign out? Progress on this device is kept.')) { const e = await deleteCloudData(); if (e) setMsg(e) } }} className="inline-flex min-h-11 items-center gap-2 justify-self-start font-semibold text-rose-700 underline"><Trash2 size={15} {...ICON} /> Delete my online data</button>
          {msg && <p role="status" className="rounded-2xl bg-butter p-3">{msg}</p>}
        </div>
      </details>
    </div>
  )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg('')
    const em = email.trim().toLowerCase()
    if (mode === 'in') setMsg(await signIn(em, pw))
    else if (mode === 'up') { const r = await signUp(em, pw, s.name); setMsg(r.error || (r.confirm ? 'Almost there — open the confirmation link we emailed you, then sign in.' : '')); if (r.confirm) setMode('in') }
    else if (mode === 'link') setMsg((await emailLink(em)) || 'Check your inbox for a sign-in link.')
    else setMsg((await resetPassword(em)) || 'If that address has an account, a reset link is on its way.')
    setBusy(false)
  }
  const st = strength(pw)
  const title = { in: 'Sign in', up: 'Create your account', link: 'Sign in with an email link', forgot: 'Reset your password' }[mode]
  return (
    <form onSubmit={submit} className="card grid gap-3 rounded-[20px] p-4">
      <div><b>{title}</b><p className="text-xs text-ink/55">Keep your progress safe and use it on any device.</p></div>
      <input type="email" required autoComplete="email" inputMode="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" className={field} />
      {(mode === 'in' || mode === 'up') && <input type="password" required minLength={mode === 'up' ? 8 : 6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={mode === 'up' ? 'Password (8+ characters)' : 'Password'} aria-label="Password" className={field} />}
      {mode === 'up' && pw && <div className="flex items-center gap-2 text-xs text-ink/60"><div className="flex flex-1 gap-1">{[1, 2, 3].map((n) => <i key={n} className={cx('h-1.5 flex-1 rounded-full', st >= n ? 'bg-forest' : 'bg-black/10')} />)}</div>{['Too short', 'Okay', 'Good', 'Strong'][st]}</div>}
      {msg && <p role="status" className="rounded-2xl bg-butter p-3 text-sm">{msg}</p>}
      <Pill type="submit" disabled={busy}>{busy ? 'Please wait…' : { in: 'Sign in', up: 'Create account', link: 'Email me a link', forgot: 'Send reset link' }[mode]}</Pill>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {mode !== 'in' && <button type="button" onClick={() => { setMode('in'); setMsg('') }} className="min-h-9 font-semibold underline">Sign in</button>}
        {mode !== 'up' && <button type="button" onClick={() => { setMode('up'); setMsg('') }} className="min-h-9 font-semibold underline">Create account</button>}
        {mode !== 'link' && <button type="button" onClick={() => { setMode('link'); setMsg('') }} className="min-h-9 text-ink/60 underline">Email me a link instead</button>}
        {mode === 'in' && <button type="button" onClick={() => { setMode('forgot'); setMsg('') }} className="min-h-9 text-ink/60 underline">Forgot password?</button>}
      </div>
    </form>
  )
}

export function Leaderboard() {
  const { session, leaders } = useCloud()
  if (!cloudEnabled) return null
  return (
    <Bento>
      <div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-2 font-bold"><Crown size={17} {...ICON} /> Community</span><span className="flex items-center gap-1.5 text-xs font-semibold text-ink/50"><i className="h-2 w-2 rounded-full bg-emerald-500" />live</span></div>
      {!session ? <p className="text-sm text-ink/60">Sign in from your profile (top right) to see other learners.</p>
        : leaders.length === 0 ? <p className="text-sm text-ink/60">No learners yet — you are the first.</p>
        : <ol className="grid gap-1.5">{leaders.map((l, i) => (
          <li key={l.id} className={cx('flex items-center gap-3 rounded-2xl px-3 py-2 text-sm', l.id === session.user.id ? 'bg-mint font-bold' : 'bg-cream')}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate">{l.display_name}{l.id === session.user.id && ' (you)'}</span>
            {l.overall != null && <span className="text-xs text-ink/55">Band {fmtBand(l.overall)}</span>}
            <span className="tabnum font-bold">{l.xp.toLocaleString()} XP</span>
          </li>))}</ol>}
    </Bento>
  )
}
