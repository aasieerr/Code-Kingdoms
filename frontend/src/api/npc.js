import api from './axios'
import { activeCharacterId } from '../gameState'

export async function fetchNpcs(mapName) {
  const params = { map: mapName }
  if (activeCharacterId?.value) params.id_character = activeCharacterId.value
  const response = await api.get('/npcs', { params })
  return response.data
}
