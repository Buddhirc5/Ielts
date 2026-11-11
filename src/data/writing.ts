export type ChartKind = 'line' | 'bar' | 'pie' | 'process' | 'maps'
export interface Task1Prompt {
  id: string; kind: ChartKind; label: string; prompt: string
  band65: string; band85: string; notes: string[]
}
export interface LetterPrompt { id: string; tone: 'Formal' | 'Semi-formal' | 'Informal'; prompt: string; bullets: string[]; checklist: { label: string; test: string }[] }
export interface Task2Prompt { id: string; type: string; prompt: string; tips: string[] }

export const LINE_DATA = {
  years: [2000, 2005, 2010, 2015, 2020],
  series: [
    { name: 'Urban', color: '#EC6B78', values: [20, 45, 68, 82, 93] },
    { name: 'Suburban', color: '#3D7A74', values: [10, 28, 55, 74, 88] },
    { name: 'Rural', color: '#F5B841', values: [3, 8, 22, 48, 71] },
  ],
}
export const BAR_DATA = {
  cats: ['Study', 'Part-time work', 'Exercise', 'Social media'],
  series: [
    { name: 'Male students', color: '#3D7A74', values: [22, 12, 6, 10] },
    { name: 'Female students', color: '#EC6B78', values: [26, 9, 4, 14] },
  ],
}
export const PIE_DATA = {
  cats: ['Heating', 'Water heating', 'Appliances', 'Cooling', 'Lighting'],
  colors: ['#EC6B78', '#F5B841', '#3D7A74', '#9C8AE0', '#8FCFC3'],
  a: { label: '2000', values: [42, 25, 15, 8, 10] },
  b: { label: '2020', values: [30, 22, 26, 14, 8] },
}
export const PROCESS_STEPS = [
  ['Plucking', 'two leaves and a bud picked by hand'], ['Withering', 'spread on troughs, 12–18 hours'], ['Rolling', 'leaves twisted by machine'],
  ['Oxidation', '2–3 hours, leaves turn copper'], ['Drying', 'fired in hot air at 90°C'], ['Sorting', 'graded by leaf size'], ['Packing', 'sealed in foil-lined sacks'], ['Export', 'shipped to auction and overseas'],
]

export const TASK1: Task1Prompt[] = [
  {
    id: 't1-line', kind: 'line', label: 'Line graph',
    prompt: 'The graph below shows the percentage of households with internet access in urban, suburban and rural areas of one country between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    band65: 'The line graph shows the percentage of households which had internet access in three areas of one country from 2000 to 2020.\n\nOverall, internet access increased in all three areas. Urban areas always had the highest percentage and rural areas had the lowest.\n\nIn 2000, 20% of urban households had internet, and this number went up to 45% in 2005 and 68% in 2010. After that it continued to go up and reached 93% in 2020. Suburban households started at 10% in 2000. Then it increased a lot to 55% in 2010 and it was 88% in 2020, so it was close to urban areas.\n\nRural areas were very low at the beginning, only 3% in 2000 and 8% in 2005. However, after 2010 the number went up very fast. It was 22% in 2010, 48% in 2015 and 71% in 2020. So the gap between rural and urban areas became smaller at the end.',
    band85: 'The line graph compares the proportion of households with internet access in urban, suburban and rural parts of one country over a twenty-year period beginning in 2000.\n\nOverall, connectivity rose substantially in all three settings. Although urban households remained the best connected throughout, the gap between them and the other two groups, which widened during the first decade, had narrowed considerably by 2020.\n\nIn 2000, only a fifth of urban homes were online, twice the suburban figure (10%). Both then climbed steeply, reaching 68% and 55% respectively by 2010, after which growth slowed as each approached saturation, finishing at 93% and 88%.\n\nRural access followed a markedly different path. Starting from a negligible 3%, it had barely reached 8% by 2005 and still stood at just 22% in 2010, some 46 percentage points behind urban areas. The following decade, however, saw the fastest growth of any group: the figure more than doubled to 48% by 2015 and stood at 71% in 2020, reducing the urban–rural divide to 22 points.',
    notes: ['The Band 8.5 overview identifies a pattern (the gap widening, then narrowing), not just "everything went up".', 'Figures are grouped and compared (twice the suburban figure, 46 points behind) instead of listed year by year.', 'Precise verbs and adverbs: climbed steeply, slowed, more than doubled, negligible.'],
  },
  {
    id: 't1-bar', kind: 'bar', label: 'Bar chart',
    prompt: 'The chart below shows the average number of hours per week that male and female university students spent on four activities in one year. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    band65: 'The bar chart gives information about how many hours male and female university students spent on four activities every week.\n\nOverall, both groups spent the most time on study. Female students spent more time on study and social media, but male students spent more time on work and exercise.\n\nFemale students studied for 26 hours per week, which was 4 hours more than male students, who studied for 22 hours. For social media, females also had a higher number, 14 hours, and males had 10 hours.\n\nOn the other hand, male students did part-time work for 12 hours and female students did 9 hours. Exercise was the lowest activity for both. Males exercised for 6 hours a week and females only exercised for 4 hours.\n\nIn conclusion, study was the most popular activity and exercise was the least popular activity for all students.',
    band85: 'The bar chart compares the weekly hours that male and female undergraduates devoted to studying, paid work, exercise and social media.\n\nOverall, study accounted for by far the largest share of time for both sexes, while exercise received the least. Women spent longer than men on study and social media, whereas the reverse was true of employment and physical activity.\n\nFemale students studied for an average of 26 hours a week, four more than their male counterparts. A gap of exactly the same size was recorded for social media, on which women spent 14 hours compared with 10 for men; for women, this made it the second most time-consuming activity.\n\nFor men, by contrast, part-time work ranked second at 12 hours, three more than the female figure of nine. Exercise occupied only six hours of the male week and a mere four of the female, less than a sixth of the time women gave to their studies.',
    notes: ['Band 6.5 adds a conclusion that repeats the overview — unnecessary in Task 1.', 'Band 8.5 ranks activities within each group, a comparison the weaker answer misses.', 'Referencing avoids repetition: their male counterparts, the reverse was true, the female figure.'],
  },
  {
    id: 't1-pie', kind: 'pie', label: 'Pie charts',
    prompt: 'The two pie charts below show how household energy was used in one country in 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    band65: 'The pie charts show the percentage of energy used at home for five purposes in 2000 and 2020 in one country.\n\nOverall, heating was the biggest part in both years, but it became smaller. Appliances and cooling became bigger.\n\nIn 2000, heating was 42% of the energy, and in 2020 it decreased to 30%. Water heating was the second biggest in 2000 with 25%, and it went down a little to 22%. Lighting also decreased from 10% to 8%.\n\nHowever, the energy for appliances increased a lot. It was 15% in 2000 and 26% in 2020, so it became the second biggest part. Cooling also went up from 8% to 14%, which is nearly double.\n\nTo sum up, people used less energy for heating and more energy for appliances and cooling in 2020 than in 2000.',
    band85: 'The two pie charts illustrate how the share of domestic energy devoted to five different purposes changed between 2000 and 2020 in a particular country.\n\nOverall, although heating remained the largest single use of energy, its dominance declined markedly, while the proportions consumed by appliances and cooling grew considerably.\n\nIn 2000, space heating was responsible for 42% of household consumption, well ahead of water heating, at exactly a quarter. Two decades later, the former had fallen by twelve percentage points to 30%, and the latter had edged down to 22%. Lighting, already the second smallest category at 10%, slipped to 8% and became the least significant.\n\nThe opposite trend was evident elsewhere. The share taken by appliances rose from 15% to 26%, overtaking water heating to become the second largest category, while cooling almost doubled from 8% to 14%. Together, these two categories accounted for two fifths of all energy used in 2020, compared with under a quarter at the start of the period.',
    notes: ['Fractions vary the language of proportion: a quarter, two fifths, almost doubled.', '"The former … the latter" replaces repeated nouns — organic cohesion.', 'Band 8.5 combines categories to reveal a bigger picture (appliances + cooling = 40%).'],
  },
  {
    id: 't1-process', kind: 'process', label: 'Process diagram',
    prompt: 'The diagram below shows the stages in the production of black tea. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    band65: 'The diagram shows how black tea is produced. There are eight steps in the process.\n\nOverall, the process starts with picking the tea leaves and ends when the tea is exported to other countries.\n\nFirst, workers pluck two leaves and a bud by hand. After that, the leaves are spread on troughs and they are withered for 12 to 18 hours. Then the leaves are rolled by a machine. Next is oxidation. In this step the leaves are left for 2 to 3 hours and they turn copper colour.\n\nAfter oxidation, the leaves are dried in hot air at 90 degrees. Then they are sorted and graded by the size of the leaf. After that the tea is packed in sacks. Finally, the tea is exported and shipped to auction and overseas.',
    band85: 'The diagram outlines the eight stages by which freshly picked leaves are turned into black tea ready for export.\n\nOverall, the process is a linear one that combines manual and mechanical work. It can be divided into three phases: harvesting and preparing the leaf, transforming it through oxidation and heat, and finally preparing the finished product for sale.\n\nProduction begins in the field, where the top two leaves and a bud are plucked by hand. The harvest is then spread across troughs and left to wither for between 12 and 18 hours, the longest stage, which reduces its moisture. Once softened, the leaves are twisted in a rolling machine.\n\nThe rolled leaves are subsequently left to oxidise for two to three hours, during which they turn a copper colour. Oxidation is halted by firing the leaves in hot air at 90°C. Having been dried, the tea is graded according to leaf size, sealed in foil-lined sacks and, in the final stage, shipped to auction and to markets overseas.',
    notes: ['A process overview states the start, the end and the number or nature of stages — there are no trends to report.', 'Passive voice dominates (are plucked, is halted, is graded) because the action matters more than who does it.', 'Sequencers are varied and embedded: once softened, subsequently, having been dried.'],
  },
  {
    id: 't1-maps', kind: 'maps', label: 'Map comparison',
    prompt: 'The two maps below show the village of Meadowside in 1995 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    band65: 'The two maps show the changes in a village called Meadowside between 1995 and 2025.\n\nOverall, the village became more modern and bigger. There are more houses and facilities now and less natural land.\n\nIn 1995, there was farmland in the north of the village. In 2025, the farmland is gone and there is a housing estate there. The village shop in the centre was changed to a supermarket, and a car park was built next to it.\n\nIn the east, there was a big forest in 1995. In 2025 half of the forest was cut down and a sports centre was built. The primary school in the south-west is still there but it is bigger now.\n\nAlso, there was only a footbridge over the river in 1995. In 2025 there is a road bridge, and a new road goes to the housing estate.',
    band85: 'The maps illustrate how the village of Meadowside developed over the thirty years from 1995 to 2025.\n\nOverall, the settlement was transformed from a largely agricultural community into a residential one, with new housing, retail and leisure facilities replacing much of its farmland and woodland, and with considerably better road access.\n\nThe most striking change occurred in the north, where the farmland that dominated the 1995 map has been replaced entirely by a housing estate. To serve this larger population, the village shop in the centre has given way to a supermarket with an adjoining car park, and the primary school in the south-west has been extended.\n\nThe east of the village has also been redeveloped. Roughly half of the forest has been cleared to make room for a sports centre, although the remaining woodland has been preserved. Finally, the footbridge that once provided the only crossing over the river has been replaced by a road bridge, from which a new road now runs north to the housing estate.',
    notes: ['Present perfect passive (has been replaced, has been cleared) is the natural tense for changes up to the present.', 'Location language is precise: in the north, adjoining, from which a new road runs north.', 'The overview summarises the TYPE of change (agricultural → residential), not individual buildings.'],
  },
]

export const LETTERS: LetterPrompt[] = [
  {
    id: 'gt-formal', tone: 'Formal',
    prompt: 'You recently bought a laptop online, but when it arrived it was damaged. Write a letter to the company. In your letter:',
    bullets: ['describe what you ordered and when', 'explain what is wrong with it', 'say what you would like the company to do'],
    checklist: [
      { label: 'Opens with "Dear Sir or Madam,"', test: '^\\s*dear (sir|madam)' },
      { label: 'States the purpose in the first sentence', test: 'i am writing (to|in|with)' },
      { label: 'No contractions (I am, not I\'m)', test: '!\\b\\w+\'(m|re|ve|ll|d|t)\\b' },
      { label: 'Makes a clear, polite request', test: '(i would (like|appreciate)|i would be grateful|could you|i request)' },
      { label: 'Closes with "Yours faithfully,"', test: 'yours faithfully' },
    ],
  },
  {
    id: 'gt-semi', tone: 'Semi-formal',
    prompt: 'You are going to study abroad for a year and need to leave your rented flat early. Write a letter to your landlord, Mr Perera. In your letter:',
    bullets: ['explain why you are leaving', 'say when you will move out', 'suggest how the landlord could find a new tenant'],
    checklist: [
      { label: 'Opens with "Dear Mr Perera,"', test: '^\\s*dear mr\\.? perera' },
      { label: 'Explains the reason clearly', test: '(because|since|as i|due to|owing to)' },
      { label: 'Gives a specific date or time frame', test: '(january|february|march|april|may|june|july|august|september|october|november|december|\\bweeks?\\b|\\bmonths?\\b|\\d(st|nd|rd|th))' },
      { label: 'Polite, co-operative tone', test: '(i apologise|i am sorry|i would be happy|i hope|thank you|grateful)' },
      { label: 'Closes with "Yours sincerely,"', test: 'yours sincerely' },
    ],
  },
  {
    id: 'gt-informal', tone: 'Informal',
    prompt: 'A friend from overseas is coming to visit Sri Lanka for the first time. Write a letter to your friend. In your letter:',
    bullets: ['suggest the best time of year to visit', 'recommend two places to see', 'offer to help with arrangements'],
    checklist: [
      { label: 'Opens with "Dear" or "Hi" + first name', test: '^\\s*(dear|hi|hello) [a-z]+' },
      { label: 'Friendly opening line', test: '(great to hear|lovely to hear|how are you|hope you|so excited|thanks for)' },
      { label: 'Uses contractions naturally', test: '\\b\\w+\'(m|re|ve|ll|d|t|s)\\b' },
      { label: 'Makes recommendations', test: '(you should|you must|why don\'t|i\'d recommend|i would recommend|make sure|how about|worth)' },
      { label: 'Informal sign-off (Best wishes / See you soon)', test: '(best wishes|see you|take care|lots of love|all the best|cheers)' },
    ],
  },
]

export const TASK2: Task2Prompt[] = [
  { id: 't2-opinion', type: 'Opinion (Agree / Disagree)', prompt: 'Some people believe that university education should be free for all students, regardless of their financial background. To what extent do you agree or disagree?', tips: ['State your position in the introduction and keep it consistent.', 'Each body paragraph develops one reason with an explanation and an example.'] },
  { id: 't2-discussion', type: 'Discussion (Both Views)', prompt: 'Some people think that young people should study abroad to gain a better education, while others believe it is better to study in their home country. Discuss both views and give your own opinion.', tips: ['Give each view a fair paragraph before your own opinion.', 'Your opinion must be explicit — "I believe", not only implied.'] },
  { id: 't2-problem', type: 'Problem – Solution', prompt: 'In many developing countries, large numbers of skilled professionals such as doctors and engineers leave to work abroad. What problems does this cause, and what solutions can you suggest?', tips: ['Pair each problem with a matching solution.', 'Say WHO should act: governments, employers, universities.'] },
  { id: 't2-advdis', type: 'Advantage – Disadvantage', prompt: 'More and more people are working from home rather than in an office. Do the advantages of this development outweigh the disadvantages?', tips: ['"Outweigh" requires a judgement — say which side is stronger.', 'Give the weaker side first, then the stronger.'] },
  { id: 't2-twopart', type: 'Two-Part Question', prompt: 'In many countries, traditional foods are being replaced by international fast food. Why is this happening? Is it a positive or negative development?', tips: ['Answer BOTH questions with roughly equal weight.', 'Use one body paragraph per question.'] },
]
