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
        <div class="npc-head"></div>
      </div>
    </div>
    <div class="npc-name">{{ npc.nombre }}</div>
  </div>
</template>

<script setup>
defineProps({
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
</script>

<style scoped>
.npc-container {
  position: absolute;
  width: 40px;
  height: 40px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.npc-sprite {
  width: 40px;
  height: 40px;
  position: relative;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.2s ease;
  animation: float 3s ease-in-out infinite;
}

.npc-sprite:hover {
  transform: scale(1.1) translateY(-5px);
  animation-play-state: paused;
}

.npc-body {
  width: 32px;
  height: 32px;
  background: #4a90e2;
  border-radius: 6px;
  margin: 4px;
  position: relative;
  box-shadow: inset 0 -4px 0 rgba(0,0,0,0.2);
}

.vendedor .npc-body {
  background: #f5a623;
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
  margin-top: 8px;
  font-size: 8px;
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
  top: -45px;
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

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes bounce {
  from { transform: translateX(-50%) translateY(0); }
  to { transform: translateX(-50%) translateY(-5px); }
}
</style>
