import { useState } from 'react'
import { BAR_DATA, LINE_DATA, PIE_DATA, PROCESS_STEPS, type ChartKind } from '../data/writing'

const AX = 'currentColor'
const tip = 'rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white'

function Line() {
  const [hover, setHover] = useState<string | null>(null)
  const W = 520, H = 300, L = 44, B = 36, T = 16, R = 16
  const x = (i: number) => L + (i * (W - L - R)) / (LINE_DATA.years.length - 1)
  const y = (v: number) => T + (1 - v / 100) * (H - T - B)
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Line graph of household internet access">
        {[0, 20, 40, 60, 80, 100].map((v) => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={AX} opacity=".12" /><text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill={AX} opacity=".7">{v}%</text></g>)}
        {LINE_DATA.years.map((yr, i) => <text key={yr} x={x(i)} y={H - 12} textAnchor="middle" fontSize="11" fill={AX} opacity=".7">{yr}</text>)}
        {LINE_DATA.series.map((s) => (
          <g key={s.name}>
            <polyline fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
            {s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={hover === `${s.name}${i}` ? 7 : 4.5} fill="#fff" stroke={s.color} strokeWidth="3" tabIndex={0} onMouseEnter={() => setHover(`${s.name}${i}`)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(`${s.name}${i}`)} onBlur={() => setHover(null)}><title>{`${s.name}, ${LINE_DATA.years[i]}: ${v}%`}</title></circle>)}
            {s.values.map((v, i) => hover === `${s.name}${i}` && <text key={`t${i}`} x={x(i)} y={y(v) - 12} textAnchor="middle" fontSize="12" fontWeight="700" fill={AX}>{v}%</text>)}
          </g>
        ))}
      </svg>
      <Legend items={LINE_DATA.series.map((s) => [s.name, s.color])} />
      <figcaption className="mt-1 text-center text-xs opacity-70">Households with internet access (%), 2000–2020</figcaption>
    </figure>
  )
}
function Legend({ items }: { items: string[][] }) {
  return <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-semibold">{items.map(([n, c]) => <span key={n} className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{n}</span>)}</div>
}
function Bar() {
  const W = 520, H = 300, L = 40, B = 40, T = 20, R = 10
  const gw = (W - L - R) / BAR_DATA.cats.length, bw = 34
  const y = (v: number) => T + (1 - v / 30) * (H - T - B)
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Bar chart of weekly hours by activity">
        {[0, 10, 20, 30].map((v) => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={AX} opacity=".12" /><text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill={AX} opacity=".7">{v}</text></g>)}
        {BAR_DATA.cats.map((c, i) => (
          <g key={c}>
            {BAR_DATA.series.map((s, j) => { const bx = L + i * gw + gw / 2 + (j ? 3 : -bw - 3); return <g key={s.name}><rect x={bx} y={y(s.values[i])} width={bw} height={y(0) - y(s.values[i])} rx="8" fill={s.color}><title>{`${s.name}, ${c}: ${s.values[i]} hours`}</title></rect><text x={bx + bw / 2} y={y(s.values[i]) - 5} textAnchor="middle" fontSize="11" fontWeight="700" fill={AX}>{s.values[i]}</text></g> })}
            <text x={L + i * gw + gw / 2} y={H - 14} textAnchor="middle" fontSize="11" fill={AX} opacity=".8">{c}</text>
          </g>
        ))}
      </svg>
      <Legend items={BAR_DATA.series.map((s) => [s.name, s.color])} />
      <figcaption className="mt-1 text-center text-xs opacity-70">Average hours per week</figcaption>
    </figure>
  )
}
function PieOne({ values, label }: { values: number[]; label: string }) {
  let a = -Math.PI / 2
  const arcs = values.map((v, i) => {
    const a2 = a + (v / 100) * Math.PI * 2, r = 80, big = a2 - a > Math.PI ? 1 : 0
    const p = `M100 100 L${100 + r * Math.cos(a)} ${100 + r * Math.sin(a)} A${r} ${r} 0 ${big} 1 ${100 + r * Math.cos(a2)} ${100 + r * Math.sin(a2)}Z`
    const mid = (a + a2) / 2; a = a2
    return <g key={i}><path d={p} fill={PIE_DATA.colors[i]} stroke="#fff" strokeWidth="2"><title>{`${PIE_DATA.cats[i]}: ${v}%`}</title></path><text x={100 + 54 * Math.cos(mid)} y={100 + 54 * Math.sin(mid) + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#141416">{v}%</text></g>
  })
  return <div className="flex-1 text-center"><svg viewBox="0 0 200 200" className="mx-auto w-full max-w-56" role="img" aria-label={`Pie chart ${label}`}>{arcs}</svg><div className="text-sm font-bold">{label}</div></div>
}
function Pie() {
  return <figure><div className="flex gap-3"><PieOne values={PIE_DATA.a.values} label={PIE_DATA.a.label} /><PieOne values={PIE_DATA.b.values} label={PIE_DATA.b.label} /></div><Legend items={PIE_DATA.cats.map((c, i) => [c, PIE_DATA.colors[i]])} /><figcaption className="mt-1 text-center text-xs opacity-70">Household energy use by purpose</figcaption></figure>
}
function Process() {
  const [on, setOn] = useState(0)
  return (
    <figure>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PROCESS_STEPS.map(([name, d], i) => (
          <li key={name}>
            <button onClick={() => setOn(i)} className={`relative h-full w-full rounded-[20px] border p-3 text-left transition ${on === i ? 'border-transparent bg-forest text-white' : 'border-current/15 bg-white/60'}`}>
              <span className={`mb-1 grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${on === i ? 'bg-white text-forest' : 'bg-ink text-white'}`}>{i + 1}</span>
              <span className="block text-sm font-bold">{name}</span>
              <span className="block text-xs opacity-80">{d}</span>
              {i < PROCESS_STEPS.length - 1 && <span aria-hidden className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-lg font-bold text-ink/50 sm:block">{(i + 1) % 4 ? '›' : ''}</span>}
            </button>
          </li>
        ))}
      </ol>
      <figcaption className="mt-2 text-center text-xs opacity-70">The production of black tea — tap a stage to focus on it</figcaption>
    </figure>
  )
}
function MapOne({ year }: { year: 1995 | 2025 }) {
  const now = year === 2025
  const lab = (x: number, y: number, t: string) => <text x={x} y={y} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#141416">{t}</text>
  return (
    <div className="flex-1">
      <svg viewBox="0 0 240 200" className="w-full rounded-[20px] border border-black/10 bg-[#F4F1DE]" role="img" aria-label={`Map of Meadowside in ${year}`}>
        <rect x="14" y="12" width="130" height="62" rx="8" fill={now ? '#F6C7CC' : '#E4D9A6'} />{lab(79, 40, now ? 'Housing estate' : 'Farmland')}
        {now && [0, 1, 2, 3, 4].map((i) => <rect key={i} x={26 + i * 23} y={50} width="14" height="12" rx="2" fill="#EC6B78" />)}
        <rect x="160" y="12" width="68" height="96" rx="10" fill="#9CCDB4" />{lab(194, 34, 'Forest')}
        {now && <><rect x="164" y="62" width="60" height="44" rx="8" fill="#F5B841" />{lab(194, 88, 'Sports centre')}</>}
        <path d="M0 150 C60 135 120 165 240 142 L240 164 C120 186 60 156 0 172Z" fill="#9CC9EE" />{lab(40, 164, 'River')}
        <rect x="96" y="92" width={now ? 50 : 30} height="26" rx="6" fill={now ? '#3D7A74' : '#C9BDF0'} /><text x={now ? 121 : 111} y="108" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={now ? '#fff' : '#141416'}>{now ? 'Supermarket' : 'Shop'}</text>
        {now && <><rect x="96" y="121" width="30" height="13" rx="3" fill="#d4d4d8" /><text x="111" y="130.5" textAnchor="middle" fontSize="7" fontWeight="700">Car park</text></>}
        <rect x="18" y="96" width={now ? 58 : 38} height={now ? 34 : 24} rx="6" fill="#FFE08A" />{lab(now ? 47 : 37, now ? 116 : 111, 'School')}
        {now ? <><rect x="150" y="70" width="8" height="118" fill="#8b8b93" /><rect x="100" y="76" width="58" height="7" fill="#8b8b93" /><text x="178" y="188" fontSize="8.5" fontWeight="700">Road bridge</text></> : <><rect x="152" y="138" width="4" height="40" fill="#8a6d3b" /><text x="162" y="188" fontSize="8.5" fontWeight="700">Footbridge</text></>}
        <text x="226" y="194" textAnchor="end" fontSize="9" fontWeight="800">N ↑</text>
      </svg>
      <div className="mt-1 text-center text-sm font-bold">{year}</div>
    </div>
  )
}
export function Task1Chart({ kind }: { kind: ChartKind }) {
  if (kind === 'line') return <Line />
  if (kind === 'bar') return <Bar />
  if (kind === 'pie') return <Pie />
  if (kind === 'process') return <Process />
  return <figure><div className="flex gap-3"><MapOne year={1995} /><MapOne year={2025} /></div><figcaption className="mt-1 text-center text-xs opacity-70">The village of Meadowside</figcaption></figure>
}
export function Spark({ values }: { values: number[] }) {
  const W = 260, H = 90, x = (i: number) => 10 + (i * (W - 20)) / (values.length - 1), y = (v: number) => H - 10 - (v / 100) * (H - 20)
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm rounded-[20px] bg-white/70" role="img" aria-label="Trend line"><polyline fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />{values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="4" fill="#EC6B78" />)}</svg>
}
export { tip }
