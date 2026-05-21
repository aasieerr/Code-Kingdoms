<template>
  <div 
    v-if="isVisible && !isAtTarget" 
    class="tutorial-arrow-ui"
    :style="screenStyle"
  >
    <div class="arrow-rotator" :style="rotatorStyle">
      <div class="arrow" :class="{ 'php-theme': isPhp, 'is-clamped': isClamped }">
        <div class="arrow-head"></div>
      </div>
    </div>
    <div class="target-label" :class="{ 'php-theme': isPhp }">
      ARENA {{ isClamped ? '' : 'AQUÍ' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // Coordenadas del jugador en el MUNDO
  playerX: { type: Number, required: true },
  playerY: { type: Number, required: true },
  // Coordenadas del objetivo en el MUNDO
  targetX: { type: Number, required: true },
  targetY: { type: Number, required: true },
  // Coordenadas de la cámara (centro de visión)
  camX: { type: Number, required: true },
  camY: { type: Number, required: true },
  isPhp: { type: Boolean, required: true },
  characterId: { type: [Number, String], required: true }
})

const isVisible = ref(false)
const isClamped = ref(false)
const zoom = 2 // El zoom que usas en MainView

// Dimensiones de la ventana
const windowSize = ref({ w: window.innerWidth, h: window.innerHeight })
const updateWindowSize = () => {
  windowSize.value = { w: window.innerWidth, h: window.innerHeight }
}

const screenStyle = computed(() => {
  const halfW = windowSize.value.w / 2
  const halfH = windowSize.value.h / 2

  // 1. Convertir coordenadas del mundo a coordenadas de pantalla
  // (wx - camX) * zoom + screenCenterX
  let sx = (props.targetX - props.camX) * zoom + halfW
  let sy = (props.targetY - props.camY) * zoom + halfH

  // 2. Definir márgenes de seguridad para que no toque el borde físico
  const margin = 60
  const minX = margin
  const maxX = windowSize.value.w - margin
  const minY = margin
  const maxY = windowSize.value.h - margin

  // 3. ¿Está fuera de pantalla?
  const clampedX = Math.max(minX, Math.min(sx, maxX))
  const clampedY = Math.max(minY, Math.min(sy, maxY))

  isClamped.value = (sx !== clampedX || sy !== clampedY)

  return {
    left: `${clampedX}px`,
    top: `${clampedY}px`,
    position: 'fixed' // Importante: ahora es UI, no mundo
  }
})

const rotatorStyle = computed(() => {
  const dx = props.targetX - props.playerX
  const dy = props.targetY - props.playerY
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  
  return {
    transform: `rotate(${angle + 90}deg)`
  }
})

const isAtTarget = computed(() => {
  const dx = props.targetX - props.playerX
  const dy = props.targetY - props.playerY
  return Math.sqrt(dx * dx + dy * dy) < 80
})

onMounted(() => {
  window.addEventListener('resize', updateWindowSize)
  const seen = localStorage.getItem(`ck_arena_v1_${props.characterId}`)
  if (seen !== 'true') isVisible.value = true
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowSize)
})
</script>

<style scoped>
.tutorial-arrow-ui {
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
}

.arrow-rotator {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.8));
}

.arrow.is-clamped {
  /* Si está en el borde, animamos para llamar la atención */
  animation: pulse 0.6s infinite alternate ease-in-out;
}

.arrow-head {
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 22px solid #facc15;
}

.php-theme .arrow-head {
  border-bottom-color: #a78bfa;
}

.target-label {
  margin-top: 8px;
  background: #0f172a;
  color: #facc15;
  font-family: 'Press Start 2P', cursive;
  font-size: 7px;
  padding: 4px 8px;
  border: 2px solid #facc15;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
}

.target-label.php-theme {
  color: #a78bfa;
  border-color: #a78bfa;
}

@keyframes pulse {
  from { transform: scale(1); }
  to { transform: scale(1.3); }
}
</style>
