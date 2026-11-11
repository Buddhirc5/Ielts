import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BarChart3, BookOpen, Gamepad2, Home, Mic, PenLine, Timer, User, type LucideIcon } from 'lucide-react'
import { useStore, type View } from './store'
import { DESTINATIONS } from './data/curriculum'
import { Books, ICON, Pill, Segmented, Sheet, Tag, cx, spring } from './components/ui'
import Dashboard from './views/Dashboard'
import Learn from './views/Learn'
import Practice from './views/Practice'
import WritingLab from './views/WritingLab'
import Speaking from './views/Speaking'
import Mock from './views/Mock'
import Analytics from './views/Analytics'
import { AccountPanel, SyncDot } from './components/Account'

const Exam = lazy(() => import('./views/Exam'))
const TABS: { id: View; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Dashboard', icon: Home }, { id: 'learn', label: 'Curriculum', icon: BookOpen }, { id: 'practice', label: 'Practice', icon: Gamepad2 },
  { id: 'writing', label: 'Writing Lab', icon: PenLine }, { id: 'speaking', label: 'Speaking', icon: Mic }, { id: 'mock', label: 'Mock Exam', icon: Timer }, { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

function ProfileForm({ onDone, cta }: { onDone: () => void; cta: string }) {
  const s = useStore()
  const [name, setName] = useState(s.name)
  const dest = DESTINATIONS.find((d) => d.id === s.dest)!
  return (
    <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); s.setProfile({ name: name.trim(), onboarded: true }); onDone() }}>
      <label className="grid gap-1 text-sm font-semibold">Your name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tharushi" className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-base font-medium" /></label>
      <div className="grid gap-1 text-sm font-semibold">Where do you plan to study or work?
        <div className="flex flex-wrap gap-2">{DESTINATIONS.map((d) => <button type="button" key={d.id} onClick={() => s.setProfile({ dest: d.id })} className={cx('min-h-11 rounded-full px-4 text-sm font-semibold', s.dest === d.id ? 'bg-ink text-white' : 'bg-white')}>{d.name}</button>)}</div>
        <p className="mt-1 rounded-2xl bg-mint p-3 text-xs font-medium leading-relaxed">{dest.note}</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">Target overall band: <span className="text-3xl font-extrabold tracking-tight">{s.target.toFixed(1)}</span>
        <input type="range" min={5} max={9} step={0.5} value={s.target} onChange={(e) => s.setProfile({ target: +e.target.value })} className="accent-ink" /></label>
      <label className="grid gap-1 text-sm font-semibold">Test date<input type="date" value={s.examDate} onChange={(e) => s.setProfile({ examDate: e.target.value })} className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-base font-medium" /></label>
      <Pill type="submit">{cta} <ArrowRight size={16} {...ICON} /></Pill>
    </form>
  )
}

function Onboarding() {
  const [step, setStep] = useState(0)
  return (
    <div className="grid min-h-full place-items-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="w-full max-w-md overflow-hidden rounded-[32px] bg-lav shadow-2xl">
        <div className="relative px-6 pt-8">
          <div className="absolute left-5 top-5 flex gap-2"><Tag i={0}>#IELTSAcademic</Tag><Tag i={1} className="bg-coral text-white">#SriLanka</Tag></div>
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}><Books className={cx('mx-auto w-full transition-all', step ? 'max-w-40' : 'max-w-xs pt-6')} /></motion.div>
        </div>
        <div className="rounded-t-[32px] bg-white p-7">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-center text-3xl font-extrabold tracking-tight">Start Your Band 8.0+ Journey Today</h1>
                <p className="mx-auto mt-3 max-w-xs text-center text-sm text-ink/70">Guided IELTS Academic lessons, computer-delivered mock exams and instant band feedback — built for Sri Lankan test takers.</p>
                <div className="mt-7 flex items-center justify-between">
                  <Pill onClick={() => setStep(1)}>Get Started</Pill>
                  <motion.button aria-label="Next" onClick={() => setStep(1)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={spring} className="relative grid h-14 w-14 place-items-center rounded-full bg-lavdeep text-white"><span className="absolute -inset-1.5 rounded-full border-2 border-transparent border-b-ink border-r-ink" /><ArrowRight {...ICON} /></motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="mb-4 text-2xl font-bold tracking-tight">Set your goal</h2>
                <ProfileForm onDone={() => {}} cta="Build my study plan" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default function App() {
  const { view, setView, exam, onboarded, track, setProfile, name, demo, reset } = useStore()
  const [profile, setProfile2] = useState(false)
  useEffect(() => { document.body.style.overflow = exam ? 'hidden' : '' }, [exam])
  if (!onboarded) return <Onboarding />
  if (exam) return <Suspense fallback={<div className="grid h-full place-items-center font-semibold">Loading test…</div>}><Exam key={exam.id + exam.title} config={exam} /></Suspense>
  const V = { home: Dashboard, learn: Learn, practice: Practice, writing: WritingLab, speaking: Speaking, mock: Mock, analytics: Analytics }[view]
  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-28 pt-4 sm:px-6 lg:pb-12">
      <header className="glass sticky top-3 z-30 mb-6 flex items-center gap-3 rounded-full px-3 py-2">
        <button onClick={() => setView('home')} className="flex items-center gap-2 pl-1 pr-2" aria-label="IELTS MasterStudio home">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ink"><svg viewBox="0 0 64 64" className="h-6 w-6"><rect x="12" y="38" width="40" height="10" rx="5" fill="#EC6B78" /><rect x="16" y="27" width="34" height="10" rx="5" fill="#F5B841" /><rect x="14" y="16" width="30" height="10" rx="5" fill="#E6E0F8" /></svg></span>
          <span className="hidden text-base font-extrabold tracking-tight sm:block">MasterStudio</span>
        </button>
        <nav className="mx-auto hidden items-center gap-0.5 rounded-full bg-black/5 p-1 lg:flex" aria-label="Main">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setView(t.id)} aria-current={view === t.id ? 'page' : undefined} className={cx('relative flex min-h-10 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-colors', view === t.id ? 'text-white' : 'text-ink/70 hover:text-ink')}>
              {view === t.id && <motion.span layoutId="nav" transition={spring} className="absolute inset-0 rounded-full bg-ink" />}
              <t.icon size={17} className="relative" {...ICON} /><span className={cx('relative', view !== t.id && 'hidden xl:inline')}>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Segmented value={track} onChange={(t) => setProfile({ track: t })} options={[{ value: 'academic', label: 'Academic' }, { value: 'general', label: 'General' }]} />
          <button onClick={() => setProfile2(true)} aria-label="Profile and settings" className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lav font-bold">{name ? name[0].toUpperCase() : <User size={18} {...ICON} />}<SyncDot /></button>
        </div>
      </header>
      <AnimatePresence mode="wait">
        <motion.main key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}><V /></motion.main>
      </AnimatePresence>
      <nav className="glass fixed inset-x-3 bottom-3 z-30 flex justify-between rounded-full p-1.5 lg:hidden" aria-label="Main">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setView(t.id)} aria-label={t.label} aria-current={view === t.id ? 'page' : undefined} className={cx('relative grid h-11 flex-1 place-items-center rounded-full', view === t.id ? 'text-white' : 'text-ink/60')}>
            {view === t.id && <motion.span layoutId="navm" transition={spring} className="absolute inset-0 rounded-full bg-ink" />}<t.icon size={19} className="relative" {...ICON} />
          </button>
        ))}
      </nav>
      <AnimatePresence>
        {profile && (
          <Sheet onClose={() => setProfile2(false)}>
            <div className="p-6">
              <AccountPanel />
              <h2 className="mb-4 mt-6 text-2xl font-bold tracking-tight">Profile & goal</h2>
              <ProfileForm onDone={() => setProfile2(false)} cta="Save" />
              <div className="mt-6 rounded-[20px] bg-white p-4 text-sm">
                <b>{demo ? 'You are viewing sample progress' : 'Your data'}</b>
                <p className="mt-1 text-ink/70">{demo ? 'The XP, study hours and three mock results shown at first launch are sample data so you can explore the charts. Clear them to start from zero.' : 'All progress is stored only in this browser.'}</p>
                <button onClick={() => { if (window.confirm('Clear all progress, essays and results stored in this browser?')) { reset(); setProfile2(false) } }} className="mt-3 min-h-11 rounded-full bg-coral px-4 text-sm font-semibold text-white">{demo ? 'Clear sample data & start fresh' : 'Reset all progress'}</button>
              </div>
            </div>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  )
}
