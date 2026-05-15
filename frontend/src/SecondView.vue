<template>
  <div
    class="viewport"
    ref="arenaRef"
    :style="viewportBgStyle"
    tabindex="0"
    @click="arenaRef.focus()"
    @keydown="onArenaPanelHotkey"
    @focus="focused = true"
    @blur="focused = false"
  >
    <!-- SCANLINES OVERLAY -->
    <div class="scanlines"></div>
    <div class="game-bg"></div>

    <ArenaWorldLayer
      :camera-transform="cameraTransform"
      :arena-grid-style="arenaGridStyle"
      :arena-floor-style="arenaFloorStyle"
      :world-width-px="worldWidthPx"
      :world-height-px="worldHeightPx"
      :enemies="enemies"
      :enemy-faction-class="enemyFactionClass"
      :coins="coins"
      :bullets="bullets"
      :enemy-bullets="enemyBullets"
      :slashes="slashes"
      :x="x"
      :y="y"
      :moving="moving"
      :sprite-data="characterStore.spriteData"
      :cosmetic-portrait-src="arenaCosmeticPortraitSrc"
      :color-still="colorStill"
      :color-moving="colorMoving"
      :dependency-mark="dependencyMark"
      :enemy-size="ENEMY_SIZE"
      :is-andres-boss="isAndresBoss"
      :boss-andres-style="bossAndresStyle"
      :is-juan-carlos-boss="isJuanCarlosBoss"
      :is-juan-carlos-flying="isJuanCarlosFlying"
      :is-juan-carlos-defending="isJuanCarlosDefending"
      :boss-juan-carlos-img="bossJuanCarlosImg"
      :boss-juan-carlos-style="bossJuanCarlosStyle"
      :enemy-sprite-src="enemySpriteSrc"
      :enemy-sprite-style="enemySpriteStyle"
      :has-enemy-sprite="hasEnemySprite"
      :hp-bar-pct="hpBarPct"
      :is-java-miniboss="isJavaMiniboss"
      :is-php-miniboss="isPhpMiniboss"
      :enemy-bullet-class="enemyBulletClass"
      :enemy-bullet-img="enemyBulletImg"
    />

    <ArenaPremiumHud
      :hud-map-label="hudMapLabel"
      :hud-section-label="hudSectionLabel"
      :is-final-kingdom-section="isFinalKingdomSection"
      :final-boss-name="finalBossName"
      :final-boss-hp-pct="finalBossHpPct"
      :final-boss-hp="finalBossHp"
      :final-boss-max-hp="finalBossMaxHp"
      :section-wave="sectionWave"
      :max-waves-in-section="maxWavesInSection"
      :start-kingdom="startKingdom"
      :target-kingdom="targetKingdom"
      :route-instruction="routeInstruction"
      :session-gold="sessionGold"
      :bank-gold="characterStore.gold"
      :player-hp-pct="playerHpPct"
      :player-hp="playerHp"
      :player-max-hp="playerMaxHp"
      :stamina-pct="staminaPct"
      :level-state="levelState"
      :xp-progress-pct="xpProgressPct"
      :arena-potion-hud-cells="arenaPotionHudCells"
      :key-label="keyLabel"
      :settings="settings"
    />

    <WalletBar
      :gold="characterStore.gold + sessionGold"
      :code-coins="characterStore.codeCoins"
      :level="levelState.level"
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
    <SettingsModal v-if="showSettings" @close="showSettings = false" />

    <MapPanel
      v-if="showMapPanel"
      :player-x="x"
      :player-y="y"
      :npcs="[]"
      :map-image="currentArenaMapImage"
      :map-name="currentArenaMapName"
      :world-width="WORLD_WIDTH"
      :world-height="ARENA_WORLD_HEIGHT"
      @close="showMapPanel = false"
    />

    <ArenaPhaseModals
      :phase="phase"
      :show-victory-modal="showVictoryModal"
      :section="section"
      :section-wave="sectionWave"
      :session-gold="sessionGold"
      :conquered-kingdom-label="conqueredKingdomLabel"
      :waves-per-section="WAVES_PER_SECTION"
      :total-sections="TOTAL_SECTIONS"
      @continue-battle="startNextWave"
      @leave-arena="leaveArena"
      @explore="showVictoryModal = false"
    />

    <img class="game-logo" src="/code-kingdoms-logo.png" alt="Code Kingdoms logo" />
    <div class="fade-overlay" :class="{ active: isFading }"></div>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArenaCombat } from './composables/useArenaCombat'
import { getArenaEnemySprite } from './constants/arenaEnemySprites'
import { getEnemyBulletSprite } from './constants/arenaEnemyBulletSprites'
import { WORLD_EDGE, WORLD_WIDTH, PORTAL_HALF_WIDTH } from './constants/world'
import { SECTION_MAPS } from './constants/maps'
import { getArenaWalkBoundsRect, ARENA_BOSS_SECTION } from './constants/arenaWalkBounds'
import { INTERMEDIATE_SECTIONS } from './composables/arenaCombatShared'
import arrayIslandsMap from './assets/maps/array-islands-map.png'
import jvmVolcanoMap from './assets/maps/jvm-volcano-map.png'
import mavenMountainsMap from './assets/maps/maven-mountains-map.png'
import springBootCityMap from './assets/maps/spring-boot-city-map.png'
import hibernateRuinsMap from './assets/maps/hibernate-ruins-map.png'
import springBorderGateMap from './assets/maps/spring-border-gate-map.png'
import eloquentSwampsMap from './assets/maps/eloquent-swamps-map.png'
import composerDesertMap from './assets/maps/composer-desert-map.png'
import laravelCitadelMap from './assets/maps/laravel-citadel-map.png'
import phpFrontierMarshesMap from './assets/maps/php-frontier-marshes-map.png'
import javaKingdomMap from './assets/maps/java-kingdom-map.png'
import phpKingdomMap from './assets/maps/php-kingdom-map.png'
import bossAndresSheet from './assets/characters/php-boss/andres-wizard-sprite-sheet-3x.png'
import javaBossIdle1 from './assets/characters/java-boss/idle-1.png'
import javaBossIdle2 from './assets/characters/java-boss/idle-2.png'
import javaBossIdle3 from './assets/characters/java-boss/idle-3.png'
import javaBossCast from './assets/characters/java-boss/cast.png'
import javaBossIdle5 from './assets/characters/java-boss/idle-5.png'
import javaBossIdle6 from './assets/characters/java-boss/idle-6.png'
import javaBossFly from './assets/characters/java-boss/fly.png'
import javaBossIdle8 from './assets/characters/java-boss/idle-8.png'
import javaBossCloak from './assets/characters/java-boss/shield-cloak.png'
import { lastTransition } from './gameState'
import { ensureActiveCharacterId, addCharacterGold } from './api/character'
import { consumeCharacterItem } from './api/consumable'
import { fetchInventoryData, myCharacterItems } from './api/inventario'
import api from './api/axios'
import InventoryPanel from './components/InventoryPanel.vue'
import EquipmentPanel from './components/EquipmentPanel.vue'
import MapPanel from './components/MapPanel.vue'
import WalletBar from './components/WalletBar.vue'
import MicropayModal from './components/MicropayModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import ArenaWorldLayer from './components/arena/ArenaWorldLayer.vue'
import ArenaPremiumHud from './components/arena/ArenaPremiumHud.vue'
import ArenaPhaseModals from './components/arena/ArenaPhaseModals.vue'
import { useCharacterStore } from './stores/character'
import { useGameSettings } from './composables/useGameSettings'
import { isPlayerPhpKingdom } from './utils/realm'
import { xpRequiredForLevel } from './utils/experience'
import { getDirectionalSkinWorldSrc } from './constants/cosmeticVisuals'

const router = useRouter()
const route = useRoute()
const ARENA_WORLD_HEIGHT = WORLD_EDGE
const ARENA_ENTRY_TARGET_Y = ARENA_WORLD_HEIGHT / 2
const ARRAY_ISLANDS_ENTRY_Y = ARENA_WORLD_HEIGHT / 2 - 90
const JVM_VOLCANO_ENTRY_Y = ARENA_WORLD_HEIGHT - 240
const LARAVEL_CITADEL_ENTRY_Y = ARENA_WORLD_HEIGHT - 220
const COMPOSER_DESERT_ENTRY_Y = ARENA_WORLD_HEIGHT - 260
const worldWidthPx = `${WORLD_WIDTH}px`
const worldHeightPx = `${ARENA_WORLD_HEIGHT}px`
const isFading = ref(lastTransition.value === 'main-to-second')
const startY = ref(lastTransition.value === 'main-to-second' ? -50 : ARENA_WORLD_HEIGHT / 2)

const showPanel = ref(null)
const showMapPanel = ref(false)
const showMicropay = ref(false)
const showSettings = ref(false)

const characterStore = useCharacterStore()
const isPlayerPhp = computed(() =>
  isPlayerPhpKingdom(characterStore.kingdomName, characterStore.kingdomId),
)
const { keyMatches, settings, keyLabel, normalizeKey } = useGameSettings()
const colorStill = ref('#e94560')
const colorMoving = ref('#f5a623')
const arenaFaction = computed(() => (isPlayerPhp.value ? 'java' : 'php'))
const currentMap = computed(() => {
  const idx = Math.min(Math.max(0, (section.value || 1) - 1), INTERMEDIATE_SECTIONS - 1)
  return SECTION_MAPS[arenaFaction.value][idx]
})
const mapImageByName = {
  'Array Islands': arrayIslandsMap,
  'JVM Volcano': jvmVolcanoMap,
  'Maven Mountains': mavenMountainsMap,
  'Spring Boot City': springBootCityMap,
  'Hibernate Ruins': hibernateRuinsMap,
  'Spring Border Gate': springBorderGateMap,
  'Eloquent Swamps': eloquentSwampsMap,
  'Composer Desert': composerDesertMap,
  'Laravel Citadel': laravelCitadelMap,
  'PHP Frontier Marshes': phpFrontierMarshesMap,
}
const currentArenaMapImage = computed(() => {
  if (isFinalKingdomSection.value) {
    return arenaFaction.value === 'php' ? phpKingdomMap : javaKingdomMap
  }
  return mapImageByName[currentMap.value?.name] || ''
})
const currentArenaMapName = computed(() => {
  if (isFinalKingdomSection.value) {
    return arenaFaction.value === 'php' ? 'REINO PHP (BOSS FINAL)' : 'REINO JAVA (BOSS FINAL)'
  }
  return currentMap.value?.name?.toUpperCase() || 'MAPA DESCONOCIDO'
})

const isArrayIslandsSection = computed(() => currentMap.value?.name === 'Array Islands')
const isJvmVolcanoSection = computed(() => currentMap.value?.name === 'JVM Volcano')
const isMavenMountainsSection = computed(() => currentMap.value?.name === 'Maven Mountains')
const isSpringBootCitySection = computed(() => currentMap.value?.name === 'Spring Boot City')
const isHibernateRuinsSection = computed(() => currentMap.value?.name === 'Hibernate Ruins')
const isSpringBorderGateSection = computed(() => currentMap.value?.name === 'Spring Border Gate')
const isEloquentSwampsSection = computed(() => currentMap.value?.name === 'Eloquent Swamps')
const isComposerDesertSection = computed(() => currentMap.value?.name === 'Composer Desert')
const isLaravelCitadelSection = computed(() => currentMap.value?.name === 'Laravel Citadel')
const isPhpFrontierMarshesSection = computed(() => currentMap.value?.name === 'PHP Frontier Marshes')
const isFinalKingdomSection = computed(() => Number(section.value || 1) === TOTAL_SECTIONS)
const currentKingdomHudName = computed(() => (arenaFaction.value === 'php' ? 'REINO DE PHP' : 'REINO DE JAVA'))
const hudMapLabel = computed(() => (
  isFinalKingdomSection.value
    ? `${currentKingdomHudName.value} · BOSS FINAL`
    : currentMap.value.name.toUpperCase()
))
const hudSectionLabel = computed(() => (
  isFinalKingdomSection.value
    ? 'BATALLA FINAL'
    : `SECCIÓN ${section.value} / ${TOTAL_SECTIONS}`
))
const maxWavesInSection = computed(() => (
  Number(section.value || 1) >= TOTAL_SECTIONS ? 1 : WAVES_PER_SECTION
))
const finalBossName = computed(() => (arenaFaction.value === 'php' ? 'ANDRÉS' : 'JUAN CARLOS'))
const finalBossEnemy = computed(() => (
  enemies.value.find((enemy) => enemy.type === 'boss') || null
))
const finalBossMaxHp = computed(() => (
  Math.max(1, Number(finalBossEnemy.value?.maxHp || 1))
))
const finalBossHp = computed(() => (
  Math.max(0, Math.round(Number(finalBossEnemy.value?.hp || 0)))
))
const finalBossHpPct = computed(() => (
  Math.max(0, Math.min(100, Math.round((100 * finalBossHp.value) / finalBossMaxHp.value)))
))
const arenaFloorStyle = computed(() => {
  if (isFinalKingdomSection.value) {
    return {
      backgroundImage: `url(${currentArenaMapImage.value})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
    }
  }
  if (isArrayIslandsSection.value) {
    return {
      backgroundImage: `url(${arrayIslandsMap})`,
      backgroundRepeat: 'no-repeat',
      // Evita deformación: mantiene ratio original del PNG.
      backgroundSize: 'auto 100%',
      backgroundPosition: 'center',
    }
  }
  if (isJvmVolcanoSection.value) {
    return {
      backgroundImage: `url(${jvmVolcanoMap})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
    }
  }
  if (isMavenMountainsSection.value) {
    return {
      backgroundImage: `url(${mavenMountainsMap})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
    }
  }
  if (isSpringBootCitySection.value) {
    return {
      backgroundImage: `url(${springBootCityMap})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
    }
  }
  if (isHibernateRuinsSection.value) {
    return {
      backgroundImage: `url(${hibernateRuinsMap})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
    }
  }
  if (isSpringBorderGateSection.value) {
    return {
      backgroundImage: `url(${springBorderGateMap})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
    }
  }
  if (isEloquentSwampsSection.value) {
    return {
      backgroundImage: `url(${eloquentSwampsMap})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
    }
  }
  if (isComposerDesertSection.value) {
    return {
      backgroundImage: `url(${composerDesertMap})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
    }
  }
  if (isLaravelCitadelSection.value) {
    return {
      backgroundImage: `url(${laravelCitadelMap})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
    }
  }
  if (isPhpFrontierMarshesSection.value) {
    return {
      backgroundImage: `url(${phpFrontierMarshesMap})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
    }
  }

  return {
    background: `
      radial-gradient(ellipse 80% 50% at 50% 50%, ${currentMap.value.accent}33, transparent 55%),
      linear-gradient(180deg, ${currentMap.value.floor} 0%, ${currentMap.value.floorAlt} 100%)
    `
  }
})

const arenaGridStyle = computed(() => ({
  backgroundImage: `
    linear-gradient(${currentMap.value.gridColor} 1px, transparent 1px),
    linear-gradient(90deg, ${currentMap.value.gridColor} 1px, transparent 1px)
  `,
  backgroundSize: '50px 50px'
}))

const viewportBgStyle = computed(() => ({
  backgroundColor: currentMap.value.bg
}))
const navigating = ref(false)
const portalCooldown = ref(true)
const showVictoryModal = ref(true)
const arenaCharacterId = ref(null)
const progressHydrated = ref(false)
const levelState = ref({
  level: 1,
  experience: 0,
  nextLevelXp: xpRequiredForLevel(1),
  maxHealth: 100,
  armor: 0,
  attackSpeed: 1,
  moveSpeed: 1,
  baseDamage: 12,
})

function syncLevelStateFromStore() {
  const level = Math.max(1, Number(characterStore.level || 1) || 1)
  const experience = Math.max(0, Math.floor(Number(characterStore.experience || 0) || 0))
  levelState.value = {
    level,
    experience,
    nextLevelXp: xpRequiredForLevel(level),
    maxHealth: Math.max(1, Number(characterStore.maxHealth || 100) || 100),
    armor: Math.max(0, Number(characterStore.armor || 0) || 0),
    attackSpeed: Math.max(0.1, Number(characterStore.attackSpeed || 1) || 1),
    moveSpeed: Math.max(0.1, Number(characterStore.speed || 100) / 100) || 1,
    baseDamage: Math.max(1, Number(characterStore.attackPower || 12) || 12),
  }
}

// Sincronizar si el usuario cambia stats desde el panel mientras está en la arena
watch([
  () => characterStore.maxHealth,
  () => characterStore.attackPower,
  () => characterStore.speed,
  () => characterStore.level,
  () => characterStore.statPoints
], () => {
  const oldMax = levelState.value.maxHealth
  syncLevelStateFromStore()
  
  // Si la vida máxima ha subido, curamos al jugador la diferencia
  if (levelState.value.maxHealth > oldMax) {
    const diff = levelState.value.maxHealth - oldMax
    playerHp.value = Math.round(Math.min(levelState.value.maxHealth, playerHp.value + diff))
  }
}, { deep: true })

function applyLevelUpRewards(levelUps = 1) {
  // Hemos desactivado esto para que solo suban con los puntos manuales
  console.log(`¡Has subido ${levelUps} niveles! Ve al panel de estadísticas para usar tus puntos.`);
}

function gainExperience(amount) {
  const safeAmount = Math.max(0, Math.floor(Number(amount) || 0))
  if (safeAmount <= 0) return
  levelState.value.experience += safeAmount
  let pendingLevelUps = 0
  while (levelState.value.experience >= levelState.value.nextLevelXp) {
    levelState.value.experience -= levelState.value.nextLevelXp
    levelState.value.level += 1
    pendingLevelUps += 1
    levelState.value.nextLevelXp = xpRequiredForLevel(levelState.value.level)
  }
  if (pendingLevelUps > 0) {
    applyLevelUpRewards(pendingLevelUps)
    // Sincronizar el valor de vida máxima del jugador
    levelState.value.maxHealth = Math.round(levelState.value.maxHealth)
  }
}

const arenaPotionHudCells = computed(() => {
  const slots = settings.value.arenaPotionSlots || []
  return slots.map((slot, slotIndex) => {
    const row = slot.itemName
      ? myCharacterItems.value.find(
          (ci) =>
            ci.item?.type === 'consumable'
            && ci.item?.name === slot.itemName
            && Number(ci.quantity ?? 1) > 0,
        )
      : null
    const quantity = row ? Number(row.quantity ?? 1) : 0
    const shortName = slot.itemName
      ? String(slot.itemName).replace(/^Poción de /i, '').trim().slice(0, 14)
      : '—'
    return { slotIndex, itemName: slot.itemName || '', key: slot.key, quantity, shortName }
  })
})

const xpProgressPct = computed(() => {
  const total = Math.max(1, Number(levelState.value.nextLevelXp || 1))
  return Math.max(0, Math.min(100, Math.round((100 * Number(levelState.value.experience || 0)) / total)))
})

function getSectionMapNameByIndex(faction, sectionNumber) {
  const sectionIndex = Math.min(Math.max(Number(sectionNumber || 1) - 1, 0), INTERMEDIATE_SECTIONS - 1)
  return SECTION_MAPS[faction]?.[sectionIndex]?.name || ''
}

function getArenaEntryPoint(mapName) {
  if (mapName === 'Array Islands') {
    return { x: WORLD_WIDTH / 2, y: ARRAY_ISLANDS_ENTRY_Y }
  }
  if (mapName === 'JVM Volcano') {
    // Entrada arriba del mapa, pero siempre dentro del terreno jugable.
    return { x: WORLD_WIDTH / 2, y: JVM_VOLCANO_ENTRY_Y }
  }
  if (mapName === 'Laravel Citadel') {
    return { x: WORLD_WIDTH / 2, y: LARAVEL_CITADEL_ENTRY_Y }
  }
  if (mapName === 'Composer Desert') {
    return { x: WORLD_WIDTH / 2, y: COMPOSER_DESERT_ENTRY_Y }
  }
  return { x: WORLD_WIDTH / 2, y: ARENA_ENTRY_TARGET_Y }
}

function isArenaWalkable(nextX, nextY, ctx = {}) {
  const size = Number(ctx.entitySize ?? ctx.playerSize ?? 34)
  const sec = Number(ctx.section ?? 0)
  if (sec >= ARENA_BOSS_SECTION) {
    return (
      nextX >= 0
      && nextY >= 0
      && (nextX + size) <= WORLD_WIDTH
      && (nextY + size) <= ARENA_WORLD_HEIGHT
    )
  }
  const rect = getArenaWalkBoundsRect(ctx.mapName || '')
  if (!rect) {
    return (
      nextX >= 0
      && nextY >= 0
      && (nextX + size) <= WORLD_WIDTH
      && (nextY + size) <= ARENA_WORLD_HEIGHT
    )
  }
  return (
    nextX >= rect.left
    && nextY >= rect.top
    && (nextX + size) <= rect.right
    && (nextY + size) <= rect.bottom
  )
}


const {
  arenaRef,
  x,
  y,
  focused,
  moving,
  locked,
  WORLD_W,
  WORLD_H,
  ENEMY_SIZE,
  section,
  sectionWave,
  routeInstruction,
  startKingdom,
  targetKingdom,
  enemyFaction,
  TOTAL_SECTIONS,
  WAVES_PER_SECTION,
  phase,
  playerHp,
  playerMaxHp,
  sessionGold,
  dependencyMark,
  enemies,
  bullets,
  enemyBullets,
  coins,
  slashes,
  stamina,
  isSprinting,
  playerFacing,
  startNextWave,
  beginFirstWave,
  resumeAt,
  applyArenaConsumable,
} = useArenaCombat({
  worldWidth: WORLD_WIDTH,
  worldHeight: ARENA_WORLD_HEIGHT,
  startX: WORLD_WIDTH / 2,
  startY: startY.value,
  // Debe ser el reino del jugador (no arenaFaction: ese valor ya es el espejo enemigo).
  // Si esto va mal, useArenaCombat invierte enemigos y el boss PHP (Andrés) sale como Java.
  startKingdom: computed(() => (isPlayerPhp.value ? 'PHP' : 'Java')),
  equippedWeapon: computed(() => characterStore.equippedWeapon),
  characterClass: computed(() => characterStore.characterClass),
  characterRace: computed(() => characterStore.kingdomName || characterStore.kingdomId),
  characterLevel: computed(() => levelState.value.level),
  characterArmor: computed(() => levelState.value.armor),
  characterAttackSpeed: computed(() => levelState.value.attackSpeed),
  characterMoveSpeed: computed(() => levelState.value.moveSpeed),
  characterBaseDamage: computed(() => levelState.value.baseDamage),
  playerMaxHp: computed(() => levelState.value.maxHealth),
  isWalkable: isArenaWalkable,
  getWalkMapName: () => currentMap.value?.name || '',
  onExperienceGain: ({ amount }) => gainExperience(amount),
  onVictory: () => {
    showVictoryModal.value = true
    syncRunGoldOnce()
  }
})

const arenaCosmeticPortraitSrc = computed(() =>
  getDirectionalSkinWorldSrc(characterStore.equippedSkin?.slug, playerFacing.value),
)

let lastArenaPotionUseAt = 0
const ARENA_POTION_USE_COOLDOWN_MS = 450

async function tryConsumeArenaSlot(slotIndex) {
  const slots = settings.value.arenaPotionSlots || []
  const slot = slots[slotIndex]
  if (!slot?.itemName) return
  const cid = arenaCharacterId.value
  if (cid == null) return
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
  if (now - lastArenaPotionUseAt < ARENA_POTION_USE_COOLDOWN_MS) return
  const row = myCharacterItems.value.find(
    (ci) =>
      ci.item?.type === 'consumable'
      && ci.item?.name === slot.itemName
      && Number(ci.quantity ?? 1) > 0,
  )
  if (!row) return
  const spentId = row.id
  lastArenaPotionUseAt = now
  try {
    const { data } = await consumeCharacterItem(spentId, {
      id_character: cid,
      arena_max_hp: Math.round(levelState.value.maxHealth),
      arena_max_mana: 500,
    })
    applyArenaConsumable({
      effect: data.effect,
      power: data.power,
      duration: data.duration,
    })
    if (data.character_item) {
      myCharacterItems.value = myCharacterItems.value.map((ci) => (
        ci.id === data.character_item.id ? data.character_item : ci
      ))
    } else {
      myCharacterItems.value = myCharacterItems.value.filter((ci) => ci.id !== spentId)
    }
  } catch {
    lastArenaPotionUseAt = 0
  }
}

function parsePositiveInt(value, fallback = null) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  const normalized = Math.floor(parsed)
  return normalized >= 1 ? normalized : fallback
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function getArenaStartFromQuery() {
  const rawSection = parsePositiveInt(route.query.section, null)
  if (rawSection == null) return null
  const safeSection = clamp(rawSection, 1, TOTAL_SECTIONS)
  const rawWave = parsePositiveInt(route.query.wave, 1)
  return {
    section: safeSection,
    wave: clamp(rawWave, 1, safeSection >= TOTAL_SECTIONS ? 1 : WAVES_PER_SECTION),
  }
}

/**
 * Si la URL pide una sección/oleada no desbloqueada, arrancamos en el progreso real guardado.
 */
function getArenaStartWithinProgress(start) {
  if (!start) return null
  const progressSection = clamp(Math.max(1, Number(characterStore.arenaSection || 1) || 1), 1, TOTAL_SECTIONS)
  const progressWave = clamp(
    Math.max(1, Number(characterStore.arenaWave || 1) || 1),
    1,
    progressSection >= TOTAL_SECTIONS ? 1 : WAVES_PER_SECTION,
  )
  if (start.section > progressSection) {
    return { section: progressSection, wave: progressWave }
  }
  if (start.section === progressSection && start.wave > progressWave) {
    return { section: progressSection, wave: progressWave }
  }
  return start
}

let lastSavedProgressKey = ''

function progressSnapshotForSave() {
  let nextSection = Math.max(1, Number(section.value) || 1)
  let nextWave = Math.max(1, Number(sectionWave.value) || 1)
  const maxWavesInSection = nextSection >= TOTAL_SECTIONS ? 1 : WAVES_PER_SECTION

  // En 'between' la oleada actual ya fue superada: el próximo punto de resumen es la siguiente.
  if (phase.value === 'between') {
    if (nextWave >= maxWavesInSection) {
      nextSection = Math.min(TOTAL_SECTIONS, nextSection + 1)
      nextWave = 1
    } else {
      nextWave = nextWave + 1
    }
  }

  const finalMaxWaves = nextSection >= TOTAL_SECTIONS ? 1 : WAVES_PER_SECTION
  nextWave = Math.max(1, Math.min(nextWave, finalMaxWaves))

  return { arena_section: nextSection, arena_wave: nextWave, arena_in_progress: true }
}

async function saveArenaProgress(force = false) {
  try {
    const id = arenaCharacterId.value
    if (!id) return
    if (!force && !progressHydrated.value) return
    const payload = {
      ...progressSnapshotForSave(),
      level: levelState.value.level,
      experience: levelState.value.experience,
      xp: levelState.value.experience,
      max_health: Math.round(levelState.value.maxHealth),
      armor: Math.round(levelState.value.armor),
      attack_speed: Number(levelState.value.attackSpeed.toFixed(3)),
      speed: Math.round(levelState.value.moveSpeed * 100), // Convertimos de 1.0 a 100
      attack_power: Math.round(levelState.value.baseDamage),
    }
    const key = [
      payload.arena_section,
      payload.arena_wave,
      payload.arena_in_progress ? 1 : 0,
      payload.level,
      payload.experience,
      payload.max_health,
      payload.armor,
      payload.attack_speed,
      payload.speed,
      payload.attack_power,
    ].join(':')
    if (!force && key === lastSavedProgressKey) return
    const { data: updatedChar } = await api.patch(`/characters/${id}`, payload)
    
    // IMPORTANTE: Actualizar el store con lo que diga el SERVIDOR
    // El servidor es quien ha calculado los nuevos stat_points, etc.
    characterStore.arenaSection = updatedChar.arena_section
    characterStore.arenaWave = updatedChar.arena_wave
    characterStore.arenaInProgress = updatedChar.arena_in_progress
    characterStore.level = updatedChar.level
    characterStore.experience = updatedChar.experience
    characterStore.maxHealth = updatedChar.max_health
    characterStore.attackPower = updatedChar.attack_power
    characterStore.speed = updatedChar.speed
    characterStore.statPoints = updatedChar.stat_points
    
    lastSavedProgressKey = key
  } catch (err) {
    console.error('No se pudo guardar progreso de arena:', err)
  }
}

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

// Bloquear movimiento solo en estados críticos (no al abrir paneles/mapa).
watch(
  [showPanel, showMapPanel, showMicropay, showSettings, phase, showVictoryModal],
  ([p, m, mi, st, ph, svm]) => {
    const isVictoryBlocking = ph === 'victory' && svm
    if (mi || st || ph === 'between' || ph === 'gameover' || isVictoryBlocking) {
      locked.value = true
    } else if (!isFading.value && !navigating.value) {
      locked.value = false
    }
  }
)

function onArenaPanelHotkey(e) {
  if (route.name !== 'SecondGame') return
  const tag = String(e.target?.tagName || '').toUpperCase()
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return

  const canUseArenaPotions =
    phase.value === 'fighting'
    && !isFading.value
    && !navigating.value
    && !showPanel.value
    && !showMapPanel.value
    && !showSettings.value
    && !showMicropay.value
  if (canUseArenaPotions) {
    const slots = settings.value.arenaPotionSlots || []
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]
      if (!slot?.itemName) continue
      if (normalizeKey(e.key) === normalizeKey(slot.key)) {
        e.preventDefault()
        void tryConsumeArenaSlot(i)
        return
      }
    }
  }

  const phaseBlocksUi = phase.value === 'between' || phase.value === 'gameover' || (phase.value === 'victory' && showVictoryModal.value)
  if (isFading.value || navigating.value || phaseBlocksUi) {
    return
  }
  if (showMicropay.value) {
    return
  }
  const key = String(e.key || '').toLowerCase()
  if (key === 'escape') {
    e.preventDefault()
    showSettings.value = true
    showMapPanel.value = false
    showPanel.value = null
    return
  }
  if (key === 'i') {
    e.preventDefault()
    showMapPanel.value = false
    showPanel.value = showPanel.value === 'inventory' ? null : 'inventory'
    return
  }
  const isInventory = keyMatches(e, 'inventory')
  const isEquipment = keyMatches(e, 'equipment')
  const isMap = keyMatches(e, 'map')
  if (!isInventory && !isEquipment && !isMap) {
    return
  }
  e.preventDefault()
  if (isInventory) {
    showPanel.value = showPanel.value === 'inventory' ? null : 'inventory'
    if (showPanel.value) {
      showMapPanel.value = false
    }
  } else if (isEquipment) {
    showPanel.value = showPanel.value === 'equipment' ? null : 'equipment'
    if (showPanel.value) {
      showMapPanel.value = false
    }
  } else if (isMap) {
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

const staminaPct = computed(() => stamina.value)

const conqueredKingdomLabel = computed(() => (
  enemyFaction.value === 'java' ? 'Java' : 'PHP'
))

const enemyFactionClass = computed(() =>
  enemyFaction.value === 'java' ? 'enemy--java' : 'enemy--php'
)

function hpBarPct(e) {
  return Math.max(8, Math.round((100 * e.hp) / (e.maxHp || 1)))
}

function enemySpriteSrc(e) {
  if (e.type === 'boss') return null
  return getArenaEnemySprite(enemyFaction.value, e.type)
}

function hasEnemySprite(e) {
  return Boolean(enemySpriteSrc(e))
}

function enemySpriteStyle(e) {
  const esize = e.size || ENEMY_SIZE
  const enemyCx = e.x + esize / 2
  const playerCx = x.value + 20
  const flipX = playerCx < enemyCx ? -1 : 1
  return {
    transform: `translate(-50%, -50%) scaleX(${flipX})`,
  }
}

function isPhpMiniboss(e) {
  return e.type === 'miniboss' && enemyFaction.value === 'php'
}

function isJavaMiniboss(e) {
  return e.type === 'miniboss' && enemyFaction.value === 'java'
}

function isAndresBoss(e) {
  return e.type === 'boss' && enemyFaction.value === 'php'
}

const JAVA_BOSS_IDLE_FRAMES = [
  javaBossIdle1,
  javaBossIdle2,
  javaBossIdle3,
  javaBossIdle5,
  javaBossIdle6,
  javaBossIdle8,
]
const JAVA_BOSS_ATTACK_MS = 700

function isJuanCarlosBoss(e) {
  return e.type === 'boss' && enemyFaction.value === 'java'
}

function isJuanCarlosDefending(e, now = performance.now()) {
  return isJuanCarlosBoss(e) && now < Number(e.shieldUntil || 0)
}

function isJuanCarlosAttacking(e, now = performance.now()) {
  return isJuanCarlosBoss(e) && now - Number(e.lastFireAt || 0) < JAVA_BOSS_ATTACK_MS
}

function isJuanCarlosFlying(e, now = performance.now()) {
  return isJuanCarlosBoss(e)
    && Boolean(e.isMoving)
    && !isJuanCarlosAttacking(e, now)
    && !isJuanCarlosDefending(e, now)
}

function bossJuanCarlosImg(e) {
  const now = performance.now()
  if (isJuanCarlosDefending(e, now)) return javaBossCloak
  if (isJuanCarlosAttacking(e, now)) return javaBossCast
  if (isJuanCarlosFlying(e, now)) return javaBossFly
  const frameIdx = Math.floor(now / 480) % JAVA_BOSS_IDLE_FRAMES.length
  return JAVA_BOSS_IDLE_FRAMES[frameIdx]
}

function bossJuanCarlosStyle(e) {
  const esize = e.size || ENEMY_SIZE
  const enemyCx = e.x + esize / 2
  const playerCx = x.value + 20
  const flipX = playerCx < enemyCx ? -1 : 1
  return {
    transform: `translate(-50%, -50%) scaleX(${flipX})`,
  }
}

function bossAndresStyle(e) {
  const esize = e.size || ENEMY_SIZE
  const enemyCx = e.x + esize / 2
  const playerCx = x.value + 20
  const flipX = playerCx < enemyCx ? -1 : 1
  return {
    backgroundImage: `url(${bossAndresSheet})`,
    transform: `scaleX(${flipX})`,
  }
}

function enemyBulletClass(b) {
  if (b.kind === 'arcane_orb') return 'enemy-bullet--arcane'
  if (b.kind === 'java_orb') return 'enemy-bullet--java-orb'
  return b.faction === 'java' ? 'enemy-bullet--java' : 'enemy-bullet--php'
}

function enemyBulletImg(b) {
  return getEnemyBulletSprite(b)
}

/** Menos zoom = más área visible (ver enemigos a distancia). */
const CAMERA_ZOOM = 1.2

const cameraTransform = computed(() => {
  const zoom = CAMERA_ZOOM
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const halfViewW = cx / zoom
  const halfViewH = cy / zoom
  const targetX = Math.max(halfViewW, Math.min(x.value + 20, WORLD_W - halfViewW))
  const targetY = Math.max(halfViewH, Math.min(y.value + 20, WORLD_H - halfViewH))
  return `translate(${cx}px, ${cy}px) scale(${zoom}) translate(-${targetX}px, -${targetY}px)`
})

let sessionSynced = false

async function refreshWallet() {
  await characterStore.refresh()
  syncLevelStateFromStore()
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
    const id = arenaCharacterId.value
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
    await saveArenaProgress(true)
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

function startArenaCombat(startOverride = null) {
  if (phase.value !== 'idle') return

  if (startOverride) {
    characterStore.arenaInProgress = true
    characterStore.arenaSection = startOverride.section
    characterStore.arenaWave = startOverride.wave
    resumeAt(startOverride.section, startOverride.wave)
    progressHydrated.value = true
    return
  }

  if (characterStore.arenaInProgress) {
    resumeAt(characterStore.arenaSection, characterStore.arenaWave)
  } else {
    beginFirstWave()
  }
  progressHydrated.value = true
}

onMounted(async () => {
  let queryStart = getArenaStartFromQuery()
  window.addEventListener('beforeunload', saveArenaProgress, { capture: true })

  try {
    arenaCharacterId.value = await ensureActiveCharacterId()
    await refreshWallet()
    if (queryStart) {
      const allowedQueryStart = getArenaStartWithinProgress(queryStart)
      if (
        allowedQueryStart
        && (allowedQueryStart.section !== queryStart.section || allowedQueryStart.wave !== queryStart.wave)
      ) {
        queryStart = allowedQueryStart
        router.replace({
          name: 'SecondGame',
          query: { ...route.query, section: queryStart.section, wave: queryStart.wave },
        }).catch(() => {})
      }
    }
    if (arenaCharacterId.value != null) {
      await fetchInventoryData(true)
    }
    const playerPhp = isPlayerPhp.value
    const faction = playerPhp ? 'java' : 'php'
    const initialSection = queryStart?.section
      || (characterStore.arenaInProgress ? Number(characterStore.arenaSection || 1) : 1)
    const initialMapName = getSectionMapNameByIndex(faction, initialSection)
    const initialEntry = getArenaEntryPoint(initialMapName)
    startY.value = initialEntry.y
    if (lastTransition.value !== 'main-to-second') {
      y.value = initialEntry.y
      x.value = initialEntry.x
    }

    let srcToPreload = ''
    if (Number(initialSection) >= TOTAL_SECTIONS) {
      srcToPreload = faction === 'php' ? phpKingdomMap : javaKingdomMap
    } else {
      srcToPreload = mapImageByName[initialMapName] || ''
    }
    await new Promise(resolve => {
      if (!srcToPreload) return resolve()
      const img = new Image()
      img.onload = resolve
      img.onerror = resolve
      img.src = srcToPreload
    })
  } catch (err) {
    console.error("Error inicial en SecondView:", err)
  }

  if (lastTransition.value === 'main-to-second') {
    locked.value = true
    moving.value = true
    isFading.value = true
    const playerPhp = isPlayerPhp.value
    y.value = playerPhp ? ARENA_WORLD_HEIGHT + 50 : -50

    setTimeout(() => {
      isFading.value = false
      const enterLoop = () => {
        const mapNameForEntry = getSectionMapNameByIndex(
          playerPhp ? 'java' : 'php',
          Number(section.value || characterStore.arenaSection || 1)
        )
        const targetY = getArenaEntryPoint(mapNameForEntry).y
        // Java entra desde arriba. PHP entra desde abajo.
        const reachedTarget = playerPhp
          ? y.value <= targetY
          : y.value >= targetY
        if (reachedTarget) {
          locked.value = false
          moving.value = false
          lastTransition.value = null
          // Retrasar el fin del cooldown del portal
          setTimeout(() => { portalCooldown.value = false }, 500)
          // Retrasar inicio de combate
          setTimeout(() => {
            startArenaCombat(queryStart)
          }, 400)
          return
        }
        y.value += playerPhp ? -5 : 5
        requestAnimationFrame(enterLoop)
      }
      requestAnimationFrame(enterLoop)
    }, 100)
  } else {
    isFading.value = false
    locked.value = false
    portalCooldown.value = false
    startArenaCombat(queryStart)
  }
})

watch([x, y], ([newX, newY]) => {
  if (locked.value || navigating.value || portalCooldown.value) return

  const cx = WORLD_W / 2
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
  window.removeEventListener('beforeunload', saveArenaProgress, { capture: true })
  saveArenaProgress(true)
  syncRunGoldOnce()
})

watch(phase, (p) => {
  if (p === 'gameover' || p === 'victory') {
    saveArenaProgress(true)
    syncRunGoldOnce()
  }
})

watch([section, sectionWave, phase], () => {
  saveArenaProgress(false)
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
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0) 55%),
    linear-gradient(180deg, #4b5563 0%, #374151 100%);
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
</style>
