import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Mic, Play, Square, Volume2, ChevronRight, RotateCcw, AudioLines } from 'lucide-react'
import { CUE_CARDS, PART1 } from '../data/speaking'
import { bulletsHit, countFillers, scoreSpeaking, wpmZone, type SpeakingScore } from '../lib/engines'
import { loadAudio, saveAudio, speak, stopSpeaking, useRecorder, type RecorderResult } from '../lib/speech'
import { useStore } from '../store'
import { Bento, ICON, Meter, Pill, Ring, SectionTitle, Segmented, Tag, cx, fmtBand, spring } from '../components/ui'

type Step = { part: 1 | 2 | 3; kind: 'answer' | 'prep'; prompt: string; limit: number }
export type RunnerMode = 'full' | 'p1' | 'p2' | 'p3'

function Waveform({ analyser, active }: { analyser: React.RefObject<AnalyserNode | null>; active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const g = c.getContext('2d')!; let raf = 0
    const draw = () => {
      const W = c.width, H = c.height; g.clearRect(0, 0, W, H)
      const an = analyser.current, bars = 48
      let data: Uint8Array<ArrayBuffer> | null = null
      if (an && active) { data = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(data) }
      for (let i = 0; i < bars; i++) {
        const v = data ? data[Math.floor((i / bars) * data.length * 0.6)] / 255 : 0.04
        const h = Math.max(4, v * H * 0.95), x = (i / bars) * W + 2, w = W / bars - 4
        g.fillStyle = i % 3 === 0 ? '#EC6B78' : '#141416'
        g.beginPath(); g.roundRect(x, (H - h) / 2, w, h, w / 2); g.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [analyser, active])
  return <canvas ref={ref} width={640} height={96} className="h-20 w-full" aria-label="Live audio waveform" />
}

export function Gauge({ wpm }: { wpm: number }) {
  const clamped = Math.max(60, Math.min(200, wpm || 60))
  const angle = -90 + ((clamped - 60) / 140) * 180
  const arc = (a: number, b: number, color: string) => {
    const p = (v: number) => { const t = Math.PI * (1 - (v - 60) / 140); return `${100 + 80 * Math.cos(t)} ${100 - 80 * Math.sin(t)}` }
    return <path d={`M${p(a)} A80 80 0 0 1 ${p(b)}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="butt" />
  }
  const zone = wpmZone(wpm)
  const label = !wpm ? 'Waiting for speech' : zone === 'slow' ? 'Too slow' : zone === 'optimal' ? 'Optimal IELTS fluency zone' : zone === 'rushed' ? 'Rushed' : zone === 'fast' ? 'Slightly fast' : 'Steady — speed up a little'
  return (
    <div className="text-center">
      <svg viewBox="0 0 200 116" className="mx-auto w-full max-w-60" role="img" aria-label={`Speaking speed ${wpm} words per minute: ${label}`}>
        {arc(60, 100, '#F5B841')}{arc(100, 125, '#FFE08A')}{arc(125, 155, '#3D7A74')}{arc(155, 170, '#FFE08A')}{arc(170, 200, '#EC6B78')}
        <motion.g animate={{ rotate: angle }} transition={spring} style={{ originX: '100px', originY: '100px', transformBox: 'view-box' }}><path d="M100 100 L100 30" stroke="#141416" strokeWidth="4" strokeLinecap="round" /></motion.g>
        <circle cx="100" cy="100" r="7" fill="#141416" />
        <text x="18" y="114" fontSize="9" fill="#141416" opacity=".6">60</text><text x="170" y="114" fontSize="9" fill="#141416" opacity=".6">200</text>
      </svg>
      <div className="text-4xl font-extrabold tracking-tight tabnum">{wpm || '—'}<span className="ml-1 text-sm font-semibold opacity-60">WPM</span></div>
      <div className={cx('mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold', zone === 'optimal' && wpm ? 'bg-forest text-white' : 'bg-black/5')}>{label}</div>
    </div>
  )
}

export function SpeakingRunner({ cueId, mode, onFinish }: { cueId: string; mode: RunnerMode; onFinish?: (s: SpeakingScore) => void }) {
  const cue = CUE_CARDS.find((c) => c.id === cueId) || CUE_CARDS[0]
  const topic = PART1[CUE_CARDS.indexOf(cue) % PART1.length]
  const steps = useMemo<Step[]>(() => {
    const s: Step[] = []
    if (mode === 'full' || mode === 'p1') topic.qs.forEach((q) => s.push({ part: 1, kind: 'answer', prompt: q, limit: 30 }))
    if (mode === 'full' || mode === 'p2') { s.push({ part: 2, kind: 'prep', prompt: `Now I'm going to give you a topic. You have one minute to prepare. ${cue.title}`, limit: 60 }); s.push({ part: 2, kind: 'answer', prompt: cue.title, limit: 120 }) }
    if (mode === 'full' || mode === 'p3') cue.part3.slice(0, mode === 'p3' ? 4 : 3).forEach((q) => s.push({ part: 3, kind: 'answer', prompt: q, limit: 45 }))
    return s
  }, [cue, mode, topic])
  const [i, setI] = useState(0)
  const [started, setStarted] = useState(false)
  const [left, setLeft] = useState(steps[0].limit)
  const [notes, setNotes] = useState('')
  const [results, setResults] = useState<RecorderResult[]>([])
  const [score, setScore] = useState<SpeakingScore | null>(null)
  const [manual, setManual] = useState('')
  const rec = useRecorder()
  const { addSpeaking, addXp, touch, logMinutes } = useStore()
  const step = steps[i]
  const live = (rec.transcript + ' ' + rec.interim).trim()
  const liveWpm = rec.seconds > 4 ? Math.round((live.split(/\s+/).filter(Boolean).length / rec.seconds) * 60) : 0
  const hits = bulletsHit(live + ' ' + results.map((r) => r.transcript).join(' '), cue.bullets)
  const fillerCount = countFillers(live).reduce((a, b) => a + b.count, 0)
  const busy = useRef(false)

  const say = (t: string) => { stopSpeaking(); speak(t, { accent: 'UK', rate: 0.95 }) }
  useEffect(() => { if (started && !score) say(step.prompt); setLeft(step.limit); return stopSpeaking }, [i, started]) // eslint-disable-line

  const finishAll = async (all: RecorderResult[]) => {
    const transcript = all.map((r) => r.transcript).join(' ').trim()
    const seconds = all.reduce((a, r) => a + r.seconds, 0), pauses = all.reduce((a, r) => a + r.pauses, 0)
    const conf = all.map((r) => r.confidence).filter((c): c is number => c != null)
    const sc = scoreSpeaking({ transcript, seconds, pauses, confidence: conf.length ? conf.reduce((a, b) => a + b, 0) / conf.length : null })
    setScore(sc); setManual(transcript)
    const id = `sp-${Date.now()}`
    const longest = [...all].filter((r) => r.blob).sort((a, b) => b.seconds - a.seconds)[0]
    if (longest?.blob) await saveAudio(id, longest.blob)
    if (sc.words > 0) { addSpeaking({ id, date: Date.now(), label: mode === 'full' ? `Full test · ${cue.theme}` : `Part ${mode[1]} · ${cue.theme}`, band: sc.overall, wpm: sc.wpm, transcript, hasAudio: !!longest?.blob }); addXp(60) }
    touch('speaking'); touch('m-cue'); logMinutes(seconds / 60 + 1)
  }
  const next = async () => {
    if (busy.current) return; busy.current = true
    let all = results
    if (step.kind === 'answer') { const r = await rec.stop(); all = [...results, r]; setResults(all) }
    if (i + 1 >= steps.length) await finishAll(all)
    else {
      setI(i + 1)
      if (step.kind === 'prep') setTimeout(() => rec.start(), 150) // automatic transition into the long turn
    }
    busy.current = false
  }
  // countdown: prep always runs; answers run while recording
  useEffect(() => {
    if (!started || score) return
    if (step.kind === 'answer' && !rec.recording) return
    if (left <= 0) { next(); return }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left, started, rec.recording, step, score]) // eslint-disable-line

  if (score) {
    const final = manual !== results.map((r) => r.transcript).join(' ').trim() ? scoreSpeaking({ transcript: manual, seconds: results.reduce((a, r) => a + r.seconds, 0), pauses: score.pauses, confidence: null }) : score
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Bento className="bg-forest text-white lg:col-span-1">
          <div className="text-sm font-semibold opacity-80">Estimated Speaking band</div>
          <div className="text-5xl font-extrabold tracking-tight">{fmtBand(final.overall)}</div>
          <p className="mt-2 text-sm opacity-90">{final.words} words · {final.wpm} WPM · {final.pauses} long pauses · {final.fillerCount} fillers</p>
          <div className="mt-4 grid gap-3 rounded-[20px] bg-white/10 p-4">
            <Meter label="Fluency & Coherence" value={final.fluency} color="#F5B841" />
            <Meter label="Lexical Resource" value={final.lexical} color="#F5B841" />
            <Meter label="Grammatical Range" value={final.grammar} color="#F5B841" />
            {final.pronunciation != null ? <Meter label="Pronunciation (clarity proxy)" value={final.pronunciation} color="#F5B841" /> : <p className="text-xs opacity-80">Pronunciation: not measurable here</p>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {onFinish ? <Pill variant="light" onClick={() => onFinish(final)}>Continue <ChevronRight size={16} {...ICON} /></Pill> : <Pill variant="light" onClick={() => { setScore(null); setResults([]); setI(0); setStarted(false) }}><RotateCcw size={16} {...ICON} /> Try again</Pill>}
          </div>
        </Bento>
        <Bento className="bg-white lg:col-span-2">
          <h3 className="mb-2 text-lg font-bold">Coach notes</h3>
          <ul className="mb-4 grid gap-2 text-sm">{final.notes.map((n) => <li key={n} className="rounded-2xl bg-butter px-4 py-2.5">{n}</li>)}</ul>
          {(mode === 'full' || mode === 'p2') && <div className="mb-4"><h4 className="mb-1 text-sm font-bold">Cue card coverage</h4><ul className="grid gap-1 text-sm">{cue.bullets.map((b, k) => { const ok = bulletsHit(manual, cue.bullets)[k]; return <li key={b.text} className="flex items-center gap-2"><span className={cx('grid h-5 w-5 place-items-center rounded-full', ok ? 'bg-forest text-white' : 'bg-black/10')}>{ok && <Check size={12} {...ICON} />}</span>{b.text}</li> })}</ul></div>}
          <label className="text-sm font-bold" htmlFor="sp-tr">Transcript {!rec.srSupported && '(type what you said to analyse it)'}</label>
          <textarea id="sp-tr" value={manual} onChange={(e) => setManual(e.target.value)} rows={5} className="mt-1 w-full rounded-2xl border border-black/10 bg-cream p-3 text-sm" placeholder="Live transcription needs Chrome, Edge or Safari. You can type or correct your answer here and the scores update instantly." />
          <p className="mt-1 text-xs text-ink/60">This is a deterministic estimate from pace, pauses, fillers and vocabulary — a guide for practice, not an official score.</p>
        </Bento>
      </div>
    )
  }

  if (!started) return (
    <Bento className="bg-lav">
      <h3 className="mt-4 text-2xl font-bold tracking-tight">{mode === 'full' ? 'Full Speaking test · Parts 1–3' : `Speaking Part ${mode[1]}`}</h3>
      <p className="mt-1 max-w-xl text-sm text-ink/70">The examiner's questions are read aloud. Your microphone is used for the live waveform, pause detection and transcription — audio stays on this device.</p>
      {!rec.srSupported && <p className="mt-3 rounded-2xl bg-white/70 p-3 text-sm">Live transcription is not available in this browser. Recording, the waveform and pause detection still work; for word-level feedback use Chrome, Edge or Safari, or type your answer afterwards.</p>}
      <Pill className="mt-5" onClick={() => setStarted(true)}><Mic size={16} {...ICON} /> Begin</Pill>
    </Bento>
  )

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="grid content-start gap-4 lg:col-span-2">
        <Bento className={step.part === 2 ? 'bg-butter' : 'bg-white'}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">Part {step.part} · {i + 1}/{steps.length}</span>
            <button onClick={() => say(step.prompt)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black/5 px-4 text-sm font-semibold"><Volume2 size={16} {...ICON} /> Replay prompt</button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={spring}>
              {step.part === 2 ? (
                <div className="rounded-[20px] border-2 border-ink/80 bg-white p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink/50">Candidate task card</div>
                  <p className="mt-1 text-lg font-bold">{cue.title}</p>
                  <p className="mt-2 text-sm font-semibold">You should say:</p>
                  <ul className="mt-1 grid gap-1.5">{cue.bullets.map((b, k) => (
                    <li key={b.text} className="flex items-center gap-2 text-sm"><motion.span animate={{ scale: hits[k] ? [1, 1.3, 1] : 1 }} className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full border-2', hits[k] ? 'border-forest bg-forest text-white' : 'border-ink/30')}>{hits[k] && <Check size={13} {...ICON} />}</motion.span><span className={hits[k] ? 'font-semibold text-forest' : ''}>{b.text}</span></li>))}</ul>
                </div>
              ) : <p className="text-xl font-bold leading-snug sm:text-2xl">{step.prompt}</p>}
            </motion.div>
          </AnimatePresence>
          {step.kind === 'prep' && (
            <div className="mt-4">
              <label htmlFor="pad" className="text-sm font-bold">Scratchpad — keywords only</label>
              <textarea id="pad" autoFocus value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder={'• what\n• when\n• what people do\n• why it matters'} className="mt-1 w-full rounded-2xl border border-black/10 bg-white p-3 text-sm" />
            </div>
          )}
          {step.part === 2 && step.kind === 'answer' && notes && <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-white/70 p-3 font-sans text-sm"><b>Your notes</b>{'\n'}{notes}</pre>}
        </Bento>
        {step.kind === 'answer' && (
          <Bento className="bg-white">
            <Waveform analyser={rec.analyser} active={rec.recording} />
            <p className="mt-2 min-h-12 text-sm leading-relaxed" aria-live="polite">{rec.transcript}<span className="opacity-50"> {rec.interim}</span>{!live && <span className="opacity-50">{rec.recording ? (rec.srSupported ? 'Listening…' : 'Recording… (live transcript unavailable in this browser)') : 'Press record and answer aloud.'}</span>}</p>
            {rec.error && <p className="mt-2 rounded-2xl bg-coral/15 p-3 text-sm font-semibold text-rose-800">{rec.error}</p>}
          </Bento>
        )}
      </div>
      <div className="grid content-start gap-4">
        <Bento className="flex flex-col items-center bg-mint text-center">
          <Ring value={left / step.limit} size={132} stroke={10} color={left <= 10 ? '#EC6B78' : '#141416'}>
            <div><div className="text-4xl font-extrabold tracking-tight tabnum">{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</div><div className="text-[11px] font-semibold opacity-60">{step.kind === 'prep' ? 'preparation' : 'to answer'}</div></div>
          </Ring>
          <div className="mt-4 flex justify-center gap-2">
            {step.kind === 'prep' ? <Pill onClick={next}><Mic size={16} {...ICON} /> Start speaking now</Pill>
              : !rec.recording ? <Pill onClick={() => { stopSpeaking(); rec.start() }}><Mic size={16} {...ICON} /> Record answer</Pill>
              : <Pill onClick={next}><Square size={14} {...ICON} /> {i + 1 >= steps.length ? 'Finish' : 'Next question'}</Pill>}
          </div>
          {step.kind === 'answer' && !rec.recording && <button onClick={next} className="mt-2 min-h-11 text-xs font-semibold underline opacity-60">Skip this question</button>}
        </Bento>
        {step.kind === 'answer' && (
          <Bento className="bg-white">
            <Gauge wpm={liveWpm} />
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-[20px] bg-butter p-3"><div className="text-2xl font-extrabold tabnum">{rec.pauses}</div><div className="text-[11px] font-semibold opacity-70">pauses &gt; 1.5 s</div></div>
              <div className="rounded-[20px] bg-lav p-3"><div className="text-2xl font-extrabold tabnum">{fillerCount}</div><div className="text-[11px] font-semibold opacity-70">filler words</div></div>
            </div>
          </Bento>
        )}
      </div>
    </div>
  )
}

function Playback({ id }: { id: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)
  if (missing) return <span className="text-xs opacity-50">audio unavailable</span>
  return url ? <audio src={url} controls autoPlay className="h-9 max-w-52" /> : <button onClick={async () => { const b = await loadAudio(id); if (b) setUrl(URL.createObjectURL(b)); else setMissing(true) }} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-black/5 px-3 text-xs font-bold"><Play size={14} {...ICON} /> Play recording</button>
}

export default function Speaking() {
  const [cue, setCue] = useState(CUE_CARDS[0].id)
  const [mode, setMode] = useState<RunnerMode>('p2')
  const [run, setRun] = useState(0)
  const log = useStore((s) => s.speakingLog)
  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Speaking Simulator</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink/70">An examiner voice asks the questions; your pace, pauses, fillers and cue-card coverage are measured as you speak.</p>
        </div>
        <Segmented value={mode} onChange={(m) => { setMode(m); setRun(run + 1) }} options={[{ value: 'p1', label: 'Part 1' }, { value: 'p2', label: 'Part 2' }, { value: 'p3', label: 'Part 3' }, { value: 'full', label: 'Full test' }]} />
      </header>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {CUE_CARDS.map((c) => <button key={c.id} onClick={() => { setCue(c.id); setRun(run + 1) }} className={cx('min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold', cue === c.id ? 'bg-ink text-white' : 'bg-white text-ink')}>{c.theme}: {c.title.replace('Describe ', '').replace('.', '')}</button>)}
      </div>
      <SpeakingRunner key={`${cue}-${mode}-${run}`} cueId={cue} mode={mode} />
      <section>
        <SectionTitle>Your recordings</SectionTitle>
        {log.length === 0 ? <Bento className="bg-white/70 text-sm text-ink/70"><AudioLines className="mb-2" {...ICON} />No recordings yet. Complete a Part 2 long turn and it will be saved here with its transcript and band estimate.</Bento> : (
          <div className="grid gap-3 md:grid-cols-2">{log.slice(0, 6).map((l) => (
            <Bento key={l.id} className="bg-white">
              <div className="flex items-center justify-between gap-3"><div><div className="font-bold">{l.label}</div><div className="text-xs text-ink/60">{new Date(l.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · {l.wpm} WPM</div></div><span className="rounded-full bg-mint px-3 py-1.5 text-sm font-extrabold">Band {fmtBand(l.band)}</span></div>
              <p className="mt-2 line-clamp-2 text-sm text-ink/70">{l.transcript || 'No transcript captured.'}</p>
              {l.hasAudio && <div className="mt-2"><Playback id={l.id} /></div>}
            </Bento>))}</div>
        )}
      </section>
    </div>
  )
}
