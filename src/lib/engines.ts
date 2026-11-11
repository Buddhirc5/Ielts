import type { QType, Skill, Track } from '../types'
import { TYPE_LABEL } from '../types'
import { FILLERS } from '../data/speaking'
import { levelOf, STOP } from './wordlists'

/* ───────────── Engine 3: raw-to-band conversion ───────────── */
// [minimum raw score, band] — widely published approximate conversion tables.
const LISTENING: [number, number][] = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [2, 2], [1, 1]]
const AC_READING: [number, number][] = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [2, 2], [1, 1]]
const GT_READING: [number, number][] = [[40, 9], [39, 8.5], [37, 8], [36, 7.5], [34, 7], [32, 6.5], [30, 6], [27, 5.5], [23, 5], [19, 4.5], [15, 4], [12, 3.5], [9, 3], [6, 2.5], [3, 2], [1, 1]]

export function table(skill: 'listening' | 'reading', track: Track) { return skill === 'listening' ? LISTENING : track === 'academic' ? AC_READING : GT_READING }
export function rawToBand(skill: 'listening' | 'reading', track: Track, raw: number): number {
  for (const [min, band] of table(skill, track)) if (raw >= min) return band
  return 0
}
export function minRawFor(skill: 'listening' | 'reading', track: Track, band: number): number | null {
  const row = [...table(skill, track)].reverse().find(([, b]) => b >= band)
  return row ? row[0] : null
}
/** Official rounding: the mean of four skills to the nearest half band, with .25 → .5 and .75 → next whole band. */
export function overallBand(l: number, r: number, w: number, s: number): number { return Math.floor(((l + r + w + s) / 4) * 2 + 0.5) / 2 }
export const roundHalf = (n: number) => Math.round(n * 2) / 2

export interface WhatIf { feasible: boolean; neededSum: number; combos: { l: number; r: number; lRaw: number; rRaw: number; overall: number }[]; message: string }
export function whatIf(target: number, minBand: number, w: number, s: number, track: Track): WhatIf {
  if (w < minBand || s < minBand) return { feasible: false, neededSum: 0, combos: [], message: `Writing and Speaking must each reach at least ${minBand.toFixed(1)} to satisfy your minimum-band condition.` }
  const neededSum = (target - 0.25) * 4 - w - s
  const combos: WhatIf['combos'] = []
  for (let l = Math.max(minBand, 4); l <= 9; l += 0.5) {
    for (let r = Math.max(minBand, 4); r <= 9; r += 0.5) {
      if (l + r >= neededSum && l + r < neededSum + 0.5) {
        const lRaw = minRawFor('listening', track, l), rRaw = minRawFor('reading', track, r)
        if (lRaw !== null && rRaw !== null) combos.push({ l, r, lRaw, rRaw, overall: overallBand(l, r, w, s) })
      }
    }
  }
  if (!combos.length) {
    if (neededSum > 18) return { feasible: false, neededSum, combos, message: 'Even 40/40 in Listening and Reading cannot offset these Writing and Speaking scores. Raise one of them by half a band.' }
    const l = Math.max(minBand, 4), r = l
    combos.push({ l, r, lRaw: minRawFor('listening', track, l)!, rRaw: minRawFor('reading', track, r)!, overall: overallBand(l, r, w, s) })
  }
  combos.sort((a, b) => Math.abs(a.l - a.r) - Math.abs(b.l - b.r) || a.lRaw + a.rRaw - (b.lRaw + b.rRaw))
  return { feasible: true, neededSum, combos: combos.slice(0, 5), message: `Listening + Reading must total at least ${Math.max(neededSum, minBand * 2).toFixed(1)} bands.` }
}

/* ───────────── Engine 2: speaking fluency analysis ───────────── */
export interface SpeakingScore { wpm: number; zone: 'slow' | 'steady' | 'optimal' | 'fast' | 'rushed'; fillers: { word: string; count: number }[]; fillerCount: number; pauses: number; fluency: number; lexical: number; grammar: number; pronunciation: number | null; overall: number; notes: string[]; words: number }
export function countFillers(t: string) {
  const lower = ' ' + t.toLowerCase().replace(/[^a-z' ]/g, ' ') + ' '
  const out: { word: string; count: number }[] = []
  for (const f of FILLERS) { const c = lower.split(` ${f} `).length - 1; if (c) out.push({ word: f, count: c }) }
  return out
}
export const wpmZone = (wpm: number): SpeakingScore['zone'] => wpm < 100 ? 'slow' : wpm < 125 ? 'steady' : wpm <= 155 ? 'optimal' : wpm <= 170 ? 'fast' : 'rushed'
export function scoreSpeaking(input: { transcript: string; seconds: number; pauses: number; confidence?: number | null }): SpeakingScore {
  const { transcript, seconds, pauses } = input
  const toks = (transcript.toLowerCase().match(/[a-z']+/g) || [])
  const words = toks.length
  const wpm = seconds > 3 ? Math.round((words / seconds) * 60) : 0
  const fillers = countFillers(transcript)
  const fillerCount = fillers.reduce((a, b) => a + b.count, 0)
  const zone = wpmZone(wpm)
  const mins = Math.max(seconds / 60, 0.25)
  let fluency = 6
  fluency += zone === 'optimal' ? 1.5 : zone === 'steady' || zone === 'fast' ? 0.5 : zone === 'slow' ? -1 : -0.5
  const ppm = pauses / mins, fpm = fillerCount / mins
  fluency += ppm <= 1 ? 1 : ppm <= 2.5 ? 0.5 : ppm > 5 ? -1 : -0.5
  fluency += fpm <= 2 ? 0.5 : fpm > 6 ? -1 : fpm > 4 ? -0.5 : 0
  if (/\b(because|so|however|although|for example|for instance|on the other hand|as a result|which means)\b/i.test(transcript)) fluency += 0.5
  const content = toks.filter((t) => !STOP.has(t))
  const adv = content.filter((t) => levelOf(t) !== 'common').length / Math.max(1, content.length)
  const ttr = words ? new Set(toks).size / Math.min(words, 120) : 0
  let lexical = 5 + (adv >= 0.14 ? 1.5 : adv >= 0.08 ? 1 : adv >= 0.04 ? 0.5 : 0) + (ttr >= 0.62 ? 1 : ttr >= 0.5 ? 0.5 : 0)
  if (/\b(in terms of|to be honest|as far as|when it comes to|a wide range of|plays? a (vital|key|major) role|i would say|from my point of view|having said that)\b/i.test(transcript)) lexical += 0.5
  const cxHits = (transcript.match(/\b(although|whereas|which|who|whose|because|unless|if|when|while|since|would have|had been|have been|used to|even though)\b/gi) || []).length
  let grammar = 5 + (cxHits / Math.max(1, words / 15) >= 0.8 ? 1.5 : cxHits >= 3 ? 1 : cxHits >= 1 ? 0.5 : 0)
  if (/\b(would|could|might|should) have\b|\bif i (were|had)\b/i.test(transcript)) grammar += 0.5
  if (/\b(have|has) (been|\w+ed)\b/i.test(transcript)) grammar += 0.5
  const pronunciation = input.confidence != null && words > 8 ? Math.max(4, Math.min(9, 4 + (input.confidence - 0.55) * 11)) : null
  const cap = words < 15 ? 3.5 : words < 40 ? 5 : 9
  const f = Math.min(cap, roundHalf(Math.max(2, Math.min(9, fluency)))), lx = Math.min(cap, roundHalf(Math.min(9, lexical))), g = Math.min(cap, roundHalf(Math.min(9, grammar)))
  const p = pronunciation == null ? null : Math.min(cap, roundHalf(pronunciation))
  const parts = [f, lx, g, ...(p == null ? [] : [p])]
  const overall = words === 0 ? 0 : Math.floor((parts.reduce((a, b) => a + b, 0) / parts.length) * 2) / 2
  const notes: string[] = []
  if (!words) notes.push('No speech was transcribed. Check microphone permission, or use Chrome / Edge for live transcription.')
  if (zone === 'slow') notes.push(`At ${wpm} WPM your delivery is slow. Aim for 125–155 WPM by linking ideas instead of pausing between words.`)
  if (zone === 'rushed') notes.push(`At ${wpm} WPM you are rushing. Slow down slightly and stress key words — clarity matters more than speed.`)
  if (zone === 'optimal') notes.push(`${wpm} WPM is inside the optimal IELTS fluency zone.`)
  if (pauses > 2 * mins) notes.push(`${pauses} long pauses (over 1.5 s). Use thinking phrases — "Let me think…", "That's an interesting point…" — instead of silence.`)
  if (fillerCount > 3 * mins) notes.push(`Fillers detected ${fillerCount} times (${fillers.map((x) => x.word).slice(0, 3).join(', ')}). Replace them with a short silent breath.`)
  if (adv < 0.05 && words > 30) notes.push('Vocabulary is mostly everyday words. Add two or three topic-specific items or collocations.')
  if (cxHits < 2 && words > 30) notes.push('Use more complex structures: "although…", "which means…", "if I had…".')
  if (p == null && words > 0) notes.push('Pronunciation cannot be measured in this browser, so it is excluded from the estimate.')
  return { wpm, zone, fillers, fillerCount, pauses, fluency: f, lexical: lx, grammar: g, pronunciation: p, overall, notes, words }
}
export function bulletsHit(transcript: string, bullets: { kw: string[] }[]): boolean[] {
  const t = transcript.toLowerCase()
  return bullets.map((b) => b.kw.filter((k) => t.includes(k)).length >= (b.kw.length > 8 ? 2 : 1))
}

/* ───────────── Engine 6: SM-2 spaced repetition ───────────── */
export interface Card { id: string; front: string; back: string; example?: string; source: string; ef: number; interval: number; reps: number; due: number; lapses: number }
export type Grade = 'again' | 'hard' | 'good' | 'easy'
const Q: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 }
const DAY = 86400000
export function sm2(card: Card, grade: Grade, now = Date.now()): Card {
  const q = Q[grade]
  let { ef, interval, reps, lapses } = card
  if (q < 3) { reps = 0; interval = 0; lapses++ }
  else {
    interval = reps === 0 ? 1 : reps === 1 ? 6 : Math.round(interval * ef)
    if (grade === 'hard') interval = Math.max(1, Math.round(interval * 0.6))
    if (grade === 'easy') interval = Math.round(interval * 1.3)
    reps++
  }
  ef = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  return { ...card, ef, interval, reps, lapses, due: interval === 0 ? now + 10 * 60000 : now + interval * DAY }
}
export function previewInterval(card: Card, grade: Grade): string {
  const n = sm2(card, grade, 0)
  return n.interval === 0 ? '10 min' : n.interval === 1 ? '1 day' : n.interval < 30 ? `${n.interval} days` : `${(n.interval / 30).toFixed(1)} mo`
}
export const newCard = (front: string, back: string, source: string, example?: string): Card => ({ id: `${front.toLowerCase()}-${Math.random().toString(36).slice(2, 7)}`, front, back, example, source, ef: 2.5, interval: 0, reps: 0, due: Date.now(), lapses: 0 })

/* ───────────── Engine 4: adaptive study-path recommender ───────────── */
export interface StudyModule { id: string; skill: Skill; title: string; subtitle: string; qtype?: QType; action: string }
export const MODULES: StudyModule[] = [
  { id: 'm-tfng', skill: 'reading', title: 'True / False / Not Given drill', subtitle: 'Academic Reading', qtype: 'tfng', action: 'drill:reading:tfng' },
  { id: 'm-ynng', skill: 'reading', title: "Writer's views: Yes / No / Not Given", subtitle: 'Academic Reading', qtype: 'ynng', action: 'drill:reading:ynng' },
  { id: 'm-head', skill: 'reading', title: 'Matching Headings drill', subtitle: 'Academic Reading', qtype: 'heading', action: 'drill:reading:heading' },
  { id: 'm-bank', skill: 'reading', title: 'Summary completion drill', subtitle: 'Academic Reading', qtype: 'bank', action: 'drill:reading:bank' },
  { id: 'm-gapL', skill: 'listening', title: 'Form & note completion', subtitle: 'Listening Parts 1 & 4', qtype: 'gap', action: 'drill:listening:gap' },
  { id: 'm-map', skill: 'listening', title: 'Map labelling', subtitle: 'Listening Part 2', qtype: 'map', action: 'drill:listening:map' },
  { id: 'm-mcqL', skill: 'listening', title: 'Multiple choice & matching', subtitle: 'Listening Part 3', qtype: 'match', action: 'drill:listening:match' },
  { id: 'm-t1', skill: 'writing', title: 'Task 1: describe a chart', subtitle: 'Academic Writing', action: 'view:writing' },
  { id: 'm-t2', skill: 'writing', title: 'Task 2: essay studio', subtitle: 'Academic Writing', action: 'view:writing' },
  { id: 'm-cue', skill: 'speaking', title: 'Part 2 cue card long turn', subtitle: 'Speaking Simulator', action: 'view:speaking' },
]
export interface Recommendation { module: StudyModule; score: number; why: string; band: number }
export function recommend(input: { target: number; skillBand: Record<Skill, number>; typeStats: Partial<Record<QType, { correct: number; total: number }>>; lastPracticed: Partial<Record<string, number>>; now?: number }): Recommendation[] {
  const now = input.now ?? Date.now()
  const out = MODULES.map((module) => {
    const band = input.skillBand[module.skill]
    const st = module.qtype ? input.typeStats[module.qtype] : undefined
    const err = st && st.total ? 1 - st.correct / st.total : 0.3
    const last = input.lastPracticed[module.id] ?? input.lastPracticed[module.skill]
    const days = last ? Math.min(14, (now - last) / DAY) : 7
    const gap = Math.max(0, input.target - band)
    const score = gap * 2.5 + err * 3.0 + days * 0.4
    let why: string
    const name = module.skill[0].toUpperCase() + module.skill.slice(1)
    if (st && st.total >= 3 && err >= 0.3) why = `Your ${TYPE_LABEL[module.qtype!]} accuracy is ${Math.round((1 - err) * 100)}% — boost this to gain +0.5 Band in ${name}`
    else if (gap >= 1) why = `${name} is ${gap.toFixed(1)} bands below your target of ${input.target.toFixed(1)} — your biggest gap`
    else if (days >= 4) why = `Not practised for ${Math.round(days)} days — a short session keeps ${name} sharp`
    else if (gap > 0) why = `${name} is ${gap.toFixed(1)} below target — steady practice closes the gap`
    else why = `On target in ${name} — maintain it with one timed set`
    return { module, score, why, band }
  })
  out.sort((a, b) => b.score - a.score)
  // keep the top three varied: at most two modules from the same skill
  const picked: Recommendation[] = []
  for (const r of out) { if (picked.filter((p) => p.module.skill === r.module.skill).length < 2) picked.push(r); if (picked.length === 3) break }
  return picked
}

/* ───────────── answer checking ───────────── */
export const norm = (s: string) => s.toLowerCase().replace(/[\s.,£$-]+/g, '').trim()
export function isCorrect(answer: string, given: string | undefined): boolean {
  if (!given) return false
  return answer.split('|').some((a) => norm(a) === norm(given))
}
