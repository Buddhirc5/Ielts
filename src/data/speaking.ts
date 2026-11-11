export interface CueCard {
  id: string; theme: string; title: string
  bullets: { text: string; kw: string[] }[]
  part3: string[]
}

export const PART1: { topic: string; qs: string[] }[] = [
  { topic: 'Hometown', qs: ["Let's talk about your hometown. Where are you from?", 'What do you like most about living there?', 'Has your hometown changed much in recent years?', 'Would you recommend it to a visitor? Why?'] },
  { topic: 'Studies', qs: ['Are you working or are you a student?', 'Why did you choose that subject?', 'What do you find most difficult about your studies?', 'What do you hope to do after you finish?'] },
  { topic: 'Tea & daily routine', qs: ['Do you prefer tea or coffee?', 'How do you usually spend your mornings?', 'Is there a part of your daily routine you would like to change?', 'Do people in your country drink a lot of tea?'] },
  { topic: 'Sport', qs: ['Do you enjoy watching sport?', 'Is cricket popular where you live?', 'Did you play any sports at school?', 'Do you think children should do more sport?'] },
]

export const CUE_CARDS: CueCard[] = [
  {
    id: 'cue-festival', theme: 'Culture', title: 'Describe a festival that is important in your country.',
    bullets: [
      { text: 'what the festival is', kw: ['festival', 'new year', 'avurudu', 'vesak', 'pongal', 'deepavali', 'diwali', 'eid', 'ramadan', 'christmas', 'perahera', 'poson', 'called', 'celebration'] },
      { text: 'when it takes place', kw: ['april', 'may', 'january', 'august', 'december', 'november', 'october', 'every year', 'annual', 'month', 'full moon', 'takes place', 'held'] },
      { text: 'what people do during it', kw: ['family', 'cook', 'sweets', 'food', 'lantern', 'light', 'visit', 'games', 'temple', 'pray', 'relatives', 'gifts', 'decorate', 'clothes', 'procession', 'kiribath', 'milk rice'] },
      { text: 'and explain why it is important', kw: ['important', 'because', 'meaning', 'tradition', 'together', 'culture', 'religious', 'significance', 'identity', 'unity', 'reason'] },
    ],
    part3: ['Why do you think traditional festivals are still important in modern societies?', 'Have festivals in your country become too commercial?', 'How do festivals help to bring different communities together?', 'Do you think young people are less interested in traditions than their parents were?'],
  },
  {
    id: 'cue-teacher', theme: 'People', title: 'Describe a teacher who has influenced you.',
    bullets: [
      { text: 'who the teacher was', kw: ['teacher', 'sir', 'madam', 'miss', 'lecturer', 'tutor', 'name', 'called'] },
      { text: 'what subject they taught', kw: ['subject', 'taught', 'maths', 'mathematics', 'science', 'english', 'physics', 'chemistry', 'biology', 'history', 'commerce', 'class', 'lesson'] },
      { text: 'what was special about their teaching', kw: ['special', 'explain', 'patient', 'strict', 'kind', 'method', 'way', 'encourage', 'example', 'story', 'different', 'interesting'] },
      { text: 'and explain how they influenced you', kw: ['influence', 'because', 'inspired', 'changed', 'decided', 'confidence', 'career', 'learned', 'taught me', 'thanks to', 'motivated'] },
    ],
    part3: ['What qualities make someone a good teacher?', 'Is the role of teachers changing because of technology?', 'Why do many students in some countries attend extra tuition classes?', 'Should teachers be paid according to their students\' results?'],
  },
  {
    id: 'cue-place', theme: 'Places', title: 'Describe a place in your country that you would recommend to visitors.',
    bullets: [
      { text: 'where the place is', kw: ['located', 'province', 'coast', 'hill', 'south', 'north', 'east', 'west', 'central', 'near', 'far', 'kilometres', 'hours from', 'kandy', 'galle', 'ella', 'sigiriya', 'jaffna', 'nuwara eliya', 'trincomalee', 'colombo'] },
      { text: 'what visitors can see or do there', kw: ['see', 'visit', 'climb', 'beach', 'temple', 'fort', 'train', 'view', 'safari', 'wildlife', 'elephants', 'tea', 'waterfall', 'surf', 'swim', 'walk', 'photograph'] },
      { text: 'when is the best time to go', kw: ['best time', 'season', 'monsoon', 'weather', 'dry', 'rain', 'december', 'april', 'august', 'morning', 'sunrise', 'sunset', 'months'] },
      { text: 'and explain why you would recommend it', kw: ['recommend', 'because', 'worth', 'unique', 'beautiful', 'peaceful', 'history', 'heritage', 'unforgettable', 'reason', 'experience'] },
    ],
    part3: ['What are the benefits and drawbacks of tourism for a country like yours?', 'How can governments protect historic sites from too many visitors?', 'Do you think people travel differently now than in the past?', 'Is it better to travel independently or with a tour group?'],
  },
]

export const FILLERS = ['um', 'uh', 'er', 'erm', 'ah', 'like', 'you know', 'basically', 'actually', 'i mean', 'sort of', 'kind of', 'so yeah']
