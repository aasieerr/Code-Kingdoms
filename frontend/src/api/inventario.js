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

/**
 * Cambia el estado de equipamiento de un item para un personaje.
 * @param {number|null} id - ID del character_item (si existe)
 * @param {boolean} equip - true para equipar, false para desequipar
 * @param {number} [id_item] - ID del item base (solo si se va a crear por primera vez)
 */
export async function toggleEquipItem(id, equip, id_item = null) {
  if (!id && equip && id_item) {
    // Si no existía en el inventario del jugador, lo creamos directamente equipado
    const { data } = await api.post(`/character-items`, {
      id_character: 1, // Hardcodeado temporalmente para pruebas sin token
      id_item: id_item,
      quantity: 1,
      is_equipped: true
    })
    return data
  }

  const { data } = await api.put(`/character-items/${id}`, {
    is_equipped: equip
  })
  return data
}
