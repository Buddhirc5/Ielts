import { useState } from 'react'
import type { QType, Skill } from '../types'
import { TYPE_LABEL } from '../types'
import { minRawFor, overallBand, rawToBand, table, whatIf } from '../lib/engines'
import { skillBands, useStore } from '../store'
import { Leaderboard } from '../components/Account'
import { Bento, Meter, SectionTitle, Tag, cx, fmtBand } from '../components/ui'

const SK: Skill[] = ['listening', 'reading', 'writing', 'speaking']
const COL: Record<Skill, string> = { listening: '#3D7A74', reading: '#EC6B78', writing: '#F5B841', speaking: '#9C8AE0' }

function Slider({ label, value, set, min, max, step, fmt }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step: number; fmt?: (n: number) => string }) {
  return <label className="grid gap-1 text-sm font-semibold"><span className="flex justify-between"><span>{label}</span><span className="text-xl font-extrabold tracking-tight tabnum">{fmt ? fmt(value) : value}</span></span><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} className="w-full accent-ink" /></label>
}

function History() {
  const attempts = useStore((s) => s.attempts)
  if (attempts.length < 2) return <p className="text-sm text-ink/60">Complete two or more tests to see your band trend.</p>
  const W = 560, H = 220, L = 30, B = 26, T = 12, R = 28
  const x = (i: number) => L + (i * (W - L - R)) / (attempts.length - 1), y = (b: number) => T + (1 - (b - 4) / 5) * (H - T - B)
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Band score history by skill">
        {[4, 5, 6, 7, 8, 9].map((b) => <g key={b}><line x1={L} x2={W - R} y1={y(b)} y2={y(b)} stroke="currentColor" opacity=".08" /><text x={L - 8} y={y(b) + 4} fontSize="11" textAnchor="end" fill="currentColor" opacity=".6">{b}</text></g>)}
        {attempts.map((a, i) => <text key={a.id} x={x(i)} y={H - 8} fontSize="10" textAnchor="middle" fill="currentColor" opacity=".6">{new Date(a.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</text>)}
        {SK.map((k) => { const pts = attempts.map((a, i) => (a.bands[k] != null ? [x(i), y(Math.max(4, a.bands[k]!)), a.bands[k]!] : null)).filter(Boolean) as number[][]; return (
          <g key={k}><polyline fill="none" stroke={COL[k]} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={pts.map((p) => `${p[0]},${p[1]}`).join(' ')} />{pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4.5" fill="var(--color-white)" stroke={COL[k]} strokeWidth="2.5"><title>{`${k}: Band ${p[2]}`}</title></circle>)}</g>) })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">{SK.map((k) => <span key={k} className="inline-flex items-center gap-1.5 capitalize"><i className="h-2.5 w-2.5 rounded-full" style={{ background: COL[k] }} />{k}</span>)}</div>
    </div>
  )
}

export default function Analytics() {
  const s = useStore()
  const bands = skillBands(s.attempts)
  const lastRaw = (k: 'listening' | 'reading') => { const a = [...s.attempts].reverse().find((x) => x.raw?.[k]); return a ? Math.round((a.raw![k]![0] / a.raw![k]![1]) * 40) : 28 }
  const [lRaw, setL] = useState(lastRaw('listening')), [rRaw, setR] = useState(lastRaw('reading')), [w, setW] = useState(bands.writing), [sp, setSp] = useState(bands.speaking)
  const lB = rawToBand('listening', s.track, lRaw), rB = rawToBand('reading', s.track, rRaw), ov = overallBand(lB, rB, w, sp), mean = (lB + rB + w + sp) / 4
  const [target, setTarget] = useState(s.target), [minB, setMinB] = useState(Math.max(5, Math.min(s.target - 0.5, bands.writing, bands.speaking))), [wW, setWW] = useState(bands.writing), [wS, setWS] = useState(bands.speaking)
  const sim = whatIf(target, minB, wW, wS, s.track)
  const types = (Object.entries(s.typeStats) as [QType, { correct: number; total: number }][]).filter(([, v]) => v.total).map(([k, v]) => ({ k, acc: v.correct / v.total, total: v.total })).sort((a, b) => a.acc - b.acc)
  const [tab, setTab] = useState<'listening' | 'reading'>('listening')
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Analytics & Band Calculator</h1>
      </header>
      <div className="grid gap-5 lg:grid-cols-3">
        <Bento className="bg-white lg:col-span-2"><SectionTitle>Band history</SectionTitle><History /></Bento>
        <Bento className="bg-lav"><SectionTitle>Current estimate</SectionTitle><div className="grid gap-3">{SK.map((k) => <Meter key={k} label={k[0].toUpperCase() + k.slice(1)} value={bands[k]} color={COL[k]} />)}</div><p className="mt-4 text-xs text-ink/60">From your most recent result in each skill. Writing and Speaking bands are algorithmic estimates, not examiner scores.</p></Bento>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Bento className="bg-mint">
          <SectionTitle>Band score calculator</SectionTitle>
          <div className="grid gap-4">
            <Slider label={`Listening raw score → Band ${fmtBand(lB)}`} value={lRaw} set={setL} min={0} max={40} step={1} fmt={(n) => `${n}/40`} />
            <Slider label={`${s.track === 'academic' ? 'Academic' : 'General'} Reading raw score → Band ${fmtBand(rB)}`} value={rRaw} set={setR} min={0} max={40} step={1} fmt={(n) => `${n}/40`} />
            <Slider label="Writing band" value={w} set={setW} min={1} max={9} step={0.5} fmt={fmtBand} />
            <Slider label="Speaking band" value={sp} set={setSp} min={1} max={9} step={0.5} fmt={fmtBand} />
          </div>
          <div className="mt-5 flex items-center justify-between rounded-[20px] bg-white p-4"><div><div className="text-sm font-semibold text-ink/60">Overall band</div><div className="text-5xl font-extrabold tracking-tight tabnum">{fmtBand(ov)}</div></div><div className="max-w-52 text-right text-xs text-ink/60">Mean of four skills = <b className="tabnum">{mean.toFixed(3)}</b>. Rounded to the nearest half band: .25 rounds up to .5, .75 rounds up to the next whole band.</div></div>
        </Bento>
        <Bento className="bg-butter">
          <SectionTitle>What-If Target Simulator</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Slider label="Required overall" value={target} set={setTarget} min={5} max={9} step={0.5} fmt={fmtBand} />
            <Slider label="No band less than" value={minB} set={setMinB} min={4} max={9} step={0.5} fmt={fmtBand} />
            <Slider label="Expected Writing" value={wW} set={setWW} min={4} max={9} step={0.5} fmt={fmtBand} />
            <Slider label="Expected Speaking" value={wS} set={setWS} min={4} max={9} step={0.5} fmt={fmtBand} />
          </div>
          <div className={cx('mt-4 rounded-[20px] p-4 text-sm', sim.feasible ? 'bg-cream' : 'bg-butter')}>
            <p className="font-semibold">{sim.message}</p>
            {sim.feasible && <table className="mt-3 w-full text-left"><thead><tr className="text-xs text-ink/50"><th className="py-1 font-semibold">Listening</th><th className="font-semibold">Reading</th><th className="font-semibold">Overall</th></tr></thead>
              <tbody>{sim.combos.map((c, i) => <tr key={i} className={cx('border-t border-black/5', i === 0 && 'font-bold')}><td className="py-2 tabnum">Band {fmtBand(c.l)} <span className="text-ink/60">(≥ {c.lRaw}/40)</span></td><td className="tabnum">Band {fmtBand(c.r)} <span className="text-ink/60">(≥ {c.rRaw}/40)</span></td><td><span className="rounded-full bg-mint px-2 py-0.5 tabnum">{fmtBand(c.overall)}</span></td></tr>)}</tbody></table>}
            {sim.feasible && <p className="mt-2 text-xs text-ink/60">Each row is a minimum combination of raw marks that offsets your Writing and Speaking. The first row is the most balanced.</p>}
          </div>
        </Bento>
      </div>

      <Leaderboard />
      <div className="grid gap-5 lg:grid-cols-2">
        <Bento className="bg-white">
          <SectionTitle>Accuracy by question type</SectionTitle>
          {types.length === 0 ? <p className="text-sm text-ink/60">Answer some Listening or Reading questions to see which types cost you marks.</p> : <div className="grid gap-3">{types.map((t) => <Meter key={t.k} label={`${TYPE_LABEL[t.k]} · ${t.total} q`} value={t.acc * 100} max={100} right={`${Math.round(t.acc * 100)}%`} color={t.acc < 0.6 ? '#EC6B78' : t.acc < 0.75 ? '#F5B841' : '#3D7A74'} />)}</div>}
        </Bento>
        <Bento className="bg-white">
          <SectionTitle right={<div className="flex gap-1 rounded-full bg-black/5 p-1">{(['listening', 'reading'] as const).map((k) => <button key={k} onClick={() => setTab(k)} className={cx('min-h-9 rounded-full px-3 text-xs font-bold capitalize', tab === k && 'bg-ink text-white')}>{k}</button>)}</div>}>Raw → band table</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">{table(tab, s.track).map(([min, b], i, arr) => <div key={b} className="flex justify-between border-b border-black/5 py-1.5 tabnum"><span className="font-bold">Band {fmtBand(b)}</span><span className="text-ink/60">{min}{i > 0 && arr[i - 1][0] - 1 !== min ? `–${arr[i - 1][0] - 1}` : i === 0 && min < 40 ? '–40' : ''}</span></div>)}</div>
          <p className="mt-3 text-xs text-ink/60">Approximate conversion for {tab === 'reading' ? (s.track === 'academic' ? 'Academic' : 'General Training') + ' Reading' : 'Listening'}. Exact boundaries vary slightly between test versions. To reach Band {fmtBand(s.target)} you need about {minRawFor(tab, s.track, s.target) ?? '—'}/40.</p>
        </Bento>
      </div>
    </div>
  )
}
