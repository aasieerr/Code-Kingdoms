import { ref } from 'vue'

export const lastTransition = ref(null)

/**
 * ID del personaje activo. Se rellena con el primer personaje de la API (ensureActiveCharacterId).
 * Con Keycloak, sustituir por el personaje vinculado al usuario.
 */
export const activeCharacterId = ref(null)
