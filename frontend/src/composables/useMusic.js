import { watch } from 'vue'
import { useGameSettings } from './useGameSettings'
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

function createAudio() {
  if (!audio) {
    audio = new Audio()
    audio.loop = true
    const { settings } = useGameSettings()
    watch(() => settings.value.volume, (vol) => {
      audio.volume = Math.max(0, Math.min(100, Number(vol) || 0)) / 100
    }, { immediate: true })
  }
  return audio
}

export function playMusic(trackName) {
  const src = TRACKS[trackName]
  if (!src) return
  if (currentTrack === trackName) return
  currentTrack = trackName
  const el = createAudio()
  el.src = src
  el.currentTime = 0
  el.play().catch(() => {})
}

export function stopMusic() {
  if (!audio) return
  audio.pause()
  audio.currentTime = 0
  currentTrack = null
}
