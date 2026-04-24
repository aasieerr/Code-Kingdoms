import api from './axios'
import { fetchInventoryData } from './inventario'
import { ensureActiveCharacterId } from './character'
import { activeCharacterId } from '../gameState'

/**
 * Compra en servidor: descuenta oro y actualiza inventario.
 * @returns {Promise<{ character: object, character_item: object, spent: number }>}
 */
export async function purchaseFromShop(idItem, quantity = 1) {
  await ensureActiveCharacterId()
  const { data } = await api.post('/shop/purchase', {
    id_character: activeCharacterId.value,
    id_item: idItem,
    quantity,
  })
  await fetchInventoryData(true)
  return data
}
