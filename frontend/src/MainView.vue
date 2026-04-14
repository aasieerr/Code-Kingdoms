<template>
  <!-- Viewport -->
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
      >
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWasd } from './components/controlChar'

const { arenaRef, x, y, focused, moving } = useWasd()

const cameraTransform = computed(() => {
  const zoom = 2
  const WORLD_SIZE = 2000
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2

  // El "radio" visible de la pantalla en coordenadas del mundo
  const halfViewW = cx / zoom
  const halfViewH = cy / zoom

  // Limitamos el punto de enfoque (targetX/Y) para que la cámara no muestre fuera del mapa
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
  transform-origin: 0 0; /* Vital para que las coordenadas coincidan con el escalado */
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
</style>
