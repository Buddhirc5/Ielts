import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { create } from 'zustand'
import { hooks, useStore } from '../store'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const cloudEnabled = !!(url && key)
export const ADMIN_EMAIL = 'buddhirc5@gmail.com'
let supabase: SupabaseClient | null = null

export interface Leader { id: string; display_name: string; xp: number; streak: number; overall: number | null }
export interface Announcement { id: number; body: string; active: boolean; created_at: string }
interface Cloud {
  session: Session | null; status: 'off' | 'signed-out' | 'syncing' | 'synced' | 'error'; error: string
  leaders: Leader[]; lastSync: number; announcements: Announcement[]; recovery: boolean
  /** true once the tracking/admin tables are available in the database */
  extended: boolean
}
export const useCloud = create<Cloud>(() => ({ session: null, status: cloudEnabled ? 'signed-out' : 'off', error: '', leaders: [], lastSync: 0, announcements: [], recovery: false, extended: false }))
/** UI hint only — the database enforces admin access with row-level security. */
export const isAdmin = (s: Session | null) => !!s && s.user.email?.toLowerCase() === ADMIN_EMAIL && !!s.user.email_confirmed_at

// Everything in the store except navigation and device-only settings is synced.
const SKIP = new Set(['view', 'exam', 'theme'])
function snapshot() {
  const s = useStore.getState() as unknown as Record<string, unknown>
  return Object.fromEntries(Object.entries(s).filter(([k, v]) => !SKIP.has(k) && typeof v !== 'function'))
}
const clean = (s: string) => s.replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 40) || 'Learner'
const platform = () => (/iPhone|iPad/.test(navigator.userAgent) ? 'iOS' : /Android/.test(navigator.userAgent) ? 'Android' : 'Desktop')
let applying = false, timer: number | undefined, lastPushed = ''

async function push() {
  const { session, extended } = useCloud.getState()
  if (!supabase || !session || applying) return
  const state = snapshot(), json = JSON.stringify(state)
  if (json === lastPushed) return
  useCloud.setState({ status: 'syncing' })
  const s = useStore.getState(), uid = session.user.id, now = new Date().toISOString()
  const overall = [...s.attempts].reverse().find((a) => a.overall)?.overall ?? null
  const profile: Record<string, unknown> = { id: uid, display_name: clean(s.name), xp: Math.max(0, Math.round(s.xp)), streak: Math.min(7, s.streak), target: s.target, overall, updated_at: now }
  if (extended) profile.show_on_board = s.showOnBoard
  const jobs = [
    supabase.from('ielts_user_state').upsert({ user_id: uid, state, updated_at: now }),
    supabase.from('ielts_profiles').upsert(profile),
  ]
  if (extended) jobs.push(supabase.from('ielts_activity').upsert({ user_id: uid, last_seen: now, minutes: Math.round(Object.values(s.studyLog).reduce((a, b) => a + b, 0) * 10) / 10, tests: s.attempts.length, lessons: s.lessonsDone.length, platform: platform() }))
  const res = await Promise.all(jobs)
  const err = res.find((r) => r.error)?.error
  if (err) useCloud.setState({ status: 'error', error: err.message })
  else { lastPushed = json; useCloud.setState({ status: 'synced', error: '', lastSync: Date.now() }); loadLeaders() }
}
export async function loadLeaders() {
  if (!supabase || !useCloud.getState().session) return
  let q = supabase.from('ielts_profiles').select('id, display_name, xp, streak, overall').order('xp', { ascending: false }).limit(10)
  if (useCloud.getState().extended) q = q.eq('show_on_board', true)
  const { data } = await q
  if (data) useCloud.setState({ leaders: data as Leader[] })
}
async function loadAnnouncements() {
  if (!supabase || !useCloud.getState().extended) return
  const { data } = await supabase.from('ielts_announcements').select('*').order('created_at', { ascending: false }).limit(20)
  if (data) useCloud.setState({ announcements: data as Announcement[] })
}
function track(type: string, meta: Record<string, unknown> = {}) {
  const { session, extended } = useCloud.getState()
  if (!supabase || !session || !extended) return
  supabase.from('ielts_events').insert({ type, meta }).then(() => {})
}
async function onSignIn(session: Session) {
  if (!supabase) return
  useCloud.setState({ session, status: 'syncing', error: '' })
  const probe = await supabase.from('ielts_activity').select('user_id').limit(1)
  useCloud.setState({ extended: !probe.error })
  const { data, error } = await supabase.from('ielts_user_state').select('state').eq('user_id', session.user.id).maybeSingle()
  if (error) { useCloud.setState({ status: 'error', error: error.message }); return }
  applying = true
  if (data?.state && typeof data.state === 'object') { const { theme: _t, view: _v, exam: _e, ...rest } = data.state as Record<string, unknown>; useStore.setState(rest) } // the cloud copy wins on sign-in
  if (!useStore.getState().onboarded) useStore.getState().setProfile({ onboarded: true })
  applying = false
  lastPushed = data?.state ? JSON.stringify(snapshot()) : ''
  await push(); loadLeaders(); loadAnnouncements()
  if (!sessionStorage.getItem('ielts-session')) { sessionStorage.setItem('ielts-session', '1'); track('session_start', { platform: platform() }) }
}

// The Supabase library is loaded after first paint so it never delays the opening screen.
const ready: Promise<void> = !cloudEnabled ? Promise.resolve() : new Promise((res) => setTimeout(res, 300)).then(() => import('@supabase/supabase-js')).then(({ createClient }) => {
  supabase = createClient(url!, key!)
  hooks.track = track
  supabase.auth.onAuthStateChange((event, session) => {
    // defer: Supabase forbids awaiting its own client inside this callback
    setTimeout(() => {
      if (event === 'PASSWORD_RECOVERY') useCloud.setState({ recovery: true })
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'PASSWORD_RECOVERY') && useCloud.getState().session?.user.id !== session.user.id) onSignIn(session)
      else if (session) useCloud.setState({ session })
      else useCloud.setState({ session: null, status: 'signed-out', leaders: [], announcements: [] })
    }, 0)
  })
  useStore.subscribe(() => { if (!useCloud.getState().session || applying) return; clearTimeout(timer); timer = window.setTimeout(push, 2000) })
  window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { clearTimeout(timer); push() } })
  supabase.channel('ielts-leaderboard').on('postgres_changes', { event: '*', schema: 'public', table: 'ielts_profiles' }, () => loadLeaders()).subscribe()
})

const redirect = () => window.location.origin
export async function signIn(email: string, password: string) { await ready; const { error } = await supabase!.auth.signInWithPassword({ email, password }); return error?.message || '' }
export async function signUp(email: string, password: string, name: string) {
  await ready
  const { data, error } = await supabase!.auth.signUp({ email, password, options: { emailRedirectTo: redirect(), data: { display_name: clean(name) } } })
  if (error) return { error: error.message, confirm: false }
  return { error: '', confirm: !data.session }
}
export async function emailLink(email: string) { await ready; const { error } = await supabase!.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect() } }); return error?.message || '' }
export async function resetPassword(email: string) { await ready; const { error } = await supabase!.auth.resetPasswordForEmail(email, { redirectTo: redirect() }); return error?.message || '' }
export async function setNewPassword(password: string) { await ready; const { error } = await supabase!.auth.updateUser({ password }); if (!error) useCloud.setState({ recovery: false }); return error?.message || '' }
export async function signOut() { clearTimeout(timer); await push(); sessionStorage.removeItem('ielts-session'); await supabase!.auth.signOut() }
/** Removes everything this app stored for the learner in the cloud, then signs out. Local progress stays on the device. */
export async function deleteCloudData() {
  const { session, extended } = useCloud.getState()
  if (!supabase || !session) return 'Not signed in'
  clearTimeout(timer); applying = true
  const uid = session.user.id
  const jobs = [supabase.from('ielts_user_state').delete().eq('user_id', uid), supabase.from('ielts_profiles').delete().eq('id', uid)]
  if (extended) jobs.push(supabase.from('ielts_events').delete().eq('user_id', uid), supabase.from('ielts_activity').delete().eq('user_id', uid))
  const res = await Promise.all(jobs)
  applying = false
  const err = res.find((r) => r.error)?.error
  if (err) return err.message
  await supabase.auth.signOut(); return ''
}

/* ───────── admin ───────── */
export interface AdminRow { user_id: string; email: string; first_seen: string; last_seen: string; minutes: number; tests: number; lessons: number; platform: string | null; display_name?: string; xp?: number; overall?: number | null; target?: number }
export interface AdminEvent { id: number; user_id: string; type: string; meta: Record<string, any>; created_at: string }
export async function loadAdmin(): Promise<{ rows: AdminRow[]; events: AdminEvent[]; error: string }> {
  await ready
  if (!supabase) return { rows: [], events: [], error: 'Cloud is not configured' }
  const since = new Date(Date.now() - 30 * 86400000).toISOString()
  const [act, prof, ev] = await Promise.all([
    supabase.from('ielts_activity').select('*').order('last_seen', { ascending: false }).limit(2000),
    supabase.from('ielts_profiles').select('id, display_name, xp, overall, target').limit(2000),
    supabase.from('ielts_events').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(5000),
  ])
  const error = act.error?.message || prof.error?.message || ev.error?.message || ''
  const byId = new Map((prof.data || []).map((p: any) => [p.id, p]))
  const rows = (act.data || []).map((a: any) => ({ ...a, minutes: Number(a.minutes), ...(byId.get(a.user_id) || {}) })) as AdminRow[]
  await loadAnnouncements()
  return { rows, events: (ev.data || []) as AdminEvent[], error }
}
export async function postAnnouncement(body: string) { const { error } = await supabase!.from('ielts_announcements').insert({ body: body.trim().slice(0, 280) }); await loadAnnouncements(); return error?.message || '' }
export async function setAnnouncement(id: number, active: boolean | null) {
  const q = active === null ? supabase!.from('ielts_announcements').delete().eq('id', id) : supabase!.from('ielts_announcements').update({ active }).eq('id', id)
  const { error } = await q; await loadAnnouncements(); return error?.message || ''
}
