import { ref } from 'vue'

export const lastTransition = ref(null)

const STORAGE_KEY = 'ck_active_character_id'

function readStoredCharacterId() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s == null || s === '') {
      return null
    }
    const n = parseInt(s, 10)
    return Number.isNaN(n) ? null : n
  } catch {
    return null
  }
}

/**
 * ID del personaje con el que se juega. Se elige en el menú de personajes.
 * Persiste en localStorage para F5 en /game; al cerrar sesión se limpia.
 */
export const activeCharacterId = ref(readStoredCharacterId())

/**
 * Fija el personaje activo y la persistencia. Usar null al cerrar sesión.
 * @param {number|null|undefined} id
 */
export function setActiveCharacterId(id) {
  if (id == null || id === undefined) {
    activeCharacterId.value = null
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch { /* */ }
    return
  }
  const n = Number(id)
  activeCharacterId.value = n
  try {
    localStorage.setItem(STORAGE_KEY, String(n))
  } catch { /* */ }
}
