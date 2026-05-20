import { describe, expect, it } from 'vitest'
import {
  keyLabel,
  normalizeArenaPotionSlots,
  normalizeKey,
  sanitizeLoadedSettings,
} from './useGameSettings'

describe('normalizeKey', () => {
  it('normaliza espacio y mayúsculas', () => {
    expect(normalizeKey(' ')).toBe('space')
    expect(normalizeKey('W')).toBe('w')
    expect(normalizeKey('  ArrowUp  ')).toBe('arrowup')
  })

  it('devuelve cadena vacía para valores falsy', () => {
    expect(normalizeKey('')).toBe('')
    expect(normalizeKey(null)).toBe('')
  })
})

describe('keyLabel', () => {
  it('formatea teclas para la UI', () => {
    expect(keyLabel('space')).toBe('SPACE')
    expect(keyLabel('arrowleft')).toBe('ARROW left')
    expect(keyLabel('')).toBe('—')
  })
})

describe('normalizeArenaPotionSlots', () => {
  const keybinds = {
    moveUp: 'w',
    moveDown: 's',
    moveLeft: 'a',
    moveRight: 'd',
    interact: 'e',
    inventory: 'i',
    equipment: 'k',
    map: 'm',
  }

  it('rechaza consumibles desconocidos', () => {
    const slots = normalizeArenaPotionSlots(keybinds, [
      { itemName: 'Poción inventada', key: '1' },
    ])
    expect(slots[0].itemName).toBe('')
  })

  it('evita duplicar teclas ya usadas en keybinds', () => {
    const slots = normalizeArenaPotionSlots(keybinds, [
      { itemName: 'Poción de vida pequeña', key: 'w' },
      { itemName: 'Poción de Curación', key: 'w' },
    ])
    const keys = slots.map((s) => s.key)
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys).not.toContain('w')
  })
})

describe('sanitizeLoadedSettings', () => {
  it('aplica valores por defecto y recorta volumen', () => {
    const safe = sanitizeLoadedSettings({
      volume: 999,
      keybinds: { moveUp: 'ArrowUp' },
      arenaPotionSlots: [],
    })
    expect(safe.volume).toBe(100)
    expect(safe.keybinds.moveUp).toBe('arrowup')
    expect(safe.arenaPotionSlots).toHaveLength(4)
  })

  it('restaura keybind duplicado al valor por defecto', () => {
    const safe = sanitizeLoadedSettings({
      keybinds: { moveUp: 'q', moveDown: 'q' },
    })
    expect(safe.keybinds.moveDown).toBe('s')
  })
})
