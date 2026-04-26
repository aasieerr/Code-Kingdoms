import { ref, computed } from 'vue'
import { fetchNpcs } from '../api/npc'

export function useNpcs(mapName, playerX, playerY) {
  const npcs = ref([])
  const activeDialogueNpc = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const loadNpcs = async () => {
    loading.value = true
    try {
      npcs.value = await fetchNpcs(mapName)
    } catch (err) {
      error.value = err
      console.error(`Error loading NPCs for ${mapName}:`, err)
    } finally {
      loading.value = false
    }
  }

  const getIsNear = (npc) => {
    if (!npc.x || !npc.y) return false
    const dist = Math.sqrt(Math.pow(playerX.value - npc.x, 2) + Math.pow(playerY.value - npc.y, 2))
    return dist < 60
  }

  const nearestNpc = computed(() => {
    return npcs.value.find(npc => getIsNear(npc))
  })

  const openDialogue = (npc) => {
    activeDialogueNpc.value = npc
  }

  const closeDialogue = () => {
    activeDialogueNpc.value = null
  }

  return {
    npcs,
    activeDialogueNpc,
    loading,
    error,
    loadNpcs,
    getIsNear,
    nearestNpc,
    openDialogue,
    closeDialogue
  }
}
