<template>
  <div
    class="viewport"
    ref="arenaRef"
    tabindex="0"
    @click="arenaRef.focus()"
    @focus="focused = true"
    @blur="focused = false"
  >
    <div
      class="world"
      :style="{ transform: cameraTransform }"
    >
      <div class="grid"></div>

      <div
        class="player"
        :style="{
          left: x + 'px',
          top: y + 'px',
          background: moving ? '#f5a623' : '#e94560',
        }"
      ></div>

      <!-- NPCs -->
      <NpcSprite
        v-for="npc in npcs"
        :key="npc.id"
        :npc="npc"
        :is-near="getIsNear(npc)"
        @interact="openDialogue"
      />
    </div>

    <!-- Diálogos NPC -->
    <DialogueModal
      v-if="activeDialogueNpc"
      :npc="activeDialogueNpc"
      @close="activeDialogueNpc = null"
    />
    <div class="fade-overlay" :class="{ active: isFading }"></div>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWasd } from './components/controlChar'
import { lastTransition } from './gameState'
import { useNpcs } from './composables/useNpcs'
import NpcSprite from './components/NpcSprite.vue'
import DialogueModal from './components/DialogueModal.vue'

const router = useRouter()
const isFading = ref(lastTransition.value === 'main-to-second')
const startY = lastTransition.value === 'main-to-second' ? -50 : 10

const { arenaRef, x, y, focused, moving, locked } = useWasd(1000, startY)

// NPCs Composable
const { 
  npcs, 
  activeDialogueNpc, 
  loadNpcs, 
  getIsNear, 
  openDialogue 
} = useNpcs('SecondGame', x, y)

function onNpcKey(e) {
  if (e.key.toLowerCase() !== 'e') return
  const nearNpc = npcs.value.find(n => getIsNear(n))
  if (nearNpc) {
    e.preventDefault()
    openDialogue(nearNpc)
  }
}

onMounted(() => {
  loadNpcs()
  window.addEventListener('keydown', onNpcKey)
  if (lastTransition.value === 'main-to-second') {
    locked.value = true
    moving.value = true
    
    setTimeout(() => {
      isFading.value = false
    }, 50)
    
    const enterLoop = () => {
      y.value += 4
      if (y.value >= 10) {
        locked.value = false
        moving.value = false
        lastTransition.value = null
      } else {
        requestAnimationFrame(enterLoop)
      }
    }
    requestAnimationFrame(enterLoop)
  } else {
    isFading.value = false
  }
})

watch([x, y], ([newX, newY]) => {
  if (!locked.value && newY <= 0 && newX > 800 && newX < 1200) {
    locked.value = true
    moving.value = true
    isFading.value = true
    
    const exitLoop = () => {
      y.value -= 4
      if (y.value <= -60) {
        lastTransition.value = 'second-to-main'
        router.push({ name: 'Game' })
      } else {
        requestAnimationFrame(exitLoop)
      }
    }
    requestAnimationFrame(exitLoop)
  }
})

const cameraTransform = computed(() => {
  const zoom = 2
  const WORLD_SIZE = 2000
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2

  const halfViewW = cx / zoom
  const halfViewH = cy / zoom

  const targetX = Math.max(halfViewW, Math.min(x.value + 20, WORLD_SIZE - halfViewW))
  const targetY = Math.max(halfViewH, Math.min(y.value + 20, WORLD_SIZE - halfViewH))

  return `translate(${cx}px, ${cy}px) scale(${zoom}) translate(-${targetX}px, -${targetY}px)`
})
</script>

<style scoped>
.viewport {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  outline: none;
  overflow: hidden;
  background-color: #2d5a27;
}

.world {
  position: absolute;
  width: 2000px;
  height: 2000px;
  transform-origin: 0 0;
  will-change: transform;
}

.grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size: 50px 50px;
}

.player {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  transition: background 0.1s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.fade-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s ease-in-out;
  z-index: 1000;
}
.fade-overlay.active {
  opacity: 1;
}
</style>
