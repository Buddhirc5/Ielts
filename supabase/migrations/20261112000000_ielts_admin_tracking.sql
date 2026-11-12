-- Admin, activity tracking, announcements and privacy controls for IELTS MasterStudio.
create schema if not exists ielts_private;

-- Admin = the one confirmed account with this address. Lives in a schema the API does not expose,
-- so it can only be used from inside policies, never called directly by a browser.
create or replace function ielts_private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u
    where u.id = (select auth.uid()) and lower(u.email) = 'buddhirc5@gmail.com' and u.email_confirmed_at is not null
  )
$$;
revoke all on function ielts_private.is_admin() from public, anon;
grant usage on schema ielts_private to authenticated;
grant execute on function ielts_private.is_admin() to authenticated;

-- Community board becomes opt-out; learners may delete their own data.
alter table public.ielts_profiles add column if not exists show_on_board boolean not null default true;
drop policy if exists "Signed-in users can read the leaderboard" on public.ielts_profiles;
create policy "Read visible profiles, own profile, or all as admin" on public.ielts_profiles for select to authenticated
  using (show_on_board or (select auth.uid()) = id or (select ielts_private.is_admin()));
create policy "Users delete their own profile" on public.ielts_profiles for delete to authenticated using ((select auth.uid()) = id);
create policy "Users delete their own state" on public.ielts_user_state for delete to authenticated using ((select auth.uid()) = user_id);

-- One summary row per learner for the admin dashboard.
create table if not exists public.ielts_activity (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null default ((select auth.jwt()) ->> 'email'),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  minutes numeric(8,1) not null default 0 check (minutes >= 0 and minutes < 1000000),
  tests integer not null default 0 check (tests >= 0),
  lessons integer not null default 0 check (lessons >= 0),
  platform text check (char_length(platform) <= 40)
);
alter table public.ielts_activity enable row level security;
create policy "Own activity or admin" on public.ielts_activity for select to authenticated using ((select auth.uid()) = user_id or (select ielts_private.is_admin()));
create policy "Insert own activity" on public.ielts_activity for insert to authenticated with check ((select auth.uid()) = user_id and email = ((select auth.jwt()) ->> 'email'));
create policy "Update own activity" on public.ielts_activity for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and email = ((select auth.jwt()) ->> 'email'));
create policy "Delete own activity" on public.ielts_activity for delete to authenticated using ((select auth.uid()) = user_id);

-- Event log: what learners do (never essay text or recordings).
create table if not exists public.ielts_events (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('session_start', 'test_complete', 'answers', 'lesson_complete', 'quiz_complete', 'writing_submit', 'speaking_complete')),
  meta jsonb not null default '{}'::jsonb check (pg_column_size(meta) < 4000),
  created_at timestamptz not null default now()
);
create index if not exists ielts_events_created_idx on public.ielts_events (created_at desc);
create index if not exists ielts_events_user_idx on public.ielts_events (user_id, created_at desc);
alter table public.ielts_events enable row level security;
create policy "Own events or admin" on public.ielts_events for select to authenticated using ((select auth.uid()) = user_id or (select ielts_private.is_admin()));
create policy "Insert own events" on public.ielts_events for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Delete own events" on public.ielts_events for delete to authenticated using ((select auth.uid()) = user_id);

-- Flood guard: at most 300 events per learner per hour.
create or replace function ielts_private.limit_events() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.ielts_events e where e.user_id = new.user_id and e.created_at > now() - interval '1 hour') >= 300 then
    raise exception 'Too many events';
  end if;
  return new;
end $$;
revoke all on function ielts_private.limit_events() from public, anon, authenticated;
drop trigger if exists ielts_events_limit on public.ielts_events;
create trigger ielts_events_limit before insert on public.ielts_events for each row execute function ielts_private.limit_events();

-- Announcements: written by the admin, shown to signed-in learners.
create table if not exists public.ielts_announcements (
  id bigint generated always as identity primary key,
  body text not null check (char_length(body) between 1 and 280),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.ielts_announcements enable row level security;
create policy "Read active announcements" on public.ielts_announcements for select to authenticated using (active or (select ielts_private.is_admin()));
create policy "Admin writes announcements" on public.ielts_announcements for insert to authenticated with check ((select ielts_private.is_admin()));
create policy "Admin edits announcements" on public.ielts_announcements for update to authenticated using ((select ielts_private.is_admin())) with check ((select ielts_private.is_admin()));
create policy "Admin deletes announcements" on public.ielts_announcements for delete to authenticated using ((select ielts_private.is_admin()));
