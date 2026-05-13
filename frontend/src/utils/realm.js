/**
 * Reino PHP vs Java (nombres, textos de UI y backend id_kingdom 1 = PHP, 2 = Java).
 */

/** Un solo valor: nombre, id como número, string "1", raza con "php"/"java", etc. */
export function isPhpKingdom(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized.includes('php') || normalized.includes('peachepe')) return true
  if (normalized.includes('java')) return false
  return normalized === '1'
}

/** Personaje en lobby/menú: nombre de reino del store + id. */
export function isPlayerPhpKingdom(kingdomName, kingdomId) {
  const kName = String(kingdomName ?? '').toLowerCase()
  if (kName.includes('php') || kName.includes('peachepe')) return true
  if (kName.includes('java')) return false
  return Number(kingdomId) === 1
}
