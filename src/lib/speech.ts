import { useCallback, useEffect, useRef, useState } from 'react'
import type { Accent } from '../types'

const LANG: Record<Accent, string[]> = { UK: ['en-GB'], Australia: ['en-AU', 'en-GB'], 'New Zealand': ['en-NZ', 'en-AU', 'en-GB'], 'North America': ['en-US', 'en-CA'] }
export const ttsSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

function pickVoice(accent: Accent): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  for (const lang of LANG[accent]) { const v = voices.find((x) => x.lang.replace('_', '-') === lang); if (v) return v }
  return voices.find((v) => v.lang.startsWith('en'))
}
/** Which accent the browser can genuinely produce for a request (voices vary by device). */
export function voiceInfo(accent: Accent): { exact: boolean; name: string } {
  if (!ttsSupported()) return { exact: false, name: 'none' }
  const v = pickVoice(accent)
  return { exact: !!v && v.lang.replace('_', '-') === LANG[accent][0], name: v ? `${v.name}` : 'default' }
}
export function speak(text: string, o: { accent?: Accent; rate?: number; pitch?: number; onend?: () => void } = {}) {
  if (!ttsSupported()) { o.onend?.(); return }
  const u = new SpeechSynthesisUtterance(text)
  const v = pickVoice(o.accent || 'UK')
  if (v) { u.voice = v; u.lang = v.lang } else u.lang = LANG[o.accent || 'UK'][0]
  u.rate = o.rate ?? 1; u.pitch = o.pitch ?? 1
  let done = false
  const fin = () => { if (!done) { done = true; o.onend?.() } }
  u.onend = fin; u.onerror = fin
  window.speechSynthesis.speak(u)
}
export const stopSpeaking = () => { if (ttsSupported()) window.speechSynthesis.cancel() }
if (ttsSupported()) window.speechSynthesis.getVoices()

/* ── tiny IndexedDB wrapper for voice recordings ── */
function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open('ielts-masterstudio', 1)
    r.onupgradeneeded = () => r.result.createObjectStore('audio')
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error)
  })
}
export async function saveAudio(id: string, blob: Blob) { try { const d = await db(); await new Promise((res, rej) => { const t = d.transaction('audio', 'readwrite'); t.objectStore('audio').put(blob, id); t.oncomplete = res; t.onerror = rej }) } catch { /* storage unavailable */ } }
export async function loadAudio(id: string): Promise<Blob | null> { try { const d = await db(); return await new Promise((res) => { const r = d.transaction('audio').objectStore('audio').get(id); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null) }) } catch { return null } }

/* ── recorder: microphone + waveform + silence detection + live transcription ── */
export interface RecorderResult { transcript: string; seconds: number; pauses: number; confidence: number | null; blob: Blob | null }
export function useRecorder() {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [pauses, setPauses] = useState(0)
  const [error, setError] = useState('')
  const analyser = useRef<AnalyserNode | null>(null)
  const r = useRef<{ stream?: MediaStream; ctx?: AudioContext; rec?: MediaRecorder; sr?: any; chunks: Blob[]; raf?: number; start: number; silentSince: number; spoke: boolean; inPause: boolean; pauses: number; final: string; conf: number[]; live: boolean; tick?: number }>({ chunks: [], start: 0, silentSince: 0, spoke: false, inPause: false, pauses: 0, final: '', conf: [], live: false })
  const SR = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null
  const srSupported = !!SR

  const start = useCallback(async () => {
    const s = r.current
    setError(''); setTranscript(''); setInterim(''); setSeconds(0); setPauses(0)
    Object.assign(s, { chunks: [], start: Date.now(), silentSince: 0, spoke: false, inPause: false, pauses: 0, final: '', conf: [], live: true })
    try {
      s.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const Ctx = window.AudioContext || (window as any).webkitAudioContext
      s.ctx = new Ctx()
      const an = s.ctx.createAnalyser(); an.fftSize = 1024
      s.ctx.createMediaStreamSource(s.stream).connect(an)
      analyser.current = an
      const buf = new Float32Array(an.fftSize)
      const loop = () => {
        if (!s.live) return
        an.getFloatTimeDomainData(buf)
        let sum = 0; for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
        const rms = Math.sqrt(sum / buf.length), now = Date.now()
        if (rms > 0.02) { s.spoke = true; s.silentSince = 0; s.inPause = false }
        else if (s.spoke) {
          if (!s.silentSince) s.silentSince = now
          else if (!s.inPause && now - s.silentSince > 1500) { s.inPause = true; s.pauses++; setPauses(s.pauses) }
        }
        s.raf = requestAnimationFrame(loop)
      }
      loop()
      if (typeof MediaRecorder !== 'undefined') { s.rec = new MediaRecorder(s.stream); s.rec.ondataavailable = (e) => e.data.size && s.chunks.push(e.data); s.rec.start() }
    } catch { setError('Microphone access was blocked. Allow the microphone in your browser settings to record and analyse your answer.') }
    if (SR) {
      const sr = new SR(); sr.lang = 'en-GB'; sr.continuous = true; sr.interimResults = true
      sr.onresult = (e: any) => {
        let live = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i]
          if (res.isFinal) { s.final += res[0].transcript.trim() + ' '; if (res[0].confidence > 0) s.conf.push(res[0].confidence) } else live += res[0].transcript
        }
        setTranscript(s.final); setInterim(live)
      }
      sr.onend = () => { if (s.live) { try { sr.start() } catch { /* already running */ } } }
      sr.onerror = (e: any) => { if (e.error === 'not-allowed') setError('Speech recognition permission was denied.') }
      try { sr.start(); s.sr = sr } catch { /* ignore */ }
    }
    s.tick = window.setInterval(() => setSeconds(Math.round((Date.now() - s.start) / 1000)), 250)
    setRecording(true)
  }, [SR])

  const stop = useCallback(async (): Promise<RecorderResult> => {
    const s = r.current
    if (!s.live) return { transcript: '', seconds: 0, pauses: 0, confidence: null, blob: null }
    s.live = false
    const secs = (Date.now() - s.start) / 1000
    if (s.raf) cancelAnimationFrame(s.raf)
    if (s.tick) clearInterval(s.tick)
    try { s.sr?.stop() } catch { /* ignore */ }
    const blob = await new Promise<Blob | null>((res) => {
      if (!s.rec || s.rec.state === 'inactive') return res(null)
      s.rec.onstop = () => res(s.chunks.length ? new Blob(s.chunks, { type: s.rec!.mimeType }) : null)
      s.rec.stop()
    })
    s.stream?.getTracks().forEach((t) => t.stop())
    s.ctx?.close().catch(() => {})
    analyser.current = null
    await new Promise((res) => setTimeout(res, 350)) // let the recogniser flush its final result
    setRecording(false); setInterim(''); setTranscript(s.final)
    return { transcript: s.final.trim(), seconds: secs, pauses: s.pauses, confidence: s.conf.length ? s.conf.reduce((a, b) => a + b, 0) / s.conf.length : null, blob }
  }, [])

  useEffect(() => () => { const s = r.current; s.live = false; s.stream?.getTracks().forEach((t) => t.stop()); try { s.sr?.stop() } catch { /* ignore */ } if (s.tick) clearInterval(s.tick) }, [])
  return { recording, transcript, interim, seconds, pauses, error, analyser, start, stop, srSupported, setTranscript: (t: string) => { r.current.final = t; setTranscript(t) } }
}
