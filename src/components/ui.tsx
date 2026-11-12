import { motion, type HTMLMotionProps } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import type { ReactNode } from 'react'

export const spring = { type: 'spring', stiffness: 320, damping: 28, mass: 0.8 } as const
export const ICON = { strokeWidth: 1.75 } as const
export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')
export const fmtBand = (b: number) => (b ? b.toFixed(1) : '—')

/** Cards are always quiet white surfaces: colour fills passed by older call sites are dropped. */
const calm = (c: string) => c.replace(/!?\bbg-(mint|lav|butter|coral|forest|cream|gold|white)(\/\d+)?\b/g, '').replace(/\btext-white\b/g, '')
export function Bento({ className = '', children, onClick, ...rest }: HTMLMotionProps<'div'> & { children: ReactNode }) {
  return (
    <motion.div layout="position" initial={false} transition={spring}
      whileHover={onClick ? { y: -2 } : undefined} whileTap={onClick ? { scale: 0.985 } : undefined}
      onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') (onClick as any)(e) } : undefined}
      className={cx('card relative overflow-hidden rounded-[24px] p-5 sm:p-6', onClick && 'cursor-pointer', calm(className))} {...rest}>
      {children}
    </motion.div>
  )
}
export function Pill({ children, onClick, variant = 'dark', className = '', disabled, type = 'button' }: { children: ReactNode; onClick?: () => void; variant?: 'dark' | 'light' | 'ghost' | 'coral'; className?: string; disabled?: boolean; type?: 'button' | 'submit' }) {
  const v = { dark: 'bg-ink text-white', light: 'bg-white text-ink border border-black/10', ghost: 'bg-black/5 text-ink', coral: 'bg-ink text-white' }[variant]
  return (
    <motion.button type={type} disabled={disabled} onClick={onClick} whileHover={disabled ? undefined : { y: -2 }} whileTap={disabled ? undefined : { scale: 0.96 }} transition={spring}
      className={cx('inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold disabled:opacity-40', v, className)}>
      {children}
    </motion.button>
  )
}
export function CircleBtn({ onClick, icon, label, className = '', ring }: { onClick?: () => void; icon?: ReactNode; label: string; className?: string; ring?: boolean }) {
  return (
    <motion.button aria-label={label} title={label} onClick={onClick ? (e) => { e.stopPropagation(); onClick() } : undefined} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} transition={spring}
      className={cx('relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-ink', className)}>
      
      {icon ?? <ArrowRight size={18} {...ICON} />}
    </motion.button>
  )
}
export const UpRight = ({ onClick, label = 'Open' }: { onClick?: () => void; label?: string }) => <CircleBtn onClick={onClick} label={label} icon={<ArrowUpRight size={18} {...ICON} />} />

export function Tag({ children }: { children: ReactNode; i?: number; className?: string }) {
  return <span className="inline-block text-xs font-semibold text-ink/45">{children}</span>
}
export function BandBadge({ band, className = '' }: { band: number; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-sm', className)}><Star size={13} {...ICON} /> Band {fmtBand(band)}</span>
}
export function Ring({ value, size = 64, stroke = 6, color = '#141416', track = 'rgba(20,20,22,.12)', children }: { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - Math.max(0, Math.min(1, value))) }} transition={spring} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}
const AV = ['#EC6B78', '#F5B841', '#3D7A74', '#9C8AE0', '#5B8DEF']
export function Avatars({ names, extra }: { names: string[]; extra?: string }) {
  return (
    <div className="flex items-center">
      {names.map((n, i) => <span key={n} title={n} className="-ml-2 grid h-9 w-9 place-items-center rounded-full border-2 border-white text-xs font-bold text-white first:ml-0" style={{ background: AV[i % AV.length] }}>{n[0]}</span>)}
      {extra && <span className="-ml-2 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-white/80 text-xs font-bold text-ink">{extra}</span>}
    </div>
  )
}
export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">{children}</h2>{right}</div>
}
export function Segmented<T extends string>({ value, onChange, options, className = '' }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  return (
    <div className={cx('inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-black/5 p-1 no-scrollbar', className)}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className={cx('relative min-h-9 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors', value === o.value ? 'text-white' : 'text-ink/70')}>
          {value === o.value && <motion.span layoutId={`seg-${options.map((x) => x.value).join('')}`} transition={spring} className="absolute inset-0 rounded-full bg-ink" />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  )
}
/** Vertical pill bars with a hatched track, solid fill and a floating dark badge at the crest. */
export function StripedBars({ data, height = 220 }: { data: { label: string; pct: number; value: string; sub?: string; color: string }[]; height?: number }) {
  return (
    <div className="flex items-end justify-between gap-2 pt-3 sm:gap-3">
      {data.map((d, i) => {
        const h = Math.max(0.2, Math.min(1, d.pct / 100))
        return (
          <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="relative w-full max-w-20 rounded-full bg-black/[.04]" style={{ height }}>
              <motion.div initial={{ height: 0 }} animate={{ height: `${h * 100}%` }} transition={{ ...spring, delay: i * 0.05 }} className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center rounded-full bg-forest/20">
                
                <span className="text-lg font-extrabold leading-none tracking-tight text-ink">{d.value}</span>
                {d.sub && <span className="text-[11px] font-medium text-ink/70">{d.sub}</span>}
              </motion.div>
            </div>
            <span className="truncate text-sm font-semibold text-ink/80">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
export function Meter({ value, max = 9, label, right }: { value: number; max?: number; color?: string; label: string; right?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{label}</span><span className="font-bold tabnum">{right ?? fmtBand(value)}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-black/[.06]"><motion.div className="h-full rounded-full bg-forest" initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }} transition={spring} /></div>
    </div>
  )
}
export function Sheet({ children, onClose, wide }: { children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div role="dialog" aria-modal="true" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={spring} onClick={(e) => e.stopPropagation()}
        className={cx('max-h-[92vh] w-full overflow-y-auto safe-b rounded-t-[28px] bg-cream shadow-2xl no-scrollbar sm:rounded-[28px]', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}>
        {children}
      </motion.div>
    </motion.div>
  )
}
export function Books({ className = '' }: { className?: string }) {
  const book = (y: number, x: number, w: number, c1: string, c2: string, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 18 L${w * 0.45} 0 L${w} 14 L${w} 44 L${w * 0.55} 62 L0 48 Z`} fill={c2} />
      <path d={`M0 18 L${w * 0.45} 0 L${w} 14 L${w * 0.55} 32 Z`} fill={c1} />
      <path d={`M${w * 0.55} 36 L${w - 4} 19 L${w - 4} 41 L${w * 0.55} 58 Z`} fill="#fff" />
      <path d={`M${w * 0.55} 42 L${w - 4} 25 M${w * 0.55} 48 L${w - 4} 31 M${w * 0.55} 54 L${w - 4} 37`} stroke="#D9E3F5" strokeWidth="1.5" />
      <path d={`M${w * 0.18} 23 L${w * 0.18} 53 M${w * 0.26} 25 L${w * 0.26} 55`} stroke={c1} strokeWidth="5" opacity=".9" />
    </g>
  )
  const star = (x: number, y: number, s: number) => <path key={`${x}${y}`} transform={`translate(${x} ${y}) scale(${s})`} d="M0 -10 C1 -3 3 -1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0 -10Z" fill="#fff" />
  return (
    <svg viewBox="0 0 360 280" className={className} role="img" aria-label="A stack of study books">
      {[[250, 40, 1.6], [300, 110, 0.9], [80, 60, 0.9], [200, 20, 0.7], [320, 180, 1.1]].map(([x, y, s]) => star(x, y, s))}
      <ellipse cx="180" cy="252" rx="150" ry="16" fill="#C9BDF0" />
      {book(182, 52, 250, '#7FB3F5', '#5E9BEA', 0)}
      {book(138, 74, 220, '#EC6B78', '#D9515F', -3)}
      {book(96, 62, 236, '#F5B841', '#E0A22C', 2)}
      {book(54, 86, 200, '#7FB3F5', '#5E9BEA', -4)}
    </svg>
  )
}
export function Coin({ done, label, today }: { done: boolean; label: string; today?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div animate={today && !done ? { scale: [1, 1.08, 1] } : {}} transition={{ repeat: Infinity, duration: 1.6 }} className={cx('grid aspect-square w-full max-w-11 place-items-center rounded-full border-2', done ? 'border-gold bg-gold text-ink shadow-[inset_0_-3px_0_rgba(0,0,0,.15)]' : 'border-white/40 bg-white/15 text-white/80')}>
        {done ? <Star size={18} fill="#141416" {...ICON} /> : <span className="text-xs font-bold">{label[0]}</span>}
      </motion.div>
      <span className="text-[11px] font-semibold text-white/90">{label}</span>
    </div>
  )
}

/** One-minute paced breathing (4 s in, 6 s out) — a quick way to lower arousal before a test. */
export function Breathe({ onClose }: { onClose: () => void }) {
  return (
    <motion.div role="dialog" aria-modal="true" aria-label="One-minute breathing exercise" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] grid place-items-center bg-canvas p-6 text-center">
      <div>
        <div className="mx-auto grid h-56 w-56 place-items-center rounded-full border border-forest/20"><div className="h-full w-full rounded-full bg-forest/25" style={{ animation: 'breathe 10s ease-in-out infinite' }} /></div>
        <p className="mt-8 text-xl font-semibold">Breathe in as the circle grows.<br />Breathe out as it shrinks.</p>
        <p className="mt-2 text-sm text-ink/60">Six slow breaths is about one minute.</p>
        <Pill className="mt-8" onClick={onClose}>I'm ready</Pill>
      </div>
    </motion.div>
  )
}
