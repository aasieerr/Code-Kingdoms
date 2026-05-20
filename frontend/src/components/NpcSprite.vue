<template>
  <div
    class="npc-container"
    :style="{
      left: (npc.x || 0) + 'px',
      top: (npc.y || 0) + 'px',
      display: (npc.x === undefined || npc.y === undefined || npc.x === null || npc.y === null) ? 'none' : 'flex'
    }"
  >
    <div
      class="npc-sprite"
      :class="npc.tipo"
      @click="$emit('interact', npc)"
    >
      <div class="npc-indicator" v-if="isNear">
        <span class="key-hint">E</span>
        <span class="action-text">Hablar</span>
      </div>
      <div class="npc-shadow"></div>
      <div class="npc-body">
        <img v-if="currentSrc" :src="currentSrc" alt="npc" style="width:100%; height:100%; object-fit:contain;" />
        <div v-else class="npc-head"></div>
      </div>
    </div>
    <div class="npc-name">{{ npc.nombre }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import npcSprites from '../constants/npcSprites'

const props = defineProps({
  npc: {
    type: Object,
    required: true
  },
  isNear: {
    type: Boolean,
    default: false
  }
})

defineEmits(['interact'])

const npc = computed(() => props.npc)
const isNear = computed(() => props.isNear)
const npcName = computed(() => npc.value?.nombre || '')
const currentSrc = computed(() => npcSprites[npcName.value] || null)
</script>

<style scoped>
.npc-container {
  position: absolute;
  width: 56px;
  height: 56px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.npc-sprite {
  width: 56px;
  height: 56px;
  position: relative;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.12s ease;
}

.npc-sprite:hover {
  transform: scale(1.08);
  animation-play-state: paused;
}

.npc-body {
  width: 48px;
  height: 48px;
  background: transparent;
  border-radius: 6px;
  margin: 4px;
  position: relative;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vendedor .npc-body {
  background: transparent;
}

.npc-head {
  width: 20px;
  height: 20px;
  background: #ffdbac;
  border-radius: 50%;
  position: absolute;
  top: -12px;
  left: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.npc-shadow {
  position: absolute;
  bottom: -4px;
  left: 5px;
  width: 30px;
  height: 8px;
  background: rgba(0,0,0,0.3);
  border-radius: 50%;
  filter: blur(2px);
}

.npc-name {
  margin-top: 10px;
  font-size: 9px;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  white-space: nowrap;
  background: rgba(0,0,0,0.5);
  padding: 2px 6px;
  border-radius: 10px;
  font-family: 'Press Start 2P', cursive;
}

.npc-indicator {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: bounce 1s infinite alternate;
}

.key-hint {
  background: #fff;
  color: #333;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  border-bottom: 2px solid #ccc;
}

.action-text {
  font-size: 7px;
  color: #ffcc80;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@keyframes sway {
  /* replaced by idle below */
}

@keyframes idle {
  0% { transform: translateY(0) scale(1); }
  40% { transform: translateY(-6px) scale(1.03); }
  60% { transform: translateY(-3px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
}

@keyframes shadowScale {
  0% { transform: scaleX(1) scaleY(1); opacity: 0.35 }
  40% { transform: scaleX(1.2) scaleY(0.85); opacity: 0.25 }
  60% { transform: scaleX(1.1) scaleY(0.9); opacity: 0.28 }
  100% { transform: scaleX(1) scaleY(1); opacity: 0.35 }
}

/* simula un ciclo de walking: alterna ligera subida/bajada y rotación para dar paso */
@keyframes walk {
  0% { transform: translateY(0) rotate(0deg) scale(1); }
  25% { transform: translateY(-2px) rotate(-1deg) scale(1.01); }
  50% { transform: translateY(0) rotate(0deg) scale(1); }
  75% { transform: translateY(-2px) rotate(1deg) scale(1.01); }
  100% { transform: translateY(0) rotate(0deg) scale(1); }
}

@keyframes shadowWalk {
  0% { transform: scaleX(1) scaleY(1); opacity: 0.35 }
  25% { transform: scaleX(1.05) scaleY(0.95); opacity: 0.28 }
  50% { transform: scaleX(1) scaleY(1); opacity: 0.35 }
  75% { transform: scaleX(1.05) scaleY(0.95); opacity: 0.28 }
  100% { transform: scaleX(1) scaleY(1); opacity: 0.35 }
}

@keyframes bounce {
  from { transform: translateX(-50%) translateY(0); }
  to { transform: translateX(-50%) translateY(-5px); }
}
</style>
