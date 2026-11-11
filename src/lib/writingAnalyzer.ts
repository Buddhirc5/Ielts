import { LINKERS, MECHANICAL, REFERENCING, STOP, SYN, WEAK, levelOf, type Level } from './wordlists'

export type TaskKind = 'task1' | 'task2' | 'letter'
export interface Token { text: string; start: number; end: number; level: Level; weak?: string; repeated?: boolean }
export interface Issue { type: string; msg: string; excerpt: string }
export interface SentenceInfo { text: string; kind: 'simple' | 'compound' | 'complex'; words: number }
export interface Analysis {
  words: number; minWords: number; sentences: SentenceInfo[]; paragraphs: string[]
  bands: { ta: number; cc: number; lr: number; gra: number; overall: number }
  ta: { wordPenalty: boolean; paragraphOk: boolean; balance: number; overview: boolean; thesis: boolean; conclusion: boolean; coverage: number; covered: string[]; missing: string[]; dataPoints: number }
  cc: { byCat: Record<string, string[]>; total: number; mechanicalRate: number; mechanical: string[]; referencing: number }
  lr: { tokens: Token[]; ttr: number; pct: { common: number; b2: number; c1: number }; repeated: { word: string; count: number }[]; weak: { word: string; count: number; upgrades: string[] }[] }
  gra: { simple: number; compound: number; complex: number; passives: number; conditionals: number; relatives: number; avgLen: number; issues: Issue[] }
  tips: string[]
}

const half = (n: number) => Math.round(n * 2) / 2
const clamp = (n: number, lo = 1, hi = 9) => Math.max(lo, Math.min(hi, n))
const SUBORD = /\b(although|though|even though|whereas|while|whilst|because|since|unless|provided that|as long as|despite the fact that|so that|in order that|if|when|whenever|once|until|after|before|as soon as|given that|whether)\b/i
const RELATIVE = /\b(which|whose|whereby|whom|who|, where|that (is|are|was|were|has|have|can|will|would))\b/i
const PARTICIPLE = /(^|, |; )(having|being|starting|compared|given|followed|leaving|making|reducing|overtaking|finishing|reaching|fearing|resulting|leading|causing|allowing)\b|, (\w{4,}ing) |\b(after|from|in|during|by|on) which\b|\b(more|less|fewer|higher|lower|\w+er) than\b.*\b(was|were|is|are|did|had)\b/i
const COORD = /,\s*(and|but|or|so|yet|nor)\s|;\s|\b(and|but|so)\s+(it|they|this|these|he|she|we|i|there|the)\b/i
const PASSIVE = /\b(is|are|was|were|be|been|being)\s+(\w+ly\s+)?(\w+ed|built|made|done|given|taken|seen|shown|known|found|held|kept|left|sold|sent|spent|grown|paid|put|cut|set|drawn|driven|written|chosen)\b/gi
const COND = /\b(if|unless|provided that|as long as|were .* to|had .* (been|known|not))\b/i
const OVERVIEW = /\b(overall|in general|generally speaking|to summarise|in summary|as an overall trend|it is clear that|it is evident that|a glance at|at first glance|what stands out|the most striking|it can be seen that|broadly speaking)\b/i
const THESIS = /\b(i (strongly |firmly |completely |partly |totally )?(believe|agree|disagree|think|would argue|contend|maintain)|in my (opinion|view)|this essay (will|argues|discusses|examines)|my view is|i am convinced|from my perspective|it seems to me)\b/i
const CONCL = /\b(in conclusion|to conclude|to sum up|in summary|all in all|on balance|ultimately|in short)\b/i
const CONTRACTION = /\b(\w+)(n't|'re|'ve|'ll|'m|'d)\b|\b(it|that|there|he|she|what|who|let)'s\b/gi

export function splitSentences(text: string): string[] {
  return text.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+(?=["'(]?[A-Z0-9])/).map((s) => s.trim()).filter((s) => /\w/.test(s))
}
export const countWords = (t: string) => (t.match(/[A-Za-z0-9][A-Za-z0-9'’%.-]*/g) || []).length

function promptKeywords(prompt: string): string[] {
  const generic = new Set(['people', 'some', 'think', 'believe', 'others', 'view', 'views', 'opinion', 'discuss', 'extent', 'agree', 'disagree', 'give', 'summarise', 'information', 'selecting', 'reporting', 'main', 'features', 'make', 'comparisons', 'relevant', 'shows', 'show', 'below', 'graph', 'chart', 'charts', 'diagram', 'maps', 'two', 'one', 'many', 'large', 'numbers', 'such', 'what', 'does', 'this', 'cause', 'suggest', 'more', 'rather', 'development', 'happening', 'positive', 'negative', 'being', 'replaced', 'while', 'better', 'gain', 'regardless', 'their', 'should', 'write', 'letter', 'your', 'year', 'between', 'average', 'number', 'four', 'three', 'different', 'used', 'stages', 'production', 'activities', 'spent', 'areas', 'access', 'week', 'male', 'female', 'recently', 'when', 'would', 'like', 'explain', 'describe', 'pie', 'bar', 'line'])
  const out: string[] = []
  for (const m of prompt.toLowerCase().match(/[a-z]{4,}/g) || []) if (!STOP.has(m) && !generic.has(m) && !out.includes(m)) out.push(m)
  return out.slice(0, 12)
}

export function analyze(text: string, opts: { task: TaskKind; prompt: string }): Analysis {
  const { task, prompt } = opts
  const minWords = task === 'task2' ? 250 : 150
  const lower = text.toLowerCase()
  const words = countWords(text)
  const paragraphs = text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter((p) => countWords(p) >= 3)
  const rawSentences = splitSentences(text)

  const promptLower = prompt.toLowerCase()
  // ---------- Lexical profile ----------
  const tokens: Token[] = []
  const freq: Record<string, number> = {}
  const re = /[A-Za-z][A-Za-z'’-]*/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const t = m[0], l = t.toLowerCase()
    // words lifted straight from the prompt earn no lexical credit
    const tok: Token = { text: t, start: m.index, end: m.index + t.length, level: STOP.has(l) || (l.length > 3 && promptLower.includes(l.replace(/(s|ed|ing)$/, ''))) ? 'common' : levelOf(l) }
    if (WEAK[l]) tok.weak = l
    tokens.push(tok)
    if (!STOP.has(l) && l.length > 2) freq[l] = (freq[l] || 0) + 1
  }
  const promptWords = new Set(promptKeywords(prompt))
  const repeated = Object.entries(freq).filter(([wd, c]) => c >= (promptWords.has(wd) ? 6 : 3) && !WEAK[wd]).map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count).slice(0, 10)
  const repSet = new Set(repeated.map((r) => r.word))
  tokens.forEach((t) => { if (repSet.has(t.text.toLowerCase())) t.repeated = true })
  const weakCounts: Record<string, number> = {}
  tokens.forEach((t) => { if (t.weak) weakCounts[t.weak] = (weakCounts[t.weak] || 0) + 1 })
  const phraseCount = (lower.match(/\ba lot of\b/g) || []).length
  if (phraseCount) weakCounts['a lot of'] = phraseCount
  const weak = Object.entries(weakCounts).map(([word, count]) => ({ word, count, upgrades: WEAK[word] })).sort((a, b) => b.count - a.count)
  const content = tokens.filter((t) => !STOP.has(t.text.toLowerCase()))
  const n = Math.max(1, content.length)
  const pct = { common: 0, b2: 0, c1: 0 }
  content.forEach((t) => pct[t.level]++)
  pct.common = (pct.common / n) * 100; pct.b2 = (pct.b2 / n) * 100; pct.c1 = (pct.c1 / n) * 100
  // moving-average type-token ratio (window 50) so long essays are not penalised
  const lw = tokens.map((t) => t.text.toLowerCase())
  let ttr = 0
  if (lw.length <= 50) ttr = lw.length ? new Set(lw).size / lw.length : 0
  else { let sum = 0, k = 0; for (let i = 0; i + 50 <= lw.length; i += 5) { sum += new Set(lw.slice(i, i + 50)).size / 50; k++ } ttr = sum / k }

  // ---------- Grammar ----------
  const sentences: SentenceInfo[] = rawSentences.map((s) => {
    const kind = SUBORD.test(s) || RELATIVE.test(s) || PARTICIPLE.test(s) ? 'complex' : COORD.test(s) ? 'compound' : 'simple'
    return { text: s, kind, words: countWords(s) }
  })
  const sn = Math.max(1, sentences.length)
  const share = (k: string) => Math.round((sentences.filter((s) => s.kind === k).length / sn) * 100)
  const issues: Issue[] = []
  const add = (type: string, msg: string, excerpt: string) => { if (issues.length < 40) issues.push({ type, msg, excerpt: excerpt.length > 90 ? excerpt.slice(0, 88) + '…' : excerpt }) }
  for (const s of rawSentences) {
    if (/^[a-z]/.test(s)) add('Capitalisation', 'Sentence does not begin with a capital letter.', s)
    if (countWords(s) > 38) add('Run-on', `This sentence has ${countWords(s)} words. Split it or use clearer punctuation.`, s)
    const splice = s.match(/[a-z]+, (he|she|it|they|we|i|this|these|there|people|students) (is|are|was|were|have|has|had|can|will|would|should|do|does|did)\b/i)
    if (splice && !SUBORD.test(s.slice(0, splice.index)) && !/\b(and|but|or|so)\b/i.test(s.slice(0, splice.index).split(' ').slice(-3).join(' ')) && countWords(s.slice(0, splice.index)) > 4) add('Comma splice', 'Two independent clauses are joined by a comma. Use a full stop, a semicolon or a conjunction.', splice[0])
  }
  for (const d of text.matchAll(/\b(\w+)\s+\1\b/gi)) if (!/^(that|had|very|so)$/i.test(d[1])) add('Repeated word', `"${d[1]}" is written twice.`, d[0])
  for (const d of text.matchAll(/\bi\b(?!')/g)) add('Capitalisation', 'The pronoun "I" must be a capital letter.', text.slice(Math.max(0, d.index! - 15), d.index! + 15))
  if (task !== 'letter') for (const d of text.matchAll(CONTRACTION)) add('Informal contraction', `"${d[0]}" is informal. Write the full form in academic writing.`, d[0])
  for (const d of text.matchAll(/\s+[,.;:]/g)) add('Punctuation', 'Remove the space before the punctuation mark.', text.slice(Math.max(0, d.index! - 12), d.index! + 4))
  for (const d of lower.matchAll(/\b(informations|advices|equipments|furnitures|researches|knowledges|discuss(ed|es|ing)? about|cope(d|s)? up with|emphasi[sz]e(d|s)? on|despite of|more better|according to me|in my point of view|today morning)\b/g)) add('Usage', `"${d[0]}" is not standard in international English.`, d[0])
  const passives = (text.match(PASSIVE) || []).length
  const conditionals = sentences.filter((s) => COND.test(s.text)).length
  const relatives = sentences.filter((s) => RELATIVE.test(s.text)).length
  const avgLen = words / sn

  // ---------- Coherence ----------
  const byCat: Record<string, string[]> = {}
  let total = 0
  for (const [cat, list] of Object.entries(LINKERS)) {
    byCat[cat] = []
    for (const l of list) { const c = (lower.match(new RegExp(`\\b${l}\\b`, 'g')) || []).length; if (c) { byCat[cat].push(c > 1 ? `${l} ×${c}` : l); total += c } }
  }
  const mechanical: string[] = []
  let mech = 0
  for (const s of rawSentences) { const sl = s.toLowerCase(); const hit = MECHANICAL.find((x) => sl.startsWith(x + ',') || sl.startsWith(x + ' ')); if (hit) { mech++; if (!mechanical.includes(hit)) mechanical.push(hit) } }
  const mechanicalRate = mech / sn
  const referencing = REFERENCING.reduce((a, r) => a + (lower.match(new RegExp(`\\b${r}\\b`, 'g')) || []).length, 0) + Math.floor((lower.match(/\b(this|these|such|its|their|both|each|those|that of|respectively)\b/g) || []).length / 2)

  // ---------- Task achievement ----------
  const kws = promptKeywords(prompt)
  const covered: string[] = [], missing: string[] = []
  for (const k of kws) {
    const root = k.length > 5 ? k.slice(0, -2) : k
    const hit = lower.includes(root) || (SYN[k] || []).some((s) => lower.includes(s))
    ;(hit ? covered : missing).push(k)
  }
  const coverage = kws.length ? covered.length / kws.length : 1
  const first = paragraphs[0] || '', last = paragraphs[paragraphs.length - 1] || ''
  const overview = OVERVIEW.test(text)
  const thesis = THESIS.test(first) || THESIS.test(last)
  const conclusion = CONCL.test(last) && paragraphs.length > 1
  const pOk = task === 'task2' ? paragraphs.length >= 4 && paragraphs.length <= 5 : paragraphs.length >= 3 && paragraphs.length <= 5
  const lens = paragraphs.map(countWords)
  const body = lens.slice(1, -1)
  const balance = body.length > 1 ? Math.min(...body) / Math.max(...body) : lens.length > 1 ? 0.6 : 0
  const dataPoints = (text.match(/\d+(\.\d+)?\s?(%|per cent|percent)?/g) || []).length
  const wordPenalty = words < minWords

  // ---------- Band estimation ----------
  let ta = 5
  if (!wordPenalty) ta += 0.5
  else ta -= Math.min(2.5, Math.ceil(((minWords - words) / minWords) * 10) * 0.5)
  if (pOk) ta += 0.5
  if (coverage >= 0.7) ta += 0.5; else if (coverage < 0.4) ta -= 1
  if (task === 'task1') { ta += overview ? 1 : -0.5; if (dataPoints >= 5) ta += 0.5; if (dataPoints >= 9 && overview) ta += 0.5 }
  else if (task === 'task2') { if (thesis) ta += 0.5; if (conclusion) ta += 0.5; if (balance >= 0.6 && body.length >= 2 && Math.min(...body) >= 60) ta += 0.5 }
  else { if (/^\s*(dear|hi|hello)\b/i.test(text)) ta += 0.5; if (/(yours (sincerely|faithfully)|best wishes|kind regards|see you|take care|all the best)/i.test(text)) ta += 0.5; if (paragraphs.length >= 3) ta += 0.5 }
  if (task === 'task1' && !overview) ta = Math.min(ta, 5.5)

  let cc = 5
  const cats = Object.values(byCat).filter((v) => v.length).length
  cc += cats >= 5 ? 1.5 : cats >= 4 ? 1 : cats >= 2 ? 0.5 : 0
  const density = total / sn
  if (density >= 0.3 && density <= 1.1) cc += 0.5
  if (mechanicalRate > 0.35) cc -= 1
  cc += referencing >= 5 ? 1.5 : referencing >= 3 ? 1 : referencing >= 1 ? 0.5 : 0
  if (ttr < 0.64) cc -= 0.5
  if (pOk) cc += 0.5; else if (paragraphs.length <= 1) cc -= 1
  if (balance >= 0.55) cc += 0.5

  let lr = 4.5
  const adv = pct.b2 + 2.5 * pct.c1
  lr += adv >= 20 ? 3 : adv >= 15 ? 2.5 : adv >= 11 ? 2 : adv >= 8 ? 1.5 : adv >= 5 ? 1 : adv >= 2.5 ? 0.5 : 0
  lr += ttr >= 0.8 ? 1 : ttr >= 0.76 ? 0.5 : ttr < 0.64 ? -0.5 : 0
  const weakRate = (weak.reduce((a, b) => a + b.count, 0) / Math.max(1, words)) * 100
  if (weakRate > 3) lr -= 1; else if (weakRate > 1.5) lr -= 0.5; else lr += 0.5
  if (repeated.length > 5) lr -= 0.5

  let gra = 4.5
  const cx = share('complex')
  gra += cx >= 60 ? 2 : cx >= 45 ? 1.5 : cx >= 30 ? 1 : cx >= 15 ? 0.5 : 0
  if (share('compound') >= 8 && share('simple') >= 8) gra += 0.5
  if (passives >= 2) gra += 0.5
  if (conditionals + relatives >= 2) gra += 0.5
  const issueRate = (issues.length / Math.max(1, words)) * 100
  gra += issueRate === 0 ? 1 : issueRate < 0.8 ? 0.5 : issueRate > 3 ? -1 : issueRate > 1.8 ? -0.5 : 0
  if (avgLen >= 15 && avgLen <= 28) gra += 0.5

  // very short texts cannot demonstrate a level
  const cap = words < 20 ? 1 : words < 50 ? 3 : words < minWords * 0.5 ? 4.5 : words < minWords * 0.8 ? 6 : 9
  const b = { ta: half(clamp(Math.min(ta, cap))), cc: half(clamp(Math.min(cc, cap))), lr: half(clamp(Math.min(lr, cap))), gra: half(clamp(Math.min(gra, cap))), overall: 0 }
  b.overall = words === 0 ? 0 : Math.floor(((b.ta + b.cc + b.lr + b.gra) / 4) * 2) / 2
  if (words === 0) b.ta = b.cc = b.lr = b.gra = 0

  // ---------- Coaching tips ----------
  const tips: string[] = []
  if (wordPenalty) tips.push(`You have ${words} words. Write at least ${minWords} — responses under the limit lose marks for Task ${task === 'task2' ? 'Response' : 'Achievement'}.`)
  if (task === 'task1' && !overview) tips.push('Add a clear overview beginning with "Overall," that states the two main features. Without it, Task Achievement cannot go above Band 5.')
  if (task === 'task2' && !thesis) tips.push('State your position clearly in the introduction (e.g. "I firmly believe that…").')
  if (task === 'task2' && !conclusion) tips.push('Finish with a short conclusion ("In conclusion, …") that restates your position.')
  if (!pOk) tips.push(task === 'task2' ? `Use 4–5 paragraphs (you have ${paragraphs.length}): introduction, two or three body paragraphs, conclusion.` : `Organise the response into 3–4 paragraphs (you have ${paragraphs.length}).`)
  if (missing.length && coverage < 0.7) tips.push(`Parts of the question may be under-developed. Not yet addressed: ${missing.slice(0, 4).join(', ')}.`)
  if (mechanicalRate > 0.35) tips.push(`${Math.round(mechanicalRate * 100)}% of your sentences open with a mechanical linker (${mechanical.slice(0, 3).join(', ')}). Replace some with referencing: this trend, such measures, the former.`)
  if (referencing < 2 && words > 80) tips.push('Use referencing to connect ideas organically: "this trend", "such measures", "the former / the latter".')
  if (adv < 8 && words > 80) tips.push('Lexical range is narrow. Replace two or three common words with precise academic choices — tap the highlighted words for suggestions.')
  if (weak.length) tips.push(`Upgrade vague words: ${weak.slice(0, 4).map((x) => `${x.word} → ${x.upgrades[0]}`).join('; ')}.`)
  if (cx < 30 && words > 80) tips.push(`Only ${cx}% of sentences are complex. Add clauses with although, whereas, which or provided that.`)
  if (passives === 0 && task === 'task1' && words > 80) tips.push('Include at least one passive structure — it is natural in academic description.')
  if (issues.length) tips.push(`${issues.length} accuracy issue${issues.length > 1 ? 's' : ''} flagged. Fix these first — frequent errors hold Grammatical Range & Accuracy at Band 6.`)
  if (!tips.length && words >= minWords) tips.push('Strong draft. To push higher, vary sentence openings and check that every body paragraph has a specific example.')

  return {
    words, minWords, sentences, paragraphs, bands: b,
    ta: { wordPenalty, paragraphOk: pOk, balance, overview, thesis, conclusion, coverage, covered, missing, dataPoints },
    cc: { byCat, total, mechanicalRate, mechanical, referencing },
    lr: { tokens, ttr, pct, repeated, weak },
    gra: { simple: share('simple'), compound: share('compound'), complex: share('complex'), passives, conditionals, relatives, avgLen, issues },
    tips,
  }
}
