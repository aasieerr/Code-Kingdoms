<template>
  <div
    class="viewport"
    ref="arenaRef"
    tabindex="0"
    @click="arenaRef.focus()"
    @keydown="onMainPanelHotkey"
    @focus="focused = true"
    @blur="focused = false"
  >
    <!-- Mundo de juego -->
    <div class="scanlines"></div>
    <div class="game-bg"></div>
    <div class="world" :style="{ transform: cameraTransform }">
      <div class="grid"></div>
      <div class="terrain kingdom-lobby" :style="kingdomLobbyStyle"></div>
      <div
        class="skin-shop-wardrobe"
        :style="skinShopMarkerStyle"
        aria-hidden="true"
      >
        <span class="skin-shop-wardrobe__tag">APARIENCIA</span>
      </div>
      <div
        class="player"
        :class="{ 'is-moving': moving }"
        :style="{
          left: x + 'px',
          top: y + 'px',
        }"
      >
        <div v-if="cosmeticPortraitSrc" class="player__cosmetic">
          <img class="player__cosmetic-img" :src="cosmeticPortraitSrc" alt="">
        </div>
        <div v-else-if="characterStore.spriteData && !isEmptySprite(characterStore.spriteData)" class="player__sprite">
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

      <!-- NPCs -->
      <NpcSprite
        v-for="npc in npcs"
        :key="npc.id"
        :npc="npc"
        :is-near="getIsNear(npc)"
        @interact="openDialogue"
      />
    </div>

    <p
      v-if="inSkinShopZone && !showSkinShop && !showMicropay"
      class="shop-hint"
    >
      Pulsa <kbd>{{ keyLabel(settings.keybinds.interact) }}</kbd> - Apariencia
    </p>

    <!-- Logo -->
    <img class="game-logo" src="/code-kingdoms-logo.png" alt="Code Kingdoms logo" />

    <WalletBar
      :gold="characterStore.gold"
      :code-coins="characterStore.codeCoins"
      :level="characterStore.level"
      @open-micropay="showMicropay = !showMicropay"
    />


    <!-- HUD -->
    <HudPanel
      :map-open="showMapPanel"
      :player-facing="facing"
      @open-inventory="openPanel('inventory')"
      @open-equipment="openPanel('equipment')"
      @open-stats="showStats = true"
      @toggle-map="toggleMap"
      @character-menu="goCharacterMenu"
      @open-settings="showSettings = true"
      @logout="handleLogout"
    />

    <!-- Panel inventario -->
    <InventoryPanel
      v-if="showPanel === 'inventory' || showPanel === 'shop'"
      :is-shop="showPanel === 'shop'"
      :shop-type="lastOpenedShopType"
      @close="showPanel = null"
      @switch-panel="openPanel"
    />

    <!-- Panel equipo -->
    <EquipmentPanel
      v-show="showPanel === 'equipment'"
      @close="showPanel = null"
      @switch-panel="openPanel"
    />

    <SkinShopPanel
      v-if="showSkinShop"
      @close="showSkinShop = false"
      @wallet-updated="refreshWallet"
    />

    <MicropayModal v-if="showMicropay" @close="showMicropay = false" />
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
    <StatsPanel v-if="showStats" @close="showStats = false" />

    <!-- Mapa -->
    <MapPanel
      v-if="showMapPanel"
      :player-x="x"
      :player-y="y"
      :npcs="npcs"
      :map-image="currentLobbyMapImage"
      :map-name="currentLobbyMapName"
      :world-width="WORLD_WIDTH"
      :world-height="MAIN_WORLD_HEIGHT"
      @close="showMapPanel = false"
    />

    <!-- Diálogos NPC -->
    <DialogueModal
      v-if="npcsManager.activeDialogueNpc.value"
      :npc="npcsManager.activeDialogueNpc.value"
      @close="npcsManager.activeDialogueNpc.value = null"
      @open-shop="handleOpenShop"
      @open-stage-selector="handleOpenStageSelector"
    />

    <StageSelectorPanel
      v-if="showPanel === 'stage-selector'"
      @close="showPanel = null"
      @select-stage="goToStage"
    />

    <!-- Tutorial y Ayudas (Fuera del mundo, en la UI) -->
    <TutorialOverlay
      :is-php="isPlayerPhp"
      @tutorial-finished="onTutorialFinished"
    />

    <TutorialArrow
      v-if="!arenaVisited && activeCharacterId"
      :player-x="x"
      :player-y="y"
      :target-x="WORLD_WIDTH / 2"
      :target-y="isPlayerPhp ? 40 : MAIN_WORLD_HEIGHT - 80"
      :cam-x="cameraPos.x"
      :cam-y="cameraPos.y"
      :is-php="isPlayerPhp"
      :character-id="activeCharacterId"
    />

    <!-- Fade de transición -->
    <div class="fade-overlay" :class="{ active: isFading }"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWasd } from './components/controlChar'
import { WORLD_EDGE, WORLD_WIDTH, PORTAL_HALF_WIDTH } from './constants/world'
import { lastTransition, activeCharacterId, setActiveCharacterId } from './gameState'
import { useAuthStore } from './stores/auth'
import { ensureActiveCharacterId, fetchCharacter } from './api/character'
import { useNpcs } from './composables/useNpcs'
import HudPanel from './components/HudPanel.vue'
import StatsPanel from './components/StatsPanel.vue'
import InventoryPanel from './components/InventoryPanel.vue'
import EquipmentPanel from './components/EquipmentPanel.vue'
import MapPanel       from './components/MapPanel.vue'
import WalletBar      from './components/WalletBar.vue'
import SkinShopPanel  from './components/SkinShopPanel.vue'
import MicropayModal  from './components/MicropayModal.vue'
import SettingsModal  from './components/SettingsModal.vue'
import NpcSprite      from './components/NpcSprite.vue'
import DialogueModal  from './components/DialogueModal.vue'
import StageSelectorPanel from './components/StageSelectorPanel.vue'
import TutorialOverlay from './components/TutorialOverlay.vue'
import TutorialArrow   from './components/TutorialArrow.vue'
import { useCharacterStore } from './stores/character'
import { useGameSettings } from './composables/useGameSettings'
import javaKingdomMap from './assets/maps/java-kingdom-map.png'
import phpKingdomMap from './assets/maps/php-kingdom-map.png'
import { parseSprite, isEmptySprite } from './utils/sprite'
import { isPlayerPhpKingdom } from './utils/realm'
import { SKIN_SHOP_LOBBY_ZONES } from './constants/skinShopLobby'
import { getDirectionalSkinWorldSrc, WARDROBE_LOBBY_IMAGE } from './constants/cosmeticVisuals'

const router        = useRouter()
const route = useRoute()
const MAIN_WORLD_HEIGHT = WORLD_EDGE
const worldWidthPx = `${WORLD_WIDTH}px`
const worldHeightPx = `${MAIN_WORLD_HEIGHT}px`
const isFading = ref(lastTransition.value === 'second-to-main' || lastTransition.value === 'menu-to-game')
const startY   = lastTransition.value === 'second-to-main' ? MAIN_WORLD_HEIGHT + 50 : MAIN_WORLD_HEIGHT / 2

// Estado de paneles
const showPanel   = ref(null)   // 'inventory' | 'equipment' | null
const showMapPanel = ref(false)
const showSkinShop = ref(false)
const showMicropay = ref(false)
const showSettings = ref(false)
const showStats = ref(false)
const authStore = useAuthStore()
const characterStore = useCharacterStore()
const isPlayerPhp = computed(() =>
  isPlayerPhpKingdom(characterStore.kingdomName, characterStore.kingdomId),
)
const { keyMatches, keyLabel, settings } = useGameSettings()
const lastOpenedShopType = ref(null)

const showTutorial = ref(false)
const arenaVisited = ref(false)

function checkTutorialState() {
  const id = activeCharacterId.value
  if (id) {
    arenaVisited.value = localStorage.getItem(`ck_arena_v1_${id}`) === 'true'
  }
}

function onTutorialFinished() {
  showTutorial.value = false
}


// Monedero y apariencia

const colorStill = ref('#e94560')
const colorMoving = ref('#f5a623')


// Movimiento del personaje
const { arenaRef, x, y, focused, moving, locked, facing } = useWasd(
  WORLD_WIDTH / 2,
  startY,
  WORLD_WIDTH,
  MAIN_WORLD_HEIGHT,
  computed(() => characterStore.speed)
)

// Bloquear inmediatamente si venimos de otra escena para evitar rebotes
if (lastTransition.value === 'second-to-main') {
  locked.value = true
}

// NPCs
const npcsManager = useNpcs('MainGame', x, y)
const {
  npcs,
  loadNpcs,
  getIsNear,
  openDialogue
} = npcsManager

const skinShopRect = computed(() => (
  isPlayerPhp.value ? SKIN_SHOP_LOBBY_ZONES.php : SKIN_SHOP_LOBBY_ZONES.java
))

const cosmeticPortraitSrc = computed(() =>
  getDirectionalSkinWorldSrc(characterStore.equippedSkin?.slug, facing.value),
)

const skinShopMarkerStyle = computed(() => {
  const z = skinShopRect.value
  return {
    left: `${z.x}px`,
    top: `${z.y}px`,
    width: `${z.w}px`,
    height: `${z.h}px`,
    backgroundImage: `url(${WARDROBE_LOBBY_IMAGE})`,
  }
})

const inSkinShopZone = computed(() => {
  const ax = x.value
  const ay = y.value
  const z = skinShopRect.value
  const p = z.pad
  return (
    ax >= z.x - p
    && ax <= z.x + z.w + p
    && ay >= z.y - p
    && ay <= z.y + z.h + p
  )
})

// Cámara centrada en el jugador
const cameraPos = computed(() => {
  const zoom      = 2
  const cx        = window.innerWidth / 2
  const cy        = window.innerHeight / 2
  const halfW     = cx / zoom
  const halfH     = cy / zoom
  const targetX   = Math.max(halfW, Math.min(x.value + 20, WORLD_WIDTH - halfW))
  const targetY   = Math.max(halfH, Math.min(y.value + 20, MAIN_WORLD_HEIGHT - halfH))
  return { x: targetX, y: targetY }
})

const cameraTransform = computed(() => {
  const cx        = window.innerWidth / 2
  const cy        = window.innerHeight / 2
  const { x: tx, y: ty } = cameraPos.value
  return `translate(${cx}px, ${cy}px) scale(2) translate(-${tx}px, -${ty}px)`
})

async function refreshWallet() {
  await characterStore.refresh()
  if (characterStore.equippedSkin) {
    colorStill.value = characterStore.equippedSkin.color_still
    colorMoving.value = characterStore.equippedSkin.color_moving
  }
}

// Bloquear movimiento si hay paneles abiertos
watch(
  [showPanel, showMapPanel, showSkinShop, showMicropay, showSettings, npcsManager.activeDialogueNpc, showTutorial],
  ([p, m, s, mi, st, d, t]) => {
    // Si hay algo abierto, bloqueamos. Si no, desbloqueamos (a menos que estemos en transición)
    if (p || m || s || mi || st || d || t) {
      locked.value = true
    } else if (!isFading.value && !navigating.value) {
      locked.value = false
    }
  }
)

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

function goCharacterMenu() {
  router.push({ name: 'CharacterMenu' })
}

async function handleLogout() {
  setActiveCharacterId(null)
  await authStore.logout()
  router.push({ name: 'Login' })
}

function onSkinShopKey(e) {
  if (showSettings.value) {
    return
  }
  if (!keyMatches(e, 'interact')) {
    return
  }
  if (showSkinShop.value || showMicropay.value) {
    return
  }
  if (showMapPanel.value || showPanel.value) {
    return
  }
  if (!inSkinShopZone.value) {
    // Check for NPCs
    const nearNpc = npcs.value.find(n => getIsNear(n))
    if (nearNpc) {
      e.preventDefault()
      openDialogue(nearNpc)
      return
    }
    return
  }
  e.preventDefault()
  showSkinShop.value = true
}

function onMainPanelHotkey(e) {
  if (route.name !== 'Game') return
  const tag = String(e.target?.tagName || '').toUpperCase()
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return
  if (showMicropay.value || showSkinShop.value || npcsManager.activeDialogueNpc.value) return
  const key = String(e.key || '').toLowerCase()
  if (key === 'escape') {
    e.preventDefault()
    showSettings.value = true
    showMapPanel.value = false
    return
  }
  if (key === 'i') {
    e.preventDefault()
    showMapPanel.value = false
    showPanel.value = showPanel.value === 'inventory' ? null : 'inventory'
    return
  }
  if (keyMatches(e, 'equipment')) {
    e.preventDefault()
    showMapPanel.value = false
    showPanel.value = showPanel.value === 'equipment' ? null : 'equipment'
    return
  }
  if (keyMatches(e, 'map')) {
    e.preventDefault()
    showPanel.value = null
    showMapPanel.value = !showMapPanel.value
  }
}

const navigating = ref(false)
const portalCooldown = ref(true)

const kingdomLobbyStyle = computed(() => ({
  backgroundImage: `url(${isPlayerPhp.value ? phpKingdomMap : javaKingdomMap})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%',
  backgroundPosition: 'center',
}))
const currentLobbyMapImage = computed(() => (
  isPlayerPhp.value ? phpKingdomMap : javaKingdomMap
))
const currentLobbyMapName = computed(() => (
  isPlayerPhp.value ? 'REINO PHP (LOBBY)' : 'REINO JAVA (LOBBY)'
))

// Entrada desde SecondView o CharacterMenu (transición)
onMounted(async () => {
  window.addEventListener('keydown', onSkinShopKey)

  try {
    await refreshWallet()
    const imgSrc = isPlayerPhp.value ? phpKingdomMap : javaKingdomMap
    await new Promise(resolve => {
      if (!imgSrc) return resolve()
      const img = new Image()
      img.onload = resolve
      img.onerror = resolve
      img.src = imgSrc
    })
  } catch (err) {
    console.error("Error inicial en MainView:", err)
  }

  const playerPhp = isPlayerPhp.value
  if (lastTransition.value === 'second-to-main') {
    y.value = playerPhp ? -50 : MAIN_WORLD_HEIGHT + 50
  }

  if (lastTransition.value === 'second-to-main') {
    locked.value = true
    moving.value = true
    isFading.value = true

    // Pequeña espera para asegurar que el componente se asiente
    setTimeout(() => {
      isFading.value = false
      const enterLoop = () => {
        const reachedTarget = playerPhp ? y.value >= 180 : y.value <= MAIN_WORLD_HEIGHT - 180
        if (reachedTarget) {
          locked.value = false
          moving.value = false
          lastTransition.value = null
          setTimeout(() => { portalCooldown.value = false }, 500)
          return
        }
        y.value += playerPhp ? 5 : -5
        requestAnimationFrame(enterLoop)
      }
      requestAnimationFrame(enterLoop)
    }, 100)
  } else if (lastTransition.value === 'menu-to-game') {
    // Transición desde el menú de personajes
    isFading.value = true
    locked.value = true
    // Comprobar arena visit DESPUÉS de que el personaje esté cargado
    await refreshWallet()
    checkTutorialState()

    setTimeout(() => {
      isFading.value = false
      locked.value = false
      lastTransition.value = null
      portalCooldown.value = false
    }, 600)
  } else {
    // F5 / recarga directa en /game
    checkTutorialState()
    isFading.value = false
    locked.value = false
    portalCooldown.value = false
  }
})

function handleOpenShop(npc) {
  try {
    lastOpenedShopType.value = npc?.shop_type || null
    // cerrar diálogo y abrir panel tienda
    npcsManager.activeDialogueNpc.value = null
    openPanel('shop')
  } catch (err) {
    console.error('Error abriendo tienda:', err)
  }
}

function handleOpenStageSelector(npc) {
  npcsManager.activeDialogueNpc.value = null
  openPanel('stage-selector')
}

function goToStage(stageNum) {
  showPanel.value = null
  navigating.value = true
  locked.value = true
  moving.value = true
  isFading.value = true

  lastTransition.value = 'main-to-second'

  setTimeout(() => {
    router.push({ name: 'SecondGame', query: { section: stageNum, wave: 1 } }).catch(() => {
      navigating.value = false
      locked.value = false
    })
  }, 500)
}

// Salida hacia SecondView:
// - Java: borde inferior  - PHP: borde superior
// Se usa watchEffect para reaccionar también cuando characterStore carga datos del kingdom.
watchEffect(() => {
  if (locked.value || navigating.value || portalCooldown.value) return

  const PLAYER = 40
  const cx = WORLD_WIDTH / 2
  const playerPhp = isPlayerPhp.value
  const curX = x.value
  const curY = y.value
  const inPortalX = curX > cx - PORTAL_HALF_WIDTH && curX < cx + PORTAL_HALF_WIDTH
  const isAtPortalEdge = playerPhp ? curY <= 0 : curY >= MAIN_WORLD_HEIGHT - PLAYER

  if (isAtPortalEdge && inPortalX) {
    navigating.value = true
    locked.value = true
    moving.value = true
    isFading.value = true
    
    // Marcar arena como visitada
    localStorage.setItem(`ck_arena_v1_${activeCharacterId.value}`, 'true')
    arenaVisited.value = true

    const exitLoop = () => {
      y.value += playerPhp ? -5 : 5
      const outOfBounds = playerPhp ? y.value <= -80 : y.value >= MAIN_WORLD_HEIGHT + 80
      if (outOfBounds) {
        lastTransition.value = 'main-to-second'
        router.push({ name: 'SecondGame' }).catch(() => {
          navigating.value = false
          locked.value = false
        })
      } else {
        requestAnimationFrame(exitLoop)
      }
    }
    requestAnimationFrame(exitLoop)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onSkinShopKey)
})
</script>

<style scoped>
.viewport {
  width: 100vw; height: 100vh; position: fixed; top: 0; left: 0;
  outline: none; overflow: hidden; background-color: #0b0d17;
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
  width: v-bind(worldWidthPx);
  height: v-bind(worldHeightPx);
  transform-origin: 0 0;
  will-change: transform;
}
.grid {
  position: absolute; width: 100%; height: 100%;
  background-image:
    linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size: 50px 50px; z-index: 1;
}
/* Terrenos */
.terrain { position: absolute; image-rendering: pixelated; z-index: 0; }
.skin-shop-wardrobe {
  position: absolute;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 0 2px 1px;
  background-size: 48px auto;
  background-repeat: no-repeat;
  background-position: center 2px;
  border: none;
  border-radius: 0;
  pointer-events: none;
  animation: skin-shop-pulse 2.2s ease-in-out infinite;
  box-shadow: none;
}
.skin-shop-wardrobe__tag {
  font-size: 5px;
  line-height: 1.2;
  text-align: center;
  color: #fffef5;
  text-shadow:
    0 0 6px #000,
    0 0 3px #000,
    0 1px 3px #000;
  padding: 2px 4px;
  background: rgba(0, 0, 0, 0.45);
  border: none;
  border-radius: 2px;
  max-width: 100%;
  white-space: nowrap;
}
@keyframes skin-shop-pulse {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; }
}
.kingdom-lobby {
  inset: 0;
}
.grassland {
  inset: 0;
  background:
    linear-gradient(90deg, rgba(255,255,255,.05) 4px, transparent 4px),
    linear-gradient(rgba(255,255,255,.05) 4px, transparent 4px),
    #5ea650;
  background-size: 40px 40px, 40px 40px, auto;
}
.forest-zone {
  left: 72px; top: 84px; width: 456px; height: 384px;
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
  right: 108px; top: 90px; width: 408px; height: 288px;
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
  right: 132px; bottom: 114px; width: 372px; height: 252px;
  border: 6px solid #1e4f84;
  background:
    linear-gradient(90deg, rgba(255,255,255,.08) 4px, transparent 4px),
    linear-gradient(rgba(255,255,255,.08) 4px, transparent 4px),
    #3f86db;
  background-size: 40px 40px;
}
.road-main   { left: 78px; top: 588px;  width: 1044px; height: 43px;   border: 4px solid #5d4524; background: #b58956; }
.road-cross  { left: 582px; top: 174px;  width: 43px;   height: 900px; border: 4px solid #5d4524; background: #b58956; }
.village-zone {
  left: 138px; top: 678px; width: 180px; height: 132px;
  border: 5px solid #6a361f;
  background:
    linear-gradient(90deg, #9f5f3e 22px, transparent 22px),
    linear-gradient(#9f5f3e 22px, transparent 22px),
    #c98259;
  background-size: 70px 70px;
}
.ruins-zone {
  left: 708px; top: 384px; width: 204px; height: 132px;
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
  z-index: 2;
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
  transition: background .1s;
}

.player__cosmetic {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.player__cosmetic-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  image-rendering: pixelated;
  flex-shrink: 0;
}

.player__sprite {
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
/* Logo */
.game-logo {
  position: absolute; right: 18px; top: 18px;
  width: 108px; height: 108px; object-fit: contain;
  z-index: 30; filter: drop-shadow(0 6px 14px rgba(0,0,0,.45));
}
/* Fade */
.fade-overlay {
  position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: #0b0d17; opacity: 0; pointer-events: none;
  transition: opacity .5s ease-in-out; z-index: 1000;
}
.fade-overlay.active { opacity: 1; }
.shop-hint {
  position: absolute;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  z-index: 20;
  margin: 0;
  font-size: 8px;
  color: #fff8e1;
  text-shadow: 0 1px 2px #000;
  pointer-events: none;
}
.shop-hint kbd {
  display: inline-block;
  border: 2px solid #333;
  background: #222;
  color: #ffcc80;
  padding: 2px 6px;
  font-size: 9px;
  font-family: inherit;
  margin: 0 2px;
}
</style>
