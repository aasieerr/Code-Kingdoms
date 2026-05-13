/**
 * XP acumulada necesaria para pasar del nivel `levelValue` al siguiente (curva de arena / HUD).
 */
export function xpRequiredForLevel(levelValue) {
  const safeLevel = Math.max(1, Number(levelValue) || 1)
  return Math.round(85 * Math.pow(safeLevel, 1.35) + safeLevel * 42)
}
