import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookmarkPlus, Check, Clock, Columns2, Eye, PenLine, Play, Send, Square, X } from 'lucide-react'
import { LETTERS, TASK1, TASK2 } from '../data/writing'
import { analyze, type Analysis, type Token } from '../lib/writingAnalyzer'
import { SYN, WEAK } from '../lib/wordlists'
import { useStore } from '../store'
import { Task1Chart } from '../components/Charts'
import { Bento, ICON, Meter, Pill, SectionTitle, Segmented, Sheet, Tag, cx, fmtBand, spring } from '../components/ui'

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const OUTLINE = [['position', 'My position / thesis', 'I believe that… because…'], ['b1', 'Body 1 — main idea + example', 'Idea: …  Example: …'], ['b2', 'Body 2 — main idea + example', 'Idea: …  Example: …'], ['concl', 'Conclusion in one line', 'Restate position + final thought']]

function Heatmap({ text, a, onPick }: { text: string; a: Analysis; onPick: (t: Token, x: number, y: number) => void }) {
  const out: React.ReactNode[] = []
  let pos = 0
  a.lr.tokens.forEach((t, i) => {
    if (t.start > pos) out.push(text.slice(pos, t.start))
    const cls = cx(t.level === 'c1' && 'bg-[#C9BDF0] rounded px-0.5', t.level === 'b2' && 'bg-[#BFE3DA] rounded px-0.5', t.weak && 'rounded bg-[#F8C9CE] px-0.5 underline decoration-coral decoration-2 underline-offset-2', t.repeated && !t.weak && 'underline decoration-gold decoration-dotted decoration-2 underline-offset-2')
    out.push(t.weak || t.repeated ? <button key={i} className={cx(cls, 'cursor-pointer')} onClick={(e) => { const r = (e.target as HTMLElement).getBoundingClientRect(); onPick(t, r.left + r.width / 2, r.bottom) }}>{t.text}</button> : cls ? <span key={i} className={cls}>{t.text}</span> : t.text)
    pos = t.end
  })
  out.push(text.slice(pos))
  return <div className="min-h-72 whitespace-pre-wrap rounded-[20px] bg-white p-4 leading-8">{out}</div>
}

export default function WritingLab() {
  const s = useStore()
  const academic = s.track === 'academic'
  const [task, setTask] = useState<'t1' | 't2'>('t1')
  const prompts = task === 't2' ? TASK2 : academic ? TASK1 : LETTERS
  const [pid, setPid] = useState(prompts[0].id)
  const prompt = prompts.find((p) => p.id === pid) || prompts[0]
  useEffect(() => { setPid(prompts[0].id) }, [task, academic]) // eslint-disable-line
  const saved = s.essays[prompt.id]
  const text = saved?.text || ''
  const setText = (t: string) => s.saveEssay(prompt.id, { text: t })
  const kind = task === 't2' ? 'task2' : academic ? 'task1' : 'letter'
  const a = useMemo(() => analyze(text, { task: kind, prompt: prompt.prompt }), [text, kind, prompt.prompt])
  const [mode, setMode] = useState<'write' | 'heat'>('write')
  const [tab, setTab] = useState<'ta' | 'cc' | 'lr' | 'gra'>('ta')
  const [models, setModels] = useState(false)
  const [pop, setPop] = useState<{ t: Token; x: number; y: number } | null>(null)
  const [savedWords, setSavedWords] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  // timers: outline (5 min) then writing (35 min) for Task 2; 20 min for Task 1
  const [phase, setPhase] = useState<'idle' | 'outline' | 'writing'>('idle')
  const [left, setLeft] = useState(0)
  const outline = saved?.outline || {}
  useEffect(() => { setPhase('idle'); setSubmitted(false); setPop(null); setMode('write') }, [prompt.id])
  useEffect(() => {
    if (phase === 'idle') return
    if (left <= 0) { if (phase === 'outline') { setPhase('writing'); setLeft(35 * 60) } else setPhase('idle'); return }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000); return () => clearTimeout(t)
  }, [phase, left])
  const start = () => { if (task === 't2') { setPhase('outline'); setLeft(5 * 60) } else { setPhase('writing'); setLeft(20 * 60) } }
  const submit = () => {
    s.saveEssay(prompt.id, { band: a.bands.overall }); s.saveAttempt({ title: `Writing ${task === 't1' ? 'Task 1' : 'Task 2'} · ${'label' in prompt ? prompt.label : 'type' in prompt ? prompt.type : prompt.tone + ' letter'}`, kind: 'writing', bands: { writing: a.bands.overall } })
    s.addXp(120); s.touch('writing'); s.touch(task === 't1' ? 'm-t1' : 'm-t2'); s.logMinutes(Math.max(5, Math.round(a.words / 12))); setSubmitted(true); setPhase('idle')
  }
  const replace = (t: Token, rep: string) => { const r = /^[A-Z]/.test(t.text) ? rep[0].toUpperCase() + rep.slice(1) : rep; setText(text.slice(0, t.start) + r + text.slice(t.end)); setPop(null) }
  const popUpgrades = pop ? (pop.t.weak ? WEAK[pop.t.weak] : SYN[pop.t.text.toLowerCase()] || []) : []
  const crit = [['ta', task === 't2' ? 'Task Response' : 'Task Achievement', a.bands.ta, '#EC6B78'], ['cc', 'Coherence & Cohesion', a.bands.cc, '#3D7A74'], ['lr', 'Lexical Resource', a.bands.lr, '#9C8AE0'], ['gra', 'Grammar Range & Accuracy', a.bands.gra, '#F5B841']] as const

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Writing Lab</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink/70">Instant, rule-based feedback on the four official criteria as you type. No text leaves your device.</p>
        </div>
        <Segmented value={task} onChange={setTask} options={[{ value: 't1', label: academic ? 'Task 1 · Data' : 'Task 1 · Letter' }, { value: 't2', label: 'Task 2 · Essay' }]} />
      </header>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">{prompts.map((p) => <button key={p.id} onClick={() => setPid(p.id)} className={cx('min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold', p.id === prompt.id ? 'bg-ink text-white' : 'bg-white')}>{'label' in p ? p.label : 'type' in p ? p.type : `${p.tone} letter`}{s.essays[p.id]?.band ? ` · ${fmtBand(s.essays[p.id].band!)}` : ''}</button>)}</div>

      <div className="grid gap-5 xl:grid-cols-12">
        {/* prompt column */}
        <div className="grid content-start gap-5 xl:col-span-4">
          <Bento className="bg-white">
            <div className="text-xs font-bold uppercase tracking-wider text-ink/50">Writing Task {task === 't1' ? 1 : 2} · at least {a.minWords} words</div>
            <p className="mt-2 font-semibold leading-relaxed">{prompt.prompt}</p>
            {'bullets' in prompt && <ul className="mt-2 list-disc pl-5 text-sm">{prompt.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
            {'kind' in prompt && <div className="mt-4 rounded-[20px] bg-cream p-3"><Task1Chart kind={prompt.kind} /></div>}
            {'tips' in prompt && <ul className="mt-3 grid gap-1.5 text-sm">{prompt.tips.map((t) => <li key={t} className="rounded-2xl bg-butter px-3 py-2">{t}</li>)}</ul>}
            {'kind' in prompt && <Pill variant="light" className="mt-4" onClick={() => setModels(true)}><Columns2 size={16} {...ICON} /> Compare Band 6.5 vs 8.5 models</Pill>}
          </Bento>
          {'checklist' in prompt && (
            <Bento className="bg-mint"><h3 className="font-bold">{prompt.tone} tone checklist</h3><ul className="mt-2 grid gap-1.5 text-sm">{prompt.checklist.map((c) => { const neg = c.test.startsWith('!'); const hit = new RegExp(neg ? c.test.slice(1) : c.test, 'im').test(text); const ok = text.trim().length > 20 && (neg ? !hit : hit); return <li key={c.label} className="flex items-center gap-2"><span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full', ok ? 'bg-forest text-white' : 'bg-white')}>{ok && <Check size={13} {...ICON} />}</span>{c.label}</li> })}</ul></Bento>
          )}
          {task === 't2' && (
            <Bento className="bg-lav">
              <div className="flex items-center justify-between"><h3 className="font-bold">5-Minute Essay Outliner</h3>{phase === 'outline' && <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white tabnum">{mmss(left)}</span>}</div>
              <p className="mt-1 text-xs text-ink/70">Plan before you write: the 35-minute writing timer starts when the outline timer ends.</p>
              <div className="mt-3 grid gap-2">{OUTLINE.map(([k, label, ph]) => <label key={k} className="grid gap-1 text-xs font-bold">{label}<textarea rows={2} value={outline[k] || ''} onChange={(e) => s.saveEssay(prompt.id, { outline: { ...outline, [k]: e.target.value } })} placeholder={ph} className="rounded-2xl border border-black/10 bg-white p-2.5 text-sm font-normal" /></label>)}</div>
              {phase === 'outline' && <Pill className="mt-3 w-full" onClick={() => { setPhase('writing'); setLeft(35 * 60) }}>Outline ready — start writing (35:00)</Pill>}
            </Bento>
          )}
        </div>

        {/* editor column */}
        <div className="grid content-start gap-4 xl:col-span-5">
          <Bento className="bg-cream">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <Segmented value={mode} onChange={setMode} options={[{ value: 'write', label: 'Write' }, { value: 'heat', label: 'Vocabulary heatmap' }]} />
              <div className="flex items-center gap-2">
                {phase !== 'idle' ? <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold tabnum', left <= 300 && phase === 'writing' ? 'pulse-warn bg-coral text-white' : 'bg-ink text-white')}><Clock size={15} {...ICON} />{phase === 'outline' ? 'Outline ' : ''}{mmss(left)}<button aria-label="Stop timer" onClick={() => setPhase('idle')} className="ml-1 grid h-6 w-6 place-items-center"><Square size={12} {...ICON} /></button></span>
                  : <Pill variant="light" onClick={start}><Play size={15} {...ICON} /> {task === 't2' ? 'Start 5 + 35 min' : 'Start 20 min'}</Pill>}
              </div>
            </div>
            {mode === 'write'
              ? <textarea value={text} onChange={(e) => { setText(e.target.value); setSubmitted(false) }} spellCheck={false} aria-label="Your answer" placeholder={phase === 'outline' ? 'Finish your outline first — or start typing when you are ready.' : 'Write your answer here. Feedback updates as you type.'} className="min-h-96 w-full resize-y rounded-[20px] border border-black/10 bg-white p-4 leading-relaxed" />
              : text.trim() ? <><Heatmap text={text} a={a} onPick={(t, x, y) => setPop({ t, x: Math.min(window.innerWidth - 150, Math.max(150, x)), y })} /><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">{[['#BFE3DA', 'Upper-intermediate (B2)'], ['#C9BDF0', 'Advanced / academic (C1–C2)'], ['#F8C9CE', 'Weak or vague — tap to upgrade']].map(([c, l]) => <span key={l} className="inline-flex items-center gap-1.5"><i className="h-3 w-3 rounded" style={{ background: c }} />{l}</span>)}<span className="underline decoration-gold decoration-dotted decoration-2 underline-offset-2">Repeated 3+ times</span></div></>
              : <div className="grid min-h-72 place-items-center rounded-[20px] bg-white p-6 text-center text-sm text-ink/50"><div><Eye className="mx-auto mb-2" {...ICON} />Write a few sentences to see every word classified by level.</div></div>}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-bold">Words: <span className={a.words < a.minWords ? 'text-rose-600' : 'text-emerald-700'}>{a.words}</span><span className="font-medium text-ink/50"> / {a.minWords} minimum</span>{a.ta.wordPenalty && a.words > 0 && <span className="ml-2 rounded-full bg-coral/15 px-2 py-0.5 text-xs text-rose-700">under-length penalty</span>}</div>
              <Pill onClick={submit} disabled={a.words < 20}><Send size={15} {...ICON} /> {submitted ? 'Saved' : 'Submit for band estimate'}</Pill>
            </div>
          </Bento>
          {a.tips.length > 0 && a.words > 0 && <Bento className="bg-butter"><h3 className="mb-2 font-bold">Coach priorities</h3><ol className="grid gap-2 text-sm">{a.tips.slice(0, 5).map((t, i) => <li key={t} className="flex gap-2.5"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white">{i + 1}</span>{t}</li>)}</ol></Bento>}
        </div>

        {/* diagnostics column */}
        <div className="grid content-start gap-4 xl:col-span-3">
          <Bento className="bg-forest text-white">
            <div className="text-sm font-semibold opacity-80">Estimated band {submitted ? '· submitted' : '· live'}</div>
            <motion.div key={a.bands.overall} initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={spring} className="text-5xl font-extrabold tracking-tight tabnum">{fmtBand(a.bands.overall)}</motion.div>
            <div className="mt-3 grid gap-2.5">{crit.map(([k, label, band, color]) => <button key={k} onClick={() => setTab(k)} className={cx('rounded-2xl p-2.5 text-left transition', tab === k ? 'bg-mint' : '')}><Meter label={label} value={band} color={color} /></button>)}</div>
            <p className="mt-3 text-[11px] opacity-75">A deterministic estimate from measurable features. It cannot judge the quality of your ideas — use it to guide revision.</p>
          </Bento>
          <Bento className="bg-white text-sm">
            {tab === 'ta' && <div className="grid gap-2"><h3 className="font-bold">{task === 't2' ? 'Task Response' : 'Task Achievement'}</h3>
              {[[!a.ta.wordPenalty, `Word count ${a.words}/${a.minWords}`], [a.ta.paragraphOk, `${a.paragraphs.length} paragraphs (${task === 't2' ? '4–5' : '3–4'} is optimal)`], ...(kind === 'task1' ? [[a.ta.overview, 'Overview detected ("Overall, …")'], [a.ta.dataPoints >= 5, `${a.ta.dataPoints} figures cited`]] : kind === 'task2' ? [[a.ta.thesis, 'Clear position / thesis'], [a.ta.conclusion, 'Conclusion paragraph'], [a.ta.balance >= 0.6, `Body paragraphs balanced (${Math.round(a.ta.balance * 100)}%)`]] : []), [a.ta.coverage >= 0.7, `Prompt coverage ${Math.round(a.ta.coverage * 100)}%`]].map(([ok, l]) => <div key={l as string} className="flex items-center gap-2"><span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-full', ok ? 'bg-forest text-white' : 'bg-coral text-white')}>{ok ? <Check size={11} {...ICON} /> : <X size={11} {...ICON} />}</span>{l as string}</div>)}
              {a.ta.missing.length > 0 && <p className="text-xs text-ink/60">Not yet addressed: {a.ta.missing.join(', ')}</p>}</div>}
            {tab === 'cc' && <div className="grid gap-2"><h3 className="font-bold">Cohesive devices</h3>
              {Object.entries(a.cc.byCat).map(([cat, list]) => <div key={cat}><div className="text-xs font-bold text-ink/50">{cat}</div><div className="flex flex-wrap gap-1">{list.length ? list.map((l) => <span key={l} className="rounded-full bg-mint px-2 py-0.5 text-xs font-semibold">{l}</span>) : <span className="text-xs text-ink/40">none used</span>}</div></div>)}
              <p className={cx('rounded-2xl p-2.5 text-xs', a.cc.mechanicalRate > 0.35 ? 'bg-coral/15' : 'bg-cream')}>{Math.round(a.cc.mechanicalRate * 100)}% of sentences start with a mechanical linker{a.cc.mechanicalRate > 0.35 ? ' — over the 35% warning line. Try this trend, such measures, the former.' : '.'} Referencing phrases: {a.cc.referencing}.</p></div>}
            {tab === 'lr' && <div className="grid gap-2"><h3 className="font-bold">Lexical profile</h3>
              <div className="flex h-4 overflow-hidden rounded-full">{[['common', '#E7E5EC'], ['b2', '#8FCFC3'], ['c1', '#9C8AE0']].map(([k, c]) => <div key={k} style={{ width: `${a.lr.pct[k as 'common']}%`, background: c }} title={`${k}: ${a.lr.pct[k as 'common'].toFixed(0)}%`} />)}</div>
              <div className="flex justify-between text-xs font-semibold"><span>A1–B1 {a.lr.pct.common.toFixed(0)}%</span><span>B2 {a.lr.pct.b2.toFixed(0)}%</span><span>C1–C2 {a.lr.pct.c1.toFixed(0)}%</span></div>
              <div>Type-token ratio: <b className="tabnum">{a.lr.ttr.toFixed(2)}</b> <span className="text-xs text-ink/50">(0.72+ shows good variety)</span></div>
              {a.lr.repeated.length > 0 && <div><div className="text-xs font-bold text-ink/50">Repeated 3+ times</div><div className="flex flex-wrap gap-1">{a.lr.repeated.map((r) => <span key={r.word} className="rounded-full bg-butter px-2 py-0.5 text-xs font-semibold">{r.word} ×{r.count}</span>)}</div></div>}
              {a.lr.weak.length > 0 && <div><div className="text-xs font-bold text-ink/50">Weak / vague words</div>{a.lr.weak.map((x) => <div key={x.word} className="text-xs"><b>{x.word}</b> ×{x.count} → {x.upgrades.join(', ')}</div>)}</div>}
              <p className="text-xs text-ink/60">Open the vocabulary heatmap and tap a highlighted word for one-tap upgrades.</p></div>}
            {tab === 'gra' && <div className="grid gap-2"><h3 className="font-bold">Sentence structures</h3>
              <div className="flex h-4 overflow-hidden rounded-full">{[[a.gra.simple, '#F6B5BC'], [a.gra.compound, '#FFE08A'], [a.gra.complex, '#3D7A74']].map(([v, c], i) => <div key={i} style={{ width: `${v}%`, background: c as string }} />)}</div>
              <div className="flex justify-between text-xs font-semibold"><span>{a.gra.simple}% Simple</span><span>{a.gra.compound}% Compound</span><span>{a.gra.complex}% Complex</span></div>
              <div className="text-xs">{a.sentences.length} sentences · average {a.gra.avgLen.toFixed(0)} words · {a.gra.passives} passive · {a.gra.conditionals} conditional · {a.gra.relatives} relative clauses</div>
              {a.gra.issues.length === 0 ? <p className="rounded-2xl bg-mint p-2.5 text-xs">No rule-based errors found.</p> : <ul className="grid max-h-64 gap-1.5 overflow-y-auto">{a.gra.issues.map((it, i) => <li key={i} className="rounded-2xl bg-cream p-2.5 text-xs"><b className="text-rose-700">{it.type}</b> — {it.msg}<br /><span className="text-ink/50">"{it.excerpt}"</span></li>)}</ul>}</div>}
          </Bento>
        </div>
      </div>

      <AnimatePresence>
        {pop && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring} className="glass-solid fixed z-50 w-72 -translate-x-1/2 rounded-[20px] p-3" style={{ left: pop.x, top: Math.min(window.innerHeight - 220, pop.y + 8) }} role="dialog" aria-label="Word upgrades">
            <div className="flex items-center justify-between"><b className="text-sm">{pop.t.weak ? `"${pop.t.text}" is vague` : `"${pop.t.text}" is repeated`}</b><button aria-label="Close" onClick={() => setPop(null)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-black/5"><X size={15} {...ICON} /></button></div>
            {popUpgrades.length ? <><p className="mt-1 text-xs text-ink/60">Band 8+ alternatives — tap to replace this occurrence. Check that it fits your sentence.</p><div className="mt-2 flex flex-wrap gap-1.5">{popUpgrades.map((u) => <button key={u} onClick={() => replace(pop.t, u)} className="min-h-9 rounded-full bg-ink px-3 text-xs font-semibold text-white">{u}</button>)}</div>
              <button onClick={() => { s.addCard(popUpgrades[0], `Upgrade for "${pop.t.text.toLowerCase()}" · also: ${popUpgrades.slice(1).join(', ')}`, 'Writing upgrades'); setSavedWords([...savedWords, pop.t.text]) }} disabled={savedWords.includes(pop.t.text)} className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-xs font-bold underline disabled:opacity-50">{savedWords.includes(pop.t.text) ? <><Check size={13} {...ICON} /> Saved to deck</> : <><BookmarkPlus size={13} {...ICON} /> Save upgrades to my deck</>}</button></>
              : <p className="mt-1 text-xs text-ink/70">Avoid repeating it: use a pronoun or a reference phrase (this, such, the former), or restructure the sentence.</p>}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {models && 'kind' in prompt && (
          <Sheet onClose={() => setModels(false)} wide>
            <div className="p-6">
              <SectionTitle right={<button aria-label="Close" onClick={() => setModels(false)} className="grid h-11 w-11 place-items-center rounded-full bg-white"><X size={18} {...ICON} /></button>}>Model answers · {prompt.label}</SectionTitle>
              <div className="grid gap-4 md:grid-cols-2">{([['Band 6.5', prompt.band65, 'bg-butter'], ['Band 8.5', prompt.band85, 'bg-mint']] as const).map(([label, essay, c]) => { const m = analyze(essay, { task: 'task1', prompt: prompt.prompt }); return (
                <div key={label} className={cx('rounded-[20px] p-4', c)}><div className="mb-2 flex items-center justify-between"><span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">{label}</span><span className="text-xs font-semibold">{m.words} words · {m.gra.complex}% complex · {m.lr.pct.c1.toFixed(0)}% C1</span></div><p className="whitespace-pre-wrap text-sm leading-relaxed">{essay}</p></div>) })}</div>
              <h3 className="mb-2 mt-5 font-bold">What makes the difference</h3>
              <ul className="grid gap-2 text-sm">{prompt.notes.map((n) => <li key={n} className="flex gap-2 rounded-2xl bg-white p-3"><PenLine size={16} className="mt-0.5 shrink-0" {...ICON} />{n}</li>)}</ul>
            </div>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  )
}
