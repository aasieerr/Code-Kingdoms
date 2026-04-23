<template>
  <div
    class="viewport"
    ref="arenaRef"
    tabindex="0"
    @click="arenaRef.focus()"
    @focus="focused = true"
    @blur="focused = false"
  >
    <!-- Mundo de juego -->
    <div class="world" :style="{ transform: cameraTransform }">
      <div class="grid"></div>
      <div class="terrain grassland"></div>
      <div class="terrain forest-zone"></div>
      <div class="terrain mountain-zone"></div>
      <div class="terrain lake-zone"></div>
      <div class="terrain road-main"></div>
      <div class="terrain road-cross"></div>
      <div class="terrain village-zone"></div>
      <div class="terrain ruins-zone"></div>
      <div class="player" :style="{ left: x + 'px', top: y + 'px', background: moving ? '#f5a623' : '#e94560' }"></div>
    </div>

    <!-- Logo -->
    <img class="game-logo" src="/code-kingdoms-logo.png" alt="Code Kingdoms logo" />

    <!-- HUD -->
    <HudPanel
      :map-open="showMapPanel"
      @open-inventory="openPanel('inventory')"
      @open-equipment="openPanel('equipment')"
      @toggle-map="toggleMap"
      @logout="handleLogout"
    />

    <!-- Panel inventario -->
    <InventoryPanel
      v-if="showPanel === 'inventory'"
      @close="showPanel = null"
    />

    <!-- Panel equipo -->
    <EquipmentPanel
      v-if="showPanel === 'equipment'"
      @close="showPanel = null"
    />

    <!-- Mapa -->
    <MapPanel
      v-if="showMapPanel"
      :player-x="x"
      :player-y="y"
      @close="showMapPanel = false"
    />

    <!-- Fade de transición -->
    <div class="fade-overlay" :class="{ active: isFading }"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWasd } from './components/controlChar'
import { lastTransition } from './gameState'
import HudPanel       from './components/HudPanel.vue'
import InventoryPanel from './components/InventoryPanel.vue'
import EquipmentPanel from './components/EquipmentPanel.vue'
import MapPanel       from './components/MapPanel.vue'

const router   = useRouter()
const isFading = ref(lastTransition.value === 'second-to-main')
const startY   = lastTransition.value === 'second-to-main' ? 2050 : 1000

// Estado de paneles
const showPanel   = ref(null)   // 'inventory' | 'equipment' | null
const showMapPanel = ref(false)

function openPanel(name) {
  showMapPanel.value = false
  showPanel.value = name
}

function toggleMap() {
  showPanel.value = null
  showMapPanel.value = !showMapPanel.value
}

function handleLogout() {
  // TODO: Keycloak logout cuando se active la autenticación
}

// Movimiento del personaje
const { arenaRef, x, y, focused, moving, locked } = useWasd(1000, startY)

// Cámara centrada en el jugador
const cameraTransform = computed(() => {
  const zoom      = 2
  const WORLD     = 2000
  const cx        = window.innerWidth / 2
  const cy        = window.innerHeight / 2
  const halfW     = cx / zoom
  const halfH     = cy / zoom
  const targetX   = Math.max(halfW, Math.min(x.value + 20, WORLD - halfW))
  const targetY   = Math.max(halfH, Math.min(y.value + 20, WORLD - halfH))
  return `translate(${cx}px, ${cy}px) scale(${zoom}) translate(-${targetX}px, -${targetY}px)`
})

// Entrada desde SecondView (transición)
onMounted(() => {
  if (lastTransition.value === 'second-to-main') {
    locked.value = true
    moving.value = true
    setTimeout(() => { isFading.value = false }, 50)
    const enterLoop = () => {
      y.value -= 4
      if (y.value <= 1950) {
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

// Salida hacia SecondView (caminar al borde inferior)
watch([x, y], ([newX, newY]) => {
  const WORLD_H = 2000
  const PLAYER  = 40
  if (!locked.value && newY >= WORLD_H - PLAYER && newX > 800 && newX < 1200) {
    locked.value = true
    moving.value = true
    isFading.value = true
    const exitLoop = () => {
      y.value += 4
      if (y.value >= WORLD_H + 60) {
        lastTransition.value = 'main-to-second'
        router.push({ name: 'SecondGame' })
      } else {
        requestAnimationFrame(exitLoop)
      }
    }
    requestAnimationFrame(exitLoop)
  }
})
</script>

<style scoped>
.viewport {
  width: 100vw; height: 100vh; position: fixed; top: 0; left: 0;
  outline: none; overflow: hidden; background-color: #335b2f;
  font-family: 'Press Start 2P', 'Courier New', monospace;
}
.world { position: absolute; width: 2000px; height: 2000px; transform-origin: 0 0; will-change: transform; }
.grid {
  position: absolute; width: 100%; height: 100%;
  background-image:
    linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size: 50px 50px; z-index: 1;
}
/* Terrenos */
.terrain { position: absolute; image-rendering: pixelated; z-index: 0; }
.grassland {
  inset: 0;
  background:
    linear-gradient(90deg, rgba(255,255,255,.05) 4px, transparent 4px),
    linear-gradient(rgba(255,255,255,.05) 4px, transparent 4px),
    #5ea650;
  background-size: 40px 40px, 40px 40px, auto;
}
.forest-zone {
  left: 120px; top: 140px; width: 760px; height: 640px;
  border: 6px solid #214724;
  background:
    radial-gradient(circle at 20% 35%, #2f7b36 18px, transparent 19px),
    radial-gradient(circle at 60% 30%, #2f7b36 18px, transparent 19px),
    radial-gradient(circle at 35% 70%, #2f7b36 18px, transparent 19px),
    radial-gradient(circle at 78% 62%, #2f7b36 18px, transparent 19px),
    #3b8a42;
  background-size: 140px 140px;
}
.mountain-zone {
  right: 180px; top: 150px; width: 680px; height: 480px;
  border: 6px solid #535353;
  background:
    linear-gradient(45deg,  #8f8f8f 25%, transparent 25%),
    linear-gradient(-45deg, #8f8f8f 25%, transparent 25%),
    linear-gradient(45deg,  transparent 75%, #8f8f8f 75%),
    linear-gradient(-45deg, transparent 75%, #8f8f8f 75%),
    #707070;
  background-size: 46px 46px;
}
.lake-zone {
  right: 220px; bottom: 190px; width: 620px; height: 420px;
  border: 6px solid #1e4f84;
  background:
    linear-gradient(90deg, rgba(255,255,255,.08) 4px, transparent 4px),
    linear-gradient(rgba(255,255,255,.08) 4px, transparent 4px),
    #3f86db;
  background-size: 40px 40px;
}
.road-main   { left: 130px; top: 980px;  width: 1740px; height: 72px;   border: 4px solid #5d4524; background: #b58956; }
.road-cross  { left: 970px; top: 290px;  width: 72px;   height: 1500px; border: 4px solid #5d4524; background: #b58956; }
.village-zone {
  left: 230px; top: 1130px; width: 300px; height: 220px;
  border: 5px solid #6a361f;
  background:
    linear-gradient(90deg, #9f5f3e 22px, transparent 22px),
    linear-gradient(#9f5f3e 22px, transparent 22px),
    #c98259;
  background-size: 70px 70px;
}
.ruins-zone {
  left: 1180px; top: 640px; width: 340px; height: 220px;
  border: 5px solid #4b3f31;
  background:
    linear-gradient(45deg,  #7f7264 25%, transparent 25%),
    linear-gradient(-45deg, #7f7264 25%, transparent 25%),
    linear-gradient(45deg,  transparent 75%, #7f7264 75%),
    linear-gradient(-45deg, transparent 75%, #7f7264 75%),
    #9a8b79;
  background-size: 36px 36px;
}
/* Jugador */
.player {
  position: absolute; width: 40px; height: 40px;
  border-radius: 6px; transition: background .1s;
  box-shadow: 0 4px 15px rgba(0,0,0,.3); z-index: 2;
}
/* Logo */
.game-logo {
  position: absolute; right: 18px; top: 18px;
  width: 108px; height: 108px; object-fit: contain;
  z-index: 30; filter: drop-shadow(0 6px 14px rgba(0,0,0,.45));
}
/* Fade */
.fade-overlay {
  position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: black; opacity: 0; pointer-events: none;
  transition: opacity .5s ease-in-out; z-index: 1000;
}
.fade-overlay.active { opacity: 1; }
</style>
