import api from './axios'

/**
 * Obtiene todos los items del juego con sus detalles (weapon/armor/consumable).
 * Ruta pública: GET /api/items
 */
export async function fetchItems() {
  const { data } = await api.get('/items')
  return Array.isArray(data) ? data : []
}

/**
 * Obtiene los items equipados/en inventario de un personaje concreto.
 * Devuelve los character-items con el item anidado y sus detalles.
 * Ruta protegida: GET /api/character-items?id_character={id}
 */
export async function fetchCharacterItems(characterId) {
  const { data } = await api.get('/character-items', {
    params: characterId ? { id_character: characterId } : {},
  })
  return Array.isArray(data) ? data : []
}
