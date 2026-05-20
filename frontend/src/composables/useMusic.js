import villageJavaMusic from '../Music/village-music.mp3'
import villagePhpMusic from '../Music/village_php.mp3'
import combatArenaMusic from '../Music/combat-arena-music.mp3'
import bossPhpMusic from '../Music/boss-php-music.mp3'
import bossJavaMusic from '../Music/boss-java-music.mp3'

const TRACKS = {
  'village-php': villagePhpMusic,
  'village-java': villageJavaMusic,
  combat: combatArenaMusic,
  'boss-php': bossPhpMusic,
  'boss-java': bossJavaMusic,
}

let audio = null
let currentTrack = null

function applyVolume() {
  try {
    const raw = JSON.parse(localStorage.getItem('code-kingdoms.settings.v1') || 'null')
    const vol = Math.max(0, Math.min(100, Number(raw?.volume ?? 70))) / 100
    audio.volume = vol
  } catch {
    audio.volume = 0.7
  }
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
  }
  applyVolume()
  audio.src = src
  audio.currentTime = 0
  audio.play().catch(() => {})
}

export function stopMusic() {
  if (!audio) return
  audio.pause()
  audio.currentTime = 0
  currentTrack = null
}
