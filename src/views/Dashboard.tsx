import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Clock, Headphones, Layers, Mic, PenLine, Star, Sparkles, GraduationCap, type LucideIcon } from 'lucide-react'
import type { Skill } from '../types'
import { dayKey, skillBands, useStore } from '../store'
import { recommend, type Recommendation } from '../lib/engines'
import { DRILL_TYPES, EXAMS } from '../lib/exams'
import { LESSONS, PEERS } from '../data/curriculum'
import { Avatars, BandBadge, Bento, CircleBtn, Coin, ICON, Meter, Pill, Ring, SectionTitle, Segmented, Sheet, StripedBars, Tag, UpRight, cx, fmtBand, spring } from '../components/ui'

export const SKILL_ICON: Record<Skill, LucideIcon> = { listening: Headphones, reading: BookOpen, writing: PenLine, speaking: Mic }
const DAY = 86400000
const CARD = ['bg-mint', 'bg-lav', 'bg-butter']

export function useCountdown(date: string) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])
  const ms = new Date(date + 'T09:00:00').getTime() - now
  if (!(ms > 0)) return null
  return `${Math.floor(ms / DAY)}d ${Math.floor((ms % DAY) / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`
}
export function useRunAction() {
  const { setView, startExam } = useStore()
  return (action: string, title: string, moduleId?: string) => {
    const [kind, a, b] = action.split(':')
    if (kind === 'view') setView(a as any)
    else startExam(EXAMS.drill(a as 'listening' | 'reading', DRILL_TYPES[b], title, moduleId))
  }
}

export function ModuleSheet({ rec, onClose }: { rec: Recommendation; onClose: () => void }) {
  const s = useStore()
  const run = useRunAction()
  const countdown = useCountdown(s.examDate)
  const Icon = SKILL_ICON[rec.module.skill]
  const lessons = LESSONS.filter((l) => l.skill === rec.module.skill)
  const passed = lessons.filter((l) => s.lessonsDone.includes(l.id)).length
  const monthKey = dayKey().slice(0, 7)
  const hours = Object.entries(s.studyLog).filter(([k]) => k.startsWith(monthKey)).reduce((a, [, m]) => a + m, 0) / 60
  const pct = Math.min(1, rec.band / s.target)
  return (
    <Sheet onClose={onClose}>
      <div className="relative bg-coral px-6 pb-12 pt-5 text-white">
        <div className="flex items-center justify-between"><CircleBtn label="Back" onClick={onClose} className="!border-white/30 !bg-white/20 !text-white" icon={<ArrowLeft size={18} {...ICON} />} /><span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{rec.module.subtitle}</span></div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <div><div className="text-sm font-semibold opacity-80">Recommended module</div><h2 className="text-3xl font-extrabold leading-tight tracking-tight">{rec.module.title}</h2></div>
          <Ring value={pct} size={92} stroke={8} color="#141416" track="rgba(255,255,255,.3)"><div className="relative grid h-14 w-14 place-items-center rounded-full bg-white/20"><Icon {...ICON} /><span className="absolute -right-3 -top-2 rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold">{Math.round(pct * 100)}%</span></div></Ring>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">{[`#${rec.module.skill[0].toUpperCase()}${rec.module.skill.slice(1)}`, '#IELTSAcademic', '#BandBooster', '#TimedPractice'].map((t, i) => <Tag key={t} i={i} className={i % 2 ? 'bg-ink/25 text-white' : 'bg-white/30 text-white'}>{t}</Tag>)}</div>
      </div>
      <div className="-mt-7 rounded-t-[32px] bg-cream p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[20px] bg-[#EEEBD6] p-4"><div className="mb-3 flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-full bg-white"><Clock size={18} {...ICON} /></span></div><div className="text-4xl font-extrabold tracking-tight">{hours.toFixed(1)} <span className="text-lg font-bold">hours</span></div><div className="text-xs font-medium text-ink/60">spent this month</div></div>
          <div className="rounded-[20px] bg-gold p-4"><div className="mb-3 flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-full bg-white/60"><BookOpen size={18} {...ICON} /></span></div><div className="text-4xl font-extrabold tracking-tight">{passed} <span className="text-lg font-bold">lessons</span></div><div className="text-xs font-medium text-ink/70">passed of {lessons.length} in {rec.module.skill}</div></div>
        </div>
        <div className="relative z-10 -mb-4 mt-4 flex justify-center"><span className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white"><Star size={13} fill="#F5B841" stroke="#F5B841" /> Level: Band {fmtBand(Math.max(rec.band, s.target - 0.5))}–{fmtBand(Math.min(9, s.target + 0.5))} Target</span></div>
        <div className="rounded-[28px] bg-forest p-5 pt-7 text-white">
          <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15"><GraduationCap {...ICON} /></span><div><div className="font-bold">Coach guidance</div><p className="text-sm opacity-90">{rec.why}.</p></div></div>
          <div className="mt-4 flex items-end justify-between"><div><div className="text-3xl font-extrabold tracking-tight tabnum">{countdown ?? 'Set a date'}</div><div className="text-xs font-semibold opacity-80">{countdown ? 'to Mock Day' : 'Add your test date in your profile'}</div></div><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Priority {rec.score.toFixed(1)}</span></div>
        </div>
        <Pill className="mt-4 w-full" onClick={() => { onClose(); run(rec.module.action, rec.module.title, rec.module.id) }}>Start this session</Pill>
      </div>
    </Sheet>
  )
}

export default function Dashboard() {
  const s = useStore()
  const [open, setOpen] = useState<Recommendation | null>(null)
  const [range, setRange] = useState<'weekly' | 'monthly'>('monthly')
  const [toast, setToast] = useState('')
  const bands = skillBands(s.attempts)
  const recs = useMemo(() => recommend({ target: s.target, skillBand: bands, typeStats: s.typeStats, lastPracticed: s.lastPracticed }), [s.target, s.attempts, s.typeStats, s.lastPracticed]) // eslint-disable-line
  const countdown = useCountdown(s.examDate)
  const claimedToday = s.lastClaim === dayKey()
  const streakLive = claimedToday || s.lastClaim === dayKey(new Date(Date.now() - DAY)) ? s.streak : 0
  const totalMin = Object.values(s.studyLog).reduce((a, b) => a + b, 0)
  const sessions = s.lessonsDone.length + Object.keys(s.studyLog).length
  const due = s.deck.filter((c) => c.due <= Date.now()).length
  const bars = useMemo(() => {
    const now = new Date(), out = []
    const colors = ['#FFE08A', '#C9BDF0', '#BFE3DA', '#F6B5BC']
    if (range === 'monthly') for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1), key = dayKey(d).slice(0, 7)
      const mins = Object.entries(s.studyLog).filter(([k]) => k.startsWith(key)).reduce((a, [, m]) => a + m, 0)
      out.push({ label: d.toLocaleDateString(undefined, { month: 'short' }), pct: Math.min(100, (mins / 60 / 20) * 100), value: `${Math.round(mins / 60)}h`, sub: 'of 20h', color: colors[(3 - i) % 4] })
    } else for (let i = 4; i >= 0; i--) {
      let mins = 0; for (let d = 0; d < 7; d++) mins += s.studyLog[dayKey(new Date(Date.now() - (i * 7 + d) * DAY))] || 0
      out.push({ label: i === 0 ? 'This wk' : `-${i} wk`, pct: Math.min(100, (mins / 60 / 5) * 100), value: `${(mins / 60).toFixed(1)}h`, sub: 'of 5h', color: colors[(4 - i) % 4] })
    }
    return out
  }, [range, s.studyLog])
  const overall = s.attempts.filter((a) => a.overall).slice(-1)[0]?.overall

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      {/* column 1 — score & streak */}
      <div className="grid content-start gap-5 lg:col-span-4 xl:col-span-3">
        <Bento className="bg-cream">
          <div className="flex items-center justify-between"><div className="text-sm font-semibold text-ink/70">Ayubowan{s.name ? `, ${s.name}` : ''} 👋</div>{s.demo && <span className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-bold">Sample data</span>}</div>
          <div className="mt-3 text-lg font-bold">Total Score</div>
          <div className="mt-1 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-gold shadow-[inset_0_-4px_0_rgba(0,0,0,.15)]"><Star size={22} fill="#141416" {...ICON} /></span>
            <motion.span key={s.xp} initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={spring} className="text-5xl font-extrabold tracking-tight tabnum">{s.xp.toLocaleString('en-US').replace(',', ' ')}</motion.span>
            <span className="-mt-8 rounded-full bg-forest px-3 py-1 text-xs font-bold text-white">{new Date().toLocaleDateString(undefined, { month: 'long' })}</span>
          </div>
          <div className="mt-1 pl-15 text-xs font-semibold text-ink/50">XP</div>
        </Bento>
        <Bento className="bg-coral text-white">
          <div className="text-xl font-bold">Bonus Streak for 7 Days</div>
          <div className="mt-4 flex justify-between">{[1, 2, 3, 4, 5, 6, 7].map((d) => <Coin key={d} label={`${d}D`} done={d <= streakLive} today={d === streakLive + 1 && !claimedToday} />)}</div>
          <motion.button whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }} transition={spring} disabled={claimedToday} onClick={() => { if (s.claim()) { setToast(`+${50 + (streakLive >= 7 ? 1 : streakLive + 1) * 10} XP claimed`); setTimeout(() => setToast(''), 2400) } }}
            className="mt-5 min-h-12 w-full rounded-full bg-white text-sm font-bold text-ink disabled:opacity-70">{claimedToday ? 'Reward claimed — come back tomorrow' : 'Claim Daily Practice Reward'}</motion.button>
        </Bento>
        <div className="grid grid-cols-2 gap-4">
          <Bento className="bg-mint !p-4" onClick={() => s.setView('learn')}><div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-9 w-9 place-items-center rounded-full bg-white"><Layers size={16} {...ICON} /></span>Lessons Completed</div><div className="mt-3 flex items-end justify-between"><span className="text-4xl font-extrabold tracking-tight tabnum">{sessions}</span><UpRight label="Open curriculum" onClick={() => s.setView('learn')} /></div></Bento>
          <Bento className="bg-butter !p-4" onClick={() => s.setView('analytics')}><div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-9 w-9 place-items-center rounded-full bg-white"><Clock size={16} {...ICON} /></span>Study Hours</div><div className="mt-3 flex items-end justify-between"><span className="text-4xl font-extrabold tracking-tight tabnum">{Math.round(totalMin / 60)}h</span><UpRight label="Open analytics" onClick={() => s.setView('analytics')} /></div></Bento>
        </div>
      </div>

      {/* column 2 — today's queue & progress */}
      <div className="grid content-start gap-5 lg:col-span-8 xl:col-span-5">
        <div>
          <SectionTitle right={<span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-bold sm:inline-flex sm:items-center sm:gap-1.5"><Sparkles size={13} {...ICON} /> Adaptive queue</span>}>Your Progress Today</SectionTitle>
          <div className="grid gap-4">
            {recs.map((r, i) => { const Icon = SKILL_ICON[r.module.skill]; return (
              <Bento key={r.module.id} className={CARD[i]} onClick={() => setOpen(r)}>
                <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-full bg-white"><Icon size={20} {...ICON} /></span><BandBadge band={r.band} /></div>
                <div className="mt-4 text-sm font-medium text-ink/60">{r.module.subtitle}</div>
                <h3 className="text-xl font-bold leading-snug tracking-tight">{r.module.title}</h3>
                <p className="mt-2 inline-block rounded-2xl bg-white/70 px-3 py-1.5 text-xs font-semibold leading-relaxed">Recommended: {r.why}</p>
                <div className="mt-4 flex items-center justify-between"><Avatars names={PEERS.slice(i * 2, i * 2 + 3)} extra="5+" /><CircleBtn ring label={`Open ${r.module.title}`} onClick={() => setOpen(r)} className="!h-12 !w-12" /></div>
              </Bento>) })}
          </div>
        </div>
      </div>

      {/* column 3 — tracker */}
      <div className="grid content-start gap-5 lg:col-span-12 xl:col-span-4">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
          <div>
            <SectionTitle right={<Segmented value={range} onChange={setRange} options={[{ value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }]} />}>Learning Time Tracker</SectionTitle>
            <Bento className="bg-lav"><div className="mb-4 flex items-center justify-between"><span className="font-bold">Progress</span><span className="text-xs font-semibold text-ink/60">study time vs goal</span></div><StripedBars data={bars} height={200} /></Bento>
          </div>
          <div className="grid content-start gap-5">
            <Bento className="bg-forest text-white">
              <div className="flex items-center justify-between"><div className="font-bold">Test-day countdown</div><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Target {fmtBand(s.target)}</span></div>
              <div className="mt-2 text-4xl font-extrabold tracking-tight tabnum">{countdown ?? '—'}</div>
              <p className="mt-1 text-sm opacity-90">{countdown ? `until your test on ${new Date(s.examDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}.` : 'Set your test date in your profile to start the countdown.'} {overall ? `Latest full mock: Band ${fmtBand(overall)}.` : 'Take a diagnostic mock to set your baseline.'}</p>
              <Pill variant="light" className="mt-4" onClick={() => s.setView('mock')}>Go to Mock Exams</Pill>
            </Bento>
            <Bento className="bg-white">
              <div className="mb-3 flex items-center justify-between"><span className="font-bold">Estimated bands</span><button className="min-h-11 text-xs font-bold underline" onClick={() => s.setView('analytics')}>Details</button></div>
              <div className="grid gap-3">{(Object.keys(bands) as Skill[]).map((k, i) => <Meter key={k} label={k[0].toUpperCase() + k.slice(1)} value={bands[k]} color={['#3D7A74', '#EC6B78', '#F5B841', '#9C8AE0'][i]} />)}</div>
            </Bento>
            <Bento className="bg-butter" onClick={() => { s.setView('practice'); setTimeout(() => document.getElementById('deck')?.scrollIntoView({ behavior: 'smooth' }), 200) }}>
              <div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-ink/70">Band 8+ deck · spaced repetition</div><div className="text-4xl font-extrabold tracking-tight tabnum">{due} <span className="text-base font-bold">cards due</span></div></div><CircleBtn label="Review cards" /></div>
            </Bento>
          </div>
        </div>
      </div>
      <AnimatePresence>{open && <ModuleSheet rec={open} onClose={() => setOpen(null)} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={spring} role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white lg:bottom-8">{toast}</motion.div>}</AnimatePresence>
    </div>
  )
}
