export interface McqItem { context?: string; spark?: number[]; prompt: string; options: string[]; answer: number; explain: string; follow?: { prompt: string; options: string[]; answer: number } }
export interface PairSet { pairs: [string, string][] }
export interface DictItem { say: string; answer: string; label: string; hint: string }
export interface BuildItem { a: string; b: string; target: string; chunks: string[]; note: string }
export type QuizDef =
  | { id: string; kind: 'mcq'; title: string; tag: string; blurb: string; color: string; items: McqItem[] }
  | { id: string; kind: 'pairs'; title: string; tag: string; blurb: string; color: string; sets: PairSet[] }
  | { id: string; kind: 'dictation'; title: string; tag: string; blurb: string; color: string; items: DictItem[] }
  | { id: string; kind: 'build'; title: string; tag: string; blurb: string; color: string; items: BuildItem[] }

const TFN = ['TRUE', 'FALSE', 'NOT GIVEN']
const YNN = ['YES', 'NO', 'NOT GIVEN']
const TRAPS = ['No trap — a direct paraphrase', 'Opposite meaning / reversed comparison', 'Topic mentioned, but this detail is never stated', 'Extreme word (all, always, only) changes the claim']

export const QUIZZES: QuizDef[] = [
  {
    id: 'q-logic', kind: 'mcq', title: 'T/F/NG vs Y/N/NG Logic Trap Blitz', tag: '#TrueFalseNotGiven', color: 'bg-mint',
    blurb: 'Compare one statement with one line of evidence. Decide, then name the trap.',
    items: [
      { context: 'Evidence: "The museum, which opened in 1921, attracts around two million visitors annually, most of them from overseas."', prompt: 'Statement: The majority of the museum\'s visitors come from abroad.', options: TFN, answer: 0, explain: '"Most of them from overseas" = "the majority … from abroad".', follow: { prompt: 'Which logic applies?', options: TRAPS, answer: 0 } },
      { context: 'Evidence: "Unlike its predecessor, the new bridge can remain open in winds of up to 80 miles per hour."', prompt: 'Statement: The old bridge was more resistant to strong winds than the new one.', options: TFN, answer: 1, explain: '"Unlike its predecessor" tells us the old bridge could NOT stay open — the comparison is reversed.', follow: { prompt: 'Which logic applies?', options: TRAPS, answer: 1 } },
      { context: 'Evidence: "The study followed 400 nurses working night shifts in three Colombo hospitals over five years."', prompt: 'Statement: Nurses on night shifts were paid more than those working during the day.', options: TFN, answer: 2, explain: 'Night-shift nurses are the topic, but pay is never mentioned.', follow: { prompt: 'Which logic applies?', options: TRAPS, answer: 2 } },
      { context: 'Evidence: "Many of the region\'s tea estates have begun to replace chemical fertiliser with compost."', prompt: 'Statement: All tea estates in the region now use compost instead of chemical fertiliser.', options: TFN, answer: 1, explain: '"Many … have begun" is not "all … now use". The quantifier makes it false.', follow: { prompt: 'Which logic applies?', options: TRAPS, answer: 3 } },
      { context: 'Evidence: "In the writer\'s view, banning cars from city centres would do little to improve air quality unless public transport were expanded first."', prompt: 'Statement (writer\'s opinion): Removing cars from city centres is enough to make the air cleaner.', options: YNN, answer: 1, explain: '"Would do little … unless" — the writer says a ban alone is NOT enough.', follow: { prompt: 'Which logic applies?', options: TRAPS, answer: 1 } },
      { context: 'Evidence: "Critics claim the scheme wastes public money. This criticism, I believe, ignores the long-term savings in healthcare."', prompt: 'Statement (writer\'s opinion): The scheme is a waste of public money.', options: YNN, answer: 1, explain: 'That is the critics\' view. The writer disagrees — always check WHOSE opinion is tested.', follow: { prompt: 'Which logic applies?', options: TRAPS, answer: 1 } },
      { context: 'Evidence: "Sales of printed newspapers have halved since 2005, while online subscriptions have risen steadily."', prompt: 'Statement: Online subscriptions now earn publishers more than printed newspapers do.', options: TFN, answer: 2, explain: 'We know the direction of both trends, but revenues are never compared.', follow: { prompt: 'Which logic applies?', options: TRAPS, answer: 2 } },
      { context: 'Evidence: "Elephants rarely enter the village during the dry season, when water is still available inside the reserve."', prompt: 'Statement: Elephants never come into the village in the dry season.', options: TFN, answer: 1, explain: '"Rarely" means it sometimes happens. "Never" is an extreme word that changes the claim.', follow: { prompt: 'Which logic applies?', options: TRAPS, answer: 3 } },
    ],
  },
  {
    id: 'q-para', kind: 'pairs', title: 'Band 8+ Paraphrase & Synonym Matcher', tag: '#Paraphrase', color: 'bg-lav',
    blurb: 'Match each passage phrase with the way an IELTS question would reword it.',
    sets: [
      { pairs: [['sold at a premium', 'fetched a higher price'], ['was slow to respond', 'took a long time to react'], ['serves no purpose', 'is of no practical use'], ['has given way to', 'has been replaced by'], ['a shortage of vegetation', 'too few plants']] },
      { pairs: [['the elderly', 'older people'], ['proving a direct cause is difficult', 'a clear link is hard to establish'], ['fell by half', 'decreased by 50 per cent'], ['a growing body of evidence', 'an increasing amount of research'], ['regardless of income', 'whether rich or poor']] },
      { pairs: [['is widely regarded as', 'is generally considered to be'], ['out of reach for most families', 'unaffordable for the majority'], ['came into force', 'took effect'], ['on the verge of extinction', 'close to dying out'], ['drew criticism from', 'was condemned by']] },
    ],
  },
  {
    id: 'q-trend', kind: 'mcq', title: 'Task 1 Trend & Data Verb Builder', tag: '#AcademicWriting', color: 'bg-butter',
    blurb: 'Look at the movement, then choose the most precise description.',
    items: [
      { spark: [80, 78, 74, 40, 12, 8], prompt: 'Describe the movement between the third and fifth points.', options: ['plummeted dramatically', 'declined marginally', 'levelled off', 'fluctuated mildly'], answer: 0, explain: 'A fall from 74 to 12 is steep and sudden: plummeted / plunged + dramatically.' },
      { spark: [20, 42, 60, 61, 60, 61], prompt: 'Describe the second half of the period.', options: ['soared', 'plateaued', 'dipped sharply', 'recovered'], answer: 1, explain: 'After the rise, the figure stays almost unchanged: it plateaued / levelled off.' },
      { spark: [30, 31, 33, 36, 38, 40], prompt: 'Describe the overall trend.', options: ['rocketed', 'collapsed', 'experienced a modest surge', 'rose steadily'], answer: 3, explain: 'Small, regular increases = rose steadily / climbed gradually. A "surge" is sudden.' },
      { spark: [50, 30, 55, 28, 52, 31], prompt: 'Describe the pattern.', options: ['remained stable', 'fluctuated considerably', 'grew exponentially', 'declined steadily'], answer: 1, explain: 'Repeated rises and falls of similar size = fluctuated considerably / wildly.' },
      { spark: [60, 45, 30, 20, 34, 52], prompt: 'Describe the final part of the period.', options: ['bottomed out and then recovered', 'peaked and then fell', 'continued to slide', 'stagnated'], answer: 0, explain: 'The lowest point (20) is followed by growth: hit a low / bottomed out, then recovered.' },
      { spark: [10, 12, 15, 48, 82, 90], prompt: 'Describe the movement after the third point.', options: ['edged up', 'dipped', 'surged', 'stabilised'], answer: 2, explain: 'A sudden, powerful increase = surged / soared / rocketed. "Edged up" is far too weak.' },
      { spark: [40, 55, 72, 88, 70, 52], prompt: 'Describe the fourth point.', options: ['reached a peak', 'hit a low', 'levelled off', 'remained constant'], answer: 0, explain: 'The highest value in the series: reached a peak of / peaked at.' },
      { spark: [50, 49, 51, 50, 50, 49], prompt: 'Describe the overall trend.', options: ['rose significantly', 'remained relatively stable', 'fell gradually', 'fluctuated wildly'], answer: 1, explain: 'Tiny variations around the same value = remained relatively stable / was virtually unchanged.' },
    ],
  },
  {
    id: 'q-linker', kind: 'mcq', title: 'Cohesive Device & Linker Surgery', tag: '#CoherenceCohesion', color: 'bg-mint',
    blurb: 'Each paragraph has a mechanical or misused linker in CAPITALS. Choose the best repair.',
    items: [
      { context: 'Many graduates leave the country after university. MOREOVER, hospitals in rural areas struggle to recruit doctors.', prompt: 'The second sentence is a RESULT of the first. Best repair?', options: ['Furthermore, hospitals…', 'As a result, hospitals…', 'On the other hand, hospitals…', 'For example, hospitals…'], answer: 1, explain: '"Moreover" adds a similar point. Here the relationship is cause → effect.' },
      { context: 'Online courses are cheap and flexible. FIRSTLY, they lack face-to-face contact.', prompt: 'The second sentence CONTRASTS with the first. Best repair?', options: ['Secondly, they lack…', 'In addition, they lack…', 'However, they lack…', 'Therefore, they lack…'], answer: 2, explain: 'Listing words cannot signal contrast. Use However / Nevertheless / That said.' },
      { context: 'Governments should invest in railways. Railways reduce traffic. Railways also cut pollution. FURTHERMORE, railways create jobs.', prompt: 'How can this be made less mechanical?', options: ['Add "Moreover" to every sentence', 'Use referencing: "Such investment reduces traffic, cuts pollution and creates jobs."', 'Replace "Furthermore" with "Besides"', 'Delete the last sentence'], answer: 1, explain: 'Referencing ("such investment") and combining clauses is what Band 7+ cohesion looks like.' },
      { context: 'Fast food is convenient. ON THE OTHER HAND, it is cheap.', prompt: 'What is wrong?', options: ['Nothing', '"On the other hand" needs a contrast; these are two similar advantages', 'It should be "In the other hand"', 'It needs a semicolon'], answer: 1, explain: 'Two positives need an addition linker: "It is also cheap" / "as well as being cheap".' },
      { context: 'Tourism brings income to coastal towns. IN A NUTSHELL, it also damages coral reefs.', prompt: 'Best repair?', options: ['To sum up, it also…', 'At the same time, it damages coral reefs.', 'Last but not least, it also…', 'In conclusion, it also…'], answer: 1, explain: '"In a nutshell" is informal and signals a summary. A concession linker fits: at the same time / yet.' },
      { context: 'Some people prefer to study abroad. NOWADAYS, others choose local universities. NOWADAYS, both options have benefits.', prompt: 'Best repair for the overused opener?', options: ['Replace both with "These days"', 'Remove them: "…, whereas others choose local universities. Both options have benefits."', 'Add "Moreover" before each', 'Use "In this modern era" instead'], answer: 1, explain: 'A subordinating conjunction (whereas) links the ideas inside the sentence — no opener needed.' },
      { context: 'DESPITE the government increased spending, exam results did not improve.', prompt: 'Fix the grammar of the linker.', options: ['Despite of the government increased spending…', 'Although the government increased spending…', 'In spite the government increased…', 'Despite the government increase spending…'], answer: 1, explain: 'Despite + noun / -ing. Although + clause. ("Despite the increase in spending" would also work.)' },
      { context: 'Children who read for pleasure do better at school. FOR INSTANCE, parents should read with them every day.', prompt: 'The second sentence is a RECOMMENDATION that follows from the first. Best repair?', options: ['For example, parents should…', 'Similarly, parents should…', 'For this reason, parents should…', 'In contrast, parents should…'], answer: 2, explain: '"For instance" introduces an example, not a consequence. Use For this reason / Parents should therefore.' },
    ],
  },
  {
    id: 'q-dict', kind: 'dictation', title: 'Listening Part 1 Spelling, Numbers & Postcode Dictation', tag: '#ListeningPart1', color: 'bg-butter',
    blurb: 'Listen once or twice, then type exactly what you hear.',
    items: [
      { say: 'My surname is Jayawardena. J, A, Y, A, W, A, R, D, E, N, A.', answer: 'Jayawardena', label: 'Surname', hint: 'Long names are spelled in groups. Write as you listen.' },
      { say: 'The flight number is U L 5 0 4.', answer: 'UL504', label: 'Flight number', hint: 'Letters then digits — "U" and "you" sound identical.' },
      { say: 'The postcode is S W 1 9, 2 B Y.', answer: 'SW19 2BY', label: 'Postcode', hint: '"B" and "V", "Y" and "I" are common confusions.' },
      { say: 'Her date of birth is the thirtieth of August, nineteen ninety-eight.', answer: '30 August 1998', label: 'Date (day month year)', hint: 'Thirteenth vs thirtieth: listen for the stress — thirTEENTH / THIRtieth.' },
      { say: 'The reference number is double seven, four, oh, double two, nine.', answer: '7740229', label: 'Reference number', hint: '"Double seven" = 77. "Oh" = 0.' },
      { say: 'The address is 15 Fitzwilliam Avenue. Fitzwilliam is F, I, T, Z, W, I, double L, I, A, M.', answer: '15 Fitzwilliam Avenue', label: 'Address', hint: '"Double L" = LL.' },
      { say: 'The total cost is two hundred and fifteen pounds fifty.', answer: '215.50', label: 'Amount (£)', hint: 'Fifteen vs fifty: fifTEEN / FIFty.' },
      { say: 'You can email me at k dot fernando at mail dot com. Fernando is F, E, R, N, A, N, D, O.', answer: 'k.fernando@mail.com', label: 'Email', hint: '"dot" = . and "at" = @' },
    ],
  },
  {
    id: 'q-grammar', kind: 'build', title: 'Complex Grammar Transformer', tag: '#GrammaticalRange', color: 'bg-lav',
    blurb: 'Combine two Band 5 sentences into one Band 8 sentence. Tap the chunks in order.',
    items: [
      { a: 'I did not know about the scholarship.', b: 'I did not apply for it.', target: 'Third conditional with inversion', chunks: ['Had I known', 'about the scholarship,', 'I would have', 'applied for it.'], note: 'Inversion (Had I known) replaces "If I had known" — a clear Band 8 structure.' },
      { a: 'The city built a new railway.', b: 'The railway reduced traffic by a third.', target: 'Non-defining relative clause', chunks: ['The city built', 'a new railway,', 'which reduced traffic', 'by a third.'], note: 'The comma + which adds extra information about the whole noun phrase.' },
      { a: 'Fees have risen sharply.', b: 'Student numbers have not fallen.', target: 'Concession (although)', chunks: ['Although fees', 'have risen sharply,', 'student numbers', 'have not fallen.'], note: 'A subordinate clause of concession shows contrast inside one sentence.' },
      { a: 'People rarely think about where their food comes from.', b: '(Make it emphatic.)', target: 'Negative inversion', chunks: ['Rarely do', 'people think about', 'where their food', 'comes from.'], note: 'After a negative adverb at the start (Rarely, Seldom, Never), subject and auxiliary invert.' },
      { a: 'Governments must act now.', b: 'If they do not, sea levels will continue to rise.', target: 'Conditional with unless', chunks: ['Unless governments', 'act now,', 'sea levels will', 'continue to rise.'], note: '"Unless" = "if … not". Do not add a second negative.' },
      { a: 'Dr Silva led the research.', b: 'Her team won an international award.', target: 'Relative clause with whose', chunks: ['Dr Silva,', 'whose team won', 'an international award,', 'led the research.'], note: '"Whose" shows possession and lets you embed one fact inside another.' },
      { a: 'The factory closed.', b: 'Hundreds of workers lost their jobs.', target: 'Participle clause (result)', chunks: ['The factory closed,', 'leaving hundreds', 'of workers', 'without jobs.'], note: 'An -ing participle clause expresses the result compactly.' },
      { a: 'The government introduced the tax.', b: 'Immediately afterwards, sales of sugary drinks fell.', target: 'No sooner … than', chunks: ['No sooner had', 'the government introduced the tax', 'than sales of sugary drinks', 'fell.'], note: 'No sooner + had + subject + past participle … than + past simple.' },
    ],
  },
  {
    id: 'q-lanka', kind: 'mcq', title: 'Sri Lankan English → IELTS Standard Fixer', tag: '#SriLankaFocus', color: 'bg-coral text-white',
    blurb: 'Phrases that are natural in Sri Lankan English but cost marks in IELTS Writing. Choose the international standard form.',
    items: [
      { context: '"We discussed about the problem in class."', prompt: 'Choose the standard form.', options: ['We discussed about the problem.', 'We discussed the problem.', 'We discussed on the problem.', 'We had discussed about the problem.'], answer: 1, explain: '"Discuss" takes a direct object — no preposition. (But: a discussion ABOUT the problem.)' },
      { context: '"The government should provide more informations and advices to students."', prompt: 'Choose the standard form.', options: ['more informations and advice', 'more information and advices', 'more information and advice', 'many informations and advices'], answer: 2, explain: 'Information, advice, equipment, furniture and research are uncountable: no plural -s.' },
      { context: '"I am having two brothers and I am knowing the answer."', prompt: 'Choose the standard form.', options: ['I am having two brothers and I know the answer.', 'I have two brothers and I know the answer.', 'I have two brothers and I am knowing the answer.', 'I had two brothers and I knew the answer.'], answer: 1, explain: 'State verbs (have = possess, know, believe, understand) are not normally used in the continuous.' },
      { context: '"Students find it hard to cope up with the workload."', prompt: 'Choose the standard form.', options: ['cope up with', 'cope with', 'cope up', 'coping up with'], answer: 1, explain: '"Cope with". Compare "keep up with" and "put up with", which do take "up".' },
      { context: '"I passed out from the University of Colombo in 2022."', prompt: 'Choose the form an international reader will understand.', options: ['I passed out from the University of Colombo.', 'I graduated from the University of Colombo.', 'I passed out of the University of Colombo.', 'I got passed from the University of Colombo.'], answer: 1, explain: 'In international English, "pass out" means to faint. Use "graduated from".' },
      { context: '"Today morning I went to the tuition class."', prompt: 'Choose the standard form.', options: ['Today morning', 'This morning', 'In today morning', 'On this morning'], answer: 1, explain: 'This morning / this afternoon / last night / yesterday evening.' },
      { context: '"Majority of people prefers to live in city."', prompt: 'Choose the standard form.', options: ['Majority of people prefer to live in city.', 'The majority of people prefer to live in cities.', 'The majority of people prefers to live in the city.', 'Majority of the people prefers to live in cities.'], answer: 1, explain: 'Sinhala and Tamil have no article system, so articles are the most frequent error: THE majority … cities (plural, general).' },
      { context: '"Even though the fees are high, but many students apply."', prompt: 'Choose the standard form.', options: ['Even though the fees are high, but many students apply.', 'Even though the fees are high, many students apply.', 'Even the fees are high, but many students apply.', 'Although the fees are high, yet many students are applying.'], answer: 1, explain: 'Use although / even though OR but — never both in the same sentence.' },
      { context: '"He asked me where do I live."', prompt: 'Choose the standard form.', options: ['He asked me where do I live.', 'He asked me where I lived.', 'He asked me where did I live.', 'He asked to me where I live.'], answer: 1, explain: 'Indirect questions use statement word order, with the tense moved back.' },
      { context: '"I am studying English since five years."', prompt: 'Choose the standard form.', options: ['I am studying English since five years.', 'I have been studying English for five years.', 'I study English since five years.', 'I have been studying English since five years.'], answer: 1, explain: 'Present perfect (continuous) + FOR a period / SINCE a point in time.' },
    ],
  },
]
