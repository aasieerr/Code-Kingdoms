import api from './axios'

export async function fetchNpcs(mapName) {
  const response = await api.get(`/npcs?map=${mapName}`)
  return response.data
}
