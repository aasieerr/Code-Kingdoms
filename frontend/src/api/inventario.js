import api from './axios'
import { ref, computed } from 'vue'
import { activeCharacterId } from '../gameState'
import { ensureActiveCharacterId } from './character'

export const globalItems = ref([])
export const myCharacterItems = ref([])
export const isInventoryLoading = ref(false)
export const lastInventoryError = ref(null)

let isDataLoaded = false

// Inventario cruzado para el UI (catálogo + posesiones)
export const mergedInventoryItems = computed(() => {
  return myCharacterItems.value
})

// Solo lo que tenemos equipado para el panel de equipo
export const equippedItems = computed(() => {
  return myCharacterItems.value.filter(ci => ci.is_equipped)
})

export async function fetchInventoryData(force = false) {
  if (isDataLoaded && !force) return
  isInventoryLoading.value = true
  lastInventoryError.value = null
  try {
    const id = await ensureActiveCharacterId()
    if (id == null) {
      isDataLoaded = false
      isInventoryLoading.value = false
      return
    }
    const cid = activeCharacterId.value
    const [resItems, resChar] = await Promise.all([
      api.get('/items'),
      api.get('/character-items', { params: { id_character: cid } })
    ])
    globalItems.value = Array.isArray(resItems.data) ? resItems.data : []
    myCharacterItems.value = Array.isArray(resChar.data) ? resChar.data : []
    isDataLoaded = true
  } catch (err) {
    lastInventoryError.value = err?.response?.data?.message ?? 'Error de red.'
  } finally {
    isInventoryLoading.value = false
  }
}

export async function toggleEquipItem(id, equip, id_item = null) {
  const ensured = await ensureActiveCharacterId()
  if (ensured == null) {
    return
  }
  const cid = activeCharacterId.value
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
