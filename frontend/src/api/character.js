import api from './axios'
import { activeCharacterId } from '../gameState'

/**
 * Obtiene todos los personajes.
 * Ruta pública: GET /api/characters
 */
export async function fetchCharacters() {
  const { data } = await api.get('/characters')
  return Array.isArray(data) ? data : []
}

/**
 * Obtiene un personaje concreto por su ID.
 * Ruta pública: GET /api/characters/{id}
 */
export async function fetchCharacter(id) {
  const { data } = await api.get(`/characters/${id}`)
  return data
}

/**
 * Asigna activeCharacterId al primer personaje de la API si aún no está fijado.
 * Evita depender de id=1, que no existe si la base no está resembrada igual.
 */
export async function ensureActiveCharacterId() {
  if (activeCharacterId.value != null) {
    return activeCharacterId.value
  }
  const list = await fetchCharacters()
  if (list.length === 0) {
    throw new Error(
      'No hay personajes. En el contenedor: php artisan db:seed (o crea un personaje por la API).'
    )
  }
  activeCharacterId.value = list[0].id
  return activeCharacterId.value
}
