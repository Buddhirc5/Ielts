export type QType = 'tfng' | 'ynng' | 'mcq' | 'multi' | 'gap' | 'match' | 'heading' | 'bank' | 'map'
export type Skill = 'listening' | 'reading' | 'writing' | 'speaking'
export type Track = 'academic' | 'general'

export interface Q {
  n: number
  text: string
  options?: string[]
  /** accepted answers separated by | (gaps), a letter (mcq/match/map/multi), a numeral (heading) or TRUE/FALSE/NOT GIVEN */
  answer: string
  /** exact evidence substring inside the passage / transcript */
  ev: string
  /** question phrase vs. passage paraphrase */
  qp: string
  pp: string
  trap: string
  para?: string
}
export interface Group {
  type: QType
  title: string
  instruction: string
  options?: string[]
  layout?: 'form' | 'notes' | 'summary' | 'list'
  heading?: string
  qs: Q[]
}
export interface Para { id: string; text: string; label?: string }
export interface Passage { id: string; title: string; subtitle?: string; paras: Para[]; groups: Group[] }
export interface Seg { sp: string; text: string }
export interface ListeningPart { id: string; title: string; context: string; accent: Accent; segs: Seg[]; groups: Group[] }
export type Accent = 'UK' | 'Australia' | 'New Zealand' | 'North America'

export const TYPE_LABEL: Record<QType, string> = {
  tfng: 'True / False / Not Given', ynng: 'Yes / No / Not Given', mcq: 'Multiple Choice', multi: 'Multiple Select',
  gap: 'Completion', match: 'Matching', heading: 'Matching Headings', bank: 'Summary (Word Bank)', map: 'Map Labelling',
}
