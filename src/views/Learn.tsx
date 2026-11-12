import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CheckCircle2, ChevronRight, Clock, Compass, Dumbbell, FlaskConical, ListChecks, Stethoscope, Timer } from 'lucide-react'
import type { QType, Skill } from '../types'
import { TYPE_LABEL } from '../types'
import { BANDS, CHECKLIST, FORMAT, LESSONS, type Lesson } from '../data/curriculum'
import { DRILL_TYPES, EXAMS } from '../lib/exams'
import { MODULES } from '../lib/engines'
import { useStore } from '../store'
import { Bento, ICON, Pill, Ring, SectionTitle, Segmented, Sheet, Tag, cx, spring } from '../components/ui'
import { SKILL_ICON } from './Dashboard'

const STEPS = [
  { n: 1, title: 'Understand the Test', icon: Compass, color: 'bg-lav' }, { n: 2, title: 'Diagnostic Express Check', icon: Stethoscope, color: 'bg-mint' },
  { n: 3, title: 'Skill Mastery Labs', icon: FlaskConical, color: 'bg-butter' }, { n: 4, title: 'Smart Practice & Drills', icon: Dumbbell, color: 'bg-lav' },
  { n: 5, title: 'Full Mock Exams', icon: Timer, color: 'bg-mint' }, { n: 6, title: 'Test-Day Readiness', icon: ListChecks, color: 'bg-butter' },
]
const SKILLS: Skill[] = ['listening', 'reading', 'writing', 'speaking']
const PART_COLORS = ['#2F5548', '#3F6F62', '#5C8777', '#7A9C8F']

function LessonSheet({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const { completeLesson, lessonsDone, logMinutes, touch } = useStore()
  const [picked, setPicked] = useState<Record<number, number>>({})
  const allRight = lesson.quiz.every((q, i) => picked[i] === q.answer)
  const answered = Object.keys(picked).length === lesson.quiz.length
  return (
    <Sheet onClose={onClose} wide>
      <div className="bg-lav p-6"><Tag className="bg-white text-ink">{lesson.tag}</Tag><h2 className="mt-3 text-2xl font-extrabold tracking-tight">{lesson.title}</h2><p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink/60"><Clock size={14} {...ICON} /> {lesson.minutes} min · {lesson.skill}</p></div>
      <div className="grid gap-5 p-6">
        <ol className="grid gap-2">{lesson.points.map((p, i) => <li key={p} className="flex gap-3 rounded-[20px] bg-white p-4 text-sm leading-relaxed"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white">{i + 1}</span>{p}</li>)}</ol>
        <div>
          <h3 className="mb-2 text-lg font-bold">Micro-quiz</h3>
          {lesson.quiz.map((q, i) => (
            <div key={q.q} className="mb-4">
              <p className="mb-2 font-semibold">{i + 1}. {q.q}</p>
              <div className="grid gap-1.5">{q.options.map((o, k) => { const chosen = picked[i] === k, shown = picked[i] != null; return (
                <button key={o} disabled={shown} onClick={() => setPicked({ ...picked, [i]: k })} className={cx('min-h-11 rounded-2xl border px-4 py-2 text-left text-sm font-medium', shown && k === q.answer ? 'border-emerald-600 bg-emerald-50' : chosen ? 'border-rose-500 bg-rose-50' : 'border-black/10 bg-white')}>{o}</button>) })}</div>
              {picked[i] != null && <p className="mt-2 rounded-2xl bg-butter p-3 text-sm">{picked[i] === q.answer ? '✓ Correct. ' : '✗ Not quite. '}{q.why}</p>}
            </div>
          ))}
        </div>
        <Pill disabled={!answered} onClick={() => { completeLesson(lesson.id); logMinutes(lesson.minutes); touch(lesson.skill); onClose() }}>{lessonsDone.includes(lesson.id) ? 'Done — close' : answered ? (allRight ? 'Complete lesson · +40 XP' : 'Complete lesson · +40 XP (review the notes above)') : 'Answer the quiz to finish'}</Pill>
      </div>
    </Sheet>
  )
}

export default function Learn() {
  const s = useStore()
  const [step, setStep] = useState(1)
  const [skill, setSkill] = useState<Skill>('listening')
  const [band, setBand] = useState(7)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const diag = s.attempts.some((a) => a.kind === 'express' || a.kind === 'mini')
  const full = s.attempts.some((a) => a.kind === 'full')
  const checkItems = CHECKLIST.flatMap((g) => g.items)
  const doneFlags = [true, diag, s.lessonsDone.length >= LESSONS.length, s.attempts.some((a) => a.kind === 'drill'), full, s.checklist.length >= checkItems.length]
  const f = FORMAT[skill], desc = BANDS.find((b) => b.band === Math.floor(band))!
  const drills = MODULES.filter((m) => m.qtype).map((m) => { const st = s.typeStats[m.qtype as QType]; return { m, acc: st && st.total ? st.correct / st.total : null, total: st?.total || 0 } }).sort((a, b) => (a.acc ?? 0.5) - (b.acc ?? 0.5))

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Your 6-step roadmap</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink/70">Understand the test, measure your level, build each skill, drill your weak points, sit full mocks, then walk in ready.</p>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {STEPS.map((st, i) => (
          <motion.button key={st.n} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} transition={spring} onClick={() => setStep(st.n)} aria-pressed={step === st.n}
            className={cx('relative rounded-[28px] p-4 text-left', step === st.n ? 'bg-ink text-white' : st.color)}>
            <div className="flex items-center justify-between"><span className={cx('grid h-10 w-10 place-items-center rounded-full', step === st.n ? 'bg-white/15' : 'bg-white')}><st.icon size={18} {...ICON} /></span>{doneFlags[i] && <CheckCircle2 size={20} className={step === st.n ? 'text-gold' : 'text-forest'} {...ICON} />}</div>
            <div className="mt-3 text-xs font-bold opacity-60">STEP {st.n}</div><div className="text-sm font-bold leading-snug">{st.title}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {step === 1 && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Bento className="bg-white">
                <SectionTitle>Test format</SectionTitle>
                <Segmented value={skill} onChange={setSkill} options={SKILLS.map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) }))} />
                <div className="mt-4 text-4xl font-extrabold tracking-tight">{f.time}</div>
                <div className="mt-3 flex h-12 gap-1 overflow-hidden rounded-full">{f.parts.map((p, i) => <motion.div key={p.name} layout className="grid place-items-center text-xs font-bold text-white" style={{ width: `${(p.mins / f.total) * 100}%`, background: PART_COLORS[i] }}>{p.mins}′</motion.div>)}</div>
                <ul className="mt-4 grid gap-2">{f.parts.map((p, i) => <li key={p.name} className="flex gap-3 rounded-[20px] bg-cream p-3 text-sm"><i className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: PART_COLORS[i] }} /><span><b>{p.name}</b> · about {p.mins} minutes<br /><span className="text-ink/70">{p.detail}</span></span></li>)}</ul>
                <p className="mt-3 rounded-[20px] bg-mint p-3 text-sm">{f.note}</p>
              </Bento>
              <Bento className="bg-lav">
                <SectionTitle>Band descriptors</SectionTitle>
                <div className="flex items-end gap-4"><div className="text-5xl font-extrabold tracking-tight tabnum">{band.toFixed(1)}</div><div className="pb-1 text-lg font-bold">{desc.label}</div></div>
                <input aria-label="Band score" type="range" min={1} max={9} step={0.5} value={band} onChange={(e) => setBand(+e.target.value)} className="mt-3 w-full accent-ink" />
                <div className="mt-1 flex justify-between text-xs font-semibold text-ink/50">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => <span key={b}>{b}</span>)}</div>
                <p className="mt-4 rounded-[20px] bg-white p-4 text-sm leading-relaxed">{desc.desc}{band % 1 ? ' A half band means you show some features of the next band up.' : ''}</p>
                <p className="mt-3 text-sm text-ink/70">Your target is <b>Band {s.target.toFixed(1)}</b>. Writing and Speaking are each marked on four equally weighted criteria; Listening and Reading are converted from a raw score out of 40.</p>
                <Pill className="mt-4" onClick={() => setStep(2)}>Next: find your level <ChevronRight size={16} {...ICON} /></Pill>
              </Bento>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-5 md:grid-cols-2">
              {[{ e: EXAMS.express(), t: 'Express Mock', m: 25, d: 'Listening Part 1 and Reading Passage 1. The fastest way to get a baseline for both skills.', c: 'bg-mint' }, { e: EXAMS.mini(), t: 'Mini Mock', m: 50, d: 'Listening Parts 1–2 and Reading Passages 1–2 for a more reliable estimate.', c: 'bg-butter' }].map((x) => (
                <Bento key={x.t} className={x.c}>
                  <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-full bg-white"><Stethoscope size={20} {...ICON} /></span><span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold">{x.m} minutes</span></div>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight">{x.t}</h3><p className="mt-1 text-sm text-ink/70">{x.d}</p>
                  <Pill className="mt-5" onClick={() => s.startExam(x.e)}>Start in exam mode</Pill>
                </Bento>
              ))}
              <Bento className="bg-white md:col-span-2 text-sm text-ink/70">Diagnostics run in the computer-delivered exam interface with a live timer. Scores are scaled to a 40-question paper, then converted to a band and fed into your daily study queue.</Bento>
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-5">
              {SKILLS.map((k) => { const Icon = SKILL_ICON[k]; const ls = LESSONS.filter((l) => l.skill === k); const done = ls.filter((l) => s.lessonsDone.includes(l.id)).length; return (
                <section key={k}>
                  <div className="mb-3 flex items-center gap-3"><Ring value={done / ls.length} size={44} stroke={5}><Icon size={16} {...ICON} /></Ring><h2 className="text-xl font-bold capitalize tracking-tight">{k} lab</h2><span className="text-sm font-semibold text-ink/50">{done}/{ls.length}</span></div>
                  <div className="grid gap-3 md:grid-cols-3">{ls.map((l, i) => (
                    <Bento key={l.id} className={['bg-mint', 'bg-lav', 'bg-butter'][i % 3]} onClick={() => setLesson(l)}>
                      <div className="flex items-start justify-between"><Tag i={i} className={l.tag === '#SriLankaFocus' ? 'bg-coral text-white' : 'bg-white text-ink'}>{l.tag}</Tag>{s.lessonsDone.includes(l.id) && <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-white"><Check size={14} {...ICON} /></span>}</div>
                      <h3 className="mt-3 font-bold leading-snug">{l.title}</h3><p className="mt-1 text-xs font-semibold text-ink/60">{l.minutes} min · {l.quiz.length}-question quiz</p>
                    </Bento>))}</div>
                </section>) })}
            </div>
          )}
          {step === 4 && (
            <div className="grid gap-3 md:grid-cols-2">
              {drills.map(({ m, acc, total }, i) => (
                <Bento key={m.id} className={i === 0 ? 'bg-coral text-white' : 'bg-white'} onClick={() => s.startExam(EXAMS.drill(m.skill as 'listening' | 'reading', DRILL_TYPES[m.action.split(':')[2]], m.title, m.id))}>
                  <div className="flex items-center justify-between gap-3">
                    <div><div className="text-xs font-bold opacity-70">{i === 0 ? 'WEAKEST · START HERE' : m.subtitle}</div><h3 className="text-lg font-bold">{m.title}</h3><p className="text-xs font-semibold opacity-70">{TYPE_LABEL[m.qtype!]} · {total ? `${total} questions attempted` : 'not attempted yet'}</p></div>
                    <div className="text-right"><div className="text-4xl font-extrabold tracking-tight tabnum">{acc == null ? '—' : `${Math.round(acc * 100)}%`}</div><div className="text-[11px] font-semibold opacity-70">accuracy</div></div>
                  </div>
                </Bento>
              ))}
            </div>
          )}
          {step === 5 && (
            <Bento className="bg-coral text-white">
              <h3 className="text-2xl font-bold tracking-tight">Full Mock Exam — all four skills</h3>
              <p className="mt-1 max-w-xl text-sm opacity-95">Listening (40 questions), Reading (40 questions), Writing Tasks 1 and 2, then Speaking Parts 1–3 — in the computer-delivered interface with highlighting, notes and a question palette.</p>
              <div className="mt-5 flex flex-wrap gap-2"><Pill variant="light" onClick={() => s.startExam(EXAMS.full(s.track))}>Start full mock</Pill><Pill variant="light" onClick={() => s.setView('mock')}>All timed tests</Pill></div>
            </Bento>
          )}
          {step === 6 && (
            <div className="grid gap-5 lg:grid-cols-3">
              <Bento className="bg-forest text-white"><Ring value={s.checklist.length / checkItems.length} size={120} stroke={10} color="#3F6F62"><span className="text-3xl font-extrabold tabnum">{Math.round((s.checklist.length / checkItems.length) * 100)}%</span></Ring><h3 className="mt-4 text-xl font-bold">Test-day readiness</h3><p className="mt-1 text-sm opacity-90">{s.checklist.length} of {checkItems.length} items ticked. Requirements vary by test centre — always follow your booking confirmation.</p></Bento>
              <div className="grid gap-4 lg:col-span-2">{CHECKLIST.map((g) => (
                <Bento key={g.group} className="bg-white"><h3 className="mb-2 font-bold">{g.group}</h3>
                  <ul className="grid gap-1">{g.items.map((it) => { const on = s.checklist.includes(it); return (
                    <li key={it}><label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl px-2 py-1.5 text-sm hover:bg-black/5"><input type="checkbox" checked={on} onChange={() => s.toggleCheck(it)} className="h-5 w-5 shrink-0 accent-[#3D7A74]" /><span className={on ? 'text-ink/50 line-through' : ''}>{it}</span></label></li>) })}</ul>
                </Bento>))}</div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>{lesson && <LessonSheet lesson={lesson} onClose={() => setLesson(null)} />}</AnimatePresence>
    </div>
  )
}
