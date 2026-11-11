-- IELTS MasterStudio: cloud sync and live leaderboard.
-- profiles: small public card for each learner (shown on the leaderboard to signed-in users).
create table if not exists public.ielts_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Learner' check (char_length(display_name) between 1 and 40),
  xp integer not null default 0 check (xp >= 0 and xp <= 10000000),
  streak integer not null default 0 check (streak between 0 and 7),
  target numeric(2,1) not null default 7.0 check (target between 1 and 9),
  overall numeric(2,1) check (overall between 0 and 9),
  updated_at timestamptz not null default now()
);
-- user_state: the learner's full private progress (attempts, essays, deck, study log) as one document.
create table if not exists public.ielts_user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null check (pg_column_size(state) < 1500000),
  updated_at timestamptz not null default now()
);
create index if not exists ielts_profiles_xp_idx on public.ielts_profiles (xp desc);

alter table public.ielts_profiles enable row level security;
alter table public.ielts_user_state enable row level security;

create policy "Signed-in users can read the leaderboard" on public.ielts_profiles for select to authenticated using (true);
create policy "Users insert their own profile" on public.ielts_profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users update their own profile" on public.ielts_profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users read their own state" on public.ielts_user_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert their own state" on public.ielts_user_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update their own state" on public.ielts_user_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter publication supabase_realtime add table public.ielts_profiles;
