import api from './axios'

/**
 * Consume un ítem del inventario (consumible). Requiere Sanctum.
 * @param {number} characterItemId — id de character_items.id
 */
export async function consumeCharacterItem(characterItemId, body) {
  return api.post(`/character-items/${characterItemId}/consume`, body)
}
