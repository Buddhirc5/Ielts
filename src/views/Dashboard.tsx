import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowRight, BookOpen, ChevronDown, Headphones, Layers, Mic, PenLine, Wind, type LucideIcon } from 'lucide-react'
import type { Skill } from '../types'
import { dayKey, hasBand, skillBands, useStore } from '../store'
import { recommend } from '../lib/engines'
import { DRILL_TYPES, EXAMS } from '../lib/exams'
import { Bento, Breathe, ICON, Pill, Ring, cx, fmtBand } from '../components/ui'

export const SKILL_ICON: Record<Skill, LucideIcon> = { listening: Headphones, reading: BookOpen, writing: PenLine, speaking: Mic }
const DAY = 86400000
const DAILY_GOAL = 15 // minutes — deliberately small, so it is easy to begin
const MINUTES: Record<Skill, number> = { listening: 10, reading: 10, writing: 20, speaking: 5 }

export function useCountdown(date: string) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t) }, [])
  const ms = new Date(date + 'T09:00:00').getTime() - now
  return ms > 0 ? Math.ceil(ms / DAY) : null
}
export function useRunAction() {
  const { setView, startExam } = useStore()
  return (action: string, title: string, moduleId?: string) => {
    const [kind, a, b] = action.split(':')
    if (kind === 'view') setView(a as 'writing' | 'speaking')
    else startExam(EXAMS.drill(a as 'listening' | 'reading', DRILL_TYPES[b], title, moduleId))
  }
}

export default function Dashboard() {
  const s = useStore()
  const run = useRunAction()
  const [more, setMore] = useState(false)
  const [breathe, setBreathe] = useState(false)
  const bands = skillBands(s.attempts)
  const started = s.attempts.length > 0
  const recs = useMemo(() => recommend({ target: s.target, skillBand: bands, typeStats: s.typeStats, lastPracticed: s.lastPracticed }), [s.target, s.attempts, s.typeStats, s.lastPracticed]) // eslint-disable-line
  const days = useCountdown(s.examDate)
  const today = Math.round(s.studyLog[dayKey()] || 0)
  const due = s.deck.filter((c) => c.due <= Date.now()).length
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const week = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * DAY); return { d: d.toLocaleDateString(undefined, { weekday: 'narrow' }), on: (s.studyLog[dayKey(d)] || 0) > 0, today: i === 6 } })
  const known = (Object.keys(bands) as Skill[]).filter((k) => hasBand(s.attempts, k))
  const avg = known.length ? Math.round((known.reduce((a, k) => a + bands[k], 0) / known.length) * 2) / 2 : null
  const top = recs[0]
  const goalMsg = today === 0 ? 'A few minutes is enough to begin.' : today < DAILY_GOAL ? 'Nice start — you are on your way.' : 'Goal reached. Anything more is a bonus.'
  const timeMsg = days == null ? 'Add your test date in your profile' : days > 21 ? 'Plenty of time — steady practice wins' : days > 7 ? 'On track — keep sessions short and regular' : 'Final week — light review and good sleep'

  return (
    <div className="mx-auto grid max-w-xl gap-5">
      <header className="pt-2">
        <h1 className="text-3xl font-bold tracking-tight">{hello}{s.name ? `, ${s.name}` : ''}</h1>
        <p className="mt-1 text-ink/60">One small step today is enough.</p>
      </header>

      {/* one clear next action */}
      <Bento>
        <div className="text-xs font-semibold uppercase tracking-wider text-ink/45">Your next step</div>
        {!started ? (
          <>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Find your starting level</h2>
            <p className="mt-1 text-ink/60">A short Listening and Reading check. It shapes everything you see next.</p>
            <Pill className="mt-5 w-full" onClick={() => s.startExam(EXAMS.express())}>Start · about 25 min <ArrowRight size={16} {...ICON} /></Pill>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">{top.module.title}</h2>
            <p className="mt-1 text-ink/60">{top.why}.</p>
            <Pill className="mt-5 w-full" onClick={() => run(top.module.action, top.module.title, top.module.id)}>Start · about {MINUTES[top.module.skill]} min <ArrowRight size={16} {...ICON} /></Pill>
          </>
        )}
        <button onClick={() => setMore(!more)} aria-expanded={more} className="mx-auto mt-3 flex min-h-11 items-center gap-1 text-sm font-semibold text-ink/60">{more ? 'Hide' : 'Other'} options <ChevronDown size={16} className={cx('transition-transform', more && 'rotate-180')} {...ICON} /></button>
        {more && (
          <ul className="grid gap-1 border-t border-black/5 pt-2">
            {(started ? recs.slice(1).map((r) => ({ icon: SKILL_ICON[r.module.skill], label: r.module.title, sub: `${MINUTES[r.module.skill]} min`, go: () => run(r.module.action, r.module.title, r.module.id) })) : []).concat([
              { icon: Layers, label: 'Learn a strategy', sub: '8–12 min lesson', go: () => s.setView('learn') },
              { icon: PenLine, label: 'Writing Lab', sub: 'instant feedback', go: () => s.setView('writing') },
              { icon: Mic, label: 'Speaking practice', sub: '2-minute cue card', go: () => s.setView('speaking') },
            ]).map((o) => (
              <li key={o.label}><button onClick={o.go} className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-2 text-left hover:bg-black/[.03]"><o.icon size={18} className="text-ink/50" {...ICON} /><span className="flex-1 font-medium">{o.label}</span><span className="text-sm text-ink/45">{o.sub}</span></button></li>
            ))}
          </ul>
        )}
      </Bento>

      {/* today's gentle goal */}
      <Bento>
        <div className="flex items-center gap-5">
          <Ring value={Math.min(1, today / DAILY_GOAL)} size={76} stroke={7} color="#3F6F62" track="rgba(28,28,30,.07)"><span className="text-lg font-bold tabnum">{today}</span></Ring>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{today} of {DAILY_GOAL} minutes today</div>
            <p className="text-sm text-ink/60">{goalMsg}</p>
            <div className="mt-3 flex gap-1.5" aria-label="Practice days this week">{week.map((w, i) => <span key={i} className="flex flex-col items-center gap-1"><i className={cx('h-2.5 w-2.5 rounded-full', w.on ? 'bg-forest' : 'bg-black/10', w.today && !w.on && 'ring-2 ring-forest/30')} /><span className="text-[10px] text-ink/40">{w.d}</span></span>)}</div>
          </div>
        </div>
      </Bento>

      {/* quiet facts — no pressure framing */}
      <div className="grid grid-cols-2 gap-3">
        <Bento className="!p-4" onClick={() => s.setView('analytics')}>
          <div className="text-sm text-ink/55">Your level</div>
          <div className="mt-1 text-2xl font-bold tracking-tight tabnum">{avg != null ? fmtBand(avg) : '—'} <span className="text-base font-medium text-ink/40">→ {fmtBand(s.target)}</span></div>
          <div className="mt-1 text-xs text-ink/50">{avg == null ? 'Shown after your first check' : avg >= s.target ? 'At your target' : `${(s.target - avg).toFixed(1)} to go — very doable`}</div>
        </Bento>
        <Bento className="!p-4" onClick={() => s.setView('mock')}>
          <div className="text-sm text-ink/55">Your test</div>
          <div className="mt-1 text-2xl font-bold tracking-tight tabnum">{days != null ? `${days} days` : '—'}</div>
          <div className="mt-1 text-xs text-ink/50">{timeMsg}</div>
        </Bento>
      </div>

      {due > 0 && (
        <button onClick={() => { s.setView('practice'); setTimeout(() => document.getElementById('deck')?.scrollIntoView({ behavior: 'smooth' }), 250) }} className="card flex min-h-14 items-center gap-3 rounded-[24px] px-5 text-left">
          <Layers size={18} className="text-ink/50" {...ICON} /><span className="flex-1"><b>{due} word{due > 1 ? 's' : ''} ready to review</b><span className="block text-sm text-ink/55">About {Math.max(1, Math.round(due / 5))} min</span></span><ArrowRight size={18} className="text-ink/40" {...ICON} />
        </button>
      )}

      <button onClick={() => setBreathe(true)} className="mx-auto flex min-h-11 items-center gap-2 text-sm font-medium text-ink/55"><Wind size={16} {...ICON} /> Feeling tense? Take a one-minute breather</button>
      <AnimatePresence>{breathe && <Breathe onClose={() => setBreathe(false)} />}</AnimatePresence>
    </div>
  )
}
