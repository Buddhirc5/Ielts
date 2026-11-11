import type { Skill } from '../types'

export interface Lesson { id: string; skill: Skill; title: string; minutes: number; tag: string; points: string[]; quiz: { q: string; options: string[]; answer: number; why: string }[] }

export const LESSONS: Lesson[] = [
  { id: 'l-pred', skill: 'listening', title: 'Predicting answers before you listen', minutes: 8, tag: '#Prediction', points: ['Use the 30 seconds before each part to read the questions, not to check earlier answers.', 'For every gap decide the word type: a name, a number, a noun, an adjective?', 'Underline keywords that will be paraphrased (price → cost, quiet → calm).', 'Answers follow the order of the recording. If you miss one, move on.'], quiz: [
    { q: '"Deposit: £____" — what should you expect to hear?', options: ['A place name', 'A number, probably with a distractor number near it', 'An adjective', 'A verb'], answer: 1, why: 'Money gaps almost always have two figures: the wrong one first, then the correction.' },
    { q: 'You missed question 4. What is the best strategy?', options: ['Stop and try to remember', 'Guess, then focus on question 5', 'Leave it blank forever', 'Ask the examiner'], answer: 1, why: 'There is no negative marking. Guess, move on and protect the next mark.' },
  ] },
  { id: 'l-dist', skill: 'listening', title: 'Distractors and changes of mind', minutes: 10, tag: '#Distractors', points: ['Speakers often give an answer and then correct it: "Gold… actually, Silver is enough."', 'Signal words: but, actually, in fact, these days, used to, I was going to.', 'In multiple choice, all three options are usually mentioned. Only one answers the question.', 'Past plans and other people\'s assumptions are typical wrong options.'], quiz: [
    { q: '"We were going to meet on Monday, but Tuesday suits everyone better." When is the meeting?', options: ['Monday', 'Tuesday', 'Both days', 'Not decided'], answer: 1, why: '"Were going to … but" cancels the first plan.' },
    { q: 'Which phrase most often introduces the CORRECT answer?', options: ['People often assume…', 'It used to be…', 'In fact…', 'I was thinking of…'], answer: 2, why: '"In fact" corrects a false belief that came just before.' },
  ] },
  { id: 'l-accent', skill: 'listening', title: 'Tuning in to UK, Australian, NZ and North American accents', minutes: 9, tag: '#Accents', points: ['Sri Lankan learners mostly hear British-influenced English. Australian and NZ vowels can surprise you: "day" may sound close to "die", "pen" like "pin".', 'North American speakers pronounce /r/ after vowels and flap the /t/: "water" → "wadder".', 'Numbers: British "double seven", "oh"; American "seven seven", "zero".', 'Practise with the speed control at 1.15× so that exam speed feels comfortable.'], quiz: [
    { q: 'A New Zealand speaker says something like "chick the list". The word is probably…', options: ['chick', 'check', 'cheek', 'chalk'], answer: 1, why: 'The NZ short "e" moves towards "i": check → "chick".' },
    { q: 'In British English, "0778" is commonly read as…', options: ['zero seven seven eight', 'oh double seven eight', 'nought seventy-seven eight', 'oh seven seventy-eight'], answer: 1, why: '"Oh" for zero and "double" for repeated digits are standard in UK phone numbers.' },
  ] },
  { id: 'l-skim', skill: 'reading', title: 'Skimming, scanning and the 20-minute rule', minutes: 10, tag: '#TimeManagement', points: ['Three passages, 40 questions, 60 minutes — and no extra time to transfer answers.', 'Spend about 20 minutes per passage. Passage 3 is the hardest, so do not borrow time from it.', 'Skim first: title, first sentence of each paragraph, then questions.', 'Scan for names, dates and numbers — they are not paraphrased.'], quiz: [
    { q: 'You have spent 26 minutes on Passage 1. What should you do?', options: ['Finish it perfectly', 'Guess the remaining answers and move on', 'Skip Passage 2', 'Re-read the passage'], answer: 1, why: 'Every question is worth one mark. Time lost here costs easier marks later.' },
    { q: 'Which items are easiest to scan for?', options: ['Opinions', 'Synonyms', 'Proper nouns and numbers', 'Linking words'], answer: 2, why: 'Capital letters and digits stand out and are rarely reworded.' },
  ] },
  { id: 'l-tfng', skill: 'reading', title: 'True / False / Not Given without guessing', minutes: 12, tag: '#TrueFalseNotGiven', points: ['TRUE: the text says the same thing in other words.', 'FALSE: the text says the opposite, so the statement could be corrected from the text.', 'NOT GIVEN: you cannot confirm or contradict it — the detail is simply missing.', 'Watch quantifiers (all, most, some) and comparisons. They create most traps.', 'Never use your own knowledge. Only the passage counts.'], quiz: [
    { q: 'Text: "Most students passed." Statement: "All students passed."', options: ['TRUE', 'FALSE', 'NOT GIVEN'], answer: 1, why: '"Most" contradicts "all".' },
    { q: 'Text: "The bridge opened in 1932." Statement: "The bridge was expensive to build."', options: ['TRUE', 'FALSE', 'NOT GIVEN'], answer: 2, why: 'Cost is never mentioned, so it cannot be judged.' },
    { q: 'What separates FALSE from NOT GIVEN?', options: ['FALSE statements are longer', 'For FALSE you can point to a sentence that contradicts it', 'NOT GIVEN is always about numbers', 'There is no real difference'], answer: 1, why: 'If you can correct the statement using the passage, it is FALSE.' },
  ] },
  { id: 'l-head', skill: 'reading', title: 'Matching headings: main idea vs detail', minutes: 10, tag: '#MatchingHeadings', points: ['A heading summarises the WHOLE paragraph, not one sentence in it.', 'Read the first two sentences and the last. Ask: what is this paragraph doing?', 'Wrong headings usually pick up a word that appears in the paragraph but describe only a detail.', 'Do the paragraphs you find easiest first, then eliminate.'], quiz: [
    { q: 'A paragraph gives three ways light harms animals. The best heading is…', options: ['The life cycle of the sea turtle', 'Wildlife led astray', 'How street lamps work', 'Birds that migrate at night'], answer: 1, why: 'Only this heading covers all three examples.' },
    { q: 'A heading contains a word that appears in the paragraph. That means…', options: ['It is definitely correct', 'It is definitely wrong', 'Nothing yet — check the main idea', 'You should choose it to save time'], answer: 2, why: 'Word-matching is the most common trap.' },
  ] },
  { id: 'l-over', skill: 'writing', title: 'Task 1: the overview that unlocks Band 7', minutes: 10, tag: '#AcademicWriting', points: ['Without a clear overview, Task Achievement is limited to Band 5.', 'An overview states the 2 biggest features: the main trend, the highest/lowest, or the key change.', 'Do not put figures in the overview. Save them for the detail paragraphs.', 'Start with "Overall," and place it straight after the introduction.'], quiz: [
    { q: 'Which is the best overview?', options: ['In 2000 the figure was 20% and in 2020 it was 93%.', 'Overall, access rose in all three areas, and the gap between them narrowed.', 'The graph shows internet access.', 'In conclusion, the internet is important.'], answer: 1, why: 'It reports the main trend and a key comparison, with no figures.' },
    { q: 'What is the maximum Task Achievement band without a clear overview?', options: ['Band 4', 'Band 5', 'Band 6', 'Band 7'], answer: 1, why: 'The public band descriptors require a clear overview from Band 6 upwards.' },
  ] },
  { id: 'l-t2', skill: 'writing', title: 'Task 2: position, paragraphs and development', minutes: 12, tag: '#TaskResponse', points: ['Answer every part of the question and make your position clear from the introduction.', 'Four paragraphs is enough: introduction, two body paragraphs, conclusion.', 'Each body paragraph: one idea → explain → specific example → link back.', 'Avoid memorised openers such as "In this modern era" — examiners recognise them and ignore them.', 'Aim for 260–290 words. Under 250 is penalised.'], quiz: [
    { q: 'Which opening sentence is strongest?', options: ['In this modern era, education is a hot topic.', 'Whether university should be free is debated; I believe it should, provided standards are protected.', 'Education is very important nowadays.', 'This essay will discuss education.'], answer: 1, why: 'It paraphrases the question and states a clear position.' },
    { q: 'How should a body paragraph be developed?', options: ['Three unrelated ideas', 'One idea, explained and supported with an example', 'A list of linking words', 'A repeat of the introduction'], answer: 1, why: 'Depth beats breadth: Band 7 needs "extended and supported" ideas.' },
  ] },
  { id: 'l-lk', skill: 'writing', title: 'Sri Lankan English vs IELTS standard: the 8 costly habits', minutes: 12, tag: '#SriLankaFocus', points: ['Articles: Sinhala and Tamil have no a/an/the. Check every singular countable noun.', 'Uncountables: information, advice, equipment, furniture, research — never plural.', 'State verbs: "I have a car" (not "I am having"), "I know" (not "I am knowing").', 'No extra prepositions: discuss the issue, emphasise the point, cope with stress.', 'Present perfect for experience up to now: "I have lived here for five years."', 'Do not double linkers: although … (no "but").', '"Passed out" → graduated. "Today morning" → this morning.', 'Sri Lankan English is a legitimate variety — but IELTS Writing is marked against international usage.'], quiz: [
    { q: 'Choose the correct sentence.', options: ['She gave me many advices.', 'She gave me a lot of advice.', 'She gave me an advice.', 'She gave me advices.'], answer: 1, why: '"Advice" is uncountable.' },
    { q: 'Choose the correct sentence.', options: ['We must emphasise on quality.', 'We must emphasise quality.', 'We must emphasise about quality.', 'We must put emphasise on quality.'], answer: 1, why: '"Emphasise" takes a direct object. (But: put emphasis ON.)' },
  ] },
  { id: 'l-p1', skill: 'speaking', title: 'Part 1: extend every answer', minutes: 8, tag: '#Fluency', points: ['Answer, give a reason, add an example: about 15–20 seconds each.', 'Do not memorise answers. Examiners are trained to spot them and will change the topic.', 'It is fine to say "That\'s an interesting question — let me think."', 'Speak at a natural pace. Speed is not fluency.'], quiz: [
    { q: 'Q: "Do you like your hometown?" Which answer is best?', options: ['Yes.', 'Yes, I do. Kandy is surrounded by hills, so it is cooler than Colombo, and I love walking around the lake in the evening.', 'My hometown is a place where I was born and it has many things.', 'I have prepared an answer about my hometown.'], answer: 1, why: 'Direct answer + reason + personal detail.' },
    { q: 'Memorised answers are risky because…', options: ['They are too long', 'The examiner may disregard them and they sound unnatural', 'They contain idioms', 'They are not allowed in Part 2'], answer: 1, why: 'Memorised language is not assessed as your own.' },
  ] },
  { id: 'l-p2', skill: 'speaking', title: 'Part 2: use the one-minute preparation well', minutes: 10, tag: '#CueCard', points: ['Write keywords, not sentences — one or two words for each bullet.', 'Cover all four bullets; the last one ("explain why") deserves the most time.', 'Use a simple story structure: past → present → feelings → future.', 'Keep talking until the examiner stops you at two minutes.'], quiz: [
    { q: 'What should your notes look like?', options: ['Full sentences', 'Keywords for each bullet point', 'A translation in Sinhala or Tamil', 'Nothing — notes are not allowed'], answer: 1, why: 'There is no time to write sentences, and reading aloud harms fluency.' },
    { q: 'You finish after 50 seconds. What should you do?', options: ['Stop and wait', 'Add feelings, a comparison or a future plan', 'Repeat your first sentence', 'Ask to change the topic'], answer: 1, why: 'Extending shows fluency; stopping early limits your score.' },
  ] },
  { id: 'l-pron', skill: 'speaking', title: 'Pronunciation priorities for Sinhala & Tamil speakers', minutes: 10, tag: '#Pronunciation', points: ['/v/ vs /w/: "vest" (teeth on lip) vs "west" (rounded lips). Practise: very well, video, wave.', '/f/ vs /p/: "coffee" not "coppee"; "fan" vs "pan".', 'The vowel in "hall / law / saw" is long and open — not the same as "hole / low / so".', 'Initial clusters: say "school", "station" without adding a vowel first ("iskool").', 'Word stress: PHOtograph, phoTOGraphy, photoGRAPHic. Stress changes the vowel.', 'Use rising and falling intonation. A flat, syllable-by-syllable rhythm is harder to follow.'], quiz: [
    { q: 'Which pair is distinguished only by /v/ and /w/?', options: ['vine / wine', 'fan / pan', 'ship / sheep', 'law / low'], answer: 0, why: 'For /v/ the top teeth touch the bottom lip; for /w/ the lips are rounded.' },
    { q: 'Where is the stress in "development"?', options: ['DEvelopment', 'deVELopment', 'develOPment', 'developMENT'], answer: 1, why: 'de-VEL-op-ment.' },
  ] },
]

export const FORMAT: Record<Skill, { time: string; total: number; parts: { name: string; mins: number; detail: string }[]; note: string }> = {
  listening: { time: '≈ 30 minutes', total: 30, note: 'On computer you type answers as you listen and have 2 minutes at the end to check them. 40 questions; one mark each.', parts: [
    { name: 'Part 1', mins: 7, detail: 'Everyday conversation between two people — e.g. booking a course. Form completion.' },
    { name: 'Part 2', mins: 7, detail: 'Everyday monologue — e.g. a guide describing facilities. Multiple choice, map labelling.' },
    { name: 'Part 3', mins: 8, detail: 'Academic discussion between up to four people. Matching, multiple choice.' },
    { name: 'Part 4', mins: 8, detail: 'Academic lecture. Note completion.' },
  ] },
  reading: { time: '60 minutes', total: 60, note: 'Academic: three long texts from books, journals and newspapers. No extra transfer time. 40 questions.', parts: [
    { name: 'Passage 1', mins: 17, detail: 'Usually factual and descriptive. T/F/NG, sentence completion.' },
    { name: 'Passage 2', mins: 20, detail: 'Often has headings to match and a summary to complete.' },
    { name: 'Passage 3', mins: 23, detail: 'Argumentative; tests the writer\'s views. Y/N/NG, multiple choice.' },
  ] },
  writing: { time: '60 minutes', total: 60, note: 'Task 2 carries twice the weight of Task 1. Each task is marked on four criteria.', parts: [
    { name: 'Task 1', mins: 20, detail: 'Academic: describe a graph, chart, process or map in at least 150 words.' },
    { name: 'Task 2', mins: 40, detail: 'Write an essay responding to an argument or problem in at least 250 words.' },
  ] },
  speaking: { time: '11–14 minutes', total: 14, note: 'A face-to-face (or video-call) interview with an examiner. It may be on a different day from the other three tests.', parts: [
    { name: 'Part 1', mins: 5, detail: 'Introduction and questions on familiar topics: home, studies, interests.' },
    { name: 'Part 2', mins: 4, detail: 'Cue card: 1 minute to prepare, then speak for up to 2 minutes.' },
    { name: 'Part 3', mins: 5, detail: 'A two-way discussion of more abstract ideas linked to Part 2.' },
  ] },
}

export const BANDS: { band: number; label: string; desc: string }[] = [
  { band: 9, label: 'Expert user', desc: 'Fully operational command of the language: appropriate, accurate and fluent, with complete understanding.' },
  { band: 8, label: 'Very good user', desc: 'Fully operational command with only occasional unsystematic inaccuracies. Handles complex, detailed argument well.' },
  { band: 7, label: 'Good user', desc: 'Operational command, with occasional inaccuracies and misunderstandings in some situations. Generally handles complex language well.' },
  { band: 6, label: 'Competent user', desc: 'Generally effective command despite some inaccuracies and misunderstandings. Can use fairly complex language in familiar situations.' },
  { band: 5, label: 'Modest user', desc: 'Partial command; copes with overall meaning in most situations, though likely to make many mistakes.' },
  { band: 4, label: 'Limited user', desc: 'Basic competence limited to familiar situations. Frequent problems in understanding and expression.' },
  { band: 3, label: 'Extremely limited user', desc: 'Conveys and understands only general meaning in very familiar situations.' },
  { band: 2, label: 'Intermittent user', desc: 'Great difficulty understanding spoken and written English.' },
  { band: 1, label: 'Non-user', desc: 'No ability to use the language beyond a few isolated words.' },
]

export const DESTINATIONS: { id: string; name: string; note: string; typical: number }[] = [
  { id: 'uk', name: 'United Kingdom', typical: 6.5, note: 'Most taught degrees ask for 6.0–7.0 overall. Visa applications usually need "IELTS for UKVI" — check before you book.' },
  { id: 'au', name: 'Australia', typical: 6.5, note: 'Universities commonly ask for 6.5 overall with no band below 6.0. Nursing and teaching registration need 7.0+.' },
  { id: 'ca', name: 'Canada', typical: 6.5, note: 'Study permits and most universities: 6.0–6.5. Each band is also converted to a CLB level for immigration.' },
  { id: 'nz', name: 'New Zealand', typical: 6.5, note: 'Undergraduate 6.0, postgraduate 6.5 is typical, with minimum scores in each band.' },
  { id: 'other', name: 'Other / not sure', typical: 6.5, note: 'Always confirm the exact requirement with your institution: it varies by course.' },
]

export const CHECKLIST: { group: string; items: string[] }[] = [
  { group: 'One week before', items: ['Confirm your test date, time and venue in the booking email (Colombo, Kandy and other centres have different reporting times).', 'Check that the passport you registered with is valid and not damaged.', 'Complete one full timed mock under exam conditions.', 'Find out whether your Speaking test is on a different day.'] },
  { group: 'The day before', items: ['Plan your route and allow extra time for traffic.', 'Pack your original passport — photocopies and NICs are not normally accepted.', 'Review your personal mistake deck — no new material.', 'Sleep at least seven hours.'] },
  { group: 'On test day', items: ['Arrive at the time shown in your confirmation, with your passport.', 'Leave your phone, watch and bag in the storage area.', 'Listening: check the headphones and volume during the sound test.', 'Reading: move on after 20 minutes per passage.', 'Writing: start with Task 2 if you tend to run out of time — it carries double weight.', 'Speaking: greet the examiner, breathe, and extend every answer.'] },
]

export const PEERS = ['Tharushi', 'Kavindu', 'Fathima', 'Nimal', 'Priya', 'Dinesh', 'Sanduni', 'Rizwan']
