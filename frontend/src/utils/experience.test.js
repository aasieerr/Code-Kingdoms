import { describe, expect, it } from 'vitest'
import { xpRequiredForLevel } from './experience'

describe('xpRequiredForLevel', () => {
  it('sube con el nivel', () => {
    const lvl1 = xpRequiredForLevel(1)
    const lvl5 = xpRequiredForLevel(5)
    const lvl10 = xpRequiredForLevel(10)
    expect(lvl5).toBeGreaterThan(lvl1)
    expect(lvl10).toBeGreaterThan(lvl5)
  })

  it('nunca baja de nivel 1 con entradas inválidas', () => {
    expect(xpRequiredForLevel(0)).toBe(xpRequiredForLevel(1))
    expect(xpRequiredForLevel(-3)).toBe(xpRequiredForLevel(1))
    expect(xpRequiredForLevel('abc')).toBe(xpRequiredForLevel(1))
  })

  it('devuelve enteros redondeados', () => {
    expect(Number.isInteger(xpRequiredForLevel(7))).toBe(true)
  })
})
