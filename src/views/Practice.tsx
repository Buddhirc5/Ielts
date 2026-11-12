import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Mic, PenLine, BookOpen, Check, Headphones, Plus, RotateCcw, Trash2, Volume2, X, Trophy } from 'lucide-react'
import { LISTENING } from '../data/listening'
import { ACADEMIC_READING, GENERAL_READING } from '../data/reading'
import { QUIZZES, type QuizDef } from '../data/quizzes'
import { TYPE_LABEL, type Accent } from '../types'
import { norm, previewInterval, type Grade } from '../lib/engines'
import { EXAMS } from '../lib/exams'
import { speak, stopSpeaking, ttsSupported } from '../lib/speech'
import { useStore } from '../store'
import { Spark } from '../components/Charts'
import { Bento, CircleBtn, ICON, Pill, SectionTitle, Sheet, Tag, cx, spring } from '../components/ui'

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const ACCENTS: Accent[] = ['UK', 'Australia', 'North America', 'New Zealand']

function QuizRunner({ quiz, onClose }: { quiz: QuizDef; onClose: () => void }) {
  const { setQuizBest, addXp, quizBest, logMinutes } = useStore()
  const total = quiz.kind === 'pairs' ? quiz.sets.length : quiz.items.length
  const [i, setI] = useState(0)
  const [pts, setPts] = useState(0)
  const [max, setMax] = useState(0)
  const [done, setDone] = useState(false)
  // per-item state
  const [pick, setPick] = useState<number | null>(null)
  const [pick2, setPick2] = useState<number | null>(null)
  const [typed, setTyped] = useState('')
  const [checked, setChecked] = useState(false)
  const [built, setBuilt] = useState<string[]>([])
  const [left, setLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [miss, setMiss] = useState(0)
  const [wrong, setWrong] = useState<string | null>(null)
  const rights = useMemo(() => (quiz.kind === 'pairs' ? shuffle(quiz.sets[i]?.pairs.map((p) => p[1]) || []) : []), [quiz, i])
  const chunks = useMemo(() => (quiz.kind === 'build' ? shuffle(quiz.items[i]?.chunks || []) : []), [quiz, i])
  const award = (p: number, m: number) => { setPts((x) => x + p); setMax((x) => x + m) }
  const next = () => {
    stopSpeaking(); setPick(null); setPick2(null); setTyped(''); setChecked(false); setBuilt([]); setLeft(null); setMatched([]); setMiss(0)
    if (i + 1 >= total) { setDone(true) } else setI(i + 1)
  }
  const pct = max ? Math.round((pts / max) * 100) : 0
  const finish = () => { setQuizBest(quiz.id, pct); addXp(Math.round(pct / 2) + 20); logMinutes(4); onClose() }

  let body: React.ReactNode = null, canNext = false
  if (done) body = (
    <div className="py-6 text-center">
      <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={spring} className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gold"><Trophy size={40} {...ICON} /></motion.div>
      <div className="mt-4 text-5xl font-extrabold tracking-tight tabnum">{pct}%</div>
      <p className="mt-1 text-sm text-ink/70">{pts} of {max} points · previous best {quizBest[quiz.id] ?? 0}% · +{Math.round(pct / 2) + 20} XP</p>
      <Pill className="mt-5" onClick={finish}>Collect XP</Pill>
    </div>
  )
  else if (quiz.kind === 'mcq') {
    const it = quiz.items[i]
    const stage2 = pick != null && it.follow
    canNext = pick != null && (!it.follow || pick2 != null)
    const opt = (o: string, k: number, chosen: number | null, ans: number, on: (k: number) => void) => (
      <button key={o} disabled={chosen != null} onClick={() => on(k)} className={cx('min-h-11 rounded-2xl border px-4 py-2 text-left text-sm font-semibold', chosen != null && k === ans ? 'border-emerald-600 bg-emerald-50' : chosen === k ? 'border-rose-500 bg-rose-50' : 'border-black/10 bg-white')}>{o}</button>)
    body = (
      <div className="grid gap-3">
        {it.spark && <Spark values={it.spark} />}
        {it.context && <p className="rounded-[20px] bg-white p-4 text-sm leading-relaxed">{it.context}</p>}
        <p className="font-bold">{it.prompt}</p>
        <div className="grid gap-2 sm:grid-cols-2">{it.options.map((o, k) => opt(o, k, pick, it.answer, (x) => { setPick(x); award(x === it.answer ? 1 : 0, 1) }))}</div>
        {pick != null && <p className="rounded-[20px] bg-butter p-3 text-sm">{pick === it.answer ? '✓ ' : '✗ '}{it.explain}</p>}
        {stage2 && <><p className="mt-1 font-bold">{it.follow!.prompt}</p><div className="grid gap-2">{it.follow!.options.map((o, k) => opt(o, k, pick2, it.follow!.answer, (x) => { setPick2(x); award(x === it.follow!.answer ? 1 : 0, 1) }))}</div></>}
      </div>
    )
  } else if (quiz.kind === 'pairs') {
    const set = quiz.sets[i]
    canNext = matched.length === set.pairs.length
    const tryMatch = (r: string) => {
      if (!left) return
      if (set.pairs.find((p) => p[0] === left)![1] === r) { const m = [...matched, left]; setMatched(m); setLeft(null); if (m.length === set.pairs.length) award(Math.max(0, set.pairs.length - miss), set.pairs.length) }
      else { setMiss(miss + 1); setWrong(r); setTimeout(() => setWrong(null), 400) }
    }
    body = (
      <div className="grid grid-cols-2 gap-3">
        <div className="grid content-start gap-2"><div className="text-xs font-bold text-ink/50">PASSAGE SAYS</div>{set.pairs.map(([l]) => <button key={l} disabled={matched.includes(l)} onClick={() => setLeft(l)} className={cx('min-h-12 rounded-2xl border px-3 py-2 text-left text-sm font-semibold', matched.includes(l) ? 'border-emerald-600 bg-emerald-50 opacity-70' : left === l ? 'border-ink bg-ink text-white' : 'border-black/10 bg-white')}>{l}</button>)}</div>
        <div className="grid content-start gap-2"><div className="text-xs font-bold text-ink/50">QUESTION SAYS</div>{rights.map((r) => { const ok = matched.some((l) => set.pairs.find((p) => p[0] === l)![1] === r); return <motion.button key={r} animate={wrong === r ? { x: [0, -6, 6, -4, 0] } : {}} disabled={ok} onClick={() => tryMatch(r)} className={cx('min-h-12 rounded-2xl border px-3 py-2 text-left text-sm font-semibold', ok ? 'border-emerald-600 bg-emerald-50 opacity-70' : wrong === r ? 'border-rose-500 bg-rose-50' : 'border-black/10 bg-white')}>{r}</motion.button> })}</div>
        <p className="col-span-2 text-xs text-ink/60">Tap a phrase on the left, then its paraphrase on the right. Mistakes so far: {miss}</p>
      </div>
    )
  } else if (quiz.kind === 'dictation') {
    const it = quiz.items[i], ok = norm(typed) === norm(it.answer), accent = ACCENTS[i % ACCENTS.length]
    canNext = checked
    body = (
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3"><Pill variant="coral" onClick={() => { stopSpeaking(); speak(it.say, { accent, rate: 0.92 }) }}><Volume2 size={16} {...ICON} /> Play audio</Pill><span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold">Accent: {accent}</span></div>
        {!ttsSupported() && <p className="rounded-2xl bg-coral/15 p-3 text-sm">Audio needs a browser with speech synthesis (Chrome, Edge, Safari or Firefox).</p>}
        <form onSubmit={(e) => { e.preventDefault(); if (!checked && typed.trim()) { setChecked(true); award(ok ? 1 : 0, 1) } }} className="grid gap-2">
          <label className="text-sm font-bold" htmlFor="dict">{it.label}</label>
          <input id="dict" value={typed} onChange={(e) => setTyped(e.target.value)} disabled={checked} autoComplete="off" spellCheck={false} className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-lg font-semibold" placeholder="Type what you hear" />
          {!checked && <Pill type="submit" disabled={!typed.trim()}>Check</Pill>}
        </form>
        {checked && <p className={cx('rounded-[20px] p-3 text-sm', ok ? 'bg-emerald-50' : 'bg-rose-50')}>{ok ? '✓ Correct.' : <>✗ Answer: <b>{it.answer}</b>.</>} {it.hint}</p>}
      </div>
    )
  } else {
    const it = quiz.items[i], ok = built.join(' ') === it.chunks.join(' ')
    canNext = checked
    body = (
      <div className="grid gap-3">
        <div className="rounded-[20px] bg-white p-4 text-sm"><div className="text-xs font-bold text-ink/50">BAND 5</div><p>{it.a}</p><p>{it.b}</p></div>
        <div className="text-sm font-bold">Target structure: <span className="rounded-full bg-ink px-3 py-1 text-xs text-white">{it.target}</span></div>
        <div className="min-h-16 rounded-[20px] border-2 border-dashed border-ink/30 bg-white/60 p-3" aria-label="Your sentence">{built.length === 0 && <span className="text-sm text-ink/40">Tap the chunks below in the right order…</span>}<div className="flex flex-wrap gap-2">{built.map((c) => <motion.button layout key={c} disabled={checked} onClick={() => setBuilt(built.filter((x) => x !== c))} className="min-h-10 rounded-full bg-ink px-4 text-sm font-semibold text-white">{c}</motion.button>)}</div></div>
        <div className="flex flex-wrap gap-2">{chunks.filter((c) => !built.includes(c)).map((c) => <motion.button layout key={c} onClick={() => setBuilt([...built, c])} className="min-h-10 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold">{c}</motion.button>)}</div>
        {!checked ? <Pill disabled={built.length !== it.chunks.length} onClick={() => { setChecked(true); award(ok ? 1 : 0, 1) }}>Check sentence</Pill>
          : <p className={cx('rounded-[20px] p-3 text-sm', ok ? 'bg-emerald-50' : 'bg-rose-50')}>{ok ? '✓ ' : '✗ '}<b>{it.chunks.join(' ')}</b><br />{it.note}</p>}
      </div>
    )
  }
  return (
    <Sheet onClose={onClose} wide>
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-3"><div><Tag className="bg-ink text-white">{quiz.tag}</Tag><h2 className="mt-2 text-xl font-bold tracking-tight">{quiz.title}</h2></div><CircleBtn label="Close quiz" onClick={onClose} icon={<X size={18} {...ICON} />} /></div>
        {!done && <div className="mb-4 flex items-center gap-3"><div className="hatch h-2.5 flex-1 overflow-hidden rounded-full bg-black/5"><motion.div className="h-full rounded-full bg-coral" animate={{ width: `${(i / total) * 100}%` }} transition={spring} /></div><span className="text-xs font-bold tabnum">{i + 1}/{total}</span></div>}
        <AnimatePresence mode="wait"><motion.div key={done ? 'done' : i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.16 }}>{body}</motion.div></AnimatePresence>
        {!done && <div className="mt-5 flex justify-end"><Pill disabled={!canNext} onClick={next}>{i + 1 >= total ? 'See score' : 'Next'}</Pill></div>}
      </div>
    </Sheet>
  )
}

function Deck() {
  const { deck, reviewCard, addCard, removeCard } = useStore()
  const [flip, setFlip] = useState(false)
  const [adding, setAdding] = useState(false)
  const [front, setFront] = useState(''), [back, setBack] = useState('')
  const [all, setAll] = useState(false)
  const due = deck.filter((c) => c.due <= Date.now()).sort((a, b) => a.due - b.due)
  const card = due[0]
  const grades: [Grade, string][] = [['again', 'bg-mint'], ['hard', 'bg-mint'], ['good', 'bg-forest text-white'], ['easy', 'bg-mint']]
  return (
    <section id="deck" className="scroll-mt-24">
      <SectionTitle right={<div className="flex gap-2"><Pill variant="light" onClick={() => setAdding(!adding)}><Plus size={16} {...ICON} /> Add card</Pill></div>}>Band 8+ Lexical Deck & Mistake Bank</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {card ? (
            <Bento className="bg-lav">
              <div className="mb-3 flex items-center justify-between text-xs font-bold"><span className="rounded-full bg-white px-3 py-1">{card.source}</span><span>{due.length} due · SM-2 ease {card.ef.toFixed(2)}</span></div>
              <motion.button key={card.id + flip} initial={{ rotateX: -80, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={spring} onClick={() => setFlip(!flip)} className="grid min-h-44 w-full place-items-center rounded-[20px] bg-white p-6 text-center" aria-label={flip ? 'Hide answer' : 'Show answer'}>
                {flip ? <div><p className="text-lg font-semibold">{card.back}</p>{card.example && <p className="mt-2 text-sm italic text-ink/60">"{card.example}"</p>}</div> : <div><p className="text-3xl font-extrabold tracking-tight">{card.front}</p><p className="mt-2 text-xs font-semibold text-ink/50">Tap to reveal the meaning</p></div>}
              </motion.button>
              {flip ? <div className="mt-3 grid grid-cols-4 gap-2">{grades.map(([g, c]) => <button key={g} onClick={() => { reviewCard(card.id, g); setFlip(false) }} className={cx('min-h-14 rounded-2xl text-sm font-bold capitalize', c)}>{g}<span className="block text-[11px] font-semibold opacity-80">{previewInterval(card, g)}</span></button>)}</div>
                : <Pill className="mt-3 w-full" onClick={() => setFlip(true)}>Show answer</Pill>}
            </Bento>
          ) : <Bento className="bg-mint"><Check {...ICON} /><h3 className="mt-2 text-xl font-bold">All caught up</h3><p className="text-sm text-ink/70">No cards are due. Next review: {deck.length ? new Date(Math.min(...deck.map((c) => c.due))).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : 'add a card to begin'}.</p></Bento>}
          <AnimatePresence>{adding && (
            <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden" onSubmit={(e) => { e.preventDefault(); if (front.trim() && back.trim()) { addCard(front.trim(), back.trim(), 'My cards'); setFront(''); setBack(''); setAdding(false) } }}>
              <div className="mt-3 grid gap-2 rounded-[28px] bg-white p-4 sm:grid-cols-[1fr_2fr_auto]"><input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Word or phrase" aria-label="Word or phrase" className="h-11 rounded-2xl border border-black/10 px-3 text-sm" /><input value={back} onChange={(e) => setBack(e.target.value)} placeholder="Meaning or correction" aria-label="Meaning" className="h-11 rounded-2xl border border-black/10 px-3 text-sm" /><Pill type="submit">Save</Pill></div>
            </motion.form>)}</AnimatePresence>
        </div>
        <Bento className="bg-white">
          <div className="grid grid-cols-3 gap-2 text-center">{[[deck.length, 'cards'], [due.length, 'due now'], [deck.filter((c) => c.interval >= 21).length, 'mastered']].map(([n, l]) => <div key={l} className="rounded-[20px] bg-cream p-3"><div className="text-3xl font-extrabold tracking-tight tabnum">{n}</div><div className="text-[11px] font-semibold text-ink/60">{l}</div></div>)}</div>
          <button onClick={() => setAll(!all)} className="mt-3 min-h-11 text-sm font-bold underline">{all ? 'Hide' : 'Browse'} all cards</button>
          {all && <ul className="mt-1 grid max-h-72 gap-1 overflow-y-auto text-sm">{deck.map((c) => <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl px-2 py-1 hover:bg-black/5"><span className="min-w-0 truncate"><b>{c.front}</b> <span className="text-ink/50">· {c.interval ? `${c.interval}d` : 'new'}</span></span><button aria-label={`Delete ${c.front}`} onClick={() => removeCard(c.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-coral/20"><Trash2 size={15} {...ICON} /></button></li>)}</ul>}
          <p className="mt-2 text-xs text-ink/60">Save words from the Writing Lab and paraphrases from Smart Explain — they join this deck automatically.</p>
        </Bento>
      </div>
    </section>
  )
}

export default function Practice() {
  const s = useStore()
  const [quiz, setQuiz] = useState<QuizDef | null>(null)
  const R = s.track === 'academic' ? ACADEMIC_READING : GENERAL_READING
  return (
    <div className="grid gap-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Practice</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink/70">Untimed skill practice with speed controls, seven quick-fire quiz games and your spaced-repetition deck.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {([['writing', PenLine, 'Writing Lab', 'Instant feedback on the four criteria'], ['speaking', Mic, 'Speaking Simulator', 'Cue cards with pace and pause tracking']] as const).map(([v, Icon, t, d]) => (
          <button key={v} onClick={() => s.setView(v)} className="card flex min-h-16 items-center gap-4 rounded-[24px] px-5 py-3 text-left"><Icon size={20} className="text-ink/50" {...ICON} /><span className="flex-1"><b className="block">{t}</b><span className="text-sm text-ink/55">{d}</span></span><ArrowRight size={18} className="text-ink/40" {...ICON} /></button>))}
      </div>
      <section>
        <SectionTitle right={<Pill variant="light" onClick={() => s.startExam(EXAMS.listening('practice'))}><RotateCcw size={15} {...ICON} /> All 4 parts</Pill>}>Listening practice</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{LISTENING.map((p, i) => (
          <Bento key={p.id} className={['bg-mint', 'bg-lav', 'bg-butter', 'bg-white'][i]} onClick={() => s.startExam(EXAMS.part('listening', i, p.title))}>
            <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><Headphones size={18} {...ICON} /></span><span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-sm">{p.accent}</span></div>
            <h3 className="mt-3 font-bold leading-snug">{p.title}</h3><p className="mt-1 text-xs font-semibold text-ink/60">{[...new Set(p.groups.map((g) => TYPE_LABEL[g.type]))].join(' · ')}</p>
            <p className="mt-2 text-xs text-ink/60">0.85× / 1.0× / 1.15× speed · replay allowed</p>
          </Bento>))}</div>
      </section>
      <section>
        <SectionTitle right={<Pill variant="light" onClick={() => s.startExam(EXAMS.reading('practice'))}><RotateCcw size={15} {...ICON} /> All 40 questions</Pill>}>{s.track === 'academic' ? 'Academic' : 'General Training'} Reading practice</SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">{R.map((p, i) => (
          <Bento key={p.id} className={['bg-lav', 'bg-butter', 'bg-mint'][i]} onClick={() => s.startExam(EXAMS.part('reading', i, p.title))}>
            <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><BookOpen size={18} {...ICON} /></span><span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-sm">{p.groups.reduce((a, g) => a + g.qs.length, 0)} questions</span></div>
            <h3 className="mt-3 text-lg font-bold leading-snug">{p.title}</h3><p className="mt-1 text-xs font-semibold text-ink/60">{[...new Set(p.groups.map((g) => TYPE_LABEL[g.type]))].join(' · ')}</p>
          </Bento>))}</div>
      </section>
      <section>
        <SectionTitle>Resources & Quiz Hub</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{QUIZZES.map((q, i) => (
          <Bento key={q.id} className={q.color} onClick={() => setQuiz(q)}>
            <div className="flex items-start justify-between"><Tag i={i} className={q.color.includes('coral') ? 'bg-white text-ink' : 'bg-white text-ink'}>{q.tag}</Tag><span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-ink">{s.quizBest[q.id] != null ? `Best ${s.quizBest[q.id]}%` : 'New'}</span></div>
            <h3 className="mt-4 text-lg font-bold leading-snug">{q.title}</h3><p className="mt-1 text-sm opacity-80">{q.blurb}</p>
            <div className="mt-4 flex items-center justify-between"><span className="text-xs font-bold opacity-70">{q.kind === 'pairs' ? `${q.sets.length} rounds` : `${q.items.length} questions`}</span><CircleBtn label={`Play ${q.title}`} onClick={() => setQuiz(q)} /></div>
          </Bento>))}</div>
      </section>
      <Deck />
      <AnimatePresence>{quiz && <QuizRunner key={quiz.id} quiz={quiz} onClose={() => { stopSpeaking(); setQuiz(null) }} />}</AnimatePresence>
    </div>
  )
}
