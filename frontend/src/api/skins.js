import api from './axios'
import { requireActiveCharacterId } from './requireActiveCharacter'

export async function fetchSkinsCatalog() {
  const { data } = await api.get('/skins')
  return Array.isArray(data) ? data : []
}

export async function purchaseSkin(skinId) {
  const cid = requireActiveCharacterId()
  const { data } = await api.post('/skins/purchase', {
    id_character: cid,
    skin_id: skinId,
  })
  return data
}

export async function equipSkin(skinId) {
  const cid = requireActiveCharacterId()
  const { data } = await api.post(
    `/characters/${cid}/equip-skin`,
    { skin_id: skinId },
  )
  return data
}
