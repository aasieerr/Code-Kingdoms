import api from './axios'
import { activeCharacterId, setActiveCharacterId } from '../gameState'

/**
 * Personajes del usuario (requiere token Sanctum).
 */
export async function fetchCharacters() {
  const { data } = await api.get('/characters')
  return Array.isArray(data) ? data : []
}

/**
 * Crea un personaje para el usuario autenticado.
 */
export async function createCharacter(payload) {
  const { data } = await api.post('/characters', {
    name: payload.name,
    id_kingdom: payload.id_kingdom,
    id_race: payload.id_race,
    id_class: payload.id_class,
    sprite_data: payload.sprite_data,
  })
  return data
}

/**
 * Detalle (requiere ser el dueño del personaje).
 */
export async function fetchCharacter(id) {
  // Cache-buster para evitar datos obsoletos (especialmente oro)
  const { data } = await api.get(`/characters/${id}?t=${Date.now()}`)
  return data
}

/**
 * Devuelve el personaje activo (elegido en el menú). No asigna ningún PJ por defecto.
 */
export async function ensureActiveCharacterId() {
  return activeCharacterId.value
}

/**
 * Suma oro al personaje. Requiere JWT.
 */
export async function addCharacterGold(characterId, delta) {
  if (delta <= 0 || characterId == null) {
    return null
  }
  const ch = await fetchCharacter(characterId)
  const next = (ch.gold ?? 0) + delta
  const { data } = await api.patch(`/characters/${characterId}`, { gold: next })
  return data
}

/**
 * Elimina un personaje.
 */
export async function deleteCharacter(id) {
  const { data } = await api.delete(`/characters/${id}`)
  return data
}
