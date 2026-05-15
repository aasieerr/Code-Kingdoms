import { ENEMY_SIZE } from './arenaEnemies'

export const PLAYER_SIZE = 40
// Hitbox ligeramente menor que el sprite para evitar atascos en bordes.
export const PLAYER_COLLISION_SIZE = 34
export const BASE_MOVE_SPEED = 2.2
export const MELEE_TYPES = ['daga', 'espada', 'hacha']
export const MELEE_RANGE = 135
export const MELEE_LIFETIME = 250
export const COIN_PICKUP_R = 52
export const CONTACT_COOLDOWN_MS = 480
export const BULLET_SPEED = 6.5
export const BULLET_LIFETIME_MS = 2200
export const FIRE_INTERVAL_MS = 320
export const BULLET_DAMAGE = 12
export const MAGNET_RANGE = 120
export const MAGNET_SPEED = 2.2
export const TOTAL_SECTIONS = 6
export const INTERMEDIATE_SECTIONS = 5
export const WAVES_PER_SECTION = 7
export const SECTION_GROWTH = 0.22
export const WAVE_GROWTH = 0.028
export const LEVEL_DAMAGE_BONUS = 0.055
export const JAVA_BOSS_SHIELD_MS = 1800
export const JAVA_BOSS_SHIELD_GAP_MS = 6500
export const DEPENDENCY_MARK_RANGE = 235
export const DEPENDENCY_MARK_DURATION_MS = 2600
export const DEPENDENCY_MARK_MOVE_THRESHOLD = 44
export const DEPENDENCY_MARK_PUSH_PX = 22

export function isJavaFinalBoss(enemy, faction) {
  return enemy?.type === 'boss' && faction === 'java'
}

export function isJavaBossShielded(enemy, now) {
  return isJavaFinalBoss(enemy, 'java') && now < Number(enemy?.shieldUntil || 0)
}

export const JAVA_ROUTE_STEPS = ['BAJAR', 'IZQUIERDA', 'BAJAR', 'DERECHA']
export const PHP_ROUTE_STEPS = ['SUBIR', 'DERECHA', 'SUBIR', 'IZQUIERDA']

export function resolveOptionValue(option, fallback = '') {
  if (option && typeof option === 'object' && 'value' in option) {
    return option.value ?? fallback
  }
  return option ?? fallback
}

export { isPhpKingdom } from '../utils/realm'

export function sectionMultiplier(sectionValue) {
  return 1 + Math.max(0, sectionValue - 1) * SECTION_GROWTH
}

export function waveMultiplier(waveValue) {
  return 1 + Math.max(0, waveValue - 1) * WAVE_GROWTH
}

export function earlyWaveMultiplier(sectionValue, waveValue) {
  if (sectionValue !== 1) return 1
  if (waveValue <= 2) return 0.48
  if (waveValue <= 4) return 0.68
  if (waveValue <= 5) return 0.84
  return 1
}

export function earlyWaveEnemyCountMultiplier(sectionValue, waveValue) {
  if (sectionValue !== 1) return 1
  if (waveValue <= 2) return 0.52
  if (waveValue <= 4) return 0.72
  if (waveValue <= 5) return 0.86
  return 1
}

export function maxWavesForSection(sectionValue) {
  return Number(sectionValue) >= TOTAL_SECTIONS ? 1 : WAVES_PER_SECTION
}

/**
 * Ajusta progreso guardado con el esquema antiguo (6 intermedias, jefe en 7, oleadas hasta 10).
 * El esquema actual: 5 intermedias, jefe en 6, 7 oleadas.
 */
export function normalizeArenaProgressFromServer(enemyFactionKey, savedSection, savedWave) {
  const rawS = Math.max(1, Math.floor(Number(savedSection) || 1))
  const rawW = Math.max(1, Math.floor(Number(savedWave) || 1))
  const faction = String(enemyFactionKey || '')
  let s = rawS
  let w = rawW

  if (s >= 7) {
    return { section: TOTAL_SECTIONS, wave: 1 }
  }

  // Antes el jefe estaba en 7; la sección 6 con oleada >1 era la última intermedia.
  if (s === 6 && rawW > 1) {
    return { section: INTERMEDIATE_SECTIONS, wave: Math.min(rawW, WAVES_PER_SECTION) }
  }

  const oldLongWaves = rawW > WAVES_PER_SECTION
  if (oldLongWaves) {
    w = Math.min(rawW, WAVES_PER_SECTION)
    if (faction === 'java') {
      if (s === 5) s = 4
      else if (s === 6) s = 5
    } else if (faction === 'php' && s >= 4) {
      s = Math.max(1, s - 1)
    }
  } else {
    w = Math.min(rawW, WAVES_PER_SECTION)
  }

  s = Math.min(Math.max(1, s), TOTAL_SECTIONS)
  if (s >= TOTAL_SECTIONS) {
    return { section: TOTAL_SECTIONS, wave: 1 }
  }
  return { section: s, wave: Math.min(w, WAVES_PER_SECTION) }
}

export function randomSpawnEdgePosition(worldW, worldH, pad = 80, entitySize = ENEMY_SIZE, getSpawnRect = null) {
  const rect = typeof getSpawnRect === 'function' ? getSpawnRect() : null
  if (!rect) {
    const spanX = Math.max(0, worldW - pad * 2 - entitySize)
    const spanY = Math.max(0, worldH - pad * 2 - entitySize)
    const edge = Math.floor(Math.random() * 4)
    if (edge === 0) return { x: Math.random() * spanX + pad, y: pad }
    if (edge === 1) return { x: worldW - pad - entitySize, y: Math.random() * spanY + pad }
    if (edge === 2) return { x: Math.random() * spanX + pad, y: worldH - pad - entitySize }
    return { x: pad, y: Math.random() * spanY + pad }
  }
  const minX = rect.left + pad
  const maxX = rect.right - entitySize - pad
  const minY = rect.top + pad
  const maxY = rect.bottom - entitySize - pad
  if (maxX <= minX || maxY <= minY) {
    return {
      x: (rect.left + rect.right - entitySize) / 2,
      y: (rect.top + rect.bottom - entitySize) / 2,
    }
  }
  const edge = Math.floor(Math.random() * 4)
  if (edge === 0) return { x: minX + Math.random() * (maxX - minX), y: minY }
  if (edge === 1) return { x: maxX, y: minY + Math.random() * (maxY - minY) }
  if (edge === 2) return { x: minX + Math.random() * (maxX - minX), y: maxY }
  return { x: minX, y: minY + Math.random() * (maxY - minY) }
}
