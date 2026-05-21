import api from './axios'
import { requireActiveCharacterId } from './requireActiveCharacter'

export async function fetchSkinsCatalog() {
  const { data } = await api.get('/skins')
  return Array.isArray(data) ? data : []
}

export async function purchaseSkin(skinId) {
  const { data } = await api.post('/skins/purchase', {
    skin_id: skinId,
  })
  return data
}

/** Equipa una skin comprada, o `null` para volver al pixel-art del creador. */
export async function equipSkin(skinId) {
  const cid = requireActiveCharacterId()
  const { data } = await api.post(
    `/characters/${cid}/equip-skin`,
    { skin_id: skinId },
  )
  return data
}
