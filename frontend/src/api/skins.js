import api from './axios'
import { ensureActiveCharacterId } from './character'
import { activeCharacterId } from '../gameState'

export async function fetchSkinsCatalog() {
  const { data } = await api.get('/skins')
  return Array.isArray(data) ? data : []
}

export async function purchaseSkin(skinId) {
  await ensureActiveCharacterId()
  const { data } = await api.post('/skins/purchase', {
    id_character: activeCharacterId.value,
    skin_id: skinId,
  })
  return data
}

export async function equipSkin(skinId) {
  await ensureActiveCharacterId()
  const { data } = await api.post(
    `/characters/${activeCharacterId.value}/equip-skin`,
    { skin_id: skinId }
  )
  return data
}
