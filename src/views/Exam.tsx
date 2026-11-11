import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Eye, EyeOff, Flag, Moon, Pause, Play, Sparkles, Sun, Type, X, ChevronRight, Lock, BookmarkPlus, Check } from 'lucide-react'
import type { Accent, Group, Q, QType, Skill } from '../types'
import { TYPE_LABEL } from '../types'
import { LISTENING } from '../data/listening'
import { ACADEMIC_READING, GENERAL_READING } from '../data/reading'
import { LETTERS, TASK1, TASK2 } from '../data/writing'
import { overallBand, rawToBand, roundHalf, type SpeakingScore } from '../lib/engines'
import { analyze, countWords } from '../lib/writingAnalyzer'
import { speak, stopSpeaking, ttsSupported, voiceInfo } from '../lib/speech'
import { useStore, type ExamConfig, type Section } from '../store'
import { AnnotatedText, GroupView, ParaHeadingSlot, displayAnswer, qAnswered, qCorrect, scoreGroups, useAnnotator, useHeld, type Annotations, type Answers } from '../components/Questions'
import { Task1Chart } from '../components/Charts'
import { ICON, cx, fmtBand, spring } from '../components/ui'
import { SpeakingRunner } from './Speaking'

interface Unit { id: string; title: string; groups: Group[]; src: number }
const FONT = { Standard: 16, Large: 18.5, 'Extra Large': 21.5 } as const
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`

function unitsOf(sec: Section, track: 'academic' | 'general'): Unit[] {
  if (sec.kind === 'listening') return sec.parts.map((p) => ({ id: LISTENING[p].id, title: LISTENING[p].title, src: p, groups: LISTENING[p].groups.filter((g) => !sec.filter || sec.filter.includes(g.type)) })).filter((u) => u.groups.length)
  if (sec.kind === 'reading') { const R = track === 'academic' ? ACADEMIC_READING : GENERAL_READING; return sec.passages.map((p) => ({ id: R[p].id, title: R[p].title, src: p, groups: R[p].groups.filter((g) => !sec.filter || sec.filter.includes(g.type)) })).filter((u) => u.groups.length) }
  return []
}

/* ───────── Listening audio (speech synthesis, sentence by sentence) ───────── */
function useListeningAudio(parts: number[], strict: boolean) {
  const [pos, setPos] = useState<{ p: number; s: number }>({ p: 0, s: 0 })
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)
  const [rate, setRate] = useState(1)
  const token = useRef(0), rateRef = useRef(1)
  rateRef.current = rate
  const playFrom = (p: number, s: number) => {
    stopSpeaking(); const my = ++token.current
    setPlaying(true); setStarted(true); setDone(false)
    const step = (pi: number, si: number) => {
      if (my !== token.current) return
      const part = LISTENING[parts[pi]]
      if (!part) { setPlaying(false); setDone(true); return }
      if (si >= part.segs.length) { setTimeout(() => step(pi + 1, 0), 900); return }
      setPos({ p: pi, s: si })
      const speakers = [...new Set(part.segs.map((x) => x.sp))]
      speak(part.segs[si].text, { accent: part.accent, rate: rateRef.current, pitch: [1, 1.3, 0.75][speakers.indexOf(part.segs[si].sp) % 3], onend: () => setTimeout(() => step(pi, si + 1), 220) })
    }
    step(p, s)
  }
  const pause = () => { token.current++; stopSpeaking(); setPlaying(false) }
  useEffect(() => () => { token.current++; stopSpeaking() }, [])
  return { pos, playing, done, started, rate, setRate, playFrom, pause, toggle: () => (playing ? (strict ? undefined : pause()) : playFrom(pos.p, pos.s)) }
}
function AudioBar({ audio, parts, strict, unitIdx }: { audio: ReturnType<typeof useListeningAudio>; parts: number[]; strict: boolean; unitIdx: number }) {
  const part = LISTENING[parts[audio.pos.p]] || LISTENING[parts[0]]
  const info = voiceInfo(part.accent)
  const progress = audio.done ? 1 : (audio.pos.p + audio.pos.s / part.segs.length) / parts.length
  return (
    <div className="panel mb-4 rounded-2xl border p-3">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => (strict ? (!audio.started && audio.playFrom(0, 0)) : audio.playing ? audio.pause() : audio.playFrom(audio.done ? unitIdx : audio.started ? audio.pos.p : unitIdx, audio.done || !audio.started ? 0 : audio.pos.s))} disabled={strict && audio.started}
          aria-label={audio.playing ? 'Pause audio' : 'Play audio'} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--ex-accent)] text-[var(--ex-accent-fg)] disabled:opacity-60">
          {strict && audio.started ? <Lock size={17} {...ICON} /> : audio.playing ? <Pause size={18} {...ICON} /> : <Play size={18} {...ICON} />}
        </button>
        <div className="min-w-40 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[.85em] font-semibold"><span>{audio.done ? 'Recording finished' : audio.started ? `Playing: ${part.title}` : strict ? 'The recording is played ONCE only. Press play when you are ready.' : 'Press play to start the recording'}</span>
            <span className="rounded-full border border-[var(--ex-border)] px-2 py-0.5 text-[.8em]">Accent: {part.accent}</span></div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--ex-border)]"><div className="h-full bg-[var(--ex-accent)] transition-all" style={{ width: `${progress * 100}%` }} /></div>
        </div>
        {!strict && <div className="flex gap-1" role="group" aria-label="Playback speed">{[0.85, 1, 1.15].map((r) => <button key={r} onClick={() => { audio.setRate(r); if (audio.playing) setTimeout(() => audio.playFrom(audio.pos.p, audio.pos.s), 0) }} className={cx('h-9 rounded-full border px-3 text-[.8em] font-bold', audio.rate === r ? 'border-transparent bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'border-[var(--ex-border)]')}>{r.toFixed(2)}×</button>)}</div>}
      </div>
      {!ttsSupported() ? <p className="mt-2 text-[.8em] font-semibold text-rose-600">This browser has no speech synthesis, so the recording cannot be played. Open the transcript after submitting, or use Chrome, Edge or Safari.</p>
        : !info.exact && <p className="mt-2 text-[.78em] text-[var(--ex-sub)]">Your device has no {part.accent} voice installed, so "{info.name}" is used instead. Accents depend on the voices your browser provides.</p>}
    </div>
  )
}

/* ───────── main exam shell ───────── */
export default function Exam({ config }: { config: ExamConfig }) {
  const st = useStore()
  const track = st.track
  const strict = config.mode === 'exam'
  const [secIdx, setSecIdx] = useState(0)
  const [phase, setPhase] = useState<'run' | 'results'>('run')
  const [answers, setAnswers] = useState<Record<number, Answers>>({})
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [cur, setCur] = useState<number>(0)
  const [unit, setUnit] = useState(0)
  const [dark, setDark] = useState(false)
  const [font, setFont] = useState<keyof typeof FONT>('Standard')
  const [hideTime, setHideTime] = useState(false)
  const [left, setLeft] = useState(config.sections[0].kind === 'speaking' ? 0 : (config.sections[0] as any).minutes * 60)
  const [confirm, setConfirm] = useState(false)
  const [ann, setAnn] = useState<Annotations>({})
  const [essay, setEssay] = useState<{ t1: string; t2: string }>({ t1: '', t2: '' })
  const [wTask, setWTask] = useState<'t1' | 't2'>('t1')
  const [speaking, setSpeaking] = useState<SpeakingScore | null>(null)
  const [mobilePane, setMobilePane] = useState<'text' | 'questions'>('text')
  const startedAt = useRef(Date.now())
  const { held, setHeld } = useHeld()
  const sec = config.sections[secIdx]
  const units = useMemo(() => unitsOf(sec, track), [sec, track])
  const a = answers[secIdx] || {}
  const setA = (n: number, v: string) => setAnswers((x) => ({ ...x, [secIdx]: { ...(x[secIdx] || {}), [n]: v } }))
  const listenParts = sec.kind === 'listening' ? units.map((u) => u.src) : []
  const audio = useListeningAudio(listenParts, strict)
  const annot = useAnnotator(ann, setAnn, phase === 'run')
  const allQ = units.flatMap((u, ui) => u.groups.flatMap((g) => g.qs.map((q) => ({ q, g, ui }))))
  const t1 = sec.kind === 'writing' && sec.t1 ? TASK1.find((t) => t.id === sec.t1) || LETTERS.find((l) => l.id === sec.t1) : undefined
  const t2 = sec.kind === 'writing' && sec.t2 ? TASK2.find((t) => t.id === sec.t2) : undefined

  useEffect(() => { setUnit(0); setCur(allQ[0]?.q.n || 0); setWTask(sec.kind === 'writing' && !sec.t1 ? 't2' : 't1'); if (sec.kind !== 'speaking') setLeft(sec.minutes * 60) }, [secIdx]) // eslint-disable-line
  useEffect(() => { if (strict && sec.kind === 'listening' && audio.started && !audio.done) setUnit(audio.pos.p) }, [audio.pos.p]) // eslint-disable-line
  useEffect(() => {
    if (phase !== 'run' || !strict || sec.kind === 'speaking') return
    if (left <= 0) { advance(); return }
    const t = setTimeout(() => setLeft((l: number) => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left, phase, secIdx]) // eslint-disable-line

  const goQ = (n: number) => {
    const hit = allQ.find((x) => x.q.n === n); if (!hit) return
    setUnit(hit.ui); setCur(n); setMobilePane('questions')
    setTimeout(() => document.getElementById(`q-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
  }
  function advance() {
    setConfirm(false); stopSpeaking(); audio.pause()
    if (secIdx + 1 < config.sections.length) setSecIdx(secIdx + 1)
    else finish()
  }
  const [result, setResult] = useState<null | { bands: Partial<Record<Skill, number>>; raw: Partial<Record<'listening' | 'reading', [number, number]>>; overall?: number; writing?: { t1?: number; t2?: number } }>(null)
  function finish(sp: SpeakingScore | null = speaking) {
    const bands: Partial<Record<Skill, number>> = {}, raw: Partial<Record<'listening' | 'reading', [number, number]>> = {}
    const types: Partial<Record<QType, { correct: number; total: number }>> = {}
    let writing: { t1?: number; t2?: number } | undefined
    config.sections.forEach((s, i) => {
      if (s.kind === 'listening' || s.kind === 'reading') {
        const sc = scoreGroups(unitsOf(s, track).flatMap((u) => u.groups), answers[i] || {})
        raw[s.kind] = [sc.correct, sc.total]
        bands[s.kind] = rawToBand(s.kind, track, Math.round((sc.correct / Math.max(1, sc.total)) * 40))
        for (const [k, v] of Object.entries(sc.byType) as [QType, { correct: number; total: number }][]) { const o = (types[k] ||= { correct: 0, total: 0 }); o.correct += v.correct; o.total += v.total }
        st.touch(s.kind)
      } else if (s.kind === 'writing') {
        writing = {}
        if (s.t1) { const p = TASK1.find((t) => t.id === s.t1), l = LETTERS.find((x) => x.id === s.t1); writing.t1 = analyze(essay.t1, { task: l ? 'letter' : 'task1', prompt: (p || l)!.prompt }).bands.overall; st.saveEssay(s.t1, { text: essay.t1, band: writing.t1 }) }
        if (s.t2) { writing.t2 = analyze(essay.t2, { task: 'task2', prompt: TASK2.find((t) => t.id === s.t2)!.prompt }).bands.overall; st.saveEssay(s.t2, { text: essay.t2, band: writing.t2 }) }
        bands.writing = writing.t1 != null && writing.t2 != null ? roundHalf((writing.t1 + 2 * writing.t2) / 3) : (writing.t1 ?? writing.t2)!
        st.touch('writing')
      } else if (sp) bands.speaking = sp.overall
    })
    const overall = bands.listening != null && bands.reading != null && bands.writing != null && bands.speaking != null ? overallBand(bands.listening, bands.reading, bands.writing, bands.speaking) : undefined
    st.recordTypes(types); if (config.moduleId) st.touch(config.moduleId)
    st.saveAttempt({ title: config.title, kind: config.kind, bands, raw, overall })
    st.addXp(config.kind === 'full' ? 400 : config.kind === 'drill' ? 80 : 180)
    st.logMinutes((Date.now() - startedAt.current) / 60000)
    setResult({ bands, raw, overall, writing }); setPhase('results'); setSecIdx(0)
  }

  const answeredCount = allQ.filter((x) => qAnswered(x.g, x.q, a)).length
  const warn = strict && left <= 600 && phase === 'run'
  const R = track === 'academic' ? ACADEMIC_READING : GENERAL_READING

  /* ───── results & review ───── */
  if (phase === 'results' && result) return <Review config={config} result={result} answers={answers} essay={essay} onExit={st.endExam} dark={dark} font={FONT[font]} />

  const u = units[unit]
  const headingGroup = u?.groups.find((g) => g.type === 'heading')
  const isLast = secIdx + 1 >= config.sections.length

  return (
    <div className={cx('exam fixed inset-0 z-40 flex flex-col', dark && 'exam-dark')} style={{ fontSize: FONT[font] }}>
      {/* top bar */}
      <header className="panel flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2 text-[14px] sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{st.name || 'Candidate'} · <span className="font-semibold opacity-70">No. 004512</span></div>
          <div className="truncate text-xs opacity-70">{config.title} — {sec.kind[0].toUpperCase() + sec.kind.slice(1)}{config.sections.length > 1 ? ` (section ${secIdx + 1} of ${config.sections.length})` : ''}{!strict && ' · Practice mode'}</div>
        </div>
        {strict && sec.kind !== 'speaking' && (
          <div className={cx('flex items-center gap-2 rounded-full border px-3 py-1.5 font-bold tabnum', warn ? 'pulse-warn border-rose-500 text-rose-600' : 'border-[var(--ex-border)]', left <= 300 && 'bg-rose-600 !text-white')} role="timer" aria-live={left === 600 || left === 300 ? 'assertive' : 'off'}>
            <Clock size={16} {...ICON} />{hideTime ? (left <= 600 ? `${Math.ceil(left / 60)} min left` : 'Timer hidden') : left > 600 ? `${Math.ceil(left / 60)} minutes left` : mmss(left)}
            <button onClick={() => setHideTime(!hideTime)} aria-label={hideTime ? 'Show timer' : 'Hide timer'} className="grid h-7 w-7 place-items-center rounded-full">{hideTime ? <Eye size={15} {...ICON} /> : <EyeOff size={15} {...ICON} />}</button>
          </div>
        )}
        <button onClick={() => setDark(!dark)} aria-label="Toggle high-contrast theme" title="High-contrast theme" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--ex-border)]">{dark ? <Sun size={17} {...ICON} /> : <Moon size={17} {...ICON} />}</button>
        <label className="flex items-center gap-1.5 rounded-full border border-[var(--ex-border)] pl-3"><Type size={15} {...ICON} /><span className="sr-only">Text size</span>
          <select value={font} onChange={(e) => setFont(e.target.value as keyof typeof FONT)} className="h-10 rounded-full !border-0 bg-transparent pr-2 text-sm font-semibold">{Object.keys(FONT).map((f) => <option key={f}>{f}</option>)}</select></label>
        <button onClick={() => setConfirm(true)} className="h-10 rounded-full bg-[var(--ex-accent)] px-4 text-sm font-bold text-[var(--ex-accent-fg)]">{sec.kind === 'speaking' ? 'End test' : isLast ? (strict ? 'Submit Test' : 'Check answers') : 'Finish section'}</button>
        <button onClick={() => { stopSpeaking(); st.endExam() }} aria-label="Exit without saving" title="Exit without saving" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--ex-border)]"><X size={17} {...ICON} /></button>
      </header>

      {/* workspace */}
      <main className="min-h-0 flex-1" onMouseUp={annot.onUp} onTouchEnd={annot.onUp}>
        {sec.kind === 'listening' && u && (
          <div className="mx-auto h-full max-w-4xl overflow-y-auto p-4 sm:p-6">
            <AudioBar audio={audio} parts={listenParts} strict={strict} unitIdx={unit} />
            <h2 className="text-[1.2em] font-bold">{u.title}</h2>
            <p className="mb-5 text-[.92em] text-[var(--ex-sub)]"><AnnotatedText id={`ctx-${u.id}`} text={LISTENING[u.src].context} ann={ann} /></p>
            {u.groups.map((g) => <GroupView key={g.title} group={g} answers={a} set={setA} held={held} setHeld={setHeld} ann={ann} onFocusQ={setCur} current={cur} />)}
          </div>
        )}
        {sec.kind === 'reading' && u && (
          <div className="flex h-full flex-col md:flex-row">
            <div className="flex gap-1 border-b border-[var(--ex-border)] p-2 md:hidden">{(['text', 'questions'] as const).map((p) => <button key={p} onClick={() => setMobilePane(p)} className={cx('h-10 flex-1 rounded-full text-sm font-bold', mobilePane === p ? 'bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : '')}>{p === 'text' ? 'Passage' : 'Questions'}</button>)}</div>
            <article className={cx('min-h-0 flex-1 overflow-y-auto border-[var(--ex-border)] p-4 sm:p-6 md:border-r', mobilePane !== 'text' && 'hidden md:block')}>
              <div className="text-[.8em] font-bold uppercase tracking-wider text-[var(--ex-sub)]">{R[u.src].subtitle}</div>
              <h2 className="mb-4 text-[1.5em] font-extrabold tracking-tight">{u.title}</h2>
              {R[u.src].paras.map((p) => (
                <div key={p.id} className="mb-4">
                  {p.label && <h3 className="mb-2 mt-6 text-[1.1em] font-bold">{p.label}</h3>}
                  {headingGroup && <ParaHeadingSlot group={headingGroup} para={p.id} answers={a} set={setA} held={held} setHeld={setHeld} />}
                  <p className="leading-[1.75]"><b className="mr-2">{p.id}</b><AnnotatedText id={`${u.id}-${p.id}`} text={p.text} ann={ann} /></p>
                </div>
              ))}
            </article>
            <div className={cx('min-h-0 flex-1 overflow-y-auto p-4 sm:p-6', mobilePane !== 'questions' && 'hidden md:block')}>
              {u.groups.map((g) => <GroupView key={g.title} group={g} answers={a} set={setA} held={held} setHeld={setHeld} ann={ann} onFocusQ={setCur} current={cur} />)}
            </div>
          </div>
        )}
        {sec.kind === 'writing' && (() => {
          const isT1 = wTask === 't1' && t1
          const p = isT1 ? t1! : t2!
          const min = isT1 ? 150 : 250, text = isT1 ? essay.t1 : essay.t2, wc = countWords(text)
          return (
            <div className="flex h-full flex-col md:flex-row">
              <article className="min-h-0 flex-1 overflow-y-auto border-[var(--ex-border)] p-4 sm:p-6 md:border-r">
                <h2 className="mb-1 text-[1.2em] font-bold">Writing Task {isT1 ? 1 : 2}</h2>
                <p className="mb-3 text-[.9em] text-[var(--ex-sub)]">You should spend about {isT1 ? 20 : 40} minutes on this task. Write at least {min} words.</p>
                <div className="panel rounded-2xl border p-4 font-semibold leading-relaxed"><AnnotatedText id={`w-${p.id}`} text={p.prompt} ann={ann} />{'bullets' in p && <ul className="mt-2 list-disc pl-5 font-normal">{p.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}</div>
                {'kind' in p && <div className="panel mt-4 rounded-2xl border p-4"><Task1Chart kind={p.kind} /></div>}
              </article>
              <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
                <textarea value={text} onChange={(e) => setEssay({ ...essay, [isT1 ? 't1' : 't2']: e.target.value })} spellCheck={false} aria-label={`Writing Task ${isT1 ? 1 : 2} answer`} placeholder="Type your answer here…" className="min-h-64 flex-1 resize-none rounded-2xl p-4 leading-relaxed" />
                <div className="mt-2 flex items-center justify-between text-[.9em] font-bold"><span>Word count: <span className={wc < min ? 'text-rose-600' : 'text-emerald-600'}>{wc}</span></span><span className="text-[var(--ex-sub)]">Minimum {min}</span></div>
              </div>
            </div>
          )
        })()}
        {sec.kind === 'speaking' && <div className="h-full overflow-y-auto bg-canvas p-4 text-ink sm:p-6" style={{ fontSize: 16 }}><div className="mx-auto max-w-5xl"><SpeakingRunner cueId={sec.cue} mode="full" onFinish={(s) => { setSpeaking(s); finish(s) }} /></div></div>}
      </main>

      {/* bottom palette */}
      {sec.kind !== 'speaking' && (
        <footer className="panel border-t px-3 py-2 text-[13px] sm:px-5">
          {sec.kind === 'writing' ? (
            <div className="flex gap-2">{([['t1', t1], ['t2', t2]] as const).filter(([, p]) => p).map(([k]) => { const wc = countWords(essay[k]); return <button key={k} onClick={() => setWTask(k)} className={cx('h-11 rounded-xl border px-4 font-bold', wTask === k ? 'border-transparent bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'border-[var(--ex-border)]')}>Task {k[1]} · {wc} words</button> })}</div>
          ) : (
            <div className="flex items-center gap-3">
              <label className="flex shrink-0 items-center gap-2 font-semibold"><input type="checkbox" className="h-5 w-5 accent-[#EC6B78]" checked={!!flags[`${secIdx}-${cur}`]} onChange={(e) => setFlags({ ...flags, [`${secIdx}-${cur}`]: e.target.checked })} /><Flag size={15} {...ICON} /><span className="hidden sm:inline">Review Q{cur}</span></label>
              <div className="flex flex-1 gap-4 overflow-x-auto no-scrollbar" role="navigation" aria-label="Question palette">
                {units.map((un, ui) => (
                  <div key={un.id} className="flex shrink-0 items-center gap-1">
                    <button onClick={() => { setUnit(ui); setMobilePane('text') }} className={cx('mr-1 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-bold', ui === unit ? 'bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'opacity-70')}>{sec.kind === 'listening' ? `Part ${un.src + 1}` : track === 'academic' ? `Passage ${un.src + 1}` : `Section ${un.src + 1}`}</button>
                    {un.groups.flatMap((g) => g.qs.map((q) => { const done = qAnswered(g, q, a), fl = flags[`${secIdx}-${q.n}`]; return (
                      <button key={q.n} onClick={() => goQ(q.n)} aria-label={`Question ${q.n}${done ? ', answered' : ', unanswered'}${fl ? ', flagged for review' : ''}`}
                        className={cx('relative grid h-9 min-w-9 place-items-center border px-1 font-bold tabnum', fl ? 'rounded-full' : 'rounded-lg', cur === q.n ? 'border-2 border-[var(--ex-accent)] ring-2 ring-[var(--ex-accent)]/30' : 'border-[var(--ex-border)]', done ? 'bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'bg-transparent')}>
                        {q.n}{fl && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-white bg-[#EC6B78]" />}
                      </button>) }))}
                  </div>
                ))}
              </div>
              <span className="hidden shrink-0 font-semibold opacity-70 lg:inline">{answeredCount}/{allQ.length} answered</span>
            </div>
          )}
        </footer>
      )}
      {annot.popover}
      <AnimatePresence>
        {confirm && (
          <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(false)}>
            <motion.div role="alertdialog" aria-modal="true" initial={{ scale: 0.94 }} animate={{ scale: 1 }} transition={spring} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-[28px] bg-white p-6 text-ink" style={{ fontSize: 16 }}>
              <h3 className="text-xl font-bold">{isLast ? 'Submit your test?' : 'Finish this section?'}</h3>
              <p className="mt-2 text-sm text-ink/70">{sec.kind === 'writing' ? `Task 1: ${countWords(essay.t1)} words · Task 2: ${countWords(essay.t2)} words.` : sec.kind === 'speaking' ? 'Your speaking answers so far will not be scored.' : `${allQ.length - answeredCount} of ${allQ.length} questions are unanswered.`} {!isLast && 'You cannot return to this section.'}</p>
              <div className="mt-5 flex justify-end gap-2"><button onClick={() => setConfirm(false)} className="h-11 rounded-full bg-black/5 px-5 text-sm font-semibold">Keep working</button><button onClick={advance} className="h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white">{isLast ? 'Submit' : 'Next section'}</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ───────── review mode: results, Smart Explain, transcript sync ───────── */
function Review({ config, result, answers, essay, onExit, dark, font }: { config: ExamConfig; result: { bands: Partial<Record<Skill, number>>; raw: Partial<Record<'listening' | 'reading', [number, number]>>; overall?: number; writing?: { t1?: number; t2?: number } }; answers: Record<number, Answers>; essay: { t1: string; t2: string }; onExit: () => void; dark: boolean; font: number }) {
  const { track, addCard, setView } = useStore()
  const reviewable = config.sections.map((s, i) => ({ s, i })).filter((x) => x.s.kind === 'listening' || x.s.kind === 'reading')
  const [tab, setTab] = useState<number | 'summary'>('summary')
  const [unit, setUnit] = useState(0)
  const [explain, setExplain] = useState<{ q: Q; g: Group } | null>(null)
  const [playing, setPlaying] = useState<number | null>(null)
  const [saved, setSaved] = useState<string[]>([])
  const srcRef = useRef<HTMLDivElement>(null)
  const token = useRef(0)
  const sec = typeof tab === 'number' ? config.sections[tab] : null
  const units = sec ? unitsOf(sec, track) : []
  const u = units[unit]
  const a = typeof tab === 'number' ? answers[tab] || {} : {}
  const R = track === 'academic' ? ACADEMIC_READING : GENERAL_READING
  useEffect(() => { if (explain) setTimeout(() => srcRef.current?.querySelector('[data-ev]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80) }, [explain])
  useEffect(() => () => { token.current++; stopSpeaking() }, [])
  const playSeg = (accent: Accent, segs: { sp: string; text: string }[], from: number) => {
    stopSpeaking(); const my = ++token.current
    const sp = [...new Set(segs.map((x) => x.sp))]
    const step = (i: number) => { if (my !== token.current) return; if (i >= segs.length) { setPlaying(null); return } setPlaying(i); speak(segs[i].text, { accent, pitch: [1, 1.3, 0.75][sp.indexOf(segs[i].sp) % 3], onend: () => setTimeout(() => step(i + 1), 200) }) }
    step(from)
  }
  const stamp = (segs: { text: string }[], i: number) => mmss(Math.round(segs.slice(0, i).reduce((x, s) => x + s.text.split(' ').length, 0) / 2.5))
  const saveWord = (q: Q) => { const w = q.pp.replace(/[()…]/g, '').trim(); if (addCard(w, `IELTS paraphrase of: "${q.qp}"`, 'Mistake bank', q.ev)) setSaved([...saved, w]); else setSaved([...saved, w]) }

  return (
    <div className={cx('exam fixed inset-0 z-40 flex flex-col', dark && 'exam-dark')} style={{ fontSize: font }}>
      <header className="panel flex flex-wrap items-center gap-2 border-b px-3 py-2 text-[14px] sm:px-5">
        <div className="mr-auto font-bold">{config.title} — Review</div>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          <button onClick={() => { setTab('summary'); setExplain(null) }} className={cx('h-10 rounded-full px-4 text-sm font-bold', tab === 'summary' ? 'bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'border border-[var(--ex-border)]')}>Results</button>
          {reviewable.map(({ s, i }) => <button key={i} onClick={() => { setTab(i); setUnit(0); setExplain(null); token.current++; stopSpeaking(); setPlaying(null) }} className={cx('h-10 whitespace-nowrap rounded-full px-4 text-sm font-bold', tab === i ? 'bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'border border-[var(--ex-border)]')}>{s.kind === 'listening' ? 'Listening review' : 'Reading review'}</button>)}
        </div>
        <button onClick={onExit} className="h-10 rounded-full bg-[var(--ex-accent)] px-4 text-sm font-bold text-[var(--ex-accent-fg)]">Done</button>
      </header>
      {tab === 'summary' ? (
        <div className="min-h-0 flex-1 overflow-y-auto bg-canvas p-4 text-ink sm:p-8" style={{ fontSize: 16 }}>
          <div className="mx-auto grid max-w-4xl gap-4">
            <div className="rounded-[32px] bg-coral p-6 text-white sm:p-8">
              <div className="text-sm font-semibold opacity-90">{result.overall != null ? 'Overall band score' : 'Section results'}</div>
              <div className="text-5xl font-extrabold tracking-tight">{result.overall != null ? fmtBand(result.overall) : Object.values(result.bands).map((b) => fmtBand(b!)).join(' · ')}</div>
              <p className="mt-2 max-w-xl text-sm opacity-95">{result.overall != null ? 'Calculated with the official rounding rule: the mean of the four skills, rounded to the nearest half band.' : config.kind === 'drill' ? 'Drill scores are scaled to a 40-question paper, so treat the band as a rough indicator.' : 'Scores from shorter tests are scaled to a 40-question paper to estimate your band.'}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.entries(result.bands) as [Skill, number][]).map(([k, b], i) => (
                <div key={k} className={cx('rounded-[28px] p-5', ['bg-mint', 'bg-lav', 'bg-butter', 'bg-white'][i % 4])}>
                  <div className="text-sm font-semibold capitalize text-ink/70">{k}</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmtBand(b)}</div>
                  <div className="text-xs font-semibold text-ink/60">{k === 'listening' || k === 'reading' ? `${result.raw[k]![0]} / ${result.raw[k]![1]} correct` : k === 'writing' ? [result.writing?.t1 != null && `Task 1: ${fmtBand(result.writing.t1)}`, result.writing?.t2 != null && `Task 2: ${fmtBand(result.writing.t2)}`].filter(Boolean).join(' · ') : 'Fluency, lexis, grammar'}</div>
                </div>
              ))}
            </div>
            {result.bands.writing != null && <div className="rounded-[28px] bg-white p-5 text-sm"><b>Writing feedback:</b> your responses were saved. Open the Writing Lab for the full four-criteria diagnostic, vocabulary heatmap and one-tap upgrades. <button className="ml-1 font-bold underline" onClick={() => { onExit(); setView('writing') }}>Open Writing Lab</button>{essay.t1.length + essay.t2.length === 0 && ' (No text was written, so the band is 0.)'}</div>}
            {reviewable.length > 0 && <div className="flex flex-wrap gap-2">{reviewable.map(({ s, i }) => <button key={i} onClick={() => setTab(i)} className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white"><Sparkles size={16} {...ICON} /> Review {s.kind} with Smart Explain</button>)}</div>}
          </div>
        </div>
      ) : sec && u && (
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div ref={srcRef} className="min-h-0 flex-1 overflow-y-auto border-[var(--ex-border)] p-4 sm:p-6 md:border-r">
            {units.length > 1 && <div className="mb-3 flex gap-1 overflow-x-auto no-scrollbar">{units.map((un, ui) => <button key={un.id} onClick={() => { setUnit(ui); setExplain(null); token.current++; stopSpeaking(); setPlaying(null) }} className={cx('h-9 whitespace-nowrap rounded-full px-3 text-[.8em] font-bold', ui === unit ? 'bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'border border-[var(--ex-border)]')}>{sec.kind === 'listening' ? `Part ${un.src + 1}` : un.title}</button>)}</div>}
            <h2 className="mb-1 text-[1.3em] font-extrabold">{u.title}</h2>
            {sec.kind === 'listening' ? (
              <>
                <p className="mb-3 text-[.85em] text-[var(--ex-sub)]">Interactive transcript — tap any sentence to play the recording from that point.{playing != null && <button onClick={() => { token.current++; stopSpeaking(); setPlaying(null) }} className="ml-2 font-bold underline">Stop audio</button>}</p>
                {LISTENING[u.src].segs.map((s, i) => (
                  <button key={i} onClick={() => playSeg(LISTENING[u.src].accent, LISTENING[u.src].segs, i)} className={cx('mb-1 flex w-full gap-3 rounded-xl px-2 py-1.5 text-left leading-relaxed', playing === i && 'bg-[var(--ex-accent)]/10 ring-1 ring-[var(--ex-accent)]')}>
                    <span className="w-10 shrink-0 pt-0.5 text-[.75em] font-bold tabnum opacity-60">{stamp(LISTENING[u.src].segs, i)}</span>
                    <span><b className="mr-1.5">{s.sp}:</b><AnnotatedText id={`tr-${u.id}-${i}`} text={s.text} evidence={explain?.q.ev} /></span>
                  </button>
                ))}
              </>
            ) : R[u.src].paras.map((p) => <div key={p.id} className="mb-4">{p.label && <h3 className="mb-2 mt-5 text-[1.05em] font-bold">{p.label}</h3>}<p className="leading-[1.75]"><b className="mr-2">{p.id}</b><AnnotatedText id={`rv-${p.id}`} text={p.text} evidence={explain?.q.ev} /></p></div>)}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {u.groups.map((g) => (
              <section key={g.title} className="mb-6">
                <h3 className="mb-2 text-[1em] font-bold">{g.title} · <span className="font-semibold opacity-70">{TYPE_LABEL[g.type]}</span></h3>
                {g.qs.map((q) => {
                  const ok = qCorrect(g, q, a), open = explain?.q.n === q.n
                  const yours = g.type === 'multi' ? (a[g.qs[0].n] || '—') : a[q.n] || '—'
                  return (
                    <div key={q.n} className={cx('panel mb-2 rounded-2xl border p-3', open && 'ring-2 ring-[var(--ex-accent)]')}>
                      <div className="flex flex-wrap items-start gap-2">
                        <span className={cx('grid h-7 min-w-7 place-items-center rounded-lg px-1 text-[.8em] font-bold text-white', ok ? 'bg-emerald-600' : 'bg-rose-600')}>{q.n}</span>
                        <div className="min-w-0 flex-1 text-[.92em]"><div className="font-semibold">{q.text.replace('____', '______')}</div><div className="mt-0.5">Your answer: <b className={ok ? 'text-emerald-600' : 'text-rose-600'}>{yours}</b>{!ok && <> · Correct: <b>{displayAnswer(g, q)}</b></>}</div></div>
                        <button onClick={() => setExplain(open ? null : { q, g })} className={cx('inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[.8em] font-bold', open ? 'bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'border border-[var(--ex-border)]')}><Sparkles size={14} {...ICON} /> Smart Explain</button>
                      </div>
                      <AnimatePresence>{open && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
                          <div className="mt-3 grid gap-2 text-[.9em]">
                            <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#E6E0F8] px-3 py-1 font-semibold text-[#141416]">Question: {q.qp}</span><ChevronRight size={16} {...ICON} /><span className="rounded-full bg-[#9BE7C4] px-3 py-1 font-semibold text-[#0b3b2e]">{sec.kind === 'listening' ? 'Recording' : 'Passage'}: {q.pp}</span></div>
                            <p><b>Evidence:</b> "{q.ev}" <span className="opacity-70">(highlighted in mint on the left)</span></p>
                            <p className="rounded-xl bg-[#FFF0C2] p-3 text-[#141416]"><b>Trap:</b> {q.trap}</p>
                            <button onClick={() => saveWord(q)} disabled={saved.includes(q.pp.replace(/[()…]/g, '').trim())} className="inline-flex h-9 w-fit items-center gap-1.5 rounded-full border border-[var(--ex-border)] px-3 text-[.85em] font-bold disabled:opacity-60">{saved.includes(q.pp.replace(/[()…]/g, '').trim()) ? <><Check size={14} {...ICON} /> Saved to deck</> : <><BookmarkPlus size={14} {...ICON} /> Save paraphrase to my deck</>}</button>
                          </div>
                        </motion.div>)}</AnimatePresence>
                    </div>
                  )
                })}
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
