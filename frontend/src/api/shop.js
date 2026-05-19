import api from './axios'
import { activeCharacterId } from '../gameState'
import { fetchInventoryData } from './inventario'

export async function purchaseItem(id_item, quantity = 1) {
  const cid = activeCharacterId.value
  if (!cid) throw new Error('No hay personaje activo')

  const { data } = await api.post('/shop/purchase', {
    id_character: cid,
    id_item,
    quantity
  })
  await fetchInventoryData(true)
  return data
}

export async function sellItem(id_character_item, quantity = 1) {
  const cid = activeCharacterId.value
  if (!cid) throw new Error('No hay personaje activo')

  const { data } = await api.post('/shop/sell', {
    id_character: cid,
    id_character_item,
    quantity
  })
  await fetchInventoryData(true)
  return data
}
