import { ref, computed, onMounted } from 'vue'
import { fetchNpcs } from '../api/npc'
import { WORLD_EDGE } from '../constants/world'


export function useNpcs(mapName, playerX, playerY) {
  const npcs = ref([])
  const activeDialogueNpc = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const loadNpcs = async () => {
    loading.value = true
    try {
      const data = await fetchNpcs(mapName)
      
      // Asegurar que las coordenadas son números y están dentro del mapa
      npcs.value = (Array.isArray(data) ? data : (data?.data || [])).map(npc => {
        let nx = Number(npc.x)
        let ny = Number(npc.y)
        
        // Si están fuera del mapa (1200px), los movemos al borde visible
        if (nx > WORLD_EDGE - 60) nx = WORLD_EDGE - 100 + (nx % 40)
        if (ny > WORLD_EDGE - 60) ny = WORLD_EDGE - 100 + (ny % 40)
        
        return { ...npc, x: nx, y: ny }
      })


    } catch (err) {
      error.value = err
      console.error(`Error loading NPCs for ${mapName}:`, err)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadNpcs()
  })

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
