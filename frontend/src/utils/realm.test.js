import { describe, expect, it } from 'vitest'
import { isPhpKingdom, isPlayerPhpKingdom } from './realm'

describe('isPhpKingdom', () => {
  it('detecta PHP por nombre o typo peachepe', () => {
    expect(isPhpKingdom('PHP Kingdom')).toBe(true)
    expect(isPhpKingdom('peachepe')).toBe(true)
  })

  it('detecta Java y rechaza id 2', () => {
    expect(isPhpKingdom('Java Realm')).toBe(false)
    expect(isPhpKingdom(2)).toBe(false)
    expect(isPhpKingdom('2')).toBe(false)
  })

  it('usa id 1 como PHP cuando no hay pista en el texto', () => {
    expect(isPhpKingdom(1)).toBe(true)
    expect(isPhpKingdom('1')).toBe(true)
    expect(isPhpKingdom('')).toBe(false)
  })
})

describe('isPlayerPhpKingdom', () => {
  it('prioriza el nombre del reino sobre el id', () => {
    expect(isPlayerPhpKingdom('Peachepe', 2)).toBe(true)
    expect(isPlayerPhpKingdom('Java', 1)).toBe(false)
  })

  it('cae al id cuando el nombre no indica facción', () => {
    expect(isPlayerPhpKingdom('Code Kingdoms', 1)).toBe(true)
    expect(isPlayerPhpKingdom('Code Kingdoms', 2)).toBe(false)
  })
})
