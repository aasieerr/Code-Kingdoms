<template>
  <div
    class="viewport"
    ref="arenaRef"
    tabindex="0"
    @click="arenaRef.focus()"
    @focus="focused = true"
    @blur="focused = false"
  >
    <!-- SCANLINES OVERLAY -->
    <div class="scanlines"></div>
    <div class="game-bg"></div>

    <div class="world" :style="{ transform: cameraTransform }">
      <div class="grid"></div>
      <div class="arena-floor"></div>

      <div
        v-for="e in enemies"
        :key="e.id"
        class="enemy"
        :style="{ left: e.x + 'px', top: e.y + 'px', width: ENEMY_SIZE + 'px', height: ENEMY_SIZE + 'px' }"
      >
        <span class="enemy-hp" :style="{ width: hpBarPct(e) + '%' }"></span>
      </div>

      <div
        v-for="c in coins"
        :key="c.id"
        class="coin-pickup"
        :style="{ left: c.x + 'px', top: c.y + 'px' }"
      >
        🪙
      </div>

      <div
        v-for="b in bullets"
        :key="b.id"
        class="bullet"
        :style="{ left: b.x + 'px', top: b.y + 'px' }"
      />

      <div
        class="player"
        :class="{ 'is-moving': moving }"
        :style="{
          left: x + 'px',
          top: y + 'px',
        }"
      >
        <div v-if="characterStore.spriteData && !isEmptySprite(characterStore.spriteData)" class="player__sprite">
          <div class="mini-grid">
            <div 
              v-for="(color, pIdx) in parseSprite(characterStore.spriteData)" 
              :key="pIdx"
              class="mini-grid__pixel"
              :style="{ backgroundColor: color || 'transparent' }"
            ></div>
          </div>
        </div>
        <div 
          v-else 
          class="player__fallback"
          :style="{ background: moving ? colorMoving : colorStill }"
        ></div>
      </div>
    </div>

    <!-- HUD -->
    <div class="arena-hud">
      <p class="hud-line wave-line">Ronda {{ wave }}</p>
      <p class="hud-line gold-line">
        <span class="lbl">Run</span> {{ sessionGold }} 🪙
        <span v-if="characterStore.gold !== null" class="wallet-rest"> · Banco {{ characterStore.gold }}</span>
      </p>

      <div class="hp-bar-outer">
        <div class="hp-bar-inner" :style="{ width: playerHpPct + '%' }"></div>
      </div>
      <p class="hud-hint hint-top">Norte — vuelve al reino</p>
      <p class="hud-hint hint-keys">WASD · disparo automático · <kbd>I</kbd> inventario · <kbd>K</kbd> equipo · <kbd>M</kbd> mapa</p>
    </div>

    <WalletBar
      :gold="characterStore.gold + sessionGold"
      :code-coins="characterStore.codeCoins"
      @open-micropay="showMicropay = !showMicropay"
    />


    <InventoryPanel
      v-show="showPanel === 'inventory'"
      @close="showPanel = null"
      @switch-panel="openPanel"
    />

    <EquipmentPanel
      v-show="showPanel === 'equipment'"
      @close="showPanel = null"
      @switch-panel="openPanel"
    />

    <MicropayModal v-if="showMicropay" @close="showMicropay = false" />

    <MapPanel
      v-if="showMapPanel"
      :player-x="x"
      :player-y="y"
      :npcs="[]"
      @close="showMapPanel = false"
    />

    <!-- Entre rondas -->
    <div v-if="phase === 'between'" class="modal-overlay" @click.self>
      <div class="modal-card">
        <h2>Ronda {{ wave }} completada</h2>
        <p>Tienes {{ sessionGold }} 🪙 esta run. Equipa ítems en el panel o sigue luchando.</p>
        <button type="button" class="btn-primary" @click="startNextWave">Siguiente ronda</button>
      </div>
    </div>

    <!-- Game over -->
    <div v-if="phase === 'gameover'" class="modal-overlay">
      <div class="modal-card">
        <h2>Derrota</h2>
        <p>
          Has llegado a la ronda {{ wave }} y reunido {{ sessionGold }} 🪙 en esta partida.
        </p>
        <button type="button" class="btn-primary" @click="leaveArena">Volver al reino</button>
      </div>
    </div>

    <img class="game-logo" src="/code-kingdoms-logo.png" alt="Code Kingdoms logo" />

    <div class="fade-overlay" :class="{ active: isFading }"></div>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useArenaCombat } from './composables/useArenaCombat'
import { WORLD_EDGE, PORTAL_HALF_WIDTH } from './constants/world'
import { lastTransition, activeCharacterId } from './gameState'
import { ensureActiveCharacterId, fetchCharacter, addCharacterGold } from './api/character'
import InventoryPanel from './components/InventoryPanel.vue'
import EquipmentPanel from './components/EquipmentPanel.vue'
import MapPanel from './components/MapPanel.vue'
import WalletBar from './components/WalletBar.vue'
import MicropayModal from './components/MicropayModal.vue'
import { useCharacterStore } from './stores/character'

function parseSprite(data) {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    return Array.isArray(parsed) ? parsed : Array(256).fill('')
  } catch {
    return Array(256).fill('')
  }
}

function isEmptySprite(data) {
  const pixels = parseSprite(data)
  return !pixels.some(p => p && p !== '')
}


const router = useRouter()
const worldEdgePx = `${WORLD_EDGE}px`
const isFading = ref(lastTransition.value === 'main-to-second')
const startY = lastTransition.value === 'main-to-second' ? -50 : WORLD_EDGE / 2

const showPanel = ref(null)
const showMapPanel = ref(false)
const showMicropay = ref(false)

const characterStore = useCharacterStore()
const colorStill = ref('#e94560')
const colorMoving = ref('#f5a623')
const navigating = ref(false)
const portalCooldown = ref(true)


const {
  arenaRef,
  x,
  y,
  focused,
  moving,
  locked,
  WORLD,
  ENEMY_SIZE,
  wave,
  phase,
  playerHp,
  playerMaxHp,
  sessionGold,
  enemies,
  bullets,
  coins,
  startNextWave,
  beginFirstWave,
} = useArenaCombat({
  startX: WORLD_EDGE / 2,
  startY,
})

// Bloquear inmediatamente si venimos de otra escena para evitar rebotes
if (lastTransition.value === 'main-to-second') {
  locked.value = true
}

function openPanel(name) {
  if (showPanel.value === name) {
    showPanel.value = null
  } else {
    showPanel.value = name
    showMapPanel.value = false
  }
}

function toggleMap() {
  showPanel.value = null
  showMapPanel.value = !showMapPanel.value
}

function onArenaPanelHotkey(e) {
  if (!focused.value || locked.value) {
    return
  }
  if (showMicropay.value) {
    return
  }
  const k = e.key.toLowerCase()
  if (!['i', 'k', 'm'].includes(k)) {
    return
  }
  e.preventDefault()
  if (k === 'i') {
    showPanel.value = showPanel.value === 'inventory' ? null : 'inventory'
    if (showPanel.value) {
      showMapPanel.value = false
    }
  } else if (k === 'k') {
    showPanel.value = showPanel.value === 'equipment' ? null : 'equipment'
    if (showPanel.value) {
      showMapPanel.value = false
    }
  } else if (k === 'm') {
    showMapPanel.value = !showMapPanel.value
    if (showMapPanel.value) {
      showPanel.value = null
    }
  }
}

const playerHpPct = computed(() => {
  const max = playerMaxHp.value || 1
  return Math.min(100, Math.round((100 * playerHp.value) / max))
})

function hpBarPct(e) {
  return Math.max(8, Math.round((100 * e.hp) / (e.maxHp || 1)))
}

/** Menos zoom = más área visible (ver enemigos a distancia). */
const CAMERA_ZOOM = 1.2

const cameraTransform = computed(() => {
  const zoom = CAMERA_ZOOM
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const halfViewW = cx / zoom
  const halfViewH = cy / zoom
  const targetX = Math.max(halfViewW, Math.min(x.value + 20, WORLD - halfViewW))
  const targetY = Math.max(halfViewH, Math.min(y.value + 20, WORLD - halfViewH))
  return `translate(${cx}px, ${cy}px) scale(${zoom}) translate(-${targetX}px, -${targetY}px)`
})

let sessionSynced = false

async function refreshWallet() {
  await characterStore.refresh()
  if (characterStore.equippedSkin) {
    colorStill.value = characterStore.equippedSkin.color_still
    colorMoving.value = characterStore.equippedSkin.color_moving
  } else {
    colorStill.value = '#e94560'
    colorMoving.value = '#f5a623'
  }
}


async function syncRunGoldOnce() {
  if (sessionSynced) return
  const delta = sessionGold.value
  if (delta <= 0) {
    sessionSynced = true
    return
  }
  try {
    const id = await ensureActiveCharacterId()
    if (id != null) {
      sessionSynced = true
      await addCharacterGold(id, delta)
      // Limpiar el oro de la sesión local una vez guardado en el servidor
      sessionGold.value = 0
      await refreshWallet()
    }
  } catch (err) {
    sessionSynced = false
    console.error("Error al sincronizar oro de la run:", err)
  }
}

async function leaveArena() {
  if (locked.value || navigating.value) return
  navigating.value = true
  locked.value = true
  
  try {
    await syncRunGoldOnce()
  } catch (err) {
    console.error("Fallo final de sync:", err)
  }
  
  isFading.value = true
  lastTransition.value = 'second-to-main'
  
  setTimeout(() => {
    router.push({ name: 'Game' }).catch(() => {
      navigating.value = false
      locked.value = false
    })
  }, 100)
}

onMounted(async () => {
  window.addEventListener('keydown', onArenaPanelHotkey)
  
  try {
    await refreshWallet()
  } catch (err) {
    console.error("Error inicial en SecondView:", err)
  }

  if (lastTransition.value === 'main-to-second') {
    locked.value = true
    moving.value = true
    isFading.value = true
    
    setTimeout(() => {
      isFading.value = false
      const enterLoop = () => {
        // Mover hasta y=180 para alejarnos bien del portal superior (y<=0)
        if (y.value >= 180) {
          locked.value = false
          moving.value = false
          lastTransition.value = null
          // Retrasar el fin del cooldown del portal
          setTimeout(() => { portalCooldown.value = false }, 500)
          // Retrasar inicio de combate
          setTimeout(() => {
            if (phase.value === 'idle') beginFirstWave()
          }, 400)
          return
        }
        y.value += 5
        requestAnimationFrame(enterLoop)
      }
      requestAnimationFrame(enterLoop)
    }, 100)
  } else {
    isFading.value = false
    locked.value = false
    portalCooldown.value = false
    if (phase.value === 'idle') beginFirstWave()
  }
})

watch([x, y], ([newX, newY]) => {
  if (locked.value || navigating.value || portalCooldown.value) return
  
  const cx = WORLD / 2
  if (
    phase.value !== 'gameover'
    && newY <= 0
    && newX > cx - PORTAL_HALF_WIDTH
    && newX < cx + PORTAL_HALF_WIDTH
  ) {
    leaveArena()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onArenaPanelHotkey)
  syncRunGoldOnce()
})

watch(phase, (p) => {
  if (p === 'gameover') {
    syncRunGoldOnce()
  }
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
  background-color: #0b0d17;
  font-family: 'Press Start 2P', monospace;
}

.scanlines {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
  opacity: 0.04;
  background: repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 2px);
}

.game-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: radial-gradient(circle at center, #1e3a8a33 0%, #0b0d17 70%);
}

.world {
  position: absolute;
  width: v-bind(worldEdgePx);
  height: v-bind(worldEdgePx);
  transform-origin: 0 0;
  will-change: transform;
}

.grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 1;
}

.arena-floor {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 50%, rgba(120, 180, 90, 0.35), transparent 55%),
    linear-gradient(180deg, #2d4a22 0%, #1e3518 100%);
}

.player {
  position: absolute;
  width: 40px;
  height: 40px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease-out;
}

.player.is-moving {
  animation: walking 0.25s infinite alternate ease-in-out;
}

@keyframes walking {
  0% { transform: translateY(0) rotate(-4deg); }
  100% { transform: translateY(-2px) rotate(4deg); }
}

.player__fallback {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  transition: background 0.1s;
}

.player__sprite {
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));
  image-rendering: pixelated;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(16, 2.5px);
  grid-template-rows: repeat(16, 2.5px);
  width: 40px;
  height: 40px;
}

.mini-grid__pixel {
  width: 2.5px;
  height: 2.5px;
}

.enemy {
  position: absolute;
  z-index: 3;
  border-radius: 4px;
  background: linear-gradient(145deg, #7c2525, #4a1518);
  border: 2px solid #2a0a0c;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.enemy-hp {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: #c62828;
  display: block;
}

.bullet {
  position: absolute;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  margin-top: -5px;
  border-radius: 50%;
  background: #ffeb3b;
  box-shadow: 0 0 8px #ff9800;
  z-index: 4;
}

.coin-pickup {
  position: absolute;
  width: 28px;
  height: 28px;
  z-index: 2;
  font-size: 18px;
  display: grid;
  place-items: center;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
  animation: coinbob 0.6s ease-in-out infinite alternate;
}

@keyframes coinbob {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-4px);
  }
}

.arena-hud {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: none;
}

.hud-line {
  margin: 0;
  font-size: 10px;
  font-family: 'Press Start 2P', monospace;
  color: #facc15;
  text-shadow: 2px 2px 0 #431407;
  letter-spacing: 1px;
}

.wave-line {
  background: rgba(11, 13, 23, 0.85);
  backdrop-filter: blur(8px);
  padding: 6px 16px;
  border: 2px solid #854d0e;
  box-shadow: 0 0 0 1px #facc15;
}

.gold-line {
  font-size: 8px;
  opacity: 0.9;
}

.hp-bar-outer {
  width: 320px;
  height: 16px;
  border: 3px solid #854d0e;
  background: #0b0d17;
  box-shadow: 0 0 0 1px #facc15, 0 4px 10px rgba(0,0,0,0.5);
  position: relative;
  overflow: hidden;
}

.hp-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #b91c1c);
  transition: width 0.3s ease-out;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.4);
}

.hud-hint {
  margin: 0;
  font-size: 7px;
  color: #fef9c3;
  opacity: 0.6;
  text-shadow: 1px 1px 0 #000;
}

.hint-top {
  color: #ffcc80;
}

.hud-hint kbd {
  display: inline-block;
  border: 2px solid #333;
  background: #222;
  color: #ffcc80;
  padding: 1px 5px;
  font-size: 7px;
  font-family: inherit;
  margin: 0 2px;
}

.game-logo {
  position: absolute;
  right: 18px;
  top: 18px;
  width: 108px;
  height: 108px;
  object-fit: contain;
  z-index: 30;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45));
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

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.72);
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal-card {
  max-width: 420px;
  border: 5px solid #1f1f1f;
  background: linear-gradient(180deg, #263238 0%, #1b2529 100%);
  box-shadow: 0 0 0 4px #607d8b;
  color: #eceff1;
  padding: 22px 20px;
  font-size: 10px;
  line-height: 1.6;
  text-align: center;
}

.modal-card h2 {
  margin: 0 0 12px;
  font-size: 12px;
  color: #c5e1a5;
}

.modal-card p {
  margin: 0 0 16px;
}

.btn-primary {
  border: 3px solid #1f1f1f;
  background: #8bc34a;
  color: #1b1b1b;
  padding: 10px 18px;
  font-size: 10px;
  cursor: pointer;
  font-family: inherit;
}
.btn-primary:hover {
  filter: brightness(1.08);
}
</style>
