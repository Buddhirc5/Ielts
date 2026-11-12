import { useEffect, useMemo, useState } from 'react'
import { Download, Megaphone, RefreshCw, Search, ShieldCheck, Trash2 } from 'lucide-react'
import { TYPE_LABEL, type QType } from '../types'
import { isAdmin, loadAdmin, postAnnouncement, setAnnouncement, useCloud, type AdminEvent, type AdminRow } from '../lib/cloud'
import { Bento, ICON, Meter, Pill, SectionTitle, cx, fmtBand } from '../components/ui'

const DAY = 86400000
const dkey = (d: string | number | Date) => new Date(d).toISOString().slice(0, 10)
const ago = (iso: string) => { const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago` }
const EVENT_LABEL: Record<string, string> = { session_start: 'Opened the app', test_complete: 'Finished a test', answers: 'Answered questions', lesson_complete: 'Completed a lesson', quiz_complete: 'Played a quiz', writing_submit: 'Submitted writing', speaking_complete: 'Finished speaking' }

function Bars({ data, label }: { data: { k: string; v: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.v))
  return (
    <div role="img" aria-label={label}>
      <div className="flex h-28 items-end gap-1">{data.map((d) => <div key={d.k} className="flex flex-1 flex-col items-center justify-end" title={`${d.k}: ${d.v}`}><div className="w-full rounded-t-md bg-forest/70" style={{ height: `${(d.v / max) * 100}%`, minHeight: d.v ? 3 : 0 }} /></div>)}</div>
      <div className="mt-1 flex justify-between text-[10px] text-ink/45"><span>{data[0]?.k.slice(5)}</span><span>peak {max}</span><span>{data[data.length - 1]?.k.slice(5)}</span></div>
    </div>
  )
}
const Kpi = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => <Bento className="!p-4"><div className="text-sm text-ink/55">{label}</div><div className="mt-1 text-3xl font-bold tracking-tight tabnum">{value}</div>{sub && <div className="mt-0.5 text-xs text-ink/50">{sub}</div>}</Bento>

export default function Admin() {
  const { session, announcements } = useCloud()
  const [rows, setRows] = useState<AdminRow[]>([]), [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [q, setQ] = useState(''), [note, setNote] = useState(''), [sort, setSort] = useState<'last_seen' | 'minutes' | 'xp'>('last_seen')
  const refresh = async () => { setLoading(true); const r = await loadAdmin(); setRows(r.rows); setEvents(r.events); setError(r.error); setLoading(false) }
  useEffect(() => { if (isAdmin(session)) refresh() }, [session?.user.id]) // eslint-disable-line

  const m = useMemo(() => {
    const now = Date.now()
    const active = (d: number) => rows.filter((r) => now - new Date(r.last_seen).getTime() < d * DAY).length
    const days = [...Array(14)].map((_, i) => dkey(now - (13 - i) * DAY))
    const signups = days.map((k) => ({ k, v: rows.filter((r) => dkey(r.first_seen) === k).length }))
    const activity = days.map((k) => ({ k, v: new Set(events.filter((e) => dkey(e.created_at) === k).map((e) => e.user_id)).size }))
    const byType: Record<string, number> = {}
    events.forEach((e) => { byType[e.type] = (byType[e.type] || 0) + 1 })
    const acc: Record<string, { correct: number; total: number }> = {}
    events.filter((e) => e.type === 'answers').forEach((e) => Object.entries(e.meta || {}).forEach(([k, v]: [string, any]) => { if (v && typeof v.total === 'number') { const o = (acc[k] ||= { correct: 0, total: 0 }); o.correct += v.correct || 0; o.total += v.total } }))
    const tests = events.filter((e) => e.type === 'test_complete')
    const overall = tests.map((e) => e.meta?.overall).filter((x) => typeof x === 'number') as number[]
    const banded = rows.filter((r) => r.overall != null)
    const returning = rows.filter((r) => new Date(r.last_seen).getTime() - new Date(r.first_seen).getTime() > DAY).length
    const platforms: Record<string, number> = {}
    rows.forEach((r) => { const p = r.platform || 'Unknown'; platforms[p] = (platforms[p] || 0) + 1 })
    return { today: active(1), week: active(7), month: active(30), signups, activity, byType, acc, tests: tests.length, hours: rows.reduce((a, r) => a + r.minutes, 0) / 60,
      avgBand: banded.length ? banded.reduce((a, r) => a + (r.overall || 0), 0) / banded.length : null, mockAvg: overall.length ? overall.reduce((a, b) => a + b, 0) / overall.length : null, returning, platforms,
      atTarget: banded.filter((r) => (r.overall || 0) >= (r.target || 9)).length, banded: banded.length }
  }, [rows, events])

  if (!isAdmin(session)) return <Bento className="mx-auto max-w-xl text-center"><ShieldCheck className="mx-auto" {...ICON} /><h1 className="mt-3 text-xl font-bold">Admin only</h1><p className="mt-1 text-sm text-ink/60">Sign in with the administrator account to see this page.</p></Bento>

  const list = rows.filter((r) => !q || `${r.email} ${r.display_name || ''}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => sort === 'last_seen' ? +new Date(b.last_seen) - +new Date(a.last_seen) : sort === 'minutes' ? b.minutes - a.minutes : (b.xp || 0) - (a.xp || 0))
  const name = (id: string) => rows.find((r) => r.user_id === id)?.display_name || rows.find((r) => r.user_id === id)?.email?.split('@')[0] || 'Learner'
  const csv = () => {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"` // neutralise spreadsheet formulas
    const lines = [['Name', 'Email', 'First seen', 'Last seen', 'Minutes', 'Tests', 'Lessons', 'XP', 'Band', 'Target', 'Platform'].join(',')].concat(rows.map((r) => [r.display_name, r.email, r.first_seen, r.last_seen, r.minutes, r.tests, r.lessons, r.xp, r.overall, r.target, r.platform].map(esc).join(',')))
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' })); a.download = `ielts-learners-${dkey(Date.now())}.csv`; a.click(); URL.revokeObjectURL(a.href)
  }
  const types = Object.entries(m.acc).filter(([, v]) => v.total).map(([k, v]) => ({ k, acc: v.correct / v.total, total: v.total })).sort((a, b) => a.acc - b.acc)

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-bold tracking-tight">Admin</h1><p className="mt-1 text-sm text-ink/60">Learner activity for the last 30 days. Only you can see this.</p></div>
        <div className="flex gap-2"><Pill variant="light" onClick={refresh} disabled={loading}><RefreshCw size={15} className={loading ? 'animate-spin' : ''} {...ICON} /> Refresh</Pill><Pill variant="light" onClick={csv} disabled={!rows.length}><Download size={15} {...ICON} /> CSV</Pill></div>
      </header>
      {error && <p role="alert" className="rounded-2xl bg-butter p-4 text-sm"><b>Could not load everything:</b> {error}. If this mentions a missing table, the tracking database update has not been applied yet.</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Learners" value={rows.length} sub={`${m.returning} came back another day`} />
        <Kpi label="Active today" value={m.today} sub={`${m.week} this week · ${m.month} this month`} />
        <Kpi label="Study time" value={`${m.hours.toFixed(1)} h`} sub={rows.length ? `${Math.round((m.hours * 60) / rows.length)} min per learner` : undefined} />
        <Kpi label="Tests finished" value={m.tests} sub={m.mockAvg != null ? `average overall ${m.mockAvg.toFixed(1)}` : 'in the last 30 days'} />
        <Kpi label="Average band" value={m.avgBand != null ? m.avgBand.toFixed(1) : '—'} sub={`${m.banded} learners with a full mock`} />
        <Kpi label="At target" value={m.banded ? `${Math.round((m.atTarget / m.banded) * 100)}%` : '—'} sub={`${m.atTarget} of ${m.banded}`} />
        <Kpi label="Events logged" value={events.length} sub="last 30 days" />
        <Kpi label="Devices" value={Object.keys(m.platforms).length ? Object.entries(m.platforms).sort((a, b) => b[1] - a[1])[0][0] : '—'} sub={Object.entries(m.platforms).map(([k, v]) => `${k} ${v}`).join(' · ') || undefined} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Bento><SectionTitle>New learners · 14 days</SectionTitle><Bars data={m.signups} label="New learners per day" /></Bento>
        <Bento><SectionTitle>Active learners · 14 days</SectionTitle><Bars data={m.activity} label="Active learners per day" /></Bento>
        <Bento>
          <SectionTitle>What learners do</SectionTitle>
          {Object.keys(m.byType).length === 0 ? <p className="text-sm text-ink/60">No activity recorded yet.</p> : <div className="grid gap-3">{Object.entries(m.byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => <Meter key={k} label={EVENT_LABEL[k] || k} value={v} max={Math.max(...Object.values(m.byType))} right={String(v)} />)}</div>}
        </Bento>
        <Bento>
          <SectionTitle>Hardest question types</SectionTitle>
          {types.length === 0 ? <p className="text-sm text-ink/60">Shown once learners answer Listening or Reading questions.</p> : <div className="grid gap-3">{types.map((t) => <Meter key={t.k} label={`${TYPE_LABEL[t.k as QType] || t.k} · ${t.total} answers`} value={t.acc * 100} max={100} right={`${Math.round(t.acc * 100)}%`} />)}</div>}
        </Bento>
      </div>

      <Bento>
        <SectionTitle right={<div className="flex flex-wrap gap-2"><label className="card flex h-11 items-center gap-2 rounded-full px-4"><Search size={15} className="text-ink/40" {...ICON} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" aria-label="Search learners" className="w-40 bg-transparent text-sm outline-none" /></label>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort learners" className="card h-11 rounded-full px-3 text-sm"><option value="last_seen">Recently active</option><option value="minutes">Most study time</option><option value="xp">Most XP</option></select></div>}>Learners</SectionTitle>
        {list.length === 0 ? <p className="text-sm text-ink/60">{loading ? 'Loading…' : 'No learners match.'}</p> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="text-left text-xs text-ink/50">{['Learner', 'Last active', 'Study time', 'Tests', 'Lessons', 'XP', 'Band → target', 'Device'].map((h) => <th key={h} className="px-2 py-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{list.slice(0, 200).map((r) => (
              <tr key={r.user_id} className="border-t border-black/5">
                <td className="px-2 py-2.5"><b className="block">{r.display_name || '—'}</b><span className="text-xs text-ink/55">{r.email}</span></td>
                <td className="px-2 tabnum text-ink/70">{ago(r.last_seen)}</td><td className="px-2 tabnum">{r.minutes >= 60 ? `${(r.minutes / 60).toFixed(1)} h` : `${Math.round(r.minutes)} min`}</td>
                <td className="px-2 tabnum">{r.tests}</td><td className="px-2 tabnum">{r.lessons}</td><td className="px-2 tabnum">{(r.xp ?? 0).toLocaleString()}</td>
                <td className="px-2 tabnum">{r.overall != null ? fmtBand(r.overall) : '—'} → {r.target != null ? fmtBand(Number(r.target)) : '—'}</td><td className="px-2 text-ink/60">{r.platform || '—'}</td>
              </tr>))}</tbody></table></div>
        )}
      </Bento>

      <div className="grid gap-5 lg:grid-cols-2">
        <Bento>
          <SectionTitle>Announcements</SectionTitle>
          <form className="grid gap-2" onSubmit={async (e) => { e.preventDefault(); if (!note.trim()) return; const err = await postAnnouncement(note); if (err) setError(err); else setNote('') }}>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} rows={2} placeholder="A short message shown on every learner's Today screen" aria-label="Announcement" className="rounded-2xl border border-black/10 bg-white p-3 text-sm" />
            <div className="flex items-center justify-between"><span className="text-xs text-ink/45">{note.length}/280</span><Pill type="submit" disabled={!note.trim()}><Megaphone size={15} {...ICON} /> Publish</Pill></div>
          </form>
          <ul className="mt-3 grid gap-2">{announcements.map((a) => (
            <li key={a.id} className={cx('flex items-start gap-2 rounded-2xl p-3 text-sm', a.active ? 'bg-mint' : 'bg-cream text-ink/50')}><span className="flex-1">{a.body}<span className="block text-xs text-ink/45">{ago(a.created_at)} · {a.active ? 'visible' : 'hidden'}</span></span>
              <button onClick={() => setAnnouncement(a.id, !a.active)} className="min-h-9 px-2 text-xs font-semibold underline">{a.active ? 'Hide' : 'Show'}</button><button aria-label="Delete announcement" onClick={() => setAnnouncement(a.id, null)} className="grid h-9 w-9 place-items-center"><Trash2 size={15} {...ICON} /></button></li>))}</ul>
        </Bento>
        <Bento>
          <SectionTitle>Latest activity</SectionTitle>
          {events.length === 0 ? <p className="text-sm text-ink/60">Nothing yet.</p> : <ul className="grid gap-1 text-sm">{events.slice(0, 25).map((e) => (
            <li key={e.id} className="flex items-baseline gap-2 border-t border-black/5 py-1.5 first:border-0"><b className="shrink-0">{name(e.user_id)}</b><span className="min-w-0 flex-1 truncate text-ink/70">{EVENT_LABEL[e.type] || e.type}{e.meta?.title ? ` · ${e.meta.title}` : e.meta?.id ? ` · ${e.meta.id}` : ''}{typeof e.meta?.overall === 'number' ? ` · Band ${e.meta.overall}` : ''}</span><span className="shrink-0 text-xs text-ink/45">{ago(e.created_at)}</span></li>))}</ul>}
        </Bento>
      </div>
    </div>
  )
}
