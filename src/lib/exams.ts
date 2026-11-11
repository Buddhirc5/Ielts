import type { QType, Track } from '../types'
import type { ExamConfig } from '../store'
import { CUE_CARDS } from '../data/speaking'

const w = (track: Track) => ({ kind: 'writing' as const, minutes: 60, t1: track === 'academic' ? 't1-line' : 'gt-formal', t2: 't2-opinion' })

export const EXAMS = {
  express: (): ExamConfig => ({ id: 'express', kind: 'express', mode: 'exam', title: 'Express Mock · 25 minutes', sections: [{ kind: 'listening', parts: [0], minutes: 8 }, { kind: 'reading', passages: [0], minutes: 17 }] }),
  mini: (): ExamConfig => ({ id: 'mini', kind: 'mini', mode: 'exam', title: 'Mini Mock · 50 minutes', sections: [{ kind: 'listening', parts: [0, 1], minutes: 15 }, { kind: 'reading', passages: [0, 1], minutes: 35 }] }),
  full: (track: Track): ExamConfig => ({ id: 'full', kind: 'full', mode: 'exam', title: 'Full Mock Exam', sections: [{ kind: 'listening', parts: [0, 1, 2, 3], minutes: 32 }, { kind: 'reading', passages: [0, 1, 2], minutes: 60 }, w(track), { kind: 'speaking', cue: CUE_CARDS[0].id }] }),
  listening: (mode: 'exam' | 'practice' = 'exam'): ExamConfig => ({ id: 'listening', kind: 'listening', mode, title: mode === 'exam' ? 'Listening Test' : 'Listening Practice', sections: [{ kind: 'listening', parts: [0, 1, 2, 3], minutes: 32 }] }),
  reading: (mode: 'exam' | 'practice' = 'exam'): ExamConfig => ({ id: 'reading', kind: 'reading', mode, title: mode === 'exam' ? 'Reading Test' : 'Reading Practice', sections: [{ kind: 'reading', passages: [0, 1, 2], minutes: 60 }] }),
  writing: (track: Track): ExamConfig => ({ id: 'writing', kind: 'writing', mode: 'exam', title: 'Writing Test', sections: [w(track)] }),
  part: (skill: 'listening' | 'reading', idx: number, title: string): ExamConfig => ({ id: `${skill}-${idx}`, kind: 'drill', mode: 'practice', title, sections: [skill === 'listening' ? { kind: 'listening', parts: [idx], minutes: 10 } : { kind: 'reading', passages: [idx], minutes: 20 }] }),
  drill: (skill: 'listening' | 'reading', types: QType[], title: string, moduleId?: string): ExamConfig => ({ id: `drill-${types.join('-')}`, kind: 'drill', mode: 'practice', moduleId, title, sections: [skill === 'listening' ? { kind: 'listening', parts: [0, 1, 2, 3], minutes: 20, filter: types } : { kind: 'reading', passages: [0, 1, 2], minutes: 20, filter: types }] }),
}
/** Resolve a recommender action string such as "drill:reading:tfng" or "view:writing". */
export const DRILL_TYPES: Record<string, QType[]> = { tfng: ['tfng'], ynng: ['ynng'], heading: ['heading'], bank: ['bank', 'gap'], gap: ['gap'], map: ['map'], match: ['match', 'mcq', 'multi'] }
