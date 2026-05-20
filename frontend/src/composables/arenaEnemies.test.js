import { describe, expect, it } from 'vitest'
import { getRoundConfig, typeBaseStats, xpForEnemyType } from './arenaEnemies'

describe('arenaEnemies', () => {
  it('expone configuración de rondas', () => {
    const rounds = getRoundConfig()
    expect(Array.isArray(rounds)).toBe(true)
    expect(rounds.length).toBeGreaterThan(0)
  })

  it('asigna stats distintos por tipo', () => {
    expect(typeBaseStats('microservice').speed).toBeGreaterThan(
      typeBaseStats('legacy_monolith').speed,
    )
    expect(typeBaseStats('legacy_monolith').hp).toBeGreaterThan(500)
  })

  it('recompensa XP conocida o fallback', () => {
    expect(xpForEnemyType('boss')).toBe(240)
    expect(xpForEnemyType('unknown_type')).toBe(12)
  })
})
