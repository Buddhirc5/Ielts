import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Highlighter, StickyNote, Eraser, X } from 'lucide-react'
import type { Group, Q, QType } from '../types'
import { isCorrect } from '../lib/engines'
import { MAP_POINTS } from '../data/listening'
import { ROMAN } from '../data/reading'
import { ICON, cx } from './ui'

export type Answers = Record<number, string>
export interface Highlight { start: number; end: number; color: 'yellow' | 'mint'; note?: string }
export type Annotations = Record<string, Highlight[]>

/* ───────── scoring ───────── */
export function qCorrect(g: Group, q: Q, answers: Answers): boolean {
  if (g.type === 'multi') { const sel = answers[g.qs[0].n] || ''; return sel.length <= g.qs.length && sel.includes(q.answer) }
  return isCorrect(q.answer, answers[q.n])
}
export function qAnswered(g: Group, q: Q, answers: Answers): boolean {
  if (g.type === 'multi') return (answers[g.qs[0].n] || '').length > g.qs.indexOf(q)
  return !!(answers[q.n] || '').trim()
}
export function scoreGroups(groups: Group[], answers: Answers) {
  let correct = 0, total = 0
  const byType: Partial<Record<QType, { correct: number; total: number }>> = {}
  for (const g of groups) for (const q of g.qs) {
    const ok = qCorrect(g, q, answers); total++; if (ok) correct++
    const t = (byType[g.type] ||= { correct: 0, total: 0 }); t.total++; if (ok) t.correct++
  }
  return { correct, total, byType }
}
export function displayAnswer(g: Group, q: Q): string {
  if (g.type === 'heading') return `${q.answer} — ${g.options![ROMAN.indexOf(q.answer)]}`
  if ((g.type === 'mcq' && q.options) || g.type === 'match' || g.type === 'multi') { const o = (q.options || g.options)!; return `${q.answer} — ${o[q.answer.charCodeAt(0) - 65]}` }
  return q.answer.split('|')[0]
}

/* ───────── annotatable text ───────── */
export function AnnotatedText({ id, text, ann, evidence, className }: { id: string; text: string; ann?: Annotations; evidence?: string; className?: string }) {
  let marks: (Highlight & { ev?: boolean })[] = [...(ann?.[id] || [])].sort((a, b) => a.start - b.start)
  if (evidence) { const i = text.indexOf(evidence); if (i >= 0) marks = [{ start: i, end: i + evidence.length, color: 'mint', ev: true }] }
  const out: ReactNode[] = []
  let pos = 0
  marks.forEach((m, k) => {
    if (m.start > pos) out.push(text.slice(pos, m.start))
    out.push(<mark key={k} data-ev={m.ev ? '1' : undefined} className={m.ev ? 'hl-ev' : `hl-${m.color}`} title={m.note}>{text.slice(m.start, m.end)}{m.note && <StickyNote aria-label={`Note: ${m.note}`} size={13} className="ml-0.5 inline align-text-top" {...ICON} />}</mark>)
    pos = m.end
  })
  if (pos < text.length) out.push(text.slice(pos))
  return <span data-ann={id} className={className}>{out}</span>
}
/** Wrap a pane with this hook to get the floating highlight / note popover. */
export function useAnnotator(ann: Annotations, setAnn: (a: Annotations) => void, enabled: boolean) {
  const [pop, setPop] = useState<{ id: string; start: number; end: number; x: number; y: number } | null>(null)
  const [noting, setNoting] = useState(false)
  const [note, setNote] = useState('')
  const onUp = () => {
    if (!enabled) return
    setTimeout(() => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.rangeCount) return
      const range = sel.getRangeAt(0)
      const host = (n: Node | null) => (n instanceof Element ? n : n?.parentElement)?.closest('[data-ann]') as HTMLElement | null
      const a = host(range.startContainer), b = host(range.endContainer)
      if (!a || a !== b) return
      const pre = document.createRange(); pre.selectNodeContents(a); pre.setEnd(range.startContainer, range.startOffset)
      const start = pre.toString().length, len = range.toString().length
      if (!len) return
      const rect = range.getBoundingClientRect()
      setNoting(false); setNote('')
      setPop({ id: a.dataset.ann!, start, end: start + len, x: Math.min(window.innerWidth - 150, Math.max(150, rect.left + rect.width / 2)), y: Math.max(64, rect.top - 8) })
    }, 0)
  }
  const apply = (color: Highlight['color'] | null, n?: string) => {
    if (!pop) return
    const rest = (ann[pop.id] || []).filter((h) => h.end <= pop.start || h.start >= pop.end)
    setAnn({ ...ann, [pop.id]: color ? [...rest, { start: pop.start, end: pop.end, color, note: n || undefined }] : rest })
    setPop(null); window.getSelection()?.removeAllRanges()
  }
  useEffect(() => { if (!pop) return; const close = (e: MouseEvent) => { if (!(e.target as Element).closest('[data-pop]')) setPop(null) }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close) }, [pop])
  const popover = pop && (
    <div data-pop className="glass-solid fixed z-[70] -translate-x-1/2 -translate-y-full rounded-2xl p-1.5 text-ink" style={{ left: pop.x, top: pop.y }}>
      {noting ? (
        <form className="flex items-center gap-1" onSubmit={(e) => { e.preventDefault(); apply('yellow', note) }}>
          <input autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="Type a note…" aria-label="Sticky note text" className="h-9 w-44 rounded-xl border border-black/10 bg-white px-3 text-sm text-ink" />
          <button className="h-9 rounded-xl bg-ink px-3 text-xs font-bold text-white">Save</button>
        </form>
      ) : (
        <div className="flex items-center gap-1">
          <button onClick={() => apply('yellow')} className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold hover:bg-black/5"><Highlighter size={15} {...ICON} /><i className="h-3.5 w-3.5 rounded-full bg-[#FFE66D]" />Yellow</button>
          <button onClick={() => apply('mint')} className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold hover:bg-black/5"><i className="h-3.5 w-3.5 rounded-full bg-[#A8E6CF]" />Mint</button>
          <button onClick={() => setNoting(true)} className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold hover:bg-black/5"><StickyNote size={15} {...ICON} />Note</button>
          <button onClick={() => apply(null)} className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold hover:bg-black/5"><Eraser size={15} {...ICON} />Clear</button>
        </div>
      )}
    </div>
  )
  return { onUp, popover }
}

/* ───────── drag & tap helpers ───────── */
export function DragPill({ value, label, held, setHeld, used }: { value: string; label: string; held: string | null; setHeld: (v: string | null) => void; used?: boolean }) {
  return (
    <button draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', value); setHeld(value) }} onDragEnd={() => setHeld(null)} onClick={() => setHeld(held === value ? null : value)}
      className={cx('min-h-9 cursor-grab rounded-full border px-3.5 py-1.5 text-left text-[.9em] font-semibold transition active:cursor-grabbing', held === value ? 'border-transparent bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'border-[var(--ex-border)] bg-[var(--ex-panel)]', used && held !== value && 'opacity-40')}>
      {label}
    </button>
  )
}
export function DropSlot({ value, label, onSet, held, setHeld, n, disabled, wide }: { value?: string; label?: string; onSet: (v: string) => void; held: string | null; setHeld: (v: string | null) => void; n: number; disabled?: boolean; wide?: boolean }) {
  const [over, setOver] = useState(false)
  return (
    <span role="button" tabIndex={0} aria-label={`Answer slot for question ${n}${value ? `: ${label}` : ', empty'}`}
      onDragOver={(e) => { if (!disabled) { e.preventDefault(); setOver(true) } }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); if (!disabled) { onSet(e.dataTransfer.getData('text/plain')); setHeld(null) } }}
      onClick={() => { if (disabled) return; if (held) { onSet(held); setHeld(null) } else if (value) onSet('') }}
      onKeyDown={(e) => { if (e.key === 'Enter' && held && !disabled) { onSet(held); setHeld(null) } }}
      className={cx('inline-flex min-h-9 items-center gap-2 rounded-full border-2 border-dashed px-3 py-1 align-middle text-[.9em] font-semibold transition', wide ? 'w-full' : 'mx-1 min-w-28', over || (held && !disabled) ? 'border-[var(--ex-accent)] bg-[var(--ex-accent)]/10' : 'border-[var(--ex-border)]', value && 'border-solid bg-[var(--ex-panel)]', !disabled && 'cursor-pointer')}>
      <b className="grid h-6 min-w-6 place-items-center rounded-full bg-[var(--ex-accent)] px-1.5 text-[.75em] text-[var(--ex-accent-fg)]">{n}</b>
      <span className={value ? '' : 'opacity-50'}>{value ? label : held ? 'Tap to place' : 'Drop here'}</span>
      {value && !disabled && <X size={13} {...ICON} />}
    </span>
  )
}

/* ───────── map ───────── */
export function SanctuaryMap() {
  return (
    <svg viewBox="0 0 100 100" className="mx-auto w-full max-w-sm rounded-[20px] border border-[var(--ex-border)] bg-[#EAF3E3] text-[#141416]" role="img" aria-label="Map of Banksia Creek Wildlife Sanctuary with locations lettered A to H">
      <ellipse cx="50" cy="48" rx="20" ry="13" fill="#9CC9EE" /><text x="50" y="50" textAnchor="middle" fontSize="4.5" fontWeight="700">Lake</text>
      <path d="M50 96 L50 80 M50 80 Q24 78 16 52 Q12 30 16 20 M50 80 Q76 78 84 52 Q88 30 84 20 M16 18 Q50 6 84 18" fill="none" stroke="#b8a77a" strokeWidth="1.6" strokeDasharray="2 1.6" />
      <rect x="42" y="92" width="16" height="6" rx="2" fill="#141416" /><text x="50" y="96.4" textAnchor="middle" fontSize="3.4" fontWeight="700" fill="#fff">ENTRANCE</text>
      <rect x="66" y="6" width="12" height="6" rx="2" fill="#CDE8B5" /><text x="72" y="10" textAnchor="middle" fontSize="2.8">Picnic lawn</text>
      {Object.entries(MAP_POINTS).map(([k, [x, y]]) => <g key={k}><circle cx={x} cy={y} r="5" fill="#fff" stroke="#141416" strokeWidth="0.8" /><text x={x} y={y + 1.7} textAnchor="middle" fontSize="5" fontWeight="800">{k}</text></g>)}
      <text x="94" y="97" textAnchor="end" fontSize="3.6" fontWeight="800">N ↑</text>
    </svg>
  )
}

/* ───────── question group renderer ───────── */
interface GV { group: Group; answers: Answers; set: (n: number, v: string) => void; held: string | null; setHeld: (v: string | null) => void; ann?: Annotations; review?: boolean; onFocusQ?: (n: number) => void; current?: number }
const Num = ({ n, cur }: { n: number; cur?: boolean }) => <b className={cx('mr-2 inline-grid h-7 min-w-7 place-items-center rounded-lg border px-1 text-[.8em]', cur ? 'border-transparent bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'border-[var(--ex-border)]')}>{n}</b>

export function GroupView({ group: g, answers, set, held, setHeld, ann, review, onFocusQ, current }: GV) {
  const letters = (g.options || []).map((_, i) => String.fromCharCode(65 + i))
  const mark = (q: Q) => review && <span className={cx('ml-2 rounded-full px-2 py-0.5 text-[.75em] font-bold', qCorrect(g, q, answers) ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')}>{qCorrect(g, q, answers) ? '✓' : `✗ ${displayAnswer(g, q)}`}</span>
  const gapInput = (q: Q) => (
    <input type="text" id={`in-${q.n}`} aria-label={`Answer ${q.n}`} disabled={review} value={answers[q.n] || ''} onFocus={() => onFocusQ?.(q.n)} onChange={(e) => set(q.n, e.target.value)} spellCheck={false} autoComplete="off" placeholder={String(q.n)}
      className="mx-1 inline-block h-9 w-36 rounded-lg px-2.5 text-[.95em] font-semibold placeholder:font-bold placeholder:opacity-40" />
  )
  const gapText = (q: Q) => { const [a, b] = q.text.split('____'); return <>{a}{gapInput(q)}{b}</> }
  const selMulti = answers[g.qs[0]?.n] || ''
  return (
    <section className="mb-8">
      <h3 className="text-[1.05em] font-bold">{g.title}</h3>
      <p className="mb-3 mt-1 text-[.92em] text-[var(--ex-sub)]"><AnnotatedText id={`ins-${g.qs[0].n}`} text={g.instruction} ann={ann} /></p>

      {(g.type === 'tfng' || g.type === 'ynng') && g.qs.map((q) => (
        <div key={q.n} id={`q-${q.n}`} className="mb-4 scroll-mt-24">
          <p className="mb-2 leading-relaxed"><Num n={q.n} cur={current === q.n} /><AnnotatedText id={`q${q.n}`} text={q.text} ann={ann} />{mark(q)}</p>
          <div className="flex flex-wrap gap-2 pl-9" role="radiogroup" aria-label={`Question ${q.n}`}>
            {(g.type === 'tfng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN']).map((o) => (
              <button key={o} role="radio" aria-checked={answers[q.n] === o} disabled={review} onClick={() => { set(q.n, answers[q.n] === o ? '' : o); onFocusQ?.(q.n) }}
                className={cx('min-h-9 rounded-full border px-4 text-[.82em] font-bold', answers[q.n] === o ? 'border-transparent bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'border-[var(--ex-border)] bg-[var(--ex-panel)]')}>{o}</button>
            ))}
          </div>
        </div>
      ))}

      {g.type === 'mcq' && g.qs.map((q) => (
        <div key={q.n} id={`q-${q.n}`} className="mb-5 scroll-mt-24">
          <p className="mb-2 leading-relaxed"><Num n={q.n} cur={current === q.n} /><AnnotatedText id={`q${q.n}`} text={q.text} ann={ann} />{mark(q)}</p>
          <div className="grid gap-1.5 pl-9" role="radiogroup" aria-label={`Question ${q.n}`}>
            {q.options!.map((o, i) => { const L = String.fromCharCode(65 + i); const on = answers[q.n] === L; return (
              <button key={L} role="radio" aria-checked={on} disabled={review} onClick={() => { set(q.n, on ? '' : L); onFocusQ?.(q.n) }} className={cx('flex min-h-10 items-center gap-3 rounded-xl border px-3 py-1.5 text-left', on ? 'border-transparent bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'border-[var(--ex-border)] bg-[var(--ex-panel)]')}>
                <b className="w-4">{L}</b><span>{o}</span>
              </button>) })}
          </div>
        </div>
      ))}

      {g.type === 'multi' && (
        <div id={`q-${g.qs[0].n}`} className="scroll-mt-24">
          {g.qs.slice(1).map((q) => <span key={q.n} id={`q-${q.n}`} />)}
          <div className="grid gap-1.5">
            {g.options!.map((o, i) => { const L = letters[i]; const on = selMulti.includes(L); return (
              <button key={L} role="checkbox" aria-checked={on} disabled={review || (!on && selMulti.length >= g.qs.length)} onClick={() => { set(g.qs[0].n, on ? selMulti.replace(L, '') : [...selMulti + L].sort().join('')); onFocusQ?.(g.qs[0].n) }}
                className={cx('flex min-h-10 items-center gap-3 rounded-xl border px-3 py-1.5 text-left disabled:opacity-50', on ? 'border-transparent bg-[var(--ex-accent)] text-[var(--ex-accent-fg)]' : 'border-[var(--ex-border)] bg-[var(--ex-panel)]')}><b className="w-4">{L}</b><span>{o}</span></button>) })}
          </div>
          {review && <p className="mt-2 text-[.9em] font-semibold">Correct answers: {g.qs.map((q) => displayAnswer(g, q)).join(' · ')}</p>}
        </div>
      )}

      {g.type === 'gap' && (
        <div className={cx(g.layout === 'form' || g.layout === 'notes' ? 'panel rounded-2xl border p-4' : '')}>
          {g.heading && <h4 className="mb-3 border-b border-[var(--ex-border)] pb-2 text-center text-[1em] font-bold">{g.heading}</h4>}
          {g.layout === 'summary'
            ? <p className="leading-loose">{g.qs.map((q) => <span key={q.n} id={`q-${q.n}`} className="scroll-mt-24">{gapText(q)}{mark(q)} </span>)}</p>
            : <ul className={cx('grid gap-2.5', g.layout === 'notes' && 'list-disc pl-5')}>{g.qs.map((q) => <li key={q.n} id={`q-${q.n}`} className="scroll-mt-24 leading-loose">{gapText(q)}{mark(q)}</li>)}</ul>}
        </div>
      )}

      {(g.type === 'match' || g.type === 'map') && (
        <div className="grid gap-4 md:grid-cols-2">
          {g.type === 'map' ? <SanctuaryMap /> : <ol className="panel grid gap-1 rounded-2xl border p-3 text-[.92em]">{g.options!.map((o, i) => <li key={o}><b className="mr-2">{letters[i]}</b>{o}</li>)}</ol>}
          <div className="grid content-start gap-2">
            {g.qs.map((q) => (
              <label key={q.n} id={`q-${q.n}`} className="flex scroll-mt-24 flex-wrap items-center gap-2">
                <Num n={q.n} cur={current === q.n} /><span className="flex-1 font-semibold">{q.text}</span>
                <select disabled={review} value={answers[q.n] || ''} onFocus={() => onFocusQ?.(q.n)} onChange={(e) => set(q.n, e.target.value)} className="h-9 rounded-lg px-2 font-bold" aria-label={`Question ${q.n}: ${q.text}`}>
                  <option value="">—</option>{letters.map((L) => <option key={L}>{L}</option>)}
                </select>{mark(q)}
              </label>
            ))}
          </div>
        </div>
      )}

      {g.type === 'heading' && (
        <div>
          <div className="mb-3 flex flex-wrap gap-2" aria-label="List of headings">
            {g.options!.map((o, i) => <DragPill key={o} value={ROMAN[i]} label={`${ROMAN[i]}  ${o}`} held={held} setHeld={setHeld} used={g.qs.some((q) => answers[q.n] === ROMAN[i])} />)}
          </div>
          <div className="grid gap-2">
            {g.qs.map((q) => (
              <div key={q.n} id={`q-${q.n}`} className="flex scroll-mt-24 flex-wrap items-center gap-2">
                <span className="w-24 font-semibold">{q.text}</span>
                <div className="min-w-0 flex-1"><DropSlot wide n={q.n} disabled={review} value={answers[q.n]} label={answers[q.n] ? `${answers[q.n]}  ${g.options![ROMAN.indexOf(answers[q.n])]}` : ''} onSet={(v) => { set(q.n, v); onFocusQ?.(q.n) }} held={held} setHeld={setHeld} /></div>
                {mark(q)}
              </div>
            ))}
          </div>
        </div>
      )}

      {g.type === 'bank' && (
        <div>
          <div className="mb-3 flex flex-wrap gap-2" aria-label="Word bank">{g.options!.map((o) => <DragPill key={o} value={o} label={o} held={held} setHeld={setHeld} used={g.qs.some((q) => answers[q.n] === o)} />)}</div>
          <p className="panel rounded-2xl border p-4 leading-[2.6]">
            {g.qs.map((q) => { const [a, b] = q.text.split('____'); return <span key={q.n} id={`q-${q.n}`} className="scroll-mt-24">{a}<DropSlot n={q.n} disabled={review} value={answers[q.n]} label={answers[q.n]} onSet={(v) => { set(q.n, v); onFocusQ?.(q.n) }} held={held} setHeld={setHeld} />{b}{mark(q)} </span> })}
          </p>
        </div>
      )}
    </section>
  )
}

/** Inline drop slot rendered above a passage paragraph for matching-headings questions. */
export function ParaHeadingSlot({ group, para, answers, set, held, setHeld, review }: { group: Group; para: string; answers: Answers; set: (n: number, v: string) => void; held: string | null; setHeld: (v: string | null) => void; review?: boolean }) {
  const q = group.qs.find((x) => x.para === para)
  if (!q) return null
  const v = answers[q.n]
  return <div className="mb-1.5"><DropSlot wide n={q.n} disabled={review} value={v} label={v ? `${v}  ${group.options![ROMAN.indexOf(v)]}` : ''} onSet={(x) => set(q.n, x)} held={held} setHeld={setHeld} /></div>
}
export function useHeld() { const [held, setHeld] = useState<string | null>(null); const ref = useRef(held); ref.current = held; return { held, setHeld } }
