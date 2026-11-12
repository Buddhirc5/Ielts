# IELTS MasterStudio

An IELTS preparation and mock-exam web app focused on **IELTS Academic** and Sri Lankan test takers. Everything runs in the browser: there is no backend and no external AI service.

- **Guided learning** — 6-step roadmap, skill labs with micro-quizzes, an adaptive daily queue, seven quiz games and an SM-2 flashcard deck.
- **Exam mode** — a computer-delivered style interface with timer, split-screen reading, highlighting and notes, question palette, and review with evidence-linked explanations.
- **Deterministic engines** — writing band estimator (`src/lib/writingAnalyzer.ts`), speaking fluency analyser, raw-to-band calculator, what-if simulator, study recommender and SM-2 scheduler (`src/lib/engines.ts`).

Band estimates for Writing and Speaking are rule-based guides for practice, not official scores. Listening audio uses the browser's speech synthesis, so the available accents depend on the device.

## Cloud sync (Supabase)

Sign-in, cross-device progress sync and the community board use Supabase. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`); the tables are in `supabase/migrations`. Without the keys the app runs fully offline in the browser.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run validate   # checks every question's evidence against its passage/transcript
npm run build      # type-check and production build (dist/)
```

Stack: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand, Lucide.
