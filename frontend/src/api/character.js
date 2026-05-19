import api from './axios'
import { activeCharacterId, setActiveCharacterId } from '../gameState'

export async function fetchCharacters() {
  const { data } = await api.get('/characters')
  return Array.isArray(data) ? data : []
}

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

export async function fetchCharacter(id) {
  // Cache-buster para evitar datos obsoletos (especialmente oro)
  const { data } = await api.get(`/characters/${id}?t=${Date.now()}`)
  return data
}

export async function ensureActiveCharacterId() {
  return activeCharacterId.value
}

export async function addCharacterGold(characterId, delta) {
  if (delta <= 0 || characterId == null) {
    return null
  }
  const ch = await fetchCharacter(characterId)
  const next = (ch.gold ?? 0) + delta
  const { data } = await api.patch(`/characters/${characterId}`, { gold: next })
  return data
}

export async function deleteCharacter(id) {
  const { data } = await api.delete(`/characters/${id}`)
  return data
}
