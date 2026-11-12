import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, BarChart3, BookOpen, Gamepad2, Home, Timer, User, type LucideIcon } from 'lucide-react'
import { useStore, type View } from './store'
import { DESTINATIONS } from './data/curriculum'
import { Books, ICON, Pill, Segmented, Sheet, cx, spring } from './components/ui'
import { AccountPanel, SyncDot } from './components/Account'
import Dashboard from './views/Dashboard'

// every screen except Today loads on demand, so the first paint stays small and fast
const Learn = lazy(() => import('./views/Learn'))
const Practice = lazy(() => import('./views/Practice'))
const WritingLab = lazy(() => import('./views/WritingLab'))
const Speaking = lazy(() => import('./views/Speaking'))
const Mock = lazy(() => import('./views/Mock'))
const Analytics = lazy(() => import('./views/Analytics'))
const Exam = lazy(() => import('./views/Exam'))

const TABS: { id: View; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Today', icon: Home }, { id: 'learn', label: 'Learn', icon: BookOpen }, { id: 'practice', label: 'Practice', icon: Gamepad2 },
  { id: 'mock', label: 'Tests', icon: Timer }, { id: 'analytics', label: 'Progress', icon: BarChart3 },
]
const tabOf = (v: View): View => (v === 'writing' || v === 'speaking' ? 'practice' : v)
const Loading = () => <div className="grid min-h-40 place-items-center text-sm text-ink/40">Loading…</div>

function ProfileForm({ onDone, cta }: { onDone: () => void; cta: string }) {
  const s = useStore()
  const [name, setName] = useState(s.name)
  const dest = DESTINATIONS.find((d) => d.id === s.dest)!
  return (
    <form className="grid gap-5" onSubmit={(e) => { e.preventDefault(); s.setProfile({ name: name.trim(), onboarded: true }); onDone() }}>
      <label className="grid gap-1.5 text-sm font-semibold">Your first name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="e.g. Tharushi" className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-base font-normal" /></label>
      <div className="grid gap-1.5 text-sm font-semibold">Where are you heading?
        <div className="flex flex-wrap gap-2">{DESTINATIONS.map((d) => <button type="button" key={d.id} onClick={() => s.setProfile({ dest: d.id })} className={cx('min-h-11 rounded-full border px-4 text-sm font-medium', s.dest === d.id ? 'border-ink bg-ink text-white' : 'border-black/10 bg-white')}>{d.name}</button>)}</div>
        <p className="text-xs font-normal leading-relaxed text-ink/55">{dest.note}</p>
      </div>
      <label className="grid gap-1.5 text-sm font-semibold"><span>Target band <span className="ml-1 text-2xl font-bold tabnum">{s.target.toFixed(1)}</span></span>
        <input type="range" min={5} max={9} step={0.5} value={s.target} onChange={(e) => s.setProfile({ target: +e.target.value })} className="accent-ink" /></label>
      <label className="grid gap-1.5 text-sm font-semibold">Test date <span className="font-normal text-ink/50">(an estimate is fine)</span><input type="date" value={s.examDate} onChange={(e) => s.setProfile({ examDate: e.target.value })} className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-base font-normal" /></label>
      <Pill type="submit">{cta} <ArrowRight size={16} {...ICON} /></Pill>
    </form>
  )
}

function Onboarding() {
  const [step, setStep] = useState(0)
  return (
    <div className="mx-auto grid min-h-[100dvh] max-w-md content-center p-6">
      {step === 0 ? (
        <motion.div key="a" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="text-center">
          <Books className="mx-auto w-full max-w-60" />
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Start Your Band 8.0+ Journey Today</h1>
          <p className="mx-auto mt-3 max-w-xs text-ink/60">Calm, focused IELTS Academic practice for Sri Lankan test takers. A few minutes a day.</p>
          <Pill className="mt-8 w-full" onClick={() => setStep(1)}>Get Started <ArrowRight size={16} {...ICON} /></Pill>
          <p className="mt-3 text-xs text-ink/45">Takes about 30 seconds. No account needed.</p>
        </motion.div>
      ) : (
        <motion.div key="b" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          <h2 className="mb-1 text-2xl font-bold tracking-tight">Set your goal</h2>
          <p className="mb-6 text-sm text-ink/55">You can change any of this later.</p>
          <ProfileForm onDone={() => {}} cta="Build my study plan" />
        </motion.div>
      )}
    </div>
  )
}

export default function App() {
  const { view, setView, exam, onboarded, track, setProfile, name, reset } = useStore()
  const [profile, setProfile2] = useState(false)
  useEffect(() => { document.body.style.overflow = exam ? 'hidden' : '' }, [exam])
  if (!onboarded) return <Onboarding />
  if (exam) return <Suspense fallback={<div className="grid h-[100dvh] place-items-center text-ink/40">Loading test…</div>}><Exam key={exam.id + exam.title} config={exam} /></Suspense>
  const V = { home: Dashboard, learn: Learn, practice: Practice, writing: WritingLab, speaking: Speaking, mock: Mock, analytics: Analytics }[view]
  const active = tabOf(view)
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-3 sm:px-6 lg:pb-12">
      <header className="mb-5 flex min-h-12 items-center gap-3">
        {view === 'writing' || view === 'speaking'
          ? <button onClick={() => setView('practice')} className="flex min-h-11 items-center gap-1.5 pr-2 font-semibold"><ArrowLeft size={18} {...ICON} /> Practice</button>
          : <button onClick={() => setView('home')} className="text-base font-bold tracking-tight" aria-label="IELTS MasterStudio home">MasterStudio</button>}
        <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Main">
          {TABS.map((t) => <button key={t.id} onClick={() => setView(t.id)} aria-current={active === t.id ? 'page' : undefined} className={cx('min-h-10 rounded-full px-4 text-sm font-medium transition-colors', active === t.id ? 'bg-ink text-white' : 'text-ink/60 hover:text-ink')}>{t.label}</button>)}
        </nav>
        <button onClick={() => setProfile2(true)} aria-label="Profile and settings" className="card relative ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full font-semibold lg:ml-0">{name ? name[0].toUpperCase() : <User size={18} {...ICON} />}<SyncDot /></button>
      </header>
      <Suspense fallback={<Loading />}><main key={view}><V /></main></Suspense>
      <nav className="safe-b fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-black/[.07] bg-white/95 px-2 pt-1.5 lg:hidden" aria-label="Main">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setView(t.id)} aria-current={active === t.id ? 'page' : undefined} className={cx('flex min-h-12 flex-col items-center justify-center gap-0.5', active === t.id ? 'text-ink' : 'text-ink/40')}>
            <t.icon size={21} strokeWidth={active === t.id ? 2.1 : 1.75} /><span className={cx('text-[11px]', active === t.id ? 'font-semibold' : 'font-medium')}>{t.label}</span>
          </button>
        ))}
      </nav>
      <AnimatePresence>
        {profile && (
          <Sheet onClose={() => setProfile2(false)}>
            <div className="grid gap-6 p-6">
              <AccountPanel />
              <div><h2 className="mb-4 text-xl font-bold tracking-tight">Your goal</h2><ProfileForm onDone={() => setProfile2(false)} cta="Save" /></div>
              <div className="grid gap-2 text-sm"><span className="font-semibold">Test type</span><Segmented value={track} onChange={(t) => setProfile({ track: t })} options={[{ value: 'academic', label: 'Academic' }, { value: 'general', label: 'General Training' }]} /></div>
              <button onClick={() => { if (window.confirm('Clear all progress, essays and results on this device?')) { reset(); setProfile2(false) } }} className="min-h-11 justify-self-start text-sm font-medium text-ink/50 underline">Reset my progress</button>
            </div>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  )
}
