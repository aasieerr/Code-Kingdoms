import swordSound from '../SoundEffects/sword-sound-effect.mp3'
import potionSound from '../SoundEffects/potion-sound-effect.mp3'
import fireball1 from '../SoundEffects/fireball-1.mp3'
import fireball2 from '../SoundEffects/fireball-2.mp3'

let ctx = null
const buffers = {}
const preloaded = {}

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function readVolume() {
  try {
    const raw = JSON.parse(localStorage.getItem('code-kingdoms.settings.v1') || 'null')
    return Math.max(0, Math.min(100, Number(raw?.sfxVolume ?? raw?.volume ?? 70))) / 100
  } catch {
    return 0.7
  }
}

async function loadBuffer(url, key) {
  try {
    const res = await fetch(url)
    const buf = await res.arrayBuffer()
    buffers[key] = await getCtx().decodeAudioData(buf)
  } catch {}
}

function resumeOnInteraction() {
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', resumeOnInteraction, { once: true })
  window.addEventListener('keydown', resumeOnInteraction, { once: true })
  window.addEventListener('touchstart', resumeOnInteraction, { once: true })
}

function preloadAudio(url, key) {
  const el = new Audio(url)
  el.preload = 'auto'
  preloaded[key] = el
}

preloadAudio(swordSound, 'sword')
preloadAudio(potionSound, 'potion')
preloadAudio(fireball1, 'fireball1')
preloadAudio(fireball2, 'fireball2')

loadBuffer(fireball1, 'fireball1_buf')
loadBuffer(fireball2, 'fireball2_buf')

function playAudio(key) {
  const el = preloaded[key]
  if (!el) return
  const clone = el.cloneNode()
  clone.volume = readVolume()
  clone.play().catch(() => {})
}

function playBuffer(key) {
  const buf = buffers[key]
  if (!buf) return
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
  const vol = readVolume()
  const src = c.createBufferSource()
  src.buffer = buf
  const gain = c.createGain()
  gain.gain.value = vol
  src.connect(gain)
  gain.connect(c.destination)
  src.start(0)
}

export function playSword() { playAudio('sword') }
export function playPotion() { playAudio('potion') }
export function playFireball() {
  playBuffer(Math.random() < 0.5 ? 'fireball1_buf' : 'fireball2_buf')
}
