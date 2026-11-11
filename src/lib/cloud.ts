import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import { create } from 'zustand'
import { useStore } from '../store'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null
export const cloudEnabled = !!supabase

export interface Leader { id: string; display_name: string; xp: number; streak: number; overall: number | null }
interface Cloud { session: Session | null; status: 'off' | 'signed-out' | 'syncing' | 'synced' | 'error'; error: string; leaders: Leader[]; lastSync: number }
export const useCloud = create<Cloud>(() => ({ session: null, status: cloudEnabled ? 'signed-out' : 'off', error: '', leaders: [], lastSync: 0 }))

// Everything in the store except navigation state and functions is synced.
const SKIP = new Set(['view', 'exam'])
function snapshot() {
  const s = useStore.getState() as unknown as Record<string, unknown>
  return Object.fromEntries(Object.entries(s).filter(([k, v]) => !SKIP.has(k) && typeof v !== 'function'))
}
let applying = false, timer: number | undefined, lastPushed = ''

async function push() {
  const { session } = useCloud.getState()
  if (!supabase || !session || applying) return
  const state = snapshot(), json = JSON.stringify(state)
  if (json === lastPushed) return
  useCloud.setState({ status: 'syncing' })
  const s = useStore.getState(), uid = session.user.id, now = new Date().toISOString()
  const overall = [...s.attempts].reverse().find((a) => a.overall)?.overall ?? null
  const [a, b] = await Promise.all([
    supabase.from('ielts_user_state').upsert({ user_id: uid, state, updated_at: now }),
    supabase.from('ielts_profiles').upsert({ id: uid, display_name: (s.name || 'Learner').slice(0, 40), xp: s.xp, streak: Math.min(7, s.streak), target: s.target, overall, updated_at: now }),
  ])
  const err = a.error || b.error
  if (err) useCloud.setState({ status: 'error', error: err.message })
  else { lastPushed = json; useCloud.setState({ status: 'synced', error: '', lastSync: Date.now() }); loadLeaders() }
}
export async function loadLeaders() {
  if (!supabase || !useCloud.getState().session) return
  const { data } = await supabase.from('ielts_profiles').select('id, display_name, xp, streak, overall').order('xp', { ascending: false }).limit(10)
  if (data) useCloud.setState({ leaders: data as Leader[] })
}
async function onSignIn(session: Session) {
  if (!supabase) return
  useCloud.setState({ session, status: 'syncing', error: '' })
  const { data, error } = await supabase.from('ielts_user_state').select('state').eq('user_id', session.user.id).maybeSingle()
  if (error) { useCloud.setState({ status: 'error', error: error.message }); return }
  applying = true
  if (data?.state) useStore.setState(data.state as object) // the cloud copy wins on sign-in
  else if (useStore.getState().demo) useStore.getState().reset() // never upload the sample data to a new account
  if (!useStore.getState().onboarded) useStore.getState().setProfile({ onboarded: true })
  applying = false
  lastPushed = data?.state ? JSON.stringify(snapshot()) : ''
  await push(); loadLeaders()
}

if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    // defer: Supabase forbids awaiting its own client inside this callback
    setTimeout(() => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && useCloud.getState().session?.user.id !== session.user.id) onSignIn(session)
      else if (session) useCloud.setState({ session })
      else useCloud.setState({ session: null, status: 'signed-out', leaders: [] })
    }, 0)
  })
  useStore.subscribe(() => { if (!useCloud.getState().session || applying) return; clearTimeout(timer); timer = window.setTimeout(push, 2000) })
  window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { clearTimeout(timer); push() } })
  supabase.channel('ielts-leaderboard').on('postgres_changes', { event: '*', schema: 'public', table: 'ielts_profiles' }, () => loadLeaders()).subscribe()
}

export async function signIn(email: string, password: string) { const { error } = await supabase!.auth.signInWithPassword({ email, password }); return error?.message || '' }
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase!.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { display_name: name } } })
  if (error) return { error: error.message, confirm: false }
  return { error: '', confirm: !data.session }
}
export async function signOut() { clearTimeout(timer); await push(); await supabase!.auth.signOut() }
