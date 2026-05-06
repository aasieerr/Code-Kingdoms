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

    <div class="world" :style="{ transform: cameraTransform }">
      <div class="grid" :style="arenaGridStyle"></div>
      <div class="arena-floor" :style="arenaFloorStyle"></div>

      <div
        v-for="e in enemies"
        :key="e.id"
        class="enemy"
        :class="[enemyFactionClass, { 'boss-enemy': e.type === 'boss' || e.type === 'miniboss', 'enemy--with-image': isPhpMeleeEnemy(e) }]"
        :style="{ left: e.x + 'px', top: e.y + 'px', width: (e.size || ENEMY_SIZE) + 'px', height: (e.size || ENEMY_SIZE) + 'px' }"
      >
        <img
          v-if="isPhpMeleeEnemy(e)"
          class="enemy-skin enemy-skin--php-melee"
          :src="phpMeleeEnemyImg"
          :style="phpMeleeEnemyStyle(e)"
          alt="PHP melee enemy"
        />
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
        v-for="b in enemyBullets"
        :key="b.id"
        class="enemy-bullet"
        :class="b.faction === 'java' ? 'enemy-bullet--java' : 'enemy-bullet--php'"
        :style="{ left: b.x + 'px', top: b.y + 'px' }"
      >
        {{ b.symbol }}
      </div>

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
          <span class="wave-label">{{ hudMapLabel }}</span>
          <span class="wave-label-sub">{{ hudSectionLabel }}</span>
          <template v-if="isFinalKingdomSection">
            <div class="boss-hud">
              <span class="boss-name">{{ finalBossName }}</span>
              <div class="boss-hp-frame">
                <div class="boss-hp-fill" :style="{ width: `${finalBossHpPct}%` }"></div>
              </div>
              <span class="boss-hp-text">{{ finalBossHp }} / {{ finalBossMaxHp }}</span>
            </div>
          </template>
          <template v-else>
            <span class="wave-number">{{ sectionWave }} / {{ maxWavesInSection }}</span>
            <span class="route-label">{{ startKingdom }} → {{ targetKingdom }} · {{ routeInstruction }}</span>
          </template>
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
          <div class="hp-label">VIDA</div>
          <div class="hp-bar-frame">
            <div class="hp-bar-fill" :style="{ width: playerHpPct + '%' }">
              <div class="hp-glow"></div>
            </div>
          </div>
          <div class="hp-numeric">{{ playerHp }} / {{ playerMaxHp }}</div>
        </div>
        <div class="xp-container">
          <div class="xp-label">NIVEL {{ levelState.level }}</div>
          <div class="xp-bar-frame">
            <div class="xp-bar-fill" :style="{ width: xpProgressPct + '%' }"></div>
          </div>
          <div class="xp-numeric">{{ levelState.experience }} / {{ levelState.nextLevelXp }} XP</div>
        </div>
      </div>

      <!-- Controls Hint (Bottom) -->
      <div class="hud-bottom-hints">
        <div class="hint-pill">
          <span class="key">{{ keyLabel(settings.keybinds.moveUp) }}/{{ keyLabel(settings.keybinds.moveLeft) }}/{{ keyLabel(settings.keybinds.moveDown) }}/{{ keyLabel(settings.keybinds.moveRight) }}</span> MOVIMIENTO
        </div>
        <div class="hint-pill">
          <span class="key">{{ keyLabel(settings.keybinds.inventory) }}</span> MOCHILA
        </div>
        <div class="hint-pill">
          <span class="key">{{ keyLabel(settings.keybinds.equipment) }}</span> EQUIPO
        </div>
        <div class="hint-pill">
          <span class="key">{{ keyLabel(settings.keybinds.map) }}</span> MAPA
        </div>
      </div>
    </div>

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
      :world-width="ARENA_WORLD_WIDTH"
      :world-height="ARENA_WORLD_HEIGHT"
      @close="showMapPanel = false"
    />

    <!-- PREMIUM MODALS -->
    <div v-if="phase === 'between'" class="premium-overlay">
      <div class="premium-modal victory-wave">
        <div class="modal-shine"></div>
        <h2 class="modal-title">OLEADA {{ sectionWave }} / {{ WAVES_PER_SECTION }} COMPLETADA</h2>
        <div class="modal-body">
          <p class="summary">SECCIÓN ACTUAL: <span>{{ section }}</span> / {{ TOTAL_SECTIONS }}</p>
          <p class="reward-text">HAS RECOLECTADO <span>{{ sessionGold }}</span> MONEDAS DE ORO</p>
          <p class="action-hint">EQUIPA ÍTEMS EN EL PANEL O SIGUE LUCHANDO</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-continue" @click="startNextWave">CONTINUAR BATALLA</button>
          <button type="button" class="btn-exit" @click="leaveArena">VOLVER AL REINO</button>
        </div>
      </div>
    </div>

    <!-- FINAL VICTORY MODAL -->
    <div v-if="phase === 'victory' && showVictoryModal" class="premium-overlay">
      <div class="premium-modal final-victory">
        <div class="modal-shine"></div>
        <div class="victory-crown">👑</div>
        <h2 class="modal-title">¡VICTORIA ABSOLUTA!</h2>
        <div class="modal-body">
          <p class="summary">HAS CONQUISTADO EL REINO {{ conqueredKingdomLabel }}</p>
          <p class="reward-text">ORO TOTAL CONSEGUIDO: <span>{{ sessionGold }}</span> 🪙</p>
          <p class="congrats">ERES EL VERDADERO REY DE LA ARENA</p>
        </div>
        <div class="modal-footer flex flex-col gap-4">
          <button type="button" class="btn-exit-gold" @click="leaveArena">VOLVER COMO UN HÉROE</button>
          <button type="button" class="btn-explore" @click="showVictoryModal = false">SEGUIR EXPLORANDO</button>
        </div>
      </div>
    </div>

    <div v-if="phase === 'gameover'" class="premium-overlay">
      <div class="premium-modal defeat">
        <div class="modal-shine"></div>
        <h2 class="modal-title">DERROTA EN COMBATE</h2>
        <div class="modal-body">
          <p class="summary">CAÍSTE EN LA SECCIÓN <span>{{ section }}</span>, OLEADA <span>{{ sectionWave }}</span></p>
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
import { useRoute, useRouter } from 'vue-router'
import { useArenaCombat } from './composables/useArenaCombat'
import { WORLD_EDGE, PORTAL_HALF_WIDTH } from './constants/world'
import { SECTION_MAPS } from './constants/maps'
import arrayIslandsMap from './assets/maps/array-islands-map.png'
import jvmVolcanoMap from './assets/maps/jvm-volcano-map.png'
import mavenMountainsMap from './assets/maps/maven-mountains-map.png'
import springBootCityMap from './assets/maps/spring-boot-city-map.png'
import gcSwampMap from './assets/maps/gc-swamp-map.png'
import hibernateRuinsMap from './assets/maps/hibernate-ruins-map.png'
import springBorderGateMap from './assets/maps/spring-border-gate-map.png'
import eloquentSwampsMap from './assets/maps/eloquent-swamps-map.png'
import bladeForestMap from './assets/maps/blade-forest-map.png'
import composerDesertMap from './assets/maps/composer-desert-map.png'
import laravelCitadelMap from './assets/maps/laravel-citadel-map.png'
import phpFrontierMarshesMap from './assets/maps/php-frontier-marshes-map.png'
import javaKingdomMap from './assets/maps/java-kingdom-map.png'
import phpKingdomMap from './assets/maps/php-kingdom-map.png'
import phpMeleeEnemyImg from './assets/enemy-php-melee.png'
import { lastTransition } from './gameState'
import { ensureActiveCharacterId, addCharacterGold, fetchCharacter } from './api/character'
import api from './api/axios'
import InventoryPanel from './components/InventoryPanel.vue'
import EquipmentPanel from './components/EquipmentPanel.vue'
import MapPanel from './components/MapPanel.vue'
import WalletBar from './components/WalletBar.vue'
import MicropayModal from './components/MicropayModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import { useCharacterStore } from './stores/character'
import { confirmCodeCoinsCheckout } from './api/micropay'
import { useGameSettings } from './composables/useGameSettings'

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

function xpRequiredForLevel(levelValue) {
  const safeLevel = Math.max(1, Number(levelValue) || 1)
  return Math.round(85 * Math.pow(safeLevel, 1.35) + safeLevel * 42)
}


const router = useRouter()
const route = useRoute()
const ARENA_WORLD_WIDTH = 1700
const ARENA_WORLD_HEIGHT = WORLD_EDGE
const ARENA_ENTRY_TARGET_Y = ARENA_WORLD_HEIGHT / 2
const JVM_VOLCANO_ENTRY_Y = 190
const LARAVEL_CITADEL_ENTRY_Y = ARENA_WORLD_HEIGHT - 220
const COMPOSER_DESERT_ENTRY_Y = ARENA_WORLD_HEIGHT - 260
const worldWidthPx = `${ARENA_WORLD_WIDTH}px`
const worldHeightPx = `${ARENA_WORLD_HEIGHT}px`
const isFading = ref(lastTransition.value === 'main-to-second')
const startY = ref(lastTransition.value === 'main-to-second' ? -50 : ARENA_WORLD_HEIGHT / 2)

const showPanel = ref(null)
const showMapPanel = ref(false)
const showMicropay = ref(false)
const showSettings = ref(false)

const characterStore = useCharacterStore()
const { keyMatches, settings, keyLabel } = useGameSettings()
const colorStill = ref('#e94560')
const colorMoving = ref('#f5a623')
const currentMap = computed(() => {
  const faction = isPhpKingdomSelected() ? 'php' : 'java'
  const idx = Math.min((section.value || 1) - 1, 5)
  return SECTION_MAPS[faction][idx]
})
const mapImageByName = {
  'Array Islands': arrayIslandsMap,
  'JVM Volcano': jvmVolcanoMap,
  'Maven Mountains': mavenMountainsMap,
  'Spring Boot City': springBootCityMap,
  'GC Swamp': gcSwampMap,
  'Hibernate Ruins': hibernateRuinsMap,
  'Spring Border Gate': springBorderGateMap,
  'Eloquent Swamps': eloquentSwampsMap,
  'Blade Forest': bladeForestMap,
  'Composer Desert': composerDesertMap,
  'Laravel Citadel': laravelCitadelMap,
  'PHP Frontier Marshes': phpFrontierMarshesMap,
}
const currentArenaMapImage = computed(() => {
  if (isFinalKingdomSection.value) {
    return isPhpKingdomSelected() ? phpKingdomMap : javaKingdomMap
  }
  return mapImageByName[currentMap.value?.name] || ''
})
const currentArenaMapName = computed(() => {
  if (isFinalKingdomSection.value) {
    return isPhpKingdomSelected() ? 'REINO PHP (BOSS FINAL)' : 'REINO JAVA (BOSS FINAL)'
  }
  return currentMap.value?.name?.toUpperCase() || 'MAPA DESCONOCIDO'
})

const isArrayIslandsSection = computed(() => currentMap.value?.name === 'Array Islands')
const isJvmVolcanoSection = computed(() => currentMap.value?.name === 'JVM Volcano')
const isMavenMountainsSection = computed(() => currentMap.value?.name === 'Maven Mountains')
const isSpringBootCitySection = computed(() => currentMap.value?.name === 'Spring Boot City')
const isGcSwampSection = computed(() => currentMap.value?.name === 'GC Swamp')
const isHibernateRuinsSection = computed(() => currentMap.value?.name === 'Hibernate Ruins')
const isSpringBorderGateSection = computed(() => currentMap.value?.name === 'Spring Border Gate')
const isEloquentSwampsSection = computed(() => currentMap.value?.name === 'Eloquent Swamps')
const isBladeForestSection = computed(() => currentMap.value?.name === 'Blade Forest')
const isComposerDesertSection = computed(() => currentMap.value?.name === 'Composer Desert')
const isLaravelCitadelSection = computed(() => currentMap.value?.name === 'Laravel Citadel')
const isPhpFrontierMarshesSection = computed(() => currentMap.value?.name === 'PHP Frontier Marshes')
const isFinalKingdomSection = computed(() => Number(section.value || 1) === TOTAL_SECTIONS)
const currentKingdomHudName = computed(() => (isPhpKingdomSelected() ? 'REINO DE PHP' : 'REINO DE JAVA'))
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
const finalBossName = computed(() => (isPhpKingdomSelected() ? 'ANDRÉS' : 'JUAN CARLOS'))
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
const ARRAY_ISLANDS_INNER_BOUNDS = {
  // Con `background-size: auto 100%` el mapa cuadrado queda centrado en X.
  left: 300,
  right: 1400,
  top: 70,
  bottom: 1130,
}
const jvmVolcanoMaskReady = ref(false)
let jvmVolcanoMaskData = null
let jvmVolcanoMaskWidth = 0
let jvmVolcanoMaskHeight = 0
let jvmVolcanoMaskPromise = null
const mavenMountainsMaskReady = ref(false)
let mavenMountainsMaskData = null
let mavenMountainsMaskWidth = 0
let mavenMountainsMaskHeight = 0
let mavenMountainsMaskPromise = null
const springBootCityMaskReady = ref(false)
let springBootCityMaskData = null
let springBootCityMaskWidth = 0
let springBootCityMaskHeight = 0
let springBootCityMaskPromise = null
const hibernateRuinsMaskReady = ref(false)
let hibernateRuinsMaskData = null
let hibernateRuinsMaskWidth = 0
let hibernateRuinsMaskHeight = 0
let hibernateRuinsMaskPromise = null
const springBorderGateMaskReady = ref(false)
let springBorderGateMaskData = null
let springBorderGateMaskWidth = 0
let springBorderGateMaskHeight = 0
let springBorderGateMaskPromise = null
const eloquentSwampsMaskReady = ref(false)
let eloquentSwampsMaskData = null
let eloquentSwampsMaskWidth = 0
let eloquentSwampsMaskHeight = 0
let eloquentSwampsMaskPromise = null
const bladeForestMaskReady = ref(false)
let bladeForestMaskData = null
let bladeForestMaskWidth = 0
let bladeForestMaskHeight = 0
let bladeForestMaskPromise = null
const composerDesertMaskReady = ref(false)
let composerDesertMaskData = null
let composerDesertMaskWidth = 0
let composerDesertMaskHeight = 0
let composerDesertMaskPromise = null
const laravelCitadelMaskReady = ref(false)
let laravelCitadelMaskData = null
let laravelCitadelMaskWidth = 0
let laravelCitadelMaskHeight = 0
let laravelCitadelMaskPromise = null
const phpFrontierMarshesMaskReady = ref(false)
let phpFrontierMarshesMaskData = null
let phpFrontierMarshesMaskWidth = 0
let phpFrontierMarshesMaskHeight = 0
let phpFrontierMarshesMaskPromise = null
const javaKingdomMaskReady = ref(false)
let javaKingdomMaskData = null
let javaKingdomMaskWidth = 0
let javaKingdomMaskHeight = 0
let javaKingdomMaskPromise = null
const phpKingdomMaskReady = ref(false)
let phpKingdomMaskData = null
let phpKingdomMaskWidth = 0
let phpKingdomMaskHeight = 0
let phpKingdomMaskPromise = null

const arenaFloorStyle = computed(() => {
  if (isFinalKingdomSection.value) {
    return {
      backgroundImage: `url(${isPhpKingdomSelected() ? phpKingdomMap : javaKingdomMap})`,
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
  if (isGcSwampSection.value) {
    return {
      backgroundImage: `url(${gcSwampMap})`,
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
  if (isBladeForestSection.value) {
    return {
      backgroundImage: `url(${bladeForestMap})`,
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
    moveSpeed: Math.max(0.1, Number(characterStore.moveSpeed || 1) || 1),
    baseDamage: Math.max(1, Number(characterStore.baseDamage || 12) || 12),
  }
}

function applyLevelUpRewards(levelUps = 1) {
  for (let i = 0; i < levelUps; i++) {
    levelState.value.maxHealth += 12
    levelState.value.armor += 3
    levelState.value.attackSpeed = Math.min(2.4, Number((levelState.value.attackSpeed + 0.025).toFixed(3)))
    levelState.value.moveSpeed = Math.min(1.45, Number((levelState.value.moveSpeed + 0.01).toFixed(3)))
    levelState.value.baseDamage += 3
  }
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
    playerMaxHp.value = Math.round(levelState.value.maxHealth)
    playerHp.value = Math.min(playerMaxHp.value, playerHp.value + pendingLevelUps * 14)
  }
}

function isTruthyQueryFlag(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return ['1', 'true', 'yes', 'on', 'si', 'sí'].includes(normalized)
}

const devImmortalMode = computed(() => import.meta.env.DEV && isTruthyQueryFlag(route.query.dev_immortal))
const devMaxDamageMode = computed(() => import.meta.env.DEV && isTruthyQueryFlag(route.query.dev_max_damage))
const xpProgressPct = computed(() => {
  const total = Math.max(1, Number(levelState.value.nextLevelXp || 1))
  return Math.max(0, Math.min(100, Math.round((100 * Number(levelState.value.experience || 0)) / total)))
})

function isPhpKingdomSelected() {
  const kName = String(characterStore.kingdomName || '').toLowerCase()
  if (kName.includes('php') || kName.includes('peachepe')) return true
  if (kName.includes('java')) return false
  const kId = Number(characterStore.kingdomId)
  // Compatibilidad con backends donde PHP puede ser 2 (y Java 1).
  return kId === 2
}

function getSectionMapNameByIndex(faction, sectionNumber) {
  const sectionIndex = Math.min(Math.max(Number(sectionNumber || 1) - 1, 0), 5)
  return SECTION_MAPS[faction]?.[sectionIndex]?.name || ''
}

function getArenaEntryPoint(mapName) {
  if (mapName === 'JVM Volcano') {
    // Entrada arriba del mapa, pero siempre dentro del terreno jugable.
    return { x: ARENA_WORLD_WIDTH / 2, y: JVM_VOLCANO_ENTRY_Y }
  }
  if (mapName === 'Laravel Citadel') {
    return { x: ARENA_WORLD_WIDTH / 2, y: LARAVEL_CITADEL_ENTRY_Y }
  }
  if (mapName === 'Composer Desert') {
    return { x: ARENA_WORLD_WIDTH / 2, y: COMPOSER_DESERT_ENTRY_Y }
  }
  return { x: ARENA_WORLD_WIDTH / 2, y: ARENA_ENTRY_TARGET_Y }
}

function ensureJvmVolcanoMaskLoaded() {
  if (jvmVolcanoMaskReady.value) return Promise.resolve(true)
  if (jvmVolcanoMaskPromise) return jvmVolcanoMaskPromise
  jvmVolcanoMaskPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        resolve(false)
        return
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      jvmVolcanoMaskData = imageData.data
      jvmVolcanoMaskWidth = canvas.width
      jvmVolcanoMaskHeight = canvas.height
      jvmVolcanoMaskReady.value = true
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = jvmVolcanoMap
  })
  return jvmVolcanoMaskPromise
}

function getJvmVolcanoPixelAtWorld(worldX, worldY) {
  if (!jvmVolcanoMaskReady.value || !jvmVolcanoMaskData) return null
  const clampedX = Math.max(0, Math.min(ARENA_WORLD_WIDTH - 1, worldX))
  const clampedY = Math.max(0, Math.min(ARENA_WORLD_HEIGHT - 1, worldY))
  const px = Math.floor((clampedX / ARENA_WORLD_WIDTH) * (jvmVolcanoMaskWidth - 1))
  const py = Math.floor((clampedY / ARENA_WORLD_HEIGHT) * (jvmVolcanoMaskHeight - 1))
  const idx = (py * jvmVolcanoMaskWidth + px) * 4
  return [
    jvmVolcanoMaskData[idx],
    jvmVolcanoMaskData[idx + 1],
    jvmVolcanoMaskData[idx + 2],
    jvmVolcanoMaskData[idx + 3],
  ]
}

function isJvmStonePixel(r, g, b, a) {
  if (a < 20) return false
  return Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && r < 95 && g < 95 && b < 95
}

function isJvmVolcanoLargeStoneAtWorld(worldX, worldY) {
  // Filtramos piedras pequeñas: solo bloquea si hay "masa" de piedra alrededor.
  const offsets = [
    [0, 0],
    [10, 0], [-10, 0], [0, 10], [0, -10],
    [18, 0], [-18, 0], [0, 18], [0, -18],
    [12, 12], [-12, 12], [12, -12], [-12, -12],
  ]
  let stoneHits = 0
  for (const [ox, oy] of offsets) {
    const rgba = getJvmVolcanoPixelAtWorld(worldX + ox, worldY + oy)
    if (!rgba) continue
    if (isJvmStonePixel(rgba[0], rgba[1], rgba[2], rgba[3])) {
      stoneHits += 1
    }
  }
  return stoneHits >= 8
}

function isJvmVolcanoBlockedPixel(r, g, b, a) {
  if (a < 20) return true
  // Lava brillante.
  const isLava = r > 130 && g > 30 && b < 40
  // Vacío oscuro exterior del mapa.
  const isAbyss = r < 24 && g < 8 && b < 6
  return isLava || isAbyss
}

function ensureMavenMountainsMaskLoaded() {
  if (mavenMountainsMaskReady.value) return Promise.resolve(true)
  if (mavenMountainsMaskPromise) return mavenMountainsMaskPromise
  mavenMountainsMaskPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        resolve(false)
        return
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      mavenMountainsMaskData = imageData.data
      mavenMountainsMaskWidth = canvas.width
      mavenMountainsMaskHeight = canvas.height
      mavenMountainsMaskReady.value = true
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = mavenMountainsMap
  })
  return mavenMountainsMaskPromise
}

function getMavenMountainsPixelAtWorld(worldX, worldY) {
  if (!mavenMountainsMaskReady.value || !mavenMountainsMaskData) return null
  const clampedX = Math.max(0, Math.min(ARENA_WORLD_WIDTH - 1, worldX))
  const clampedY = Math.max(0, Math.min(ARENA_WORLD_HEIGHT - 1, worldY))
  const px = Math.floor((clampedX / ARENA_WORLD_WIDTH) * (mavenMountainsMaskWidth - 1))
  const py = Math.floor((clampedY / ARENA_WORLD_HEIGHT) * (mavenMountainsMaskHeight - 1))
  const idx = (py * mavenMountainsMaskWidth + px) * 4
  return [
    mavenMountainsMaskData[idx],
    mavenMountainsMaskData[idx + 1],
    mavenMountainsMaskData[idx + 2],
    mavenMountainsMaskData[idx + 3],
  ]
}

function isMavenObstaclePixel(r, g, b, a) {
  if (a < 20) return true
  // Fondo exterior oscuro.
  if (r < 15 && g < 15 && b < 30) return true
  // Rocas/desniveles claros.
  const isLightStone = r > 90 && g > 95 && b > 110
  // Sombra de desniveles y huecos profundos.
  const isDeepShadow = r < 28 && g < 30 && b < 58
  return isLightStone || isDeepShadow
}

function isMavenLargeObstacleAtWorld(worldX, worldY) {
  // Evita bloquear piedras pequeñas: solo bloquea masa grande.
  const offsets = [
    [0, 0],
    [10, 0], [-10, 0], [0, 10], [0, -10],
    [18, 0], [-18, 0], [0, 18], [0, -18],
    [12, 12], [-12, 12], [12, -12], [-12, -12],
  ]
  let obstacleHits = 0
  for (const [ox, oy] of offsets) {
    const rgba = getMavenMountainsPixelAtWorld(worldX + ox, worldY + oy)
    if (!rgba) continue
    if (isMavenObstaclePixel(rgba[0], rgba[1], rgba[2], rgba[3])) {
      obstacleHits += 1
    }
  }
  return obstacleHits >= 8
}

function ensureSpringBootCityMaskLoaded() {
  if (springBootCityMaskReady.value) return Promise.resolve(true)
  if (springBootCityMaskPromise) return springBootCityMaskPromise
  springBootCityMaskPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        resolve(false)
        return
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      springBootCityMaskData = imageData.data
      springBootCityMaskWidth = canvas.width
      springBootCityMaskHeight = canvas.height
      springBootCityMaskReady.value = true
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = springBootCityMap
  })
  return springBootCityMaskPromise
}

function getSpringBootCityPixelAtWorld(worldX, worldY) {
  if (!springBootCityMaskReady.value || !springBootCityMaskData) return null
  const clampedX = Math.max(0, Math.min(ARENA_WORLD_WIDTH - 1, worldX))
  const clampedY = Math.max(0, Math.min(ARENA_WORLD_HEIGHT - 1, worldY))
  const px = Math.floor((clampedX / ARENA_WORLD_WIDTH) * (springBootCityMaskWidth - 1))
  const py = Math.floor((clampedY / ARENA_WORLD_HEIGHT) * (springBootCityMaskHeight - 1))
  const idx = (py * springBootCityMaskWidth + px) * 4
  return [
    springBootCityMaskData[idx],
    springBootCityMaskData[idx + 1],
    springBootCityMaskData[idx + 2],
    springBootCityMaskData[idx + 3],
  ]
}

function isSpringBootCityWallPixel(r, g, b, a) {
  if (a < 20) return false
  // Bordes de edificios: gris-azulado claro.
  return (
    r >= 70 && r <= 170
    && g >= 78 && g <= 185
    && b >= 95 && b <= 210
    && Math.abs(r - g) <= 34
    && Math.abs(g - b) <= 46
  )
}

function isSpringBootCityRoofPixel(r, g, b, a) {
  if (a < 20) return false
  // Interior oscuro de edificio.
  return (
    r >= 10 && r <= 55
    && g >= 16 && g <= 75
    && b >= 40 && b <= 120
    && (b - r) >= 18
  )
}

function countNearbySpringWalls(worldX, worldY) {
  const wallOffsets = [
    [10, 0], [-10, 0], [0, 10], [0, -10],
    [14, 0], [-14, 0], [0, 14], [0, -14],
    [10, 10], [-10, 10], [10, -10], [-10, -10],
  ]
  let walls = 0
  for (const [ox, oy] of wallOffsets) {
    const rgba = getSpringBootCityPixelAtWorld(worldX + ox, worldY + oy)
    if (!rgba) continue
    if (isSpringBootCityWallPixel(rgba[0], rgba[1], rgba[2], rgba[3])) walls += 1
  }
  return walls
}

function isSpringBootCityBuildingAtWorld(worldX, worldY) {
  const rgba = getSpringBootCityPixelAtWorld(worldX, worldY)
  if (!rgba) return false
  const isWall = isSpringBootCityWallPixel(rgba[0], rgba[1], rgba[2], rgba[3])
  if (isWall) return true
  // También bloquea interior de edificio si está conectado a muros.
  const isRoof = isSpringBootCityRoofPixel(rgba[0], rgba[1], rgba[2], rgba[3])
  if (!isRoof) return false
  return countNearbySpringWalls(worldX, worldY) >= 1
}

function isSpringBootCityLargeBuildingAtWorld(worldX, worldY) {
  const offsets = [
    [0, 0],
    [9, 0], [-9, 0], [0, 9], [0, -9],
    [15, 0], [-15, 0], [0, 15], [0, -15],
    [11, 11], [-11, 11], [11, -11], [-11, -11],
  ]
  let hits = 0
  for (const [ox, oy] of offsets) {
    if (isSpringBootCityBuildingAtWorld(worldX + ox, worldY + oy)) hits += 1
  }
  return hits >= 8
}

function ensureHibernateRuinsMaskLoaded() {
  if (hibernateRuinsMaskReady.value) return Promise.resolve(true)
  if (hibernateRuinsMaskPromise) return hibernateRuinsMaskPromise
  hibernateRuinsMaskPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        resolve(false)
        return
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      hibernateRuinsMaskData = imageData.data
      hibernateRuinsMaskWidth = canvas.width
      hibernateRuinsMaskHeight = canvas.height
      hibernateRuinsMaskReady.value = true
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = hibernateRuinsMap
  })
  return hibernateRuinsMaskPromise
}

function getHibernateRuinsPixelAtWorld(worldX, worldY) {
  if (!hibernateRuinsMaskReady.value || !hibernateRuinsMaskData) return null
  const clampedX = Math.max(0, Math.min(ARENA_WORLD_WIDTH - 1, worldX))
  const clampedY = Math.max(0, Math.min(ARENA_WORLD_HEIGHT - 1, worldY))
  const px = Math.floor((clampedX / ARENA_WORLD_WIDTH) * (hibernateRuinsMaskWidth - 1))
  const py = Math.floor((clampedY / ARENA_WORLD_HEIGHT) * (hibernateRuinsMaskHeight - 1))
  const idx = (py * hibernateRuinsMaskWidth + px) * 4
  return [
    hibernateRuinsMaskData[idx],
    hibernateRuinsMaskData[idx + 1],
    hibernateRuinsMaskData[idx + 2],
    hibernateRuinsMaskData[idx + 3],
  ]
}

function isHibernateWallPixel(r, g, b, a) {
  if (a < 20) return false
  // Muros de piedra cálida.
  return (
    r >= 78 && r <= 190
    && g >= 48 && g <= 145
    && b >= 16 && b <= 92
    && r > g && g > b
  )
}

function isHibernateVoidPixel(r, g, b, a) {
  if (a < 20) return true
  return r < 26 && g < 20 && b < 12
}

function isHibernateLargeWallAtWorld(worldX, worldY) {
  const offsets = [
    [0, 0],
    [9, 0], [-9, 0], [0, 9], [0, -9],
    [15, 0], [-15, 0], [0, 15], [0, -15],
    [11, 11], [-11, 11], [11, -11], [-11, -11],
  ]
  let hits = 0
  for (const [ox, oy] of offsets) {
    const rgba = getHibernateRuinsPixelAtWorld(worldX + ox, worldY + oy)
    if (!rgba) continue
    if (isHibernateWallPixel(rgba[0], rgba[1], rgba[2], rgba[3])) hits += 1
  }
  return hits >= 7
}

function ensureSpringBorderGateMaskLoaded() {
  if (springBorderGateMaskReady.value) return Promise.resolve(true)
  if (springBorderGateMaskPromise) return springBorderGateMaskPromise
  springBorderGateMaskPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        resolve(false)
        return
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      springBorderGateMaskData = imageData.data
      springBorderGateMaskWidth = canvas.width
      springBorderGateMaskHeight = canvas.height
      springBorderGateMaskReady.value = true
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = springBorderGateMap
  })
  return springBorderGateMaskPromise
}

function getSpringBorderGatePixelAtWorld(worldX, worldY) {
  if (!springBorderGateMaskReady.value || !springBorderGateMaskData) return null
  const clampedX = Math.max(0, Math.min(ARENA_WORLD_WIDTH - 1, worldX))
  const clampedY = Math.max(0, Math.min(ARENA_WORLD_HEIGHT - 1, worldY))
  const px = Math.floor((clampedX / ARENA_WORLD_WIDTH) * (springBorderGateMaskWidth - 1))
  const py = Math.floor((clampedY / ARENA_WORLD_HEIGHT) * (springBorderGateMaskHeight - 1))
  const idx = (py * springBorderGateMaskWidth + px) * 4
  return [
    springBorderGateMaskData[idx],
    springBorderGateMaskData[idx + 1],
    springBorderGateMaskData[idx + 2],
    springBorderGateMaskData[idx + 3],
  ]
}

function isSpringBorderGateBlockedPixel(r, g, b, a, worldY) {
  if (a < 20) return true
  const isVoid = r < 20 && g < 14 && b < 10
  if (isVoid) return true
  // Muros/piedra de la puerta.
  const isWallStone = (
    r >= 30 && r <= 170
    && g >= 24 && g <= 135
    && b >= 18 && b <= 110
    && Math.abs(r - g) <= 32
    && Math.abs(g - b) <= 32
  )
  if (isWallStone) return true
  // Líneas naranjas de la puerta (solo en banda superior).
  const isGateAccent = worldY < 320 && r > 130 && g > 55 && b < 45
  return isGateAccent
}

function ensureEloquentSwampsMaskLoaded() {
  if (eloquentSwampsMaskReady.value) return Promise.resolve(true)
  if (eloquentSwampsMaskPromise) return eloquentSwampsMaskPromise
  eloquentSwampsMaskPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        resolve(false)
        return
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      eloquentSwampsMaskData = imageData.data
      eloquentSwampsMaskWidth = canvas.width
      eloquentSwampsMaskHeight = canvas.height
      eloquentSwampsMaskReady.value = true
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = eloquentSwampsMap
  })
  return eloquentSwampsMaskPromise
}

function getEloquentSwampsPixelAtWorld(worldX, worldY) {
  if (!eloquentSwampsMaskReady.value || !eloquentSwampsMaskData) return null
  const clampedX = Math.max(0, Math.min(ARENA_WORLD_WIDTH - 1, worldX))
  const clampedY = Math.max(0, Math.min(ARENA_WORLD_HEIGHT - 1, worldY))
  const px = Math.floor((clampedX / ARENA_WORLD_WIDTH) * (eloquentSwampsMaskWidth - 1))
  const py = Math.floor((clampedY / ARENA_WORLD_HEIGHT) * (eloquentSwampsMaskHeight - 1))
  const idx = (py * eloquentSwampsMaskWidth + px) * 4
  return [
    eloquentSwampsMaskData[idx],
    eloquentSwampsMaskData[idx + 1],
    eloquentSwampsMaskData[idx + 2],
    eloquentSwampsMaskData[idx + 3],
  ]
}

function isEloquentSwampsBlockedPixel(r, g, b, a) {
  if (a < 20) return true
  // Verde oscuro exterior del borde.
  const isBorderDark = r < 20 && g < 40 && b < 25
  if (isBorderDark) return true
  // Agua de pantano (verde-azulado oscuro).
  const isWater = (
    r <= 34
    && g >= 38 && g <= 78
    && b >= 30 && b <= 70
    && (g - r) >= 14
    && (b - r) >= 8
  )
  return isWater
}

function ensureBladeForestMaskLoaded() {
  if (bladeForestMaskReady.value) return Promise.resolve(true)
  if (bladeForestMaskPromise) return bladeForestMaskPromise
  bladeForestMaskPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        resolve(false)
        return
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      bladeForestMaskData = imageData.data
      bladeForestMaskWidth = canvas.width
      bladeForestMaskHeight = canvas.height
      bladeForestMaskReady.value = true
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = bladeForestMap
  })
  return bladeForestMaskPromise
}

function getBladeForestPixelAtWorld(worldX, worldY) {
  if (!bladeForestMaskReady.value || !bladeForestMaskData) return null
  const clampedX = Math.max(0, Math.min(ARENA_WORLD_WIDTH - 1, worldX))
  const clampedY = Math.max(0, Math.min(ARENA_WORLD_HEIGHT - 1, worldY))
  const px = Math.floor((clampedX / ARENA_WORLD_WIDTH) * (bladeForestMaskWidth - 1))
  const py = Math.floor((clampedY / ARENA_WORLD_HEIGHT) * (bladeForestMaskHeight - 1))
  const idx = (py * bladeForestMaskWidth + px) * 4
  return [
    bladeForestMaskData[idx],
    bladeForestMaskData[idx + 1],
    bladeForestMaskData[idx + 2],
    bladeForestMaskData[idx + 3],
  ]
}

function isBladeForestTreePixel(r, g, b, a) {
  if (a < 20) return false
  // Copa de pino (no césped/camino): verde medio con contraste marcado.
  return (
    r >= 24 && r <= 72
    && g >= 68 && g <= 128
    && b >= 18 && b <= 74
    && (g - r) >= 24
    && (g - r) <= 62
    && (g - b) >= 18
  )
}

function isBladeForestSwordSafeZone(worldX, worldY) {
  // Zona central de la espada: siempre transitable.
  return worldX >= 640 && worldX <= 1060 && worldY >= 120 && worldY <= 1080
}

function isBladeForestBorderDarkPixel(r, g, b, a) {
  if (a < 20) return true
  return r < 12 && g < 36 && b < 16
}

function isBladeForestLargeTreeAtWorld(worldX, worldY) {
  if (isBladeForestSwordSafeZone(worldX, worldY)) {
    return false
  }
  // Evita bloquear césped/sombras suaves: requiere masa de árbol.
  const offsets = [
    [0, 0],
    [8, 0], [-8, 0], [0, 8], [0, -8],
    [14, 0], [-14, 0], [0, 14], [0, -14],
    [10, 10], [-10, 10], [10, -10], [-10, -10],
  ]
  let treeHits = 0
  for (const [ox, oy] of offsets) {
    const rgba = getBladeForestPixelAtWorld(worldX + ox, worldY + oy)
    if (!rgba) continue
    if (isBladeForestTreePixel(rgba[0], rgba[1], rgba[2], rgba[3])) treeHits += 1
  }
  return treeHits >= 9
}

function ensureComposerDesertMaskLoaded() {
  if (composerDesertMaskReady.value) return Promise.resolve(true)
  if (composerDesertMaskPromise) return composerDesertMaskPromise
  composerDesertMaskPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return resolve(false)
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      composerDesertMaskData = imageData.data
      composerDesertMaskWidth = canvas.width
      composerDesertMaskHeight = canvas.height
      composerDesertMaskReady.value = true
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = composerDesertMap
  })
  return composerDesertMaskPromise
}

function getComposerDesertPixelAtWorld(worldX, worldY) {
  if (!composerDesertMaskReady.value || !composerDesertMaskData) return null
  const clampedX = Math.max(0, Math.min(ARENA_WORLD_WIDTH - 1, worldX))
  const clampedY = Math.max(0, Math.min(ARENA_WORLD_HEIGHT - 1, worldY))
  const px = Math.floor((clampedX / ARENA_WORLD_WIDTH) * (composerDesertMaskWidth - 1))
  const py = Math.floor((clampedY / ARENA_WORLD_HEIGHT) * (composerDesertMaskHeight - 1))
  const idx = (py * composerDesertMaskWidth + px) * 4
  return [
    composerDesertMaskData[idx],
    composerDesertMaskData[idx + 1],
    composerDesertMaskData[idx + 2],
    composerDesertMaskData[idx + 3],
  ]
}

function isComposerDesertBlockedPixel(r, g, b, a) {
  if (a < 20) return true
  const isVoid = r < 28 && g < 24 && b < 16
  // Rocas oscuras grandes (no suelo base).
  const isDarkRock = r >= 42 && r <= 92 && g >= 30 && g <= 68 && b >= 14 && b <= 42
  return isVoid || isDarkRock
}

function ensureLaravelCitadelMaskLoaded() {
  if (laravelCitadelMaskReady.value) return Promise.resolve(true)
  if (laravelCitadelMaskPromise) return laravelCitadelMaskPromise
  laravelCitadelMaskPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return resolve(false)
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      laravelCitadelMaskData = imageData.data
      laravelCitadelMaskWidth = canvas.width
      laravelCitadelMaskHeight = canvas.height
      laravelCitadelMaskReady.value = true
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = laravelCitadelMap
  })
  return laravelCitadelMaskPromise
}

function getLaravelCitadelPixelAtWorld(worldX, worldY) {
  if (!laravelCitadelMaskReady.value || !laravelCitadelMaskData) return null
  const clampedX = Math.max(0, Math.min(ARENA_WORLD_WIDTH - 1, worldX))
  const clampedY = Math.max(0, Math.min(ARENA_WORLD_HEIGHT - 1, worldY))
  const px = Math.floor((clampedX / ARENA_WORLD_WIDTH) * (laravelCitadelMaskWidth - 1))
  const py = Math.floor((clampedY / ARENA_WORLD_HEIGHT) * (laravelCitadelMaskHeight - 1))
  const idx = (py * laravelCitadelMaskWidth + px) * 4
  return [
    laravelCitadelMaskData[idx],
    laravelCitadelMaskData[idx + 1],
    laravelCitadelMaskData[idx + 2],
    laravelCitadelMaskData[idx + 3],
  ]
}

function isLaravelCitadelBlockedPixel(r, g, b, a) {
  if (a < 20) return true
  const isVoid = r < 22 && g < 22 && b < 48
  const isStoneWall = r >= 78 && r <= 190 && g >= 78 && g <= 190 && b >= 90 && b <= 220 && Math.abs(r - g) <= 35 && Math.abs(g - b) <= 45
  const isRedBarrier = r > 110 && g < 95 && b < 110
  return isVoid || isStoneWall || isRedBarrier
}

function ensurePhpFrontierMarshesMaskLoaded() {
  if (phpFrontierMarshesMaskReady.value) return Promise.resolve(true)
  if (phpFrontierMarshesMaskPromise) return phpFrontierMarshesMaskPromise
  phpFrontierMarshesMaskPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return resolve(false)
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      phpFrontierMarshesMaskData = imageData.data
      phpFrontierMarshesMaskWidth = canvas.width
      phpFrontierMarshesMaskHeight = canvas.height
      phpFrontierMarshesMaskReady.value = true
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = phpFrontierMarshesMap
  })
  return phpFrontierMarshesMaskPromise
}

function getPhpFrontierMarshesPixelAtWorld(worldX, worldY) {
  if (!phpFrontierMarshesMaskReady.value || !phpFrontierMarshesMaskData) return null
  const clampedX = Math.max(0, Math.min(ARENA_WORLD_WIDTH - 1, worldX))
  const clampedY = Math.max(0, Math.min(ARENA_WORLD_HEIGHT - 1, worldY))
  const px = Math.floor((clampedX / ARENA_WORLD_WIDTH) * (phpFrontierMarshesMaskWidth - 1))
  const py = Math.floor((clampedY / ARENA_WORLD_HEIGHT) * (phpFrontierMarshesMaskHeight - 1))
  const idx = (py * phpFrontierMarshesMaskWidth + px) * 4
  return [
    phpFrontierMarshesMaskData[idx],
    phpFrontierMarshesMaskData[idx + 1],
    phpFrontierMarshesMaskData[idx + 2],
    phpFrontierMarshesMaskData[idx + 3],
  ]
}

function isPhpFrontierMarshesBlockedPixel(r, g, b, a) {
  if (a < 20) return true
  // Borde exterior oscuro.
  const isOuterDark = r < 10 && g < 28 && b < 14
  if (isOuterDark) return true
  // Agua oscura de marisma.
  const isWater = r <= 30 && g <= 58 && b >= 22 && b <= 60 && (b - r) >= 6
  if (isWater) return true
  // Muralla/puerta púrpura.
  const isGateWall = r >= 32 && r <= 130 && g >= 24 && g <= 95 && b >= 45 && b <= 150 && (b - g) >= 12
  return isGateWall
}

function ensureJavaKingdomMaskLoaded() {
  if (javaKingdomMaskReady.value) return Promise.resolve(true)
  if (javaKingdomMaskPromise) return javaKingdomMaskPromise
  javaKingdomMaskPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return resolve(false)
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      javaKingdomMaskData = imageData.data
      javaKingdomMaskWidth = canvas.width
      javaKingdomMaskHeight = canvas.height
      javaKingdomMaskReady.value = true
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = javaKingdomMap
  })
  return javaKingdomMaskPromise
}

function ensurePhpKingdomMaskLoaded() {
  if (phpKingdomMaskReady.value) return Promise.resolve(true)
  if (phpKingdomMaskPromise) return phpKingdomMaskPromise
  phpKingdomMaskPromise = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return resolve(false)
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      phpKingdomMaskData = imageData.data
      phpKingdomMaskWidth = canvas.width
      phpKingdomMaskHeight = canvas.height
      phpKingdomMaskReady.value = true
      resolve(true)
    }
    img.onerror = () => resolve(false)
    img.src = phpKingdomMap
  })
  return phpKingdomMaskPromise
}

function getKingdomPixelAtWorld(worldX, worldY, forPhp) {
  const ready = forPhp ? phpKingdomMaskReady.value : javaKingdomMaskReady.value
  const data = forPhp ? phpKingdomMaskData : javaKingdomMaskData
  const width = forPhp ? phpKingdomMaskWidth : javaKingdomMaskWidth
  const height = forPhp ? phpKingdomMaskHeight : javaKingdomMaskHeight
  if (!ready || !data) return null
  const clampedX = Math.max(0, Math.min(ARENA_WORLD_WIDTH - 1, worldX))
  const clampedY = Math.max(0, Math.min(ARENA_WORLD_HEIGHT - 1, worldY))
  const px = Math.floor((clampedX / ARENA_WORLD_WIDTH) * (width - 1))
  const py = Math.floor((clampedY / ARENA_WORLD_HEIGHT) * (height - 1))
  const idx = (py * width + px) * 4
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
}

function isKingdomBlockedPixel(r, g, b, a, forPhp) {
  if (a < 20) return true
  const isVoid = forPhp
    ? (r < 24 && g < 40 && b < 24)
    : (r < 30 && g < 30 && b < 30)
  if (isVoid) return true
  const isWall = forPhp
    ? (r >= 58 && r <= 150 && g >= 48 && g <= 125 && b >= 60 && b <= 165 && (b - g) >= 4)
    : (r >= 55 && r <= 165 && g >= 55 && g <= 165 && b >= 65 && b <= 190 && Math.abs(r - g) <= 32 && Math.abs(g - b) <= 40)
  return isWall
}

function isArrayIslandsWalkable(nextX, nextY, ctx = {}) {
  const currentSection = Number(ctx.section || 1)
  const faction = isPhpKingdomSelected() ? 'php' : 'java'
  const sectionIndex = Math.min(Math.max(currentSection - 1, 0), 5)
  const sectionMapName = SECTION_MAPS[faction]?.[sectionIndex]?.name
  if (currentSection === TOTAL_SECTIONS) {
    const forPhp = faction === 'php'
    // En el reino final de Java no aplicamos colisión por máscara para permitir
    // movimiento libre con mapas artísticos oscuros.
    if (!forPhp) return true
    const ready = forPhp ? phpKingdomMaskReady.value : javaKingdomMaskReady.value
    if (!ready) return true
    const playerSize = Number(ctx.playerSize || 40)
    const pad = 3
    const samplePoints = [
      [nextX + pad, nextY + pad],
      [nextX + playerSize - pad, nextY + pad],
      [nextX + pad, nextY + playerSize - pad],
      [nextX + playerSize - pad, nextY + playerSize - pad],
      [nextX + playerSize / 2, nextY + pad],
      [nextX + playerSize / 2, nextY + playerSize - pad],
      [nextX + pad, nextY + playerSize / 2],
      [nextX + playerSize - pad, nextY + playerSize / 2],
      [nextX + playerSize / 2, nextY + playerSize / 2],
    ]
    return samplePoints.every(([px, py]) => {
      const rgba = getKingdomPixelAtWorld(px, py, forPhp)
      if (!rgba) return true
      return !isKingdomBlockedPixel(rgba[0], rgba[1], rgba[2], rgba[3], forPhp)
    })
  }
  if (sectionMapName === 'Array Islands') {
    const playerSize = Number(ctx.playerSize || 40)
    return (
      nextX >= ARRAY_ISLANDS_INNER_BOUNDS.left
      && nextY >= ARRAY_ISLANDS_INNER_BOUNDS.top
      && (nextX + playerSize) <= ARRAY_ISLANDS_INNER_BOUNDS.right
      && (nextY + playerSize) <= ARRAY_ISLANDS_INNER_BOUNDS.bottom
    )
  }
  if (sectionMapName === 'JVM Volcano' && jvmVolcanoMaskReady.value) {
    const playerSize = Number(ctx.playerSize || 40)
    const pad = 4
    const samplePoints = [
      [nextX + pad, nextY + pad],
      [nextX + playerSize - pad, nextY + pad],
      [nextX + pad, nextY + playerSize - pad],
      [nextX + playerSize - pad, nextY + playerSize - pad],
      [nextX + playerSize / 2, nextY + playerSize / 2],
    ]
    return samplePoints.every(([px, py]) => {
      const rgba = getJvmVolcanoPixelAtWorld(px, py)
      if (!rgba) return true
      if (isJvmVolcanoBlockedPixel(rgba[0], rgba[1], rgba[2], rgba[3])) {
        return false
      }
      return !isJvmVolcanoLargeStoneAtWorld(px, py)
    })
  }
  if (sectionMapName === 'Maven Mountains' && mavenMountainsMaskReady.value) {
    const playerSize = Number(ctx.playerSize || 40)
    const pad = 4
    const samplePoints = [
      [nextX + pad, nextY + pad],
      [nextX + playerSize - pad, nextY + pad],
      [nextX + pad, nextY + playerSize - pad],
      [nextX + playerSize - pad, nextY + playerSize - pad],
      [nextX + playerSize / 2, nextY + playerSize / 2],
    ]
    return samplePoints.every(([px, py]) => !isMavenLargeObstacleAtWorld(px, py))
  }
  if (sectionMapName === 'Spring Boot City' && springBootCityMaskReady.value) {
    return true
  }
  if (sectionMapName === 'Hibernate Ruins' && hibernateRuinsMaskReady.value) {
    const playerSize = Number(ctx.playerSize || 40)
    const pad = 3
    const samplePoints = [
      [nextX + pad, nextY + pad],
      [nextX + playerSize - pad, nextY + pad],
      [nextX + pad, nextY + playerSize - pad],
      [nextX + playerSize - pad, nextY + playerSize - pad],
      [nextX + playerSize / 2, nextY + pad],
      [nextX + playerSize / 2, nextY + playerSize - pad],
      [nextX + pad, nextY + playerSize / 2],
      [nextX + playerSize - pad, nextY + playerSize / 2],
      [nextX + playerSize / 2, nextY + playerSize / 2],
    ]
    return samplePoints.every(([px, py]) => {
      const rgba = getHibernateRuinsPixelAtWorld(px, py)
      if (!rgba) return true
      if (isHibernateVoidPixel(rgba[0], rgba[1], rgba[2], rgba[3])) return false
      return !isHibernateLargeWallAtWorld(px, py)
    })
  }
  if (sectionMapName === 'Spring Border Gate' && springBorderGateMaskReady.value) {
    const playerSize = Number(ctx.playerSize || 40)
    const pad = 3
    const samplePoints = [
      [nextX + pad, nextY + pad],
      [nextX + playerSize - pad, nextY + pad],
      [nextX + pad, nextY + playerSize - pad],
      [nextX + playerSize - pad, nextY + playerSize - pad],
      [nextX + playerSize / 2, nextY + playerSize / 2],
    ]
    return samplePoints.every(([px, py]) => {
      const rgba = getSpringBorderGatePixelAtWorld(px, py)
      if (!rgba) return true
      return !isSpringBorderGateBlockedPixel(rgba[0], rgba[1], rgba[2], rgba[3], py)
    })
  }
  if (sectionMapName === 'Eloquent Swamps' && eloquentSwampsMaskReady.value) {
    const playerSize = Number(ctx.playerSize || 40)
    const pad = 3
    const samplePoints = [
      [nextX + pad, nextY + pad],
      [nextX + playerSize - pad, nextY + pad],
      [nextX + pad, nextY + playerSize - pad],
      [nextX + playerSize - pad, nextY + playerSize - pad],
      [nextX + playerSize / 2, nextY + pad],
      [nextX + playerSize / 2, nextY + playerSize - pad],
      [nextX + pad, nextY + playerSize / 2],
      [nextX + playerSize - pad, nextY + playerSize / 2],
      [nextX + playerSize / 2, nextY + playerSize / 2],
    ]
    return samplePoints.every(([px, py]) => {
      const rgba = getEloquentSwampsPixelAtWorld(px, py)
      if (!rgba) return true
      return !isEloquentSwampsBlockedPixel(rgba[0], rgba[1], rgba[2], rgba[3])
    })
  }
  if (sectionMapName === 'Blade Forest' && bladeForestMaskReady.value) {
    const playerSize = Number(ctx.playerSize || 40)
    const pad = 3
    const samplePoints = [
      [nextX + pad, nextY + pad],
      [nextX + playerSize - pad, nextY + pad],
      [nextX + pad, nextY + playerSize - pad],
      [nextX + playerSize - pad, nextY + playerSize - pad],
      [nextX + playerSize / 2, nextY + pad],
      [nextX + playerSize / 2, nextY + playerSize - pad],
      [nextX + pad, nextY + playerSize / 2],
      [nextX + playerSize - pad, nextY + playerSize / 2],
      [nextX + playerSize / 2, nextY + playerSize / 2],
    ]
    return samplePoints.every(([px, py]) => {
      if (isBladeForestSwordSafeZone(px, py)) return true
      const rgba = getBladeForestPixelAtWorld(px, py)
      if (!rgba) return false
      if (isBladeForestLargeTreeAtWorld(px, py)) return false
      if (isBladeForestBorderDarkPixel(rgba[0], rgba[1], rgba[2], rgba[3])) return false
      return true
    })
  }
  if (sectionMapName === 'Composer Desert' && composerDesertMaskReady.value) {
    const playerSize = Number(ctx.playerSize || 40)
    const pad = 3
    const samplePoints = [
      [nextX + pad, nextY + pad],
      [nextX + playerSize - pad, nextY + pad],
      [nextX + pad, nextY + playerSize - pad],
      [nextX + playerSize - pad, nextY + playerSize - pad],
      [nextX + playerSize / 2, nextY + playerSize / 2],
    ]
    return samplePoints.every(([px, py]) => {
      const rgba = getComposerDesertPixelAtWorld(px, py)
      if (!rgba) return true
      return !isComposerDesertBlockedPixel(rgba[0], rgba[1], rgba[2], rgba[3])
    })
  }
  if (sectionMapName === 'Laravel Citadel' && laravelCitadelMaskReady.value) {
    const playerSize = Number(ctx.playerSize || 40)
    const pad = 3
    const samplePoints = [
      [nextX + pad, nextY + pad],
      [nextX + playerSize - pad, nextY + pad],
      [nextX + pad, nextY + playerSize - pad],
      [nextX + playerSize - pad, nextY + playerSize - pad],
      [nextX + playerSize / 2, nextY + pad],
      [nextX + playerSize / 2, nextY + playerSize - pad],
      [nextX + pad, nextY + playerSize / 2],
      [nextX + playerSize - pad, nextY + playerSize / 2],
      [nextX + playerSize / 2, nextY + playerSize / 2],
    ]
    return samplePoints.every(([px, py]) => {
      const rgba = getLaravelCitadelPixelAtWorld(px, py)
      if (!rgba) return true
      return !isLaravelCitadelBlockedPixel(rgba[0], rgba[1], rgba[2], rgba[3])
    })
  }
  if (sectionMapName === 'PHP Frontier Marshes' && phpFrontierMarshesMaskReady.value) {
    const playerSize = Number(ctx.playerSize || 40)
    const pad = 3
    const samplePoints = [
      [nextX + pad, nextY + pad],
      [nextX + playerSize - pad, nextY + pad],
      [nextX + pad, nextY + playerSize - pad],
      [nextX + playerSize - pad, nextY + playerSize - pad],
      [nextX + playerSize / 2, nextY + pad],
      [nextX + playerSize / 2, nextY + playerSize - pad],
      [nextX + pad, nextY + playerSize / 2],
      [nextX + playerSize - pad, nextY + playerSize / 2],
      [nextX + playerSize / 2, nextY + playerSize / 2],
    ]
    return samplePoints.every(([px, py]) => {
      const rgba = getPhpFrontierMarshesPixelAtWorld(px, py)
      if (!rgba) return true
      return !isPhpFrontierMarshesBlockedPixel(rgba[0], rgba[1], rgba[2], rgba[3])
    })
  }
  return true
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
  enemies,
  bullets,
  enemyBullets,
  coins,
  slashes,
  startNextWave,
  beginFirstWave,
  resumeAt,
} = useArenaCombat({
  worldWidth: ARENA_WORLD_WIDTH,
  worldHeight: ARENA_WORLD_HEIGHT,
  startX: ARENA_WORLD_WIDTH / 2,
  startY: startY.value,
  startKingdom: computed(() => (isPhpKingdomSelected() ? 'PHP' : 'Java')),
  equippedWeapon: computed(() => characterStore.equippedWeapon),
  characterClass: computed(() => characterStore.characterClass),
  characterRace: computed(() => characterStore.kingdomName || characterStore.kingdomId),
  characterLevel: computed(() => levelState.value.level),
  characterArmor: computed(() => levelState.value.armor),
  characterAttackSpeed: computed(() => levelState.value.attackSpeed),
  characterMoveSpeed: computed(() => levelState.value.moveSpeed),
  characterBaseDamage: computed(() => levelState.value.baseDamage),
  playerMaxHp: computed(() => levelState.value.maxHealth),
  isWalkable: isArrayIslandsWalkable,
  debugImmortal: devImmortalMode,
  debugMaxDamage: devMaxDamageMode,
  debugDamage: 99999,
  onExperienceGain: ({ amount }) => gainExperience(amount),
  onVictory: () => {
    showVictoryModal.value = true
    syncRunGoldOnce()
  }
})

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

let lastSavedProgressKey = ''

function progressSnapshotForSave() {
  let nextSection = section.value
  let nextWave = sectionWave.value
  let maxWavesInNextSection = nextSection >= TOTAL_SECTIONS ? 1 : WAVES_PER_SECTION
  if (phase.value === 'between') {
    if (nextWave >= maxWavesInNextSection) {
      nextSection = Math.min(TOTAL_SECTIONS, nextSection + 1)
      nextWave = 1
      maxWavesInNextSection = nextSection >= TOTAL_SECTIONS ? 1 : WAVES_PER_SECTION
    } else {
      nextWave += 1
    }
  }
  nextWave = clamp(nextWave, 1, maxWavesInNextSection)
  const inProgress = phase.value === 'fighting' || phase.value === 'between'
  if (!inProgress) {
    nextSection = 1
    nextWave = 1
  }
  return { arena_section: nextSection, arena_wave: nextWave, arena_in_progress: inProgress }
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
      move_speed: Number(levelState.value.moveSpeed.toFixed(3)),
      base_damage: Math.round(levelState.value.baseDamage),
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
      payload.move_speed,
      payload.base_damage,
    ].join(':')
    if (!force && key === lastSavedProgressKey) return
    await api.patch(`/characters/${id}`, payload)
    characterStore.arenaSection = payload.arena_section
    characterStore.arenaWave = payload.arena_wave
    characterStore.arenaInProgress = payload.arena_in_progress
    characterStore.level = payload.level
    characterStore.experience = payload.experience
    characterStore.maxHealth = payload.max_health
    characterStore.armor = payload.armor
    characterStore.attackSpeed = payload.attack_speed
    characterStore.moveSpeed = payload.move_speed
    characterStore.baseDamage = payload.base_damage
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

const conqueredKingdomLabel = computed(() => (
  enemyFaction.value === 'java' ? 'Java' : 'PHP'
))

const enemyFactionClass = computed(() =>
  enemyFaction.value === 'java' ? 'enemy--java' : 'enemy--php'
)

function hpBarPct(e) {
  return Math.max(8, Math.round((100 * e.hp) / (e.maxHp || 1)))
}

function isPhpMeleeEnemy(e) {
  if (enemyFaction.value !== 'php') return false
  const rangedTypes = new Set(['thread_spammer', 'dependency_injector', 'composer_update', 'boss', 'miniboss'])
  return !rangedTypes.has(e.type)
}

function phpMeleeEnemyStyle(e) {
  const esize = e.size || ENEMY_SIZE
  const enemyCx = e.x + esize / 2
  const enemyCy = e.y + esize / 2
  const playerCx = x.value + 20
  const playerCy = y.value + 20
  const angleDeg = (Math.atan2(playerCy - enemyCy, playerCx - enemyCx) * 180) / Math.PI - 90
  return {
    transform: `rotate(${angleDeg}deg) scale(1.2)`,
  }
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

async function handleMicropayReturn() {
  const status = String(route.query.micropay_status || '')
  const sessionId = String(route.query.session_id || '')
  if (status !== 'success' || !sessionId) return

  try {
    await confirmCodeCoinsCheckout(sessionId)
    await refreshWallet()
    playerMaxHp.value = Math.round(levelState.value.maxHealth)
    playerHp.value = playerMaxHp.value
  } catch (err) {
    console.error('Error confirmando micropago en SecondView:', err)
  } finally {
    router.replace({ path: route.path, query: {} }).catch(() => {})
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
  const queryStart = getArenaStartFromQuery()

  await ensureJvmVolcanoMaskLoaded()
  await ensureMavenMountainsMaskLoaded()
  await ensureSpringBootCityMaskLoaded()
  await ensureHibernateRuinsMaskLoaded()
  await ensureSpringBorderGateMaskLoaded()
  await ensureEloquentSwampsMaskLoaded()
  await ensureBladeForestMaskLoaded()
  await ensureComposerDesertMaskLoaded()
  await ensureLaravelCitadelMaskLoaded()
  await ensurePhpFrontierMarshesMaskLoaded()
  await ensureJavaKingdomMaskLoaded()
  await ensurePhpKingdomMaskLoaded()
  window.addEventListener('beforeunload', saveArenaProgress, { capture: true })
  
  try {
    arenaCharacterId.value = await ensureActiveCharacterId()
    const arenaCharacter = arenaCharacterId.value != null
      ? await fetchCharacter(arenaCharacterId.value)
      : null
    await refreshWallet()
    await handleMicropayReturn()
    if (arenaCharacter) {
      characterStore.arenaSection = Number(arenaCharacter.arena_section ?? 1) || 1
      characterStore.arenaWave = Number(arenaCharacter.arena_wave ?? 1) || 1
      characterStore.arenaInProgress = Boolean(arenaCharacter.arena_in_progress)
    }
    const isPhpKingdom = isPhpKingdomSelected()
    const faction = isPhpKingdom ? 'php' : 'java'
    const initialSection = queryStart?.section
      || (characterStore.arenaInProgress ? Number(characterStore.arenaSection || 1) : 1)
    const initialMapName = getSectionMapNameByIndex(faction, initialSection)
    const initialEntry = getArenaEntryPoint(initialMapName)
    startY.value = initialEntry.y
    if (lastTransition.value !== 'main-to-second') {
      y.value = initialEntry.y
      x.value = initialEntry.x
    }
  } catch (err) {
    console.error("Error inicial en SecondView:", err)
  }

  if (lastTransition.value === 'main-to-second') {
    locked.value = true
    moving.value = true
    isFading.value = true
    const isPhpKingdom = isPhpKingdomSelected()
    y.value = isPhpKingdom ? ARENA_WORLD_HEIGHT + 50 : -50
    
    setTimeout(() => {
      isFading.value = false
      const enterLoop = () => {
        const mapNameForEntry = getSectionMapNameByIndex(
          isPhpKingdom ? 'php' : 'java',
          Number(section.value || characterStore.arenaSection || 1)
        )
        const targetY = getArenaEntryPoint(mapNameForEntry).y
        // Java entra desde arriba. PHP entra desde abajo.
        const reachedTarget = isPhpKingdom
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
        y.value += isPhpKingdom ? -5 : 5
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

.world {
  position: absolute;
  width: v-bind(worldWidthPx);
  height: v-bind(worldHeightPx);
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
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.enemy--with-image {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  overflow: visible !important;
}

.enemy-skin {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: auto;
  pointer-events: none;
}

.enemy-skin--php-melee {
  width: 150%;
  height: 150%;
  left: -25%;
  top: -25%;
  transform-origin: center;
  transition: transform 0.08s linear;
}

.enemy--with-image .enemy-hp {
  bottom: -6px;
}

.enemy--java {
  background: linear-gradient(145deg, #f4a340, #cf6d1e);
  border: 2px solid #6a2e0c;
}

.enemy--php {
  background: linear-gradient(145deg, #6ea8ff, #2d5ebd);
  border: 2px solid #173a7f;
}

.enemy-hp {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  display: block;
}

.enemy--java .enemy-hp {
  background: #ff7b00;
}

.enemy--php .enemy-hp {
  background: #1e88e5;
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

.enemy-bullet {
  position: absolute;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  margin-top: -7px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 9px;
  font-weight: 700;
  color: #ffffff;
  z-index: 4;
  border: 2px solid #fff;
}

.enemy-bullet--java {
  background: #ff8f00;
  box-shadow: 0 0 12px #e65100, 0 0 4px #fff;
}

.enemy-bullet--php {
  background: #1e88e5;
  box-shadow: 0 0 12px #0d47a1, 0 0 4px #fff;
}

.boss-enemy {
  border: 4px solid #facc15 !important;
  box-shadow: 0 0 30px rgba(250, 204, 21, 0.4), inset 0 0 20px rgba(0,0,0,0.8) !important;
}

.boss-enemy::after {
  content: '⚠';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: #facc15;
  opacity: 0.5;
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

.wave-label { font-size: 8px; color: #facc15; opacity: 0.8; }
.wave-label-sub {
  font-size: 7px;
  color: rgba(250, 204, 21, 0.5);
  letter-spacing: 0.1em;
}
.wave-number { font-size: 22px; color: white; text-shadow: 0 0 10px rgba(255,255,255,0.3); }
.route-label { font-size: 7px; color: #a7f3d0; letter-spacing: 0.08em; }
.boss-hud {
  width: min(560px, 70vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.boss-name {
  font-size: 10px;
  color: #f8fafc;
  letter-spacing: 0.12em;
  text-shadow: 0 0 8px rgba(248, 250, 252, 0.35);
}
.boss-hp-frame {
  width: 100%;
  height: 14px;
  border: 2px solid #ef4444;
  background: rgba(15, 23, 42, 0.8);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}
.boss-hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #dc2626 0%, #ef4444 60%, #f97316 100%);
  transition: width 160ms linear;
}
.boss-hp-text {
  font-size: 8px;
  color: #fee2e2;
  letter-spacing: 0.08em;
}

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

.xp-container {
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.xp-label { font-size: 7px; color: #a7f3d0; }

.xp-bar-frame {
  height: 14px;
  background: #052e2b;
  border: 2px solid #115e59;
  padding: 1px;
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0f766e, #14b8a6);
  transition: width 0.2s ease-out;
}

.xp-numeric { font-size: 7px; text-align: right; color: #ccfbf1; opacity: 0.9; }

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

.victory-crown {
  font-size: 60px;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 20px rgba(250, 204, 21, 0.6));
  animation: crown-float 2s ease-in-out infinite;
}

@keyframes crown-float {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
}

.final-victory {
  border-color: #facc15;
  background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%);
  box-shadow: 0 0 100px rgba(250, 204, 21, 0.3);
}

.final-victory .modal-title {
  color: #facc15;
  font-size: 24px;
  margin-bottom: 30px;
}

.congrats {
  font-size: 8px;
  color: #facc15;
  margin-top: 20px;
  letter-spacing: 2px;
}

.btn-exit-gold {
  background: #facc15;
  color: #0b0d17;
  border: 4px solid #854d0e;
  padding: 20px 40px;
  font-family: inherit;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 6px 6px 0 #854d0e;
}

.btn-exit-gold:hover {
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0 #854d0e;
  background: white;
}

.btn-explore {
  background: transparent;
  color: #94a3b8;
  border: 2px solid #334155;
  padding: 12px 20px;
  font-family: inherit;
  font-size: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-explore:hover {
  color: white;
  border-color: white;
  background: rgba(255,255,255,0.05);
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
