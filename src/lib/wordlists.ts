const w = (s: string) => new Set(s.trim().split(/\s+/))

/** Upper-intermediate (B2) vocabulary sample. */
export const B2 = w(`
achieve acquire adapt adequate adjust affect afford alternative analyse annual apparent approach appropriate approximately argue aspect assess assume attitude available aware benefit capable challenge circumstance community compare complex concentrate concern conclude conduct consequence consider considerable consist constant consumer context contrast contribute convenient crucial cultural current debate decade decline define demand demonstrate despite determine develop device distinct diverse domestic economic economy effective efficient emerge emphasis enable encourage environment essential establish estimate evidence evolve examine exceed expand expose extend factor feature financial focus function fund generate global gradual growth identify illustrate impact improve income increase indicate individual industry influence initial instance institution involve issue lack maintain major majority method minority modern notable objective obtain obvious occur opportunity outcome overall participate percentage period policy positive potential predict previous primary principle priority process professional promote proportion provide purpose range rapid recent reduce region regulate rely remain require research resource respond restrict reveal significant similar society source specific stable standard steady strategy structure sufficient survey sustain target technique technology tend trend typical urban vary welfare whereas widespread
affordable awareness beneficial competitive consumption contribution dramatic employment expansion expenditure facility harmful household investment likelihood measure moreover nevertheless occupation outweigh pollution population poverty productive qualification reasonable reliable responsibility shortage steadily substantial tackle unemployment workforce
`)

/** Advanced / academic (C1–C2, AWL-style) vocabulary sample. */
export const C1 = w(`
abundant accumulate acknowledge advocate aggregate albeit alleviate allocate ambiguous ameliorate analogous arbitrary attain attribute augment autonomy bolster catalyst coherent coincide commence compel compensate complement comprehensive comprise conceive concurrent confer consensus constitute constrain contemplate contend contradict controversial conversely correlate culminate curtail deficit denote depict deplete derive detrimental deteriorate deviate differentiate diminish discrepancy disparity disproportionate disseminate diverge dominance eliminate empirical encompass endeavour enhance entail equitable erode escalate exacerbate exemplify exert explicit exploit facilitate feasible fluctuate formidable foster fundamental hamper hinder hypothesis imminent impede imperative implement implication implicit incentive incentivise inclination incompatible indispensable inevitable inherent inhibit initiate innovative integral integrate intrinsic invaluable jeopardise justify lucrative magnitude mandatory marginal mitigate negligible notwithstanding nurture obsolete offset optimal paradigm paramount perceive perpetuate pervasive plausible plummet precede predominant prerequisite prevalent profound prohibit proliferate prolong prosperity proximity pragmatic rationale reconcile reinforce resilient scrutiny stagnate stringent subsequent subsidise substantiate succumb supersede susceptible sustainable tangible thereby trajectory undermine underpin unprecedented utilise viable volatile vulnerable whereby widen yield
affluent burgeoning commonplace compelling counterproductive deprivation deterrent discourse disparities dwindle erosion far-reaching infrastructure meritocracy multifaceted overwhelming repercussion saturation scarcity sedentary socioeconomic stark stigma surge thriving ubiquitous
`)

export const STOP = w(`a an the and or but if so of in on at to for from by with as is are was were be been being am do does did have has had having it its this that these those i you he she we they me him her us them my your his our their not no nor can could will would shall should may might must than then there here which who whom whose what when where why how all any both each few more most other some such only own same too very just also into over after before under between through during about against above below up down out off again further once s t don now one two three many much`)

export const WEAK: Record<string, string[]> = {
  very: ['extremely', 'highly', 'remarkably', 'particularly'],
  good: ['beneficial', 'valuable', 'effective', 'favourable'],
  bad: ['detrimental', 'harmful', 'adverse', 'damaging'],
  big: ['substantial', 'considerable', 'significant', 'major'],
  small: ['marginal', 'modest', 'negligible', 'minor'],
  things: ['factors', 'aspects', 'issues', 'elements'],
  thing: ['factor', 'aspect', 'issue', 'element'],
  'a lot of': ['a great deal of', 'numerous', 'a considerable number of', 'substantial'],
  lots: ['a great many', 'numerous', 'plenty'],
  important: ['crucial', 'vital', 'essential', 'paramount'],
  nowadays: ['in recent years', 'at present', 'today'],
  get: ['obtain', 'acquire', 'receive', 'gain'],
  people: ['individuals', 'citizens', 'members of society', 'the public'],
  problem: ['issue', 'challenge', 'difficulty', 'obstacle'],
  show: ['illustrate', 'demonstrate', 'indicate', 'reveal'],
  shows: ['illustrates', 'demonstrates', 'indicates', 'reveals'],
  think: ['believe', 'contend', 'maintain', 'would argue'],
  help: ['assist', 'facilitate', 'support', 'enable'],
  increase: ['rise', 'grow', 'climb', 'escalate'],
  increased: ['rose', 'grew', 'climbed', 'escalated'],
  decrease: ['decline', 'fall', 'drop', 'diminish'],
  decreased: ['declined', 'fell', 'dropped', 'diminished'],
  huge: ['enormous', 'immense', 'vast', 'substantial'],
  nice: ['pleasant', 'appealing', 'agreeable'],
  really: ['genuinely', 'considerably', 'particularly'],
  kids: ['children', 'young people', 'youngsters'],
  stuff: ['material', 'items', 'matters'],
}

export const SYN: Record<string, string[]> = {
  university: ['higher education', 'tertiary', 'college', 'degree', 'undergraduate', 'campus'],
  education: ['schooling', 'learning', 'study', 'tuition', 'academic'],
  free: ['no cost', 'without charge', 'subsidised', 'funded', 'state-funded', 'fees'],
  students: ['learners', 'undergraduates', 'graduates', 'pupils', 'young people'],
  financial: ['income', 'economic', 'money', 'afford', 'wealth', 'poor'],
  abroad: ['overseas', 'foreign', 'another country', 'international'],
  home: ['domestic', 'local', 'own country', 'native', 'house'],
  country: ['nation', 'state', 'homeland', 'national'],
  professionals: ['doctors', 'engineers', 'skilled workers', 'experts', 'graduates'],
  leave: ['emigrate', 'migrate', 'move', 'brain drain', 'depart'],
  problems: ['issues', 'difficulties', 'consequences', 'challenges', 'drawbacks'],
  solutions: ['measures', 'steps', 'remedies', 'tackle', 'address', 'solve'],
  working: ['work', 'employment', 'job', 'remote', 'telecommuting', 'employees'],
  office: ['workplace', 'company', 'colleagues', 'commute'],
  advantages: ['benefits', 'merits', 'positive', 'upside'],
  disadvantages: ['drawbacks', 'downsides', 'negative', 'problems'],
  traditional: ['local', 'cultural', 'heritage', 'home-cooked', 'customary'],
  foods: ['food', 'cuisine', 'diet', 'dishes', 'meals'],
  fast: ['convenience', 'junk', 'processed', 'takeaway'],
  internet: ['online', 'web', 'connectivity', 'connected'],
  households: ['homes', 'families', 'houses'],
  percentage: ['proportion', 'share', 'per cent', '%'],
  energy: ['power', 'electricity', 'consumption'],
  tea: ['leaves', 'leaf'],
  village: ['settlement', 'community', 'town'],
  hours: ['time', 'weekly'],
  young: ['youth', 'teenagers', 'students'],
  skilled: ['qualified', 'educated', 'trained'],
}

export const LINKERS: Record<string, string[]> = {
  Addition: ['moreover', 'furthermore', 'in addition', 'additionally', 'besides', 'also', 'as well as', 'not only', 'what is more'],
  Contrast: ['however', 'on the other hand', 'in contrast', 'by contrast', 'whereas', 'while', 'conversely', 'nevertheless', 'nonetheless', 'yet', 'on the contrary'],
  'Cause/Effect': ['because', 'therefore', 'as a result', 'consequently', 'thus', 'hence', 'due to', 'owing to', 'so that', 'since', 'leads to', 'results in', 'for this reason', 'thereby'],
  Illustration: ['for example', 'for instance', 'such as', 'namely', 'to illustrate', 'in particular', 'a case in point'],
  Concession: ['although', 'even though', 'though', 'despite', 'in spite of', 'admittedly', 'while it is true', 'granted', 'albeit'],
  Conclusion: ['in conclusion', 'to conclude', 'to sum up', 'in summary', 'overall', 'all in all', 'on the whole', 'ultimately'],
}
export const MECHANICAL = ['moreover', 'furthermore', 'firstly', 'secondly', 'thirdly', 'lastly', 'finally', 'in addition', 'additionally', 'besides', 'first of all', 'last but not least', 'nowadays', 'on the other hand', 'in conclusion', 'to sum up', 'however']
export const REFERENCING = ['this trend', 'this approach', 'this issue', 'this problem', 'this view', 'this development', 'this figure', 'such measures', 'such a', 'these changes', 'these figures', 'the former', 'the latter', 'this means', 'this is because', 'this would', 'these factors', 'respectively', 'this policy', 'doing so', 'the same']

export function stem(t: string): string[] {
  const c = [t]
  if (t.endsWith('ies')) c.push(t.slice(0, -3) + 'y')
  if (t.endsWith('es')) c.push(t.slice(0, -2))
  if (t.endsWith('s')) c.push(t.slice(0, -1))
  if (t.endsWith('ed')) c.push(t.slice(0, -2), t.slice(0, -1))
  if (t.endsWith('ing')) c.push(t.slice(0, -3), t.slice(0, -3) + 'e')
  if (t.endsWith('ly')) c.push(t.slice(0, -2))
  if (t.endsWith('ally')) c.push(t.slice(0, -4), t.slice(0, -2))
  if (t.endsWith('ily')) c.push(t.slice(0, -3) + 'y')
  if (t.endsWith('ion')) c.push(t.slice(0, -3), t.slice(0, -3) + 'e')
  if (t.endsWith('ation')) c.push(t.slice(0, -5), t.slice(0, -5) + 'e')
  if (t.endsWith('ment')) c.push(t.slice(0, -4))
  if (t.endsWith('ity')) c.push(t.slice(0, -3), t.slice(0, -3) + 'e')
  if (t.endsWith('ised') || t.endsWith('ized')) c.push(t.slice(0, -4) + 'ise')
  // doubled consonant: "planned" -> "plan"
  if (/(.)\1(ed|ing)$/.test(t)) c.push(t.replace(/(.)\1(ed|ing)$/, '$1'))
  return c
}
export type Level = 'common' | 'b2' | 'c1'
export function levelOf(token: string): Level {
  const t = token.toLowerCase().replace(/z/g, 's')
  for (const s of [...stem(token.toLowerCase()), ...stem(t)]) {
    if (C1.has(s)) return 'c1'
    if (B2.has(s)) return 'b2'
  }
  return 'common'
}
