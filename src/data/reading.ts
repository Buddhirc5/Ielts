import type { Group, Passage } from '../types'

const clipperGroups = (o: number): Group[] => [
  {
    type: 'tfng', title: `Questions ${1 + o}–${7 + o}`,
    instruction: 'Do the following statements agree with the information given in the text? Choose TRUE, FALSE or NOT GIVEN.',
    qs: [
      { n: 1 + o, text: 'The first tea to reach London each year could be sold at a higher price.', answer: 'TRUE', ev: 'the first cargo to arrive each year sold at a premium', qp: 'sold at a higher price', pp: 'sold at a premium', trap: 'Synonym match: "at a premium" means above the normal price. No trap — but candidates who do not know the phrase often choose Not Given.' },
      { n: 2 + o, text: 'The clipper hull was first developed by British shipbuilders.', answer: 'FALSE', ev: 'The design of the clipper originated not in Britain but in the shipyards of the eastern United States', qp: 'first developed by British shipbuilders', pp: 'originated not in Britain but in … the United States', trap: 'Direct contradiction. Britain IS mentioned, which tempts a quick "True" — read the "not … but" structure.' },
      { n: 3 + o, text: 'Clippers were able to carry more cargo than ordinary merchant ships.', answer: 'FALSE', ev: 'a clipper could carry far less cargo than a traditional merchant ship of the same length', qp: 'more cargo than ordinary merchant ships', pp: 'far less cargo than a traditional merchant ship', trap: 'Reversed comparison: the statement swaps "less" for "more".' },
      { n: 4 + o, text: 'American clippers were cheaper to build than British ones.', answer: 'NOT GIVEN', ev: 'their arrival caused alarm', qp: 'cheaper to build', pp: '(no information about building costs)', trap: 'Comparison trap: both American and British clippers are discussed, but their construction costs are never compared. Do not infer cost from the "alarm" they caused.' },
      { n: 5 + o, text: 'Composite construction combined iron and wood.', answer: 'TRUE', ev: 'built with iron frames covered in wooden planks, a method known as composite construction', qp: 'combined iron and wood', pp: 'iron frames covered in wooden planks', trap: 'The definition comes BEFORE the technical term in the sentence.' },
      { n: 6 + o, text: 'The owners of Taeping kept the whole prize for the 1866 race.', answer: 'FALSE', ev: 'its owners agreed to share the prize with their rival', qp: 'kept the whole prize', pp: 'agreed to share the prize', trap: 'Taeping did dock first, so keeping the prize seems logical — but the text says otherwise.' },
      { n: 7 + o, text: 'Cutty Sark was built on the River Clyde.', answer: 'NOT GIVEN', ev: 'The most famous survivor, Cutty Sark, launched in 1869', qp: 'built on the River Clyde', pp: 'launched in 1869 (no shipyard named)', trap: 'Word-spotting trap: the Clyde appears earlier as a place where clippers were built, but the text never says where Cutty Sark was built. Outside knowledge does not count.' },
    ],
  },
  {
    type: 'gap', layout: 'list', title: `Questions ${8 + o}–${13 + o}`,
    instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the text for each answer.',
    qs: [
      { n: 8 + o, text: 'Captains who won the tea race were rewarded with a ____.', answer: 'bonus|generous bonus', ev: 'merchants were prepared to pay captains a generous bonus', qp: 'were rewarded with', pp: 'were prepared to pay captains', trap: 'Passive/active switch: captains are the object in the text but the subject in the question.' },
      { n: 9 + o, text: 'Clippers were only profitable when carrying goods that were ____ and valuable.', answer: 'light', ev: 'profitable only for goods that were light and valuable', qp: 'only profitable when carrying', pp: 'profitable only for goods', trap: 'A direct lift — the skill is locating it quickly in paragraph B.' },
      { n: 10 + o, text: 'British builders had been shielded from foreign competition by the ____.', answer: 'Navigation Acts', ev: 'a set of laws known as the Navigation Acts had long protected them from foreign competition', qp: 'shielded from', pp: 'protected them from', trap: 'Both words are needed. "Laws" alone is too general, and "Acts" alone is incomplete.' },
      { n: 11 + o, text: 'In the 1866 race, the two leading ships took ____ days to reach London.', answer: '99|ninety-nine|ninety nine', ev: 'After ninety-nine days and more than 14,000 miles', qp: 'took … days', pp: 'After ninety-nine days', trap: 'Several numbers sit close together: five ships, three days, 14,000 miles, twenty minutes.' },
      { n: 12 + o, text: 'Sailing ships could only pass through the Suez Canal if they were ____.', answer: 'towed', ev: 'which had to be towed through at great expense', qp: 'could only pass through … if', pp: 'had to be towed through', trap: 'One word fits the grammar. "Towed through" would repeat "through" from the question.' },
      { n: 13 + o, text: 'After the tea trade declined, some clippers transported ____ from Australia.', answer: 'wool', ev: 'Some clippers found a second life carrying wool from Australia', qp: 'transported', pp: 'carrying', trap: 'Tea is the obvious cargo throughout the passage; the final paragraph changes it.' },
    ],
  },
]

const clipperParas = [
  { id: 'A', text: "In the middle of the nineteenth century, the fastest commercial vessels on the oceans were the tea clippers: slender, three-masted sailing ships built to carry the new season's tea from China to London. Speed mattered because the first cargo to arrive each year sold at a premium, and merchants were prepared to pay captains a generous bonus for winning what newspapers soon called the tea race." },
  { id: 'B', text: 'The design of the clipper originated not in Britain but in the shipyards of the eastern United States, where builders in the 1840s experimented with long, narrow hulls and sharply pointed bows. These features allowed a ship to cut through waves rather than ride over them. The price of speed was capacity: a clipper could carry far less cargo than a traditional merchant ship of the same length, which made it profitable only for goods that were light and valuable.' },
  { id: 'C', text: 'British shipbuilders were slow to respond, partly because a set of laws known as the Navigation Acts had long protected them from foreign competition. When the Acts were repealed in 1849, American clippers were free to deliver tea to London, and their arrival caused alarm. Within a decade, yards in Aberdeen and on the River Clyde were producing clippers of their own, many of them built with iron frames covered in wooden planks, a method known as composite construction.' },
  { id: 'D', text: 'The most celebrated contest took place in 1866, when five ships left the Chinese port of Fuzhou within three days of one another. After ninety-nine days and more than 14,000 miles, two of them, Taeping and Ariel, reached London on the same tide. Taeping docked twenty minutes ahead, but its owners agreed to share the prize with their rival, fearing that a dispute would damage the trade.' },
  { id: 'E', text: "Yet the clippers' triumph was brief. The opening of the Suez Canal in 1869 shortened the route to Asia by thousands of miles, but its calm, narrow waters were of little use to sailing ships, which had to be towed through at great expense. Steamships, which could use the canal freely, began to deliver tea in half the time. Coal was costly, but steamers offered something sail never could: a reliable date of arrival." },
  { id: 'F', text: 'Some clippers found a second life carrying wool from Australia, a route on which the strong winds of the southern oceans still favoured sail. The most famous survivor, Cutty Sark, launched in 1869, never won a tea race, yet set records in the wool trade during the 1880s. Today it is preserved in a dry dock in Greenwich, the last of its kind.' },
]

export const ACADEMIC_READING: Passage[] = [
  { id: 'AR1', title: 'The Tea Clippers', subtitle: 'Reading Passage 1', paras: clipperParas, groups: clipperGroups(0) },
  {
    id: 'AR2', title: 'Reclaiming the Night Sky', subtitle: 'Reading Passage 2',
    paras: [
      { id: 'A', text: "For most of human history, darkness arrived every evening and with it a sky crowded with stars. Today, a child born in a large city may never see the Milky Way. Satellite measurements suggest that artificially lit outdoor areas grew by roughly two per cent a year during the last decade, and astronomers estimate that more than eighty per cent of the world's population now lives under skies polluted by light." },
      { id: 'B', text: 'The loss is not merely aesthetic. Many animals rely on the daily cycle of light and dark to regulate their behaviour. Newly hatched sea turtles, which find the ocean by heading towards the brightest horizon, are drawn inland by street lamps and die in their thousands. Migrating birds, confused by illuminated towers, circle them until they collapse from exhaustion. Even insects are affected: a single lamp can attract and kill countless moths in one night, removing important pollinators from the surrounding fields.' },
      { id: 'C', text: 'Humans are not immune. Exposure to light at night suppresses the production of melatonin, the hormone that prepares the body for sleep. Researchers have linked disrupted sleep patterns to obesity, depression and other disorders, although they caution that proving a direct cause is difficult, because people who live in brightly lit districts also tend to experience more noise and stress.' },
      { id: 'D', text: 'Much of this light serves no purpose. Poorly designed fittings send a large proportion of their output sideways or upwards, where it illuminates nothing but the undersides of clouds. One study of a mid-sized European city calculated that almost a third of its public lighting was wasted in this way, at an annual cost of several million euros — money, critics point out, that taxpayers spend on brightening outer space.' },
      { id: 'E', text: 'The assumption that brighter streets are safer streets is also being questioned. When several English councils switched off or dimmed lamps after midnight to save money, researchers who examined fourteen years of records found no increase in either crime or road accidents. Glare from unshielded lamps, some experts argue, can actually make it harder to see, by creating deep shadows in which a person may hide.' },
      { id: 'F', text: 'Solutions are neither complicated nor costly. Shielded fittings direct light downwards; warm-coloured bulbs are less disruptive to wildlife than blue-white ones; and motion sensors ensure that lamps shine only when someone is present. The French town of Clermont cut its lighting bill by forty per cent after adopting such measures, and residents have begun gathering in the main square for monthly star-watching evenings. Darkness, it turns out, is one of the few environmental resources that can be restored at the flick of a switch.' },
    ],
    groups: [
      {
        type: 'heading', title: 'Questions 14–19',
        instruction: 'The text has six paragraphs, A–F. Choose the correct heading for each paragraph. Drag a heading onto a paragraph, or tap a heading and then tap the paragraph slot.',
        options: ['Paying for light nobody uses', 'The history of street lighting', 'Wildlife led astray', 'Simple remedies and an early success', 'A view that is vanishing', 'Why astronomers oppose new technology', 'Doubts about a common belief', 'Possible risks to human health'],
        qs: [
          { n: 14, para: 'A', text: 'Paragraph A', answer: 'v', ev: 'a child born in a large city may never see the Milky Way', qp: 'A view that is vanishing', pp: 'may never see the Milky Way', trap: 'Astronomers are mentioned, which makes heading vi tempting — but they only supply a statistic; they are not opposing anything.' },
          { n: 15, para: 'B', text: 'Paragraph B', answer: 'iii', ev: 'are drawn inland by street lamps and die in their thousands', qp: 'Wildlife led astray', pp: 'drawn inland … confused by illuminated towers', trap: 'Street lamps appear here, but the paragraph is about their effect on animals, not their history (heading ii).' },
          { n: 16, para: 'C', text: 'Paragraph C', answer: 'viii', ev: 'Researchers have linked disrupted sleep patterns to obesity, depression and other disorders', qp: 'Possible risks to human health', pp: 'linked … to obesity, depression and other disorders', trap: '"Possible" matters: the paragraph hedges ("proving a direct cause is difficult"). A heading that claimed proof would be wrong.' },
          { n: 17, para: 'D', text: 'Paragraph D', answer: 'i', ev: 'almost a third of its public lighting was wasted in this way, at an annual cost of several million euros', qp: 'Paying for light nobody uses', pp: 'wasted … at an annual cost of several million euros', trap: 'A heading must cover the whole paragraph: both the waste AND the cost.' },
          { n: 18, para: 'E', text: 'Paragraph E', answer: 'vii', ev: 'The assumption that brighter streets are safer streets is also being questioned', qp: 'Doubts about a common belief', pp: 'The assumption … is also being questioned', trap: 'The topic sentence gives the answer. Money-saving is mentioned but is only the background to the study.' },
          { n: 19, para: 'F', text: 'Paragraph F', answer: 'iv', ev: 'The French town of Clermont cut its lighting bill by forty per cent after adopting such measures', qp: 'Simple remedies and an early success', pp: 'neither complicated nor costly … cut its lighting bill by forty per cent', trap: 'Technology is discussed positively here, so heading vi ("oppose new technology") is the opposite of the content.' },
        ],
      },
      {
        type: 'bank', layout: 'summary', title: 'Questions 20–24',
        instruction: 'Complete the summary using the list of words below. Drag a word into each gap, or tap a word and then tap the gap.',
        options: ['inland', 'exhaustion', 'pollinators', 'hormone', 'sensors', 'predators', 'offshore', 'hunger', 'bulbs', 'disease'],
        qs: [
          { n: 20, text: 'Artificial light harms wildlife in several ways. Young turtles head ____ instead of towards the sea,', answer: 'inland', ev: 'are drawn inland by street lamps', qp: 'head … instead of towards the sea', pp: 'are drawn inland', trap: '"Offshore" is the direction turtles SHOULD travel, not the one they take.' },
          { n: 21, text: 'while birds fly around lit towers until they suffer from ____.', answer: 'exhaustion', ev: 'circle them until they collapse from exhaustion', qp: 'fly around lit towers', pp: 'circle them', trap: '"Hunger" is a plausible cause of death for birds but is not what the text says.' },
          { n: 22, text: 'The death of moths means fewer ____ for nearby crops.', answer: 'pollinators', ev: 'removing important pollinators from the surrounding fields', qp: 'nearby crops', pp: 'the surrounding fields', trap: '"Predators" fits the grammar but reverses the meaning.' },
          { n: 23, text: 'In humans, night-time light reduces the level of a ____ that controls sleep.', answer: 'hormone', ev: 'melatonin, the hormone that prepares the body for sleep', qp: 'reduces the level of', pp: 'suppresses the production of', trap: '"Disease" appears in the bank because disorders are mentioned in the same paragraph.' },
          { n: 24, text: 'One practical answer is to fit ____ so that lamps operate only when needed.', answer: 'sensors', ev: 'motion sensors ensure that lamps shine only when someone is present', qp: 'operate only when needed', pp: 'shine only when someone is present', trap: '"Bulbs" are also a solution in paragraph F, but they concern colour, not timing.' },
        ],
      },
      {
        type: 'mcq', title: 'Questions 25–26', instruction: 'Choose the correct letter, A, B, C or D.',
        qs: [
          { n: 25, text: 'What do researchers say about the link between light at night and illness?', options: ['It has been proved beyond doubt.', 'It is hard to establish because other factors are involved.', 'It applies only to people who sleep badly.', 'It has been exaggerated by the media.'], answer: 'B', ev: 'they caution that proving a direct cause is difficult', qp: 'hard to establish because other factors are involved', pp: 'proving a direct cause is difficult, because … more noise and stress', trap: 'Option A overstates a hedged claim — the most common MCQ trap in academic texts.' },
          { n: 26, text: 'What happened when some English councils reduced street lighting?', options: ['Crime fell significantly.', 'Road accidents became more frequent.', 'Neither crime nor accidents rose.', 'Residents demanded that lights be restored.'], answer: 'C', ev: 'found no increase in either crime or road accidents', qp: 'Neither crime nor accidents rose', pp: 'no increase in either crime or road accidents', trap: '"No increase" is not the same as a fall, so A goes further than the text.' },
        ],
      },
    ],
  },
  {
    id: 'AR3', title: 'Can Machines Be Creative?', subtitle: 'Reading Passage 3',
    paras: [
      { id: 'A', text: "When a computer program defeated the world's best player of the board game Go in 2016, commentators were struck less by the victory than by one particular move, which no human expert would have considered and which was later described as beautiful. Was this creativity? The question is no longer academic. Software now composes music, writes verse and produces images that win prizes, and the argument over what to call these achievements has divided researchers." },
      { id: 'B', text: 'Sceptics insist that such systems merely recombine patterns found in the vast quantities of human work on which they are trained. In my view, this objection is weaker than it first appears. Human artists, too, learn by absorbing the work of their predecessors; nobody has ever written a symphony without first hearing music. If borrowing disqualified a work from being creative, very little of our own culture would pass the test.' },
      { id: 'C', text: 'A more serious objection concerns intention. A painter chooses a subject because it matters to her; a program has no stake in what it produces and cannot tell whether its output is profound or trivial. The psychologist Margaret Boden, who has studied the subject for four decades, distinguishes between producing something novel and recognising that it has value. Machines, she suggests, increasingly manage the first, while the second still depends on people.' },
      { id: 'D', text: "This division of labour is visible in practice. The composer who uses software to generate a hundred melodies still decides which one deserves to be developed, and it is that act of selection, I would argue, that deserves to be called creative. It would be a mistake, however, to conclude that the machine's contribution is trivial. Photographers were once dismissed as mere operators of equipment, yet few people today would deny that photography is an art." },
      { id: 'E', text: 'What worries me is not that machines will replace artists but that they will flood the market with competent, forgettable work, making it harder for original voices to be heard and paid. Legal systems have been slow to respond: in most countries it remains unclear who, if anyone, owns a picture generated by software. Until that question is settled, those whose work was used to train the systems have every reason to feel exploited.' },
      { id: 'F', text: 'Creativity has never been a fixed concept. It was once reserved for the divine, then extended reluctantly to poets, and later to scientists and engineers. Whether we choose to extend it to machines will depend less on what they can do than on what we wish the word to mean.' },
    ],
    groups: [
      {
        type: 'ynng', title: 'Questions 27–32',
        instruction: 'Do the following statements agree with the views of the writer? Choose YES, NO or NOT GIVEN.',
        qs: [
          { n: 27, text: 'The move that attracted attention in the 2016 Go match was one that human experts commonly play.', answer: 'NO', ev: 'which no human expert would have considered', qp: 'human experts commonly play', pp: 'no human expert would have considered', trap: 'Direct contradiction hidden inside a relative clause.' },
          { n: 28, text: 'The argument that machines only recombine existing material is a convincing one.', answer: 'NO', ev: 'In my view, this objection is weaker than it first appears.', qp: 'is a convincing one', pp: 'is weaker than it first appears', trap: "Whose view? The sceptics hold this argument; the WRITER rejects it. Y/N/NG questions test the writer's opinion, not other people's." },
          { n: 29, text: 'Human artists depend on earlier work in order to create.', answer: 'YES', ev: 'Human artists, too, learn by absorbing the work of their predecessors', qp: 'depend on earlier work', pp: 'learn by absorbing the work of their predecessors', trap: 'A clean paraphrase — "predecessors" = those who produced earlier work.' },
          { n: 30, text: 'Margaret Boden believes machines will eventually be able to judge the value of their own work.', answer: 'NOT GIVEN', ev: 'while the second still depends on people', qp: 'will eventually be able to judge', pp: 'still depends on people (present situation only)', trap: 'Prediction trap: "still" describes the present. Boden makes no forecast, so neither YES nor NO can be supported.' },
          { n: 31, text: 'Choosing between options produced by a machine is a creative act.', answer: 'YES', ev: 'it is that act of selection, I would argue, that deserves to be called creative', qp: 'Choosing between options', pp: 'that act of selection', trap: '"I would argue" marks this clearly as the writer\'s own claim.' },
          { n: 32, text: 'Photography was accepted as an art form more quickly than computer-generated art will be.', answer: 'NOT GIVEN', ev: 'Photographers were once dismissed as mere operators of equipment', qp: 'more quickly than', pp: '(no comparison of speed is made)', trap: 'Comparison trap: photography is used as an analogy, but the speed of acceptance is never compared.' },
        ],
      },
      {
        type: 'mcq', title: 'Questions 33–36', instruction: 'Choose the correct letter, A, B, C or D.',
        qs: [
          { n: 33, text: 'Why does the writer refer to the writing of a symphony?', options: ['to show that music is the most demanding art form', 'to illustrate that all creators build on what they have encountered', 'to argue that machines will never compose well', 'to criticise the methods of modern composers'], answer: 'B', ev: 'nobody has ever written a symphony without first hearing music', qp: 'build on what they have encountered', pp: 'without first hearing music', trap: 'Purpose questions ask WHY an example is used. Options A, C and D are about music itself, not the argument it supports.' },
          { n: 34, text: 'According to paragraph C, what is a program unable to do?', options: ['produce something that is new', "imitate a painter's style", 'operate without human data', 'assess whether what it has made matters'], answer: 'D', ev: 'cannot tell whether its output is profound or trivial', qp: 'assess whether what it has made matters', pp: 'cannot tell whether its output is profound or trivial', trap: 'Option A is the opposite: machines "increasingly manage" novelty.' },
          { n: 35, text: "What is the writer's main concern in paragraph E?", options: ['Original work will be drowned out by mediocre output.', 'Artists will be replaced by machines.', 'Software-generated pictures will become too expensive.', 'Courts will ban machine-made art.'], answer: 'A', ev: 'they will flood the market with competent, forgettable work, making it harder for original voices to be heard and paid', qp: 'drowned out by mediocre output', pp: 'flood the market with competent, forgettable work', trap: 'Option B is explicitly denied: "not that machines will replace artists".' },
          { n: 36, text: 'What point does the writer make in the final paragraph?', options: ['Machines have already matched human creativity.', 'Scientists were the first people to be called creative.', 'What counts as creativity depends on how society chooses to define it.', 'The definition of creativity should no longer be changed.'], answer: 'C', ev: 'will depend less on what they can do than on what we wish the word to mean', qp: 'depends on how society chooses to define it', pp: 'on what we wish the word to mean', trap: 'Option B scrambles the historical order given in the paragraph.' },
        ],
      },
      {
        type: 'gap', layout: 'summary', title: 'Questions 37–40',
        instruction: 'Complete the summary below. Choose ONE WORD ONLY from the text for each answer.',
        qs: [
          { n: 37, text: 'The writer notes that the law has been ____ to react to machine-made art.', answer: 'slow', ev: 'Legal systems have been slow to respond', qp: 'the law … to react', pp: 'Legal systems … to respond', trap: 'The gap needs an adjective; "unclear" appears nearby but describes ownership.' },
          { n: 38, text: 'In most countries it is uncertain who ____ an image produced by software.', answer: 'owns', ev: 'who, if anyone, owns a picture generated by software', qp: 'an image produced by software', pp: 'a picture generated by software', trap: 'Keep the verb form from the text: "owns", not "own" or "owner".' },
          { n: 39, text: 'People whose work was used for training may therefore feel ____.', answer: 'exploited', ev: 'have every reason to feel exploited', qp: 'may therefore feel', pp: 'have every reason to feel', trap: 'A direct lift at the end of the paragraph.' },
          { n: 40, text: 'Historically, creativity was first associated with the ____ before being applied to poets.', answer: 'divine', ev: 'It was once reserved for the divine', qp: 'first associated with', pp: 'once reserved for', trap: 'Order matters: poets, scientists and engineers all came later.' },
        ],
      },
    ],
  },
]

export const GENERAL_READING: Passage[] = [
  {
    id: 'GR1', title: 'Section 1 · Everyday notices', subtitle: 'Two short texts: evening classes and parcel lockers',
    paras: [
      { id: 'A', label: 'Oakfield Community Centre — Evening Classes, Autumn Term', text: 'Enrolment for the autumn term opens on Monday 2 September. You can enrol online, by telephone or in person at reception, but please note that places cannot be reserved without full payment. Most courses run for ten weeks and cost £85; residents aged over sixty or in receipt of benefits pay half price on production of evidence.' },
      { id: 'B', text: "This term we are offering three new courses. Conversational Spanish is aimed at complete beginners and requires no textbook. Digital Photography is open to all levels, but students must bring their own camera — a phone camera is not suitable. Bread Making takes place in the centre's kitchen and is limited to eight students because of space; ingredients are included in the fee." },
      { id: 'C', text: 'Classes start at 7 pm and finish at 9 pm, with a fifteen-minute break. The café closes at 6.30 pm, so hot drinks are available from the machine in the foyer only. If a class is cancelled because of low numbers, you will be offered a transfer to another course or a full refund. Refunds for any other reason are given only if you withdraw at least seven days before the course begins, and are subject to a £10 administration charge.' },
      { id: 'D', text: 'Free parking is available behind the centre after 6 pm. Before that time, the car park is reserved for staff of the neighbouring health clinic.' },
      { id: 'E', label: 'Using the QuickDrop Parcel Lockers', text: 'QuickDrop lockers let you collect parcels at any hour, without waiting at home for a delivery. When your parcel has been placed in a locker, we will send a six-digit code to your phone by text message. Enter the code on the touchscreen and the door of your compartment will open automatically.' },
      { id: 'F', text: 'Parcels are held for three days. If you have not collected yours by then, it is returned to the local depot, where it will be kept for a further week before being sent back to the retailer. To collect from the depot you will need to show photo identification.' },
      { id: 'G', text: 'The lockers cannot accept items weighing more than fifteen kilograms, or anything containing liquids or fresh food. If your compartment is empty or the parcel is damaged, do not leave the site: press the help button and an operator will speak to you through the intercom. Reports made later cannot be investigated.' },
      { id: 'H', text: 'To send a return, print the label supplied by the retailer and scan its barcode at the locker. A compartment will open; place the parcel inside and close the door firmly. Keep the receipt that is printed, as this is your only proof of posting.' },
    ],
    groups: [
      {
        type: 'tfng', title: 'Questions 1–7',
        instruction: 'Read the notice about evening classes. Do the following statements agree with the information given? Choose TRUE, FALSE or NOT GIVEN.',
        qs: [
          { n: 1, text: 'It is possible to hold a place on a course before paying for it.', answer: 'FALSE', ev: 'places cannot be reserved without full payment', qp: 'hold a place … before paying', pp: 'cannot be reserved without full payment', trap: 'Three ways to enrol are listed first, which sounds flexible — the restriction follows "but please note".' },
          { n: 2, text: 'People over sixty are entitled to a reduced fee.', answer: 'TRUE', ev: 'residents aged over sixty or in receipt of benefits pay half price', qp: 'a reduced fee', pp: 'pay half price', trap: 'Simple paraphrase: half price = reduced fee.' },
          { n: 3, text: 'The Spanish course is taught by a native speaker.', answer: 'NOT GIVEN', ev: 'Conversational Spanish is aimed at complete beginners and requires no textbook', qp: 'taught by a native speaker', pp: '(nothing is said about the teacher)', trap: 'A reasonable assumption is not information. The teacher is never mentioned.' },
          { n: 4, text: 'Photography students may use a mobile phone instead of a camera.', answer: 'FALSE', ev: 'a phone camera is not suitable', qp: 'may use a mobile phone', pp: 'a phone camera is not suitable', trap: '"Open to all levels" sounds permissive, but it is about ability, not equipment.' },
          { n: 5, text: 'The Bread Making course was fully booked last term.', answer: 'NOT GIVEN', ev: 'is limited to eight students because of space', qp: 'fully booked last term', pp: 'limited to eight students (and described as new)', trap: 'A limit on numbers suggests popularity, but past bookings are never mentioned.' },
          { n: 6, text: 'The café is open during the break in classes.', answer: 'FALSE', ev: 'The café closes at 6.30 pm', qp: 'open during the break', pp: 'closes at 6.30 pm (classes start at 7 pm)', trap: 'You must combine two facts: the café closes at 6.30 and classes begin at 7.' },
          { n: 7, text: 'The centre shares its car park with a health clinic.', answer: 'TRUE', ev: 'the car park is reserved for staff of the neighbouring health clinic', qp: 'shares its car park', pp: 'reserved for staff of the neighbouring health clinic', trap: 'Sharing is implied by the two time periods, before and after 6 pm.' },
        ],
      },
      {
        type: 'gap', layout: 'list', title: 'Questions 8–14',
        instruction: 'Read the parcel locker instructions. Complete the sentences. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the text for each answer.',
        qs: [
          { n: 8, text: 'The code that opens the locker is delivered by ____.', answer: 'text message|text', ev: 'we will send a six-digit code to your phone by text message', qp: 'is delivered by', pp: 'we will send … by', trap: '"Phone" is the device, not the method.' },
          { n: 9, text: 'Parcels not collected within three days are taken to the ____.', answer: 'depot|local depot', ev: 'it is returned to the local depot', qp: 'are taken to', pp: 'is returned to', trap: 'The retailer is the FINAL destination, a week later.' },
          { n: 10, text: 'They are kept there for another ____ before going back to the retailer.', answer: 'week|one week|1 week', ev: 'where it will be kept for a further week', qp: 'for another', pp: 'for a further', trap: '"Three days" is the locker period, not the depot period.' },
          { n: 11, text: 'Customers collecting from the depot must show ____.', answer: 'photo identification|identification', ev: 'you will need to show photo identification', qp: 'must show', pp: 'will need to show', trap: 'The six-digit code is for the locker only.' },
          { n: 12, text: 'Lockers cannot take items heavier than ____ kilograms.', answer: '15|fifteen', ev: 'items weighing more than fifteen kilograms', qp: 'heavier than', pp: 'weighing more than', trap: 'Numbers written as words in the text may be written as figures in your answer.' },
          { n: 13, text: 'A customer whose parcel is damaged should press the ____.', answer: 'help button', ev: 'press the help button and an operator will speak to you through the intercom', qp: 'should press', pp: 'press the help button', trap: 'The intercom is how the operator replies, not what you press.' },
          { n: 14, text: 'When returning an item, the printed ____ is the only proof of posting.', answer: 'receipt', ev: 'Keep the receipt that is printed, as this is your only proof of posting', qp: 'the printed …', pp: 'the receipt that is printed', trap: 'The label is also printed — but by you, before you arrive.' },
        ],
      },
    ],
  },
  {
    id: 'GR2', title: 'Section 2 · Flexible working: staff guide', subtitle: 'Halden Logistics employee handbook',
    paras: [
      { id: 'A', text: 'Halden Logistics recognises that staff work best when they can balance their jobs with life outside work. Any employee who has completed six months of continuous service may apply to change their working pattern. You do not need to give a reason, and applying will never count against you in appraisals or promotion decisions.' },
      { id: 'B', text: 'Three arrangements are available. Compressed hours allow you to work your full weekly hours over four days instead of five. Staggered hours let you start and finish earlier or later than the standard day, provided you are present between 10 am and 3 pm. Remote working, for up to two days a week, is open to office-based roles only; warehouse and driving staff are not eligible for obvious reasons.' },
      { id: 'C', text: 'Applications are made on form FW1, which can be downloaded from the intranet. Send the completed form to your line manager, not to Human Resources. Your manager must arrange a meeting with you within fourteen days and give a written decision within a further fourteen.' },
      { id: 'D', text: 'A request can be refused only on business grounds: for instance, if it would leave a team without cover at busy periods, or if the cost of the change would be unreasonable. Your manager must explain the grounds in writing. A general preference for having everyone in the office is not an acceptable reason.' },
      { id: 'E', text: 'If your request is refused, you may appeal within ten working days. Appeals are heard by a senior manager from a different department, and you are welcome to bring a colleague or union representative to the hearing. The outcome of an appeal is final for that application, but you may submit a new request after twelve months.' },
      { id: 'F', text: 'Every new arrangement begins with a three-month trial. At the end of it, you and your manager will review how well it has worked. Either side may then propose changes. If the arrangement is confirmed, your contract will be amended, and your pay and holiday entitlement will be recalculated where your total hours have altered.' },
    ],
    groups: [
      {
        type: 'heading', title: 'Questions 15–20',
        instruction: 'The text has six sections, A–F. Choose the correct heading for each section. Drag a heading onto a section, or tap a heading and then tap the slot.',
        options: ['The options on offer', 'Challenging a decision', 'Training for line managers', 'Who can apply', 'Testing the new pattern', 'Changes to pay rates this year', 'How to make a request', 'Why a request might be turned down'],
        qs: [
          { n: 15, para: 'A', text: 'Section A', answer: 'iv', ev: 'Any employee who has completed six months of continuous service may apply', qp: 'Who can apply', pp: 'Any employee who has completed six months … may apply', trap: 'The first sentence is a general introduction; the heading comes from the second.' },
          { n: 16, para: 'B', text: 'Section B', answer: 'i', ev: 'Three arrangements are available.', qp: 'The options on offer', pp: 'Three arrangements are available', trap: 'Eligibility is mentioned again here (remote working), but only as a detail of one option.' },
          { n: 17, para: 'C', text: 'Section C', answer: 'vii', ev: 'Applications are made on form FW1', qp: 'How to make a request', pp: 'Applications are made on form FW1 … send the completed form', trap: 'Line managers appear, but nothing is said about training them (heading iii).' },
          { n: 18, para: 'D', text: 'Section D', answer: 'viii', ev: 'A request can be refused only on business grounds', qp: 'Why a request might be turned down', pp: 'can be refused only on business grounds', trap: '"Cost" is mentioned, which may attract heading vi — but it is the cost of the change, not pay rates.' },
          { n: 19, para: 'E', text: 'Section E', answer: 'ii', ev: 'If your request is refused, you may appeal within ten working days.', qp: 'Challenging a decision', pp: 'you may appeal', trap: 'Refusal opens this section too. Look at what the section goes on to explain.' },
          { n: 20, para: 'F', text: 'Section F', answer: 'v', ev: 'Every new arrangement begins with a three-month trial.', qp: 'Testing the new pattern', pp: 'begins with a three-month trial', trap: 'Pay is recalculated at the end, but only as a consequence — heading vi describes something else.' },
        ],
      },
      {
        type: 'bank', layout: 'summary', title: 'Questions 21–25',
        instruction: 'Complete the summary using the list of words below. Drag a word into each gap, or tap a word and then tap the gap.',
        options: ['months', 'middle', 'warehouse', 'manager', 'fortnight', 'years', 'start', 'office', 'director', 'week'],
        qs: [
          { n: 21, text: 'Staff become eligible after six ____ of service.', answer: 'months', ev: 'six months of continuous service', qp: 'become eligible after', pp: 'has completed … may apply', trap: '"Twelve months" appears later, about re-applying.' },
          { n: 22, text: 'Those on staggered hours must be at work during the ____ of the day,', answer: 'middle', ev: 'provided you are present between 10 am and 3 pm', qp: 'the … of the day', pp: 'between 10 am and 3 pm', trap: 'The times are not in the bank; you must summarise them in one word.' },
          { n: 23, text: 'and remote working is not open to ____ employees.', answer: 'warehouse', ev: 'warehouse and driving staff are not eligible', qp: 'is not open to', pp: 'are not eligible', trap: '"Office" is in the bank — but office staff are the ones who CAN work remotely.' },
          { n: 24, text: "The form goes to the employee's ____,", answer: 'manager', ev: 'Send the completed form to your line manager, not to Human Resources', qp: 'The form goes to', pp: 'Send the completed form to', trap: 'A "director" is not mentioned; Human Resources is explicitly excluded.' },
          { n: 25, text: 'who must hold a meeting within a ____.', answer: 'fortnight', ev: 'Your manager must arrange a meeting with you within fourteen days', qp: 'within a …', pp: 'within fourteen days', trap: 'Fourteen days = a fortnight. "Week" is half the correct period.' },
        ],
      },
      {
        type: 'mcq', title: 'Questions 26–27', instruction: 'Choose the correct letter, A, B, C or D.',
        qs: [
          { n: 26, text: 'Which of the following is NOT a valid reason for refusing a request?', options: ['The team would be short of staff at busy times.', 'The change would cost too much.', 'The manager would rather have staff on site.', 'The business would be affected.'], answer: 'C', ev: 'A general preference for having everyone in the office is not an acceptable reason.', qp: 'would rather have staff on site', pp: 'a general preference for having everyone in the office', trap: '"NOT" questions reverse your usual search: three options are supported by the text.' },
          { n: 27, text: 'After an unsuccessful appeal, an employee', options: ['may appeal again to Human Resources.', 'must wait a year before making another request.', 'can ask a union to overturn the decision.', 'loses the right to apply in future.'], answer: 'B', ev: 'you may submit a new request after twelve months', qp: 'must wait a year', pp: 'after twelve months', trap: 'A union representative may attend the hearing, but cannot overturn the result.' },
        ],
      },
    ],
  },
  { id: 'GR3', title: 'Section 3 · The Tea Clippers', subtitle: 'A longer text of general interest', paras: clipperParas, groups: clipperGroups(27) },
]

export const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x']
