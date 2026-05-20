import { ref, computed, onMounted } from 'vue'
import { fetchNpcs } from '../api/npc'

export function useNpcs(mapName, playerX, playerY) {
  const npcs = ref([])
  const activeDialogueNpc = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const loadNpcs = async () => {
    loading.value = true
    try {
      const data = await fetchNpcs(mapName)

      // Coordenadas como números (NaN si el backend envía algo inválido)
      npcs.value = (Array.isArray(data) ? data : (data?.data || [])).map((npc) => {
        const nx = Number(npc.x)
        const ny = Number(npc.y)
        return { ...npc, x: nx, y: ny }
      })
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadNpcs()
  })

  const getIsNear = (npc) => {
    if (!Number.isFinite(npc.x) || !Number.isFinite(npc.y)) return false
    return Math.hypot(playerX.value - npc.x, playerY.value - npc.y) < 60
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
