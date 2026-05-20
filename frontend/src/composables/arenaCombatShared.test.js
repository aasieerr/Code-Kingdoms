import { describe, expect, it } from 'vitest'
import {
  earlyWaveEnemyCountMultiplier,
  earlyWaveMultiplier,
  isJavaBossShielded,
  isJavaFinalBoss,
  maxWavesForSection,
  normalizeArenaProgressFromServer,
  isAdminCombatEnabled,
  resolveOptionValue,
  scalePlayerDamageForAdmin,
  sectionMultiplier,
  waveMultiplier,
  WAVES_PER_SECTION,
  TOTAL_SECTIONS,
} from './arenaCombatShared'

describe('resolveOptionValue', () => {
  it('extrae .value de refs de Vue y usa fallback', () => {
    expect(resolveOptionValue({ value: 'php' })).toBe('php')
    expect(resolveOptionValue({ value: null }, 'java')).toBe('java')
    expect(resolveOptionValue('direct')).toBe('direct')
    expect(resolveOptionValue(undefined, 'x')).toBe('x')
  })
})

describe('admin combat', () => {
  it('detects admin flag from refs or booleans', () => {
    expect(isAdminCombatEnabled(true)).toBe(true)
    expect(isAdminCombatEnabled({ value: true })).toBe(true)
    expect(isAdminCombatEnabled(false)).toBe(false)
    expect(isAdminCombatEnabled({ value: false })).toBe(false)
  })

  it('amplifies damage for admins', () => {
    expect(scalePlayerDamageForAdmin(12, false)).toBe(12)
    expect(scalePlayerDamageForAdmin(12, true)).toBeGreaterThanOrEqual(100)
    expect(scalePlayerDamageForAdmin(5, { value: true })).toBeGreaterThanOrEqual(100)
  })
})

describe('arena multipliers', () => {
  it('escala sección y oleada desde 1', () => {
    expect(sectionMultiplier(1)).toBe(1)
    expect(sectionMultiplier(3)).toBeGreaterThan(1)
    expect(waveMultiplier(1)).toBe(1)
    expect(waveMultiplier(4)).toBeGreaterThan(1)
  })

  it('suaviza dificultad al inicio de la sección 1', () => {
    expect(earlyWaveMultiplier(1, 1)).toBe(0.48)
    expect(earlyWaveMultiplier(2, 1)).toBe(1)
    expect(earlyWaveEnemyCountMultiplier(1, 3)).toBe(0.72)
  })

  it('limita oleadas en la sección final', () => {
    expect(maxWavesForSection(TOTAL_SECTIONS)).toBe(1)
    expect(maxWavesForSection(1)).toBe(WAVES_PER_SECTION)
  })
})

describe('isJavaFinalBoss / isJavaBossShielded', () => {
  it('solo el boss de facción java activa escudo', () => {
    const boss = { type: 'boss', shieldUntil: 5000 }
    expect(isJavaFinalBoss(boss, 'java')).toBe(true)
    expect(isJavaFinalBoss(boss, 'php')).toBe(false)
    expect(isJavaBossShielded(boss, 1000)).toBe(true)
    expect(isJavaBossShielded(boss, 9000)).toBe(false)
  })
})

describe('normalizeArenaProgressFromServer', () => {
  it('colapsa sección 7+ al jefe final', () => {
    expect(normalizeArenaProgressFromServer('java', 7, 3)).toEqual({
      section: TOTAL_SECTIONS,
      wave: 1,
    })
  })

  it('migra progreso antiguo sección 6 con oleada > 1', () => {
    expect(normalizeArenaProgressFromServer('php', 6, 5)).toEqual({
      section: 5,
      wave: 5,
    })
  })

  it('ajusta oleadas largas en facción java', () => {
    const result = normalizeArenaProgressFromServer('java', 5, 10)
    expect(result.wave).toBeLessThanOrEqual(WAVES_PER_SECTION)
    expect(result.section).toBeLessThan(5)
  })
})
