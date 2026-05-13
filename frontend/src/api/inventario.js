import api from './axios'
import { ref, computed } from 'vue'
import { ensureActiveCharacterId } from './character'

export const globalItems = ref([])
export const myCharacterItems = ref([])
export const isInventoryLoading = ref(false)
export const lastInventoryError = ref(null)

let lastLoadedCharacterId = null

// Solo lo que tenemos equipado para el panel de equipo
export const equippedItems = computed(() => {
  return myCharacterItems.value.filter(ci => ci.is_equipped)
})

async function loadInventoryPayload(cid, shopType) {
  const params = { id_character: cid }
  if (shopType) params.shop_type = shopType
  const [resItems, resChar] = await Promise.all([
    api.get('/items', { params }),
    api.get('/character-items', { params: { id_character: cid } }),
  ])
  globalItems.value = Array.isArray(resItems.data) ? resItems.data : []
  myCharacterItems.value = Array.isArray(resChar.data) ? resChar.data : []
  lastLoadedCharacterId = cid
}

export async function fetchInventoryData(force = false, shopType = null) {
  const cid = await ensureActiveCharacterId()
  if (lastLoadedCharacterId === cid && !force) return
  isInventoryLoading.value = true
  lastInventoryError.value = null
  try {
    if (cid == null) {
      lastLoadedCharacterId = null
      isInventoryLoading.value = false
      return
    }
    await loadInventoryPayload(cid, shopType)
  } catch (err) {
    lastInventoryError.value = err?.response?.data?.message ?? 'Error de red.'
  } finally {
    isInventoryLoading.value = false
  }
}

export async function toggleEquipItem(id, equip, id_item = null) {
  const cid = await ensureActiveCharacterId()
  if (cid == null) {
    return
  }
  if (!id && equip && id_item) {
    await api.post(`/character-items`, {
      id_character: cid,
      id_item: id_item,
      quantity: 1,
      is_equipped: true
    })
  } else {
    await api.put(`/character-items/${id}`, {
      is_equipped: equip
    })
  }

  const { data } = await api.get('/character-items', { params: { id_character: cid } })
  myCharacterItems.value = Array.isArray(data) ? data : []
}
