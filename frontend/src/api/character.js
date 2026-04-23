import api from './axios'

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
