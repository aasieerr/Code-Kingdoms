<template>
  <div
    class="viewport"
    ref="arenaRef"
    tabindex="0"
    @click="arenaRef.focus()"
    @focus="focused = true"
    @blur="focused = false"
  >
    <div class="game-scanlines"></div>
    <div class="game-bg"></div>
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
      <div
        class="player"
        :class="{ 'is-moving': moving }"
        :style="{ left: x + 'px', top: y + 'px' }"
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

      <!-- NPCs -->
      <NpcSprite
        v-for="npc in npcs"
        :key="npc.id"
        :npc="npc"
        :is-near="getIsNear(npc)"
        @interact="openDialogue"
      />
    </div>

    <p v-if="inSkinShopZone && !showSkinShop && !showMicropay" class="shop-hint">
      Pulsa <kbd>E</kbd> — Apariencia
    </p>

    <img class="game-logo" src="/code-kingdoms-logo.png" alt="Code Kingdoms logo" />

    <WalletBar
      :gold="characterStore.gold"
      :code-coins="characterStore.codeCoins"
      @open-micropay="showMicropay = !showMicropay"
    />

    <HudPanel
      :map-open="showMapPanel"
      @open-inventory="openPanel('inventory')"
      @open-equipment="openPanel('equipment')"
      @toggle-map="toggleMap"
      @character-menu="goCharacterMenu"
      @logout="handleLogout"
    />

    <InventoryPanel
      v-show="showPanel === 'inventory' || showPanel === 'shop'"
      :is-shop="showPanel === 'shop'"
      @close="showPanel = null"
      @switch-panel="openPanel"
    />

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

    <MapPanel
      v-if="showMapPanel"
      :player-x="x"
      :player-y="y"
      :npcs="npcs"
      @close="showMapPanel = false"
    />

    <DialogueModal
      v-if="npcsManager.activeDialogueNpc.value"
      :npc="npcsManager.activeDialogueNpc.value"
      @close="npcsManager.activeDialogueNpc.value = null"
      @open-shop="openPanel('shop')"
    />

    <div class="fade-overlay" :class="{ active: isFading }"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWasd } from './components/controlChar'
import { WORLD_EDGE, PORTAL_HALF_WIDTH } from './constants/world'
import { lastTransition, setActiveCharacterId } from './gameState'
import { useAuthStore } from './stores/auth'
import { useCharacterStore } from './stores/character'
import { useNpcs } from './composables/useNpcs'
import { parseSprite, isEmptySprite } from './utils/sprite'
import HudPanel       from './components/HudPanel.vue'
import InventoryPanel from './components/InventoryPanel.vue'
import EquipmentPanel from './components/EquipmentPanel.vue'
import MapPanel       from './components/MapPanel.vue'
import WalletBar      from './components/WalletBar.vue'
import SkinShopPanel  from './components/SkinShopPanel.vue'
import MicropayModal  from './components/MicropayModal.vue'
import NpcSprite      from './components/NpcSprite.vue'
import DialogueModal  from './components/DialogueModal.vue'

const router        = useRouter()
const worldEdgePx   = `${WORLD_EDGE}px`
const isFading      = ref(lastTransition.value === 'second-to-main' || lastTransition.value === 'menu-to-game')
const startY        = lastTransition.value === 'second-to-main' ? WORLD_EDGE + 50 : WORLD_EDGE / 2

const showPanel    = ref(null)
const showMapPanel = ref(false)
const showSkinShop = ref(false)
const showMicropay = ref(false)

const authStore      = useAuthStore()
const characterStore = useCharacterStore()
const colorStill     = ref('#e94560')
const colorMoving    = ref('#f5a623')

const { arenaRef, x, y, focused, moving, locked } = useWasd(WORLD_EDGE / 2, startY)

if (lastTransition.value === 'second-to-main') locked.value = true

const npcsManager = useNpcs('MainGame', x, y)
const { npcs, getIsNear, openDialogue } = npcsManager

const SKIN_SHOP = { x: 138, y: 678, w: 180, h: 132, pad: 24 }
const inSkinShopZone = computed(() => {
  const ax = x.value; const ay = y.value; const p = SKIN_SHOP.pad
  return ax >= SKIN_SHOP.x - p && ax <= SKIN_SHOP.x + SKIN_SHOP.w + p
      && ay >= SKIN_SHOP.y - p && ay <= SKIN_SHOP.y + SKIN_SHOP.h + p
})

const cameraTransform = computed(() => {
  const zoom = 2; const cx = window.innerWidth / 2; const cy = window.innerHeight / 2
  const halfW = cx / zoom; const halfH = cy / zoom
  const targetX = Math.max(halfW, Math.min(x.value + 20, WORLD_EDGE - halfW))
  const targetY = Math.max(halfH, Math.min(y.value + 20, WORLD_EDGE - halfH))
  return `translate(${cx}px, ${cy}px) scale(${zoom}) translate(-${targetX}px, -${targetY}px)`
})

async function refreshWallet() {
  await characterStore.refresh()
  if (characterStore.equippedSkin) {
    colorStill.value  = characterStore.equippedSkin.color_still
    colorMoving.value = characterStore.equippedSkin.color_moving
  }
}

watch(
  [showPanel, showMapPanel, showSkinShop, showMicropay, npcsManager.activeDialogueNpc],
  ([p, m, s, mi, d]) => {
    if (p || m || s || mi || d) {
      locked.value = true
    } else if (!isFading.value && !navigating.value) {
      locked.value = false
    }
  }
)

watch(npcs, (list) => {
  console.log(`NPCs cargados: ${list.length}`, list)
})

function openPanel(name) {
  showPanel.value  = showPanel.value === name ? null : name
  if (showPanel.value) showMapPanel.value = false
}
function toggleMap() {
  showPanel.value  = null
  showMapPanel.value = !showMapPanel.value
}
function goCharacterMenu() { router.push({ name: 'CharacterMenu' }) }
async function handleLogout() {
  setActiveCharacterId(null)
  await authStore.logout()
  router.push({ name: 'Login' })
}

function onSkinShopKey(e) {
  if (e.key.toLowerCase() !== 'e') return
  if (showSkinShop.value || showMicropay.value || showMapPanel.value || showPanel.value) return
  if (!inSkinShopZone.value) {
    const nearNpc = npcs.value.find(n => getIsNear(n))
    if (nearNpc) { e.preventDefault(); openDialogue(nearNpc) }
    return
  }
  e.preventDefault()
  showSkinShop.value = true
}

const navigating    = ref(false)
const portalCooldown = ref(true)

onMounted(async () => {
  window.addEventListener('keydown', onSkinShopKey)
  try { await refreshWallet() } catch (err) { console.error('Error inicial en MainView:', err) }

  if (lastTransition.value === 'second-to-main') {
    locked.value = true; moving.value = true; isFading.value = true
    setTimeout(() => {
      isFading.value = false
      const enterLoop = () => {
        if (y.value <= WORLD_EDGE - 180) {
          locked.value = false; moving.value = false
          lastTransition.value = null
          setTimeout(() => { portalCooldown.value = false }, 500)
          return
        }
        y.value -= 5; requestAnimationFrame(enterLoop)
      }
      requestAnimationFrame(enterLoop)
    }, 100)
  } else if (lastTransition.value === 'menu-to-game') {
    isFading.value = true; locked.value = true
    setTimeout(() => {
      isFading.value = false; locked.value = false
      lastTransition.value = null; portalCooldown.value = false
    }, 600)
  } else {
    isFading.value = false; locked.value = false; portalCooldown.value = false
  }
})

watch([x, y], ([newX, newY]) => {
  if (locked.value || navigating.value || portalCooldown.value) return
  const PLAYER = 40; const cx = WORLD_EDGE / 2
  if (newY >= WORLD_EDGE - PLAYER && newX > cx - PORTAL_HALF_WIDTH && newX < cx + PORTAL_HALF_WIDTH) {
    navigating.value = true; locked.value = true; moving.value = true; isFading.value = true
    const exitLoop = () => {
      y.value += 5
      if (y.value >= WORLD_EDGE + 80) {
        lastTransition.value = 'main-to-second'
        router.push({ name: 'SecondGame' }).catch(() => { navigating.value = false; locked.value = false })
      } else { requestAnimationFrame(exitLoop) }
    }
    requestAnimationFrame(exitLoop)
  }
})

onUnmounted(() => { window.removeEventListener('keydown', onSkinShopKey) })
</script>

<style>
@import './styles/game-world.css';
</style>

<style scoped>
/* .world must stay here because it uses v-bind() */
.world {
  position: absolute;
  width: v-bind(worldEdgePx);
  height: v-bind(worldEdgePx);
  transform-origin: 0 0;
  will-change: transform;
}

/* ── Terrain zones ── */
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
    linear-gradient(45deg, #8f8f8f 25%, transparent 25%),
    linear-gradient(-45deg, #8f8f8f 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #8f8f8f 75%),
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
.road-main  { left: 78px; top: 588px; width: 1044px; height: 43px; border: 4px solid #5d4524; background: #b58956; }
.road-cross { left: 582px; top: 174px; width: 43px; height: 900px; border: 4px solid #5d4524; background: #b58956; }
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
    linear-gradient(45deg, #7f7264 25%, transparent 25%),
    linear-gradient(-45deg, #7f7264 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #7f7264 75%),
    linear-gradient(-45deg, transparent 75%, #7f7264 75%),
    #9a8b79;
  background-size: 36px 36px;
}

/* Shop hint */
.shop-hint {
  position: absolute; left: 50%; bottom: 32px;
  transform: translateX(-50%); z-index: 20; margin: 0;
  font-size: 8px; color: #fff8e1; text-shadow: 0 1px 2px #000; pointer-events: none;
}
.shop-hint kbd {
  display: inline-block; border: 2px solid #333; background: #222;
  color: #ffcc80; padding: 2px 6px; font-size: 9px; font-family: inherit; margin: 0 2px;
}
</style>
