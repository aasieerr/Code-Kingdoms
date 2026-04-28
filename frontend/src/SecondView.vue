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
        v-for="s in slashes"
        :key="s.id"
        class="slash-container"
        :style="{
          left: s.x + 'px',
          top: s.y + 'px',
          '--angle': (s.angle + Math.PI / 2) + 'rad'
        }"
      >
        <div class="slash-effect"></div>
      </div>

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

    <!-- PREMIUM ARENA HUD -->
    <div class="premium-arena-hud">
      <!-- Wave Info -->
      <div class="hud-top-center">
        <div class="wave-display">
          <span class="wave-label">RONDA</span>
          <span class="wave-number">{{ wave }}</span>
        </div>
      </div>

      <!-- Player Stats (Left) -->
      <div class="hud-stats-left">
        <div class="gold-display">
          <div class="gold-item current">
            <span class="gold-icon">🪙</span>
            <span class="gold-val">{{ sessionGold }}</span>
            <span class="gold-lbl">RUN</span>
          </div>
          <div class="gold-item bank">
            <span class="gold-icon">🏛️</span>
            <span class="gold-val">{{ characterStore.gold }}</span>
            <span class="gold-lbl">BANCO</span>
          </div>
        </div>

        <div class="hp-container">
          <div class="hp-label">SISTEMA VITAL</div>
          <div class="hp-bar-frame">
            <div class="hp-bar-fill" :style="{ width: playerHpPct + '%' }">
              <div class="hp-glow"></div>
            </div>
          </div>
          <div class="hp-numeric">{{ playerHp }} / {{ playerMaxHp }}</div>
        </div>
      </div>

      <!-- Controls Hint (Bottom) -->
      <div class="hud-bottom-hints">
        <div class="hint-pill">
          <span class="key">WASD</span> MOVIMIENTO
        </div>
        <div class="hint-pill">
          <span class="key">I</span> MOCHILA
        </div>
        <div class="hint-pill">
          <span class="key">K</span> EQUIPO
        </div>
        <div class="hint-pill">
          <span class="key">M</span> MAPA
        </div>
      </div>
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

    <!-- PREMIUM MODALS -->
    <div v-if="phase === 'between'" class="premium-overlay">
      <div class="premium-modal victory">
        <div class="modal-shine"></div>
        <h2 class="modal-title">¡RONDA {{ wave }} COMPLETADA!</h2>
        <div class="modal-body">
          <p class="reward-text">HAS RECOLECTADO <span>{{ sessionGold }}</span> MONEDAS DE ORO</p>
          <p class="action-hint">EQUIPA ÍTEMS EN EL PANEL O SIGUE LUCHANDO</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-continue" @click="startNextWave">CONTINUAR BATALLA</button>
          <button type="button" class="btn-exit" @click="leaveArena">VOLVER AL REINO</button>
        </div>
      </div>
    </div>

    <div v-if="phase === 'gameover'" class="premium-overlay">
      <div class="premium-modal defeat">
        <div class="modal-shine"></div>
        <h2 class="modal-title">DERROTA EN COMBATE</h2>
        <div class="modal-body">
          <p class="summary">CAÍSTE EN LA RONDA <span>{{ wave }}</span></p>
          <p class="reward-text">ORO ASEGURADO: <span>{{ sessionGold }}</span> 🪙</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-exit" @click="leaveArena">RETIRARSE AL REINO</button>
        </div>
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
  slashes,
  startNextWave,
  beginFirstWave,
} = useArenaCombat({
  startX: WORLD_EDGE / 2,
  startY,
  equippedWeapon: computed(() => characterStore.equippedWeapon),
  characterClass: computed(() => characterStore.characterClass),
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

// Bloquear movimiento si hay paneles abiertos
watch(
  [showPanel, showMapPanel, showMicropay, phase],
  ([p, m, mi, ph]) => {
    // Si hay algo abierto o fase especial, bloqueamos.
    if (p || m || mi || ph === 'between' || ph === 'gameover') {
      locked.value = true
    } else if (!isFading.value && !navigating.value) {
      locked.value = false
    }
  }
)

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
  if (navigating.value) return
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
    phase.value === 'idle'
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

.slash-container {
  position: absolute;
  z-index: 6;
  pointer-events: none;
  transform: translate(-50%, -50%) rotate(var(--angle));
}
.slash-effect {
  width: 220px;
  height: 220px;
  border: 12px solid transparent;
  border-top: 12px solid #ffffff;
  border-radius: 50%;
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8));
  animation: slash-anim 0.25s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
}
@keyframes slash-anim {
  0% { transform: rotate(-70deg) scale(0.7); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: rotate(70deg) scale(1.1); opacity: 0; }
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

/* PREMIUM ARENA HUD */
.premium-arena-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  padding: 40px;
  font-family: 'Press Start 2P', monospace;
}

.hud-top-center {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
}

.wave-display {
  background: rgba(15, 23, 42, 0.9);
  border: 4px solid #facc15;
  padding: 15px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 0 20px rgba(250, 204, 21, 0.2);
}

.wave-label { font-size: 8px; color: #facc15; opacity: 0.7; }
.wave-number { font-size: 24px; color: white; text-shadow: 0 0 10px rgba(255,255,255,0.3); }

.hud-stats-left {
  position: absolute;
  top: 40px;
  left: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gold-display {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gold-item {
  background: rgba(15, 23, 42, 0.8);
  border-left: 4px solid #facc15;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.gold-icon { font-size: 16px; }
.gold-val { font-size: 12px; color: white; }
.gold-lbl { font-size: 6px; color: #facc15; opacity: 0.6; }

.hp-container {
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hp-label { font-size: 7px; color: #facc15; }
.hp-bar-frame {
  height: 20px;
  background: #0b0d17;
  border: 2px solid #334155;
  padding: 2px;
}

.hp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #b91c1c, #ef4444);
  position: relative;
  transition: width 0.3s ease-out;
}

.hp-glow {
  position: absolute;
  inset: 0;
  background: white;
  opacity: 0.2;
  filter: blur(4px);
}

.hp-numeric { font-size: 7px; text-align: right; color: white; opacity: 0.6; }

.hud-bottom-hints {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
}

.hint-pill {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(250, 204, 21, 0.2);
  padding: 8px 16px;
  font-size: 6px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 10px;
}

.key {
  color: #facc15;
  background: rgba(250, 204, 21, 0.1);
  padding: 4px 6px;
  border: 1px solid #facc15;
}

/* PREMIUM MODALS */
.premium-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.premium-modal {
  width: 500px;
  background: #0f172a;
  border: 4px solid #facc15;
  box-shadow: 0 0 50px rgba(0,0,0,0.5), inset 0 0 100px rgba(250, 204, 21, 0.05);
  position: relative;
  overflow: hidden;
  padding: 40px;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  animation: modal-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-enter {
  from { transform: scale(0.9) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.modal-shine {
  position: absolute;
  top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle, rgba(250, 204, 21, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.modal-title {
  font-size: 18px;
  color: #facc15;
  margin-bottom: 30px;
  text-shadow: 0 0 10px rgba(250, 204, 21, 0.4);
}

.modal-body {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reward-text { font-size: 10px; color: #cbd5e1; }
.reward-text span { color: #facc15; font-size: 14px; }

.action-hint { font-size: 7px; color: #64748b; }

.modal-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-continue, .btn-exit {
  padding: 20px;
  border: 4px solid #facc15;
  background: #ca8a04;
  color: white;
  font-family: inherit;
  font-size: 10px;
  cursor: pointer;
  box-shadow: 4px 4px 0 #854d0e;
  transition: all 0.1s;
}

.btn-continue:active, .btn-exit:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #854d0e;
}

.btn-exit { background: #991b1b; border-color: #ef4444; box-shadow: 4px 4px 0 #450a0a; }
.btn-exit:active { box-shadow: 2px 2px 0 #450a0a; }

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
</style>
