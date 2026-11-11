// Checks that every question's evidence string really occurs in its passage / transcript and that numbering is 1–40.
// Node 22.18+ strips TypeScript types natively.
const L = await import('../src/data/listening.ts'), R = await import('../src/data/reading.ts')
let bad = 0
const check = (name, units, textOf) => { const ns = []; for (const u of units) for (const g of u.groups) for (const q of g.qs) { ns.push(q.n); if (!textOf(u).includes(q.ev)) { bad++; console.log(`✗ ${name} Q${q.n}: evidence not found: ${q.ev}`) } if (g.type === 'heading' && !['i','ii','iii','iv','v','vi','vii','viii'].includes(q.answer)) { bad++; console.log('bad heading', q.n) } }
  const ok = ns.length === 40 && ns.every((n, i) => n === i + 1); if (!ok) { bad++; console.log(`✗ ${name}: numbering`, ns.join(',')) } else console.log(`✓ ${name}: 40 questions, evidence verified`) }
check('Listening', L.LISTENING, (u) => u.segs.map((s) => s.text).join('\n'))
check('Academic Reading', R.ACADEMIC_READING, (u) => u.paras.map((p) => p.text).join('\n'))
check('General Reading', R.GENERAL_READING, (u) => u.paras.map((p) => p.text).join('\n'))
process.exit(bad ? 1 : 0)
