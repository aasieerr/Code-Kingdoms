import villageJavaMusic from '../Music/village-music.mp3'
import villagePhpMusic from '../Music/village_php.mp3'
import combatJavaMusic from '../Music/combat-arena-music.mp3'
import bossPhpMusic from '../Music/boss-php-music.mp3'
import bossJavaMusic from '../Music/boss-java-music.mp3'

const TRACKS = {
  'village-php': villagePhpMusic,
  'village-java': villageJavaMusic,
  'combat-java': combatJavaMusic,
  'combat-php': combatJavaMusic,
  'boss-php': bossPhpMusic,
  'boss-java': bossJavaMusic,
}

const FADE_STEP_MS = 40
let audio = null
let currentTrack = null
let fadeTimer = null

function getTargetVolume() {
  try {
    const raw = JSON.parse(localStorage.getItem('code-kingdoms.settings.v1') || 'null')
    return Math.max(0, Math.min(100, Number(raw?.volume ?? 70))) / 100
  } catch {
    return 0.7
  }
}

function linearFade(from, to, duration, onDone) {
  if (fadeTimer) clearInterval(fadeTimer)
  const steps = Math.max(1, Math.round(duration / FADE_STEP_MS))
  let step = 0
  fadeTimer = setInterval(() => {
    step++
    const t = step / steps
    audio.volume = from + (to - from) * t
    if (step >= steps) {
      clearInterval(fadeTimer)
      fadeTimer = null
      onDone?.()
    }
  }, FADE_STEP_MS)
}

function doPlay(src, fadeInMs) {
  audio.volume = 0
  audio.src = src
  audio.currentTime = 0
  const start = () => {
    audio.play().catch(() => {})
    linearFade(0, getTargetVolume(), fadeInMs)
  }
  if (audio.readyState >= 2) start()
  else audio.addEventListener('canplay', start, { once: true })
}

export function playMusic(trackName) {
  const src = TRACKS[trackName]
  if (!src) return
  if (currentTrack === trackName) return
  currentTrack = trackName

  if (!audio) {
    audio = new Audio()
    audio.loop = true
    audio.style.display = 'none'
    document.body.appendChild(audio)
    doPlay(src, 800)
    return
  }

  linearFade(audio.volume, 0, 300, () => {
    doPlay(src, 600)
  })
}

export function stopMusic() {
  if (!audio) return
  linearFade(audio.volume, 0, 300, () => {
    audio.pause()
    audio.currentTime = 0
    currentTrack = null
  })
}
