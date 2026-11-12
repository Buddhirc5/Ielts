import { BookOpen, Flag, Headphones, Highlighter, Mic, MonitorSmartphone, PenLine, Timer, Type } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { EXAMS } from '../lib/exams'
import { useStore } from '../store'
import { Breathe, Bento, CircleBtn, ICON, Pill, SectionTitle, Tag, fmtBand } from '../components/ui'

export default function Mock() {
  const s = useStore()
  const [breathe, setBreathe] = useState(false)
  const sections = [
    { t: 'Listening', d: '4 parts · 40 questions · single play', icon: Headphones, c: 'bg-mint', go: () => s.startExam(EXAMS.listening()) },
    { t: 'Reading', d: `${s.track === 'academic' ? '3 passages' : '3 sections'} · 40 questions · 60 min`, icon: BookOpen, c: 'bg-lav', go: () => s.startExam(EXAMS.reading()) },
    { t: 'Writing', d: `${s.track === 'academic' ? 'Chart description' : 'Letter'} + essay · 60 min`, icon: PenLine, c: 'bg-butter', go: () => s.startExam(EXAMS.writing(s.track)) },
    { t: 'Speaking', d: 'Parts 1–3 with the examiner voice', icon: Mic, c: 'bg-white', go: () => s.setView('speaking') },
  ]
  const history = [...s.attempts].reverse()
  return (
    <div className="grid gap-6">
      <div className="grid gap-5 lg:grid-cols-3">
        <Bento tone="sky" className="lg:col-span-2">
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Full Mock Exam Mode</h1>
          <p className="mt-2 max-w-xl text-sm opacity-95">A distraction-free simulation of the computer-delivered test: Listening, Reading, Writing and Speaking back to back, with one overall band at the end. Allow about 2 hours 45 minutes.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3"><Pill variant="light" onClick={() => s.startExam(EXAMS.full(s.track))}><Timer size={16} {...ICON} /> Start full mock</Pill><button onClick={() => setBreathe(true)} className="min-h-11 text-sm font-medium text-ink/60 underline">Take a one-minute breather first</button></div>
        </Bento>
        <Bento className="bg-white">
          <h2 className="font-bold">Inside the exam interface</h2>
          <ul className="mt-3 grid gap-2.5 text-sm">{[[Timer, 'Live countdown with 10- and 5-minute warnings'], [Highlighter, 'Select text to highlight or add a sticky note'], [Flag, 'Question palette with flag-for-review'], [Type, 'Text size and high-contrast controls'], [MonitorSmartphone, 'Split-screen passage and questions']].map(([I, t]: any) => <li key={t} className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lav"><I size={16} {...ICON} /></span>{t}</li>)}</ul>
        </Bento>
      </div>
      <section>
        <SectionTitle>Diagnostic checks</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <Bento className="bg-mint" onClick={() => s.startExam(EXAMS.express())}><div className="flex items-center justify-between"><div><div className="text-4xl font-extrabold tracking-tight">25 min</div><h3 className="text-lg font-bold">Express Mock</h3><p className="text-sm text-ink/70">Listening Part 1 + Reading Passage 1</p></div><CircleBtn ring label="Start Express Mock" /></div></Bento>
          <Bento className="bg-butter" onClick={() => s.startExam(EXAMS.mini())}><div className="flex items-center justify-between"><div><div className="text-4xl font-extrabold tracking-tight">50 min</div><h3 className="text-lg font-bold">Mini Mock</h3><p className="text-sm text-ink/70">Listening Parts 1–2 + Reading Passages 1–2</p></div><CircleBtn ring label="Start Mini Mock" /></div></Bento>
        </div>
      </section>
      <section>
        <SectionTitle>Timed section tests</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{sections.map((x) => (
          <Bento key={x.t} className={x.c} onClick={x.go}><span className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm"><x.icon size={20} {...ICON} /></span><h3 className="mt-4 text-xl font-bold">{x.t}</h3><p className="text-sm text-ink/70">{x.d}</p><div className="mt-4 flex justify-end"><CircleBtn label={`Start ${x.t}`} /></div></Bento>))}</div>
      </section>
      <section>
        <SectionTitle>Attempt history</SectionTitle>
        {history.length === 0 ? <Bento className="bg-white/70 text-sm text-ink/70">No attempts yet. Your results will appear here after your first test.</Bento> : (
          <div className="overflow-x-auto rounded-[28px] bg-white p-2"><table className="w-full min-w-[560px] text-sm"><thead><tr className="text-left text-xs text-ink/50">{['Date', 'Test', 'L', 'R', 'W', 'S', 'Overall'].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{history.slice(0, 12).map((a) => <tr key={a.id} className="border-t border-black/5"><td className="px-3 py-3 tabnum text-ink/60">{new Date(a.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</td><td className="px-3 py-3 font-semibold">{a.title}</td>{(['listening', 'reading', 'writing', 'speaking'] as const).map((k) => <td key={k} className="px-3 py-3 tabnum">{a.bands[k] != null ? fmtBand(a.bands[k]!) : '—'}</td>)}<td className="px-3 py-3"><span className="rounded-full bg-mint px-2.5 py-1 font-bold tabnum">{a.overall ? fmtBand(a.overall) : '—'}</span></td></tr>)}</tbody></table></div>
        )}
      </section>
      <AnimatePresence>{breathe && <Breathe onClose={() => setBreathe(false)} />}</AnimatePresence>
    </div>
  )
}
