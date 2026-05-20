import { describe, expect, it } from 'vitest'
import { isEmptySprite, parseSprite } from './sprite'

describe('parseSprite', () => {
  it('parsea JSON en string', () => {
    expect(parseSprite('["#fff","","#000"]')).toEqual(['#fff', '', '#000'])
  })

  it('acepta arrays ya parseados', () => {
    expect(parseSprite(['a', 'b'])).toEqual(['a', 'b'])
  })

  it('devuelve 256 celdas vacías ante datos inválidos', () => {
    expect(parseSprite(null)).toHaveLength(256)
    expect(parseSprite('not-json')).toHaveLength(256)
    expect(parseSprite({ pixels: 1 })).toHaveLength(256)
  })
})

describe('isEmptySprite', () => {
  it('detecta sprites sin píxeles pintados', () => {
    expect(isEmptySprite(Array(256).fill(''))).toBe(true)
    expect(isEmptySprite('["", "", "#ff0000"]')).toBe(false)
  })
})
