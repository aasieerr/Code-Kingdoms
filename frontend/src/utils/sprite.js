export function parseSprite(data) {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    return Array.isArray(parsed) ? parsed : Array(256).fill('')
  } catch {
    return Array(256).fill('')
  }
}

export function isEmptySprite(data) {
  return !parseSprite(data).some(p => p && p !== '')
}

export function defaultStickmanSprite() {
  const s = Array(256).fill('')
  const c = '#ffffff'
  const head = [36,37,38,39,51,56,67,72,84,85,86,87]
  head.forEach(i => s[i] = c)
  for (let i = 6; i <= 11; i++) { s[i * 16 + 7] = c; s[i * 16 + 8] = c }
  for (let i = 4; i <= 11; i++) s[8 * 16 + i] = c
  s[12*16+6] = c; s[12*16+9] = c
  s[13*16+5] = c; s[13*16+10] = c
  s[14*16+4] = c; s[14*16+11] = c
  return s
}
