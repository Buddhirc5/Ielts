import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QType, Skill, Track } from './types'
import { newCard, sm2, type Card, type Grade } from './lib/engines'
import { SEED_VOCAB } from './data/vocab'

export type View = 'home' | 'learn' | 'practice' | 'writing' | 'speaking' | 'mock' | 'analytics'
export type Section =
  | { kind: 'listening'; parts: number[]; minutes: number; filter?: QType[] }
  | { kind: 'reading'; passages: number[]; minutes: number; filter?: QType[] }
  | { kind: 'writing'; minutes: number; t1?: string; t2?: string }
  | { kind: 'speaking'; cue: string }
export interface ExamConfig { id: string; title: string; kind: string; mode: 'exam' | 'practice'; sections: Section[]; moduleId?: string }
export interface Attempt { id: string; date: number; title: string; kind: string; bands: Partial<Record<Skill, number>>; raw?: Partial<Record<'listening' | 'reading', [number, number]>>; overall?: number }
export interface Essay { text: string; outline?: Record<string, string>; band?: number; updated: number }
export interface SpeakingLog { id: string; date: number; label: string; band: number; wpm: number; transcript: string; hasAudio: boolean }

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const DAY = 86400000

interface State {
  view: View; exam: ExamConfig | null
  onboarded: boolean; demo: boolean; name: string; track: Track; target: number; dest: string; examDate: string
  xp: number; streak: number; lastClaim: string
  attempts: Attempt[]; typeStats: Partial<Record<QType, { correct: number; total: number }>>; lastPracticed: Record<string, number>
  essays: Record<string, Essay>; deck: Card[]; lessonsDone: string[]; checklist: string[]; quizBest: Record<string, number>
  studyLog: Record<string, number>; speakingLog: SpeakingLog[]
  setView: (v: View) => void; startExam: (e: ExamConfig) => void; endExam: () => void
  setProfile: (p: Partial<Pick<State, 'name' | 'track' | 'target' | 'dest' | 'examDate' | 'onboarded'>>) => void
  addXp: (n: number) => void; claim: () => boolean
  saveAttempt: (a: Omit<Attempt, 'id' | 'date'>) => void
  recordTypes: (r: Partial<Record<QType, { correct: number; total: number }>>) => void
  touch: (key: string) => void; logMinutes: (m: number) => void
  saveEssay: (id: string, e: Partial<Essay>) => void
  addCard: (front: string, back: string, source: string, example?: string) => boolean
  reviewCard: (id: string, g: Grade) => void; removeCard: (id: string) => void
  completeLesson: (id: string) => void; toggleCheck: (id: string) => void; setQuizBest: (id: string, score: number) => void
  addSpeaking: (s: SpeakingLog) => void
  reset: (keepProfile?: boolean) => void
}

const blank = () => ({ xp: 0, streak: 0, lastClaim: '', attempts: [] as Attempt[], studyLog: {} as Record<string, number>, typeStats: {} as State['typeStats'], lastPracticed: {} as Record<string, number>, lessonsDone: [] as string[], quizBest: {} as Record<string, number>, deck: SEED_VOCAB.map(([f, b, e]) => newCard(f, b, 'Band 8+ deck', e)) })

export const useStore = create<State>()(persist((set, get) => ({
  view: 'home', exam: null,
  onboarded: false, demo: false, name: '', track: 'academic', target: 7, dest: 'uk', examDate: dayKey(new Date(Date.now() + 28 * DAY)),
  essays: {}, checklist: [], speakingLog: [],
  ...blank(),
  setView: (view) => { set({ view }); window.scrollTo({ top: 0 }) },
  startExam: (exam) => set({ exam }),
  endExam: () => set({ exam: null }),
  setProfile: (p) => set(p),
  addXp: (n) => set((s) => ({ xp: s.xp + n })),
  claim: () => {
    const s = get(), today = dayKey()
    if (s.lastClaim === today) return false
    const cont = s.lastClaim === dayKey(new Date(Date.now() - DAY))
    const streak = cont ? (s.streak >= 7 ? 1 : s.streak + 1) : 1
    set({ streak, lastClaim: today, xp: s.xp + 50 + streak * 10 })
    return true
  },
  saveAttempt: (a) => set((s) => ({ attempts: [...s.attempts, { ...a, id: Math.random().toString(36).slice(2), date: Date.now() }] })),
  recordTypes: (r) => set((s) => {
    const typeStats = { ...s.typeStats }
    for (const [k, v] of Object.entries(r) as [QType, { correct: number; total: number }][]) { const o = typeStats[k] || { correct: 0, total: 0 }; typeStats[k] = { correct: o.correct + v.correct, total: o.total + v.total } }
    return { typeStats }
  }),
  touch: (key) => set((s) => ({ lastPracticed: { ...s.lastPracticed, [key]: Date.now() } })),
  logMinutes: (m) => set((s) => { const k = dayKey(); return { studyLog: { ...s.studyLog, [k]: Math.round(((s.studyLog[k] || 0) + m) * 10) / 10 } } }),
  saveEssay: (id, e) => set((s) => ({ essays: { ...s.essays, [id]: { ...(s.essays[id] || { text: '' }), ...e, updated: Date.now() } } })),
  addCard: (front, back, source, example) => {
    if (get().deck.some((c) => c.front.toLowerCase() === front.toLowerCase())) return false
    set((s) => ({ deck: [newCard(front, back, source, example), ...s.deck] })); return true
  },
  reviewCard: (id, g) => set((s) => ({ deck: s.deck.map((c) => (c.id === id ? sm2(c, g) : c)), xp: s.xp + 5 })),
  removeCard: (id) => set((s) => ({ deck: s.deck.filter((c) => c.id !== id) })),
  completeLesson: (id) => set((s) => (s.lessonsDone.includes(id) ? {} : { lessonsDone: [...s.lessonsDone, id], xp: s.xp + 40 })),
  toggleCheck: (id) => set((s) => ({ checklist: s.checklist.includes(id) ? s.checklist.filter((x) => x !== id) : [...s.checklist, id] })),
  setQuizBest: (id, score) => set((s) => ({ quizBest: { ...s.quizBest, [id]: Math.max(s.quizBest[id] || 0, score) } })),
  addSpeaking: (sp) => set((s) => ({ speakingLog: [sp, ...s.speakingLog].slice(0, 30) })),
  reset: () => set({ ...blank(), demo: false, essays: {}, checklist: [], speakingLog: [] }),
}), {
  name: 'ielts-masterstudio-v2',
  partialize: (s) => { const { view: _v, exam: _e, ...rest } = s; return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')) as unknown as State },
}))

/** Latest known band for every skill (falls back to a neutral 5.5 baseline). */
export function skillBands(attempts: Attempt[]): Record<Skill, number> {
  const out: Record<Skill, number> = { listening: 5.5, reading: 5.5, writing: 5.5, speaking: 5.5 }
  for (const a of attempts) for (const [k, v] of Object.entries(a.bands) as [Skill, number][]) if (v) out[k] = v
  return out
}
export const hasBand = (attempts: Attempt[], skill: Skill) => attempts.some((a) => a.bands[skill])
