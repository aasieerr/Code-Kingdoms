/**
 * Shared pixel-art sprite utilities.
 * Used by MainView, SecondView, HudPanel, CharacterMenuView.
 */

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
