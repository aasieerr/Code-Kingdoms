<template>
  <div
    class="viewport"
    ref="arenaRef"
    tabindex="0"
    @click="arenaRef.focus()"
    @focus="focused = true"
    @blur="focused = false"
  >
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

    <aside class="hud-panel">
      <div class="avatar-frame">PJ</div>
      <button class="hud-btn" @click.stop="openCharacterPanel('equipment')">Ver equipo</button>
      <button class="hud-btn" @click.stop="openCharacterPanel('inventory')">Inventario</button>
      <button class="hud-btn secondary" @click.stop="toggleMapPanel">{{ showMapPanel ? 'Cerrar mapa' : 'Mapa' }}</button>
      <button class="hud-btn logout">Cerrar sesión</button>
    </aside>

    <img class="game-logo" src="/code-kingdoms-logo.png" alt="Code Kingdoms logo" />

    <section v-if="showCharacterPanel" class="character-panel" @click.stop>
      <header class="panel-header">
        <h2>{{ activePanelTab === 'inventory' ? 'Inventario' : 'Equipo' }}</h2>
        <button class="close-btn" @click="showCharacterPanel = false">X</button>
      </header>

      <div class="panel-tabs">
        <button class="tab-btn" :class="{ active: activePanelTab === 'inventory' }" @click="activePanelTab = 'inventory'">Inventario</button>
        <button class="tab-btn" :class="{ active: activePanelTab === 'equipment' }" @click="activePanelTab = 'equipment'">Equipo</button>
      </div>

      <div v-if="activePanelTab === 'inventory'" class="inventory-content">
        <div class="inventory-filters">
          <button
            v-for="type in filterTypes"
            :key="type.value"
            class="filter-btn"
            :class="{ active: activeFilter === type.value }"
            @click="activeFilter = type.value"
          >
            {{ type.label }}
          </button>
        </div>

        <!-- Estado: cargando -->
        <div v-if="itemsLoading" class="inventory-status">
          <span class="status-icon">⏳</span>
          <p>Cargando inventario...</p>
        </div>

        <!-- Estado: error -->
        <div v-else-if="itemsError" class="inventory-status error">
          <span class="status-icon">⚠</span>
          <p>{{ itemsError }}</p>
          <button class="filter-btn" @click="loadItems">Reintentar</button>
        </div>

        <!-- Estado: sin items -->
        <div v-else-if="filteredItems.length === 0" class="inventory-status">
          <span class="status-icon">📦</span>
          <p>No hay items de este tipo.</p>
        </div>

        <!-- Estado: datos del backend -->
        <div v-else class="inventory-grid">
          <ul class="item-list">
            <li
              v-for="item in filteredItems"
              :key="item.id_item"
              :class="{ selected: selectedItem?.id_item === item.id_item }"
              @click="selectedItem = item"
            >
              <span class="item-icon">{{ spriteByType[item.type] }}</span>
              <div>
                <p class="item-name">{{ item.name }}</p>
                <p class="item-type">{{ labelsByType[item.type] }}</p>
              </div>
            </li>
          </ul>

          <article class="item-preview" v-if="selectedItem">
            <div class="sprite-box">{{ spriteByType[selectedItem.type] }}</div>
            <h3>{{ selectedItem.name }}</h3>
            <p>{{ selectedItem.description }}</p>
            <ul class="item-stats">
              <li v-if="selectedItem.type === 'weapon'">Daño: {{ selectedItem.details?.damage ?? '-' }}</li>
              <li v-if="selectedItem.type === 'weapon'">Tipo: {{ selectedItem.details?.weapon_type ?? '-' }}</li>
              <li v-if="selectedItem.type === 'armor'">Defensa: {{ selectedItem.details?.defense ?? '-' }}</li>
              <li v-if="selectedItem.type === 'armor'">Clase: {{ selectedItem.details?.armor_type ?? '-' }}</li>
              <li v-if="selectedItem.type === 'consumable'">Efecto: {{ selectedItem.details?.effect ?? '-' }}</li>
              <li v-if="selectedItem.type === 'consumable'">Potencia: {{ selectedItem.details?.power ?? '-' }}</li>
            </ul>
          </article>
        </div>
      </div>

      <div v-else class="equipment-content">
        <!-- Cargando equipo -->
        <div v-if="equipLoading" class="inventory-status" style="grid-column:1/-1">
          <span class="status-icon">⏳</span>
          <p>Cargando equipo...</p>
        </div>

        <!-- Error al cargar equipo -->
        <div v-else-if="equipError" class="inventory-status error" style="grid-column:1/-1">
          <span class="status-icon">⚠</span>
          <p>{{ equipError }}</p>
          <button class="filter-btn" @click="loadEquipment">Reintentar</button>
        </div>

        <!-- Equipo cargado -->
        <template v-else>
          <div class="character-silhouette">
            <div
              v-for="slot in equipSlots"
              :key="slot.key"
              class="equip-slot"
              :class="[slot.css, { occupied: equippedMap[slot.key] }]"
              :title="slot.label"
            >
              <template v-if="equippedMap[slot.key]">
                <span class="slot-icon">{{ spriteByType[equippedMap[slot.key].item?.type] }}</span>
                <span class="slot-name">{{ equippedMap[slot.key].item?.name }}</span>
              </template>
              <template v-else>
                <span class="slot-empty">{{ slot.label }}</span>
              </template>
            </div>
          </div>

          <div class="equipment-detail">
            <template v-if="Object.keys(equippedMap).length">
              <p class="equip-section-title">Items equipados</p>
              <ul class="item-list" style="max-height:300px">
                <li
                  v-for="ci in equippedItems"
                  :key="ci.id"
                  :class="{ selected: selectedEquipped?.id === ci.id }"
                  @click="selectedEquipped = ci"
                >
                  <span class="item-icon">{{ spriteByType[ci.item?.type] }}</span>
                  <div>
                    <p class="item-name">{{ ci.item?.name }}</p>
                    <p class="item-type">{{ labelsByType[ci.item?.type] }} · x{{ ci.quantity }}</p>
                  </div>
                </li>
              </ul>
              <article class="item-preview" v-if="selectedEquipped?.item" style="margin-top:10px">
                <div class="sprite-box">{{ spriteByType[selectedEquipped.item.type] }}</div>
                <h3>{{ selectedEquipped.item.name }}</h3>
                <p>{{ selectedEquipped.item.description }}</p>
                <ul class="item-stats">
                  <li v-if="selectedEquipped.item.type === 'weapon'">Daño: {{ selectedEquipped.item.details?.damage ?? '-' }}</li>
                  <li v-if="selectedEquipped.item.type === 'weapon'">Tipo: {{ selectedEquipped.item.details?.weapon_type ?? '-' }}</li>
                  <li v-if="selectedEquipped.item.type === 'armor'">Defensa: {{ selectedEquipped.item.details?.defense ?? '-' }}</li>
                  <li v-if="selectedEquipped.item.type === 'armor'">Clase: {{ selectedEquipped.item.details?.armor_type ?? '-' }}</li>
                  <li v-if="selectedEquipped.item.type === 'consumable'">Efecto: {{ selectedEquipped.item.details?.effect ?? '-' }}</li>
                  <li v-if="selectedEquipped.item.type === 'consumable'">Potencia: {{ selectedEquipped.item.details?.power ?? '-' }}</li>
                </ul>
              </article>
            </template>
            <div v-else class="inventory-status" style="min-height:120px">
              <span class="status-icon">🗡</span>
              <p>Sin objetos equipados.</p>
            </div>
          </div>
        </template>
      </div>
    </section>

    <section v-if="showMapPanel" class="map-panel" @click.stop>
      <header class="map-header">
        <h3>Mapa del reino</h3>
        <button class="close-btn" @click="showMapPanel = false">X</button>
      </header>
      <div class="pixel-map">
        <div class="biome grasslands"></div>
        <div class="biome forest"></div>
        <div class="biome water"></div>
        <div class="biome mountains"></div>
        <div class="road horizontal-road"></div>
        <div class="road vertical-road"></div>
        <div class="landmark village">Pueblo</div>
        <div class="landmark ruins">Ruinas</div>
        <div class="landmark tower">Torre</div>
        <div class="player-marker" :style="playerMapStyle">🧍</div>
      </div>
    </section>

    <div class="fade-overlay" :class="{ active: isFading }"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchItems, fetchCharacterItems } from './api/inventario'
import { useWasd } from './components/controlChar'
import { lastTransition } from './gameState'

const router = useRouter()
const isFading = ref(lastTransition.value === 'second-to-main')
const startY = lastTransition.value === 'second-to-main' ? 2050 : 1000
const showMapPanel = ref(false)
const showCharacterPanel = ref(false)
const activePanelTab = ref('inventory')
const items = ref([])
const selectedItem = ref(null)
const activeFilter = ref('all')
const itemsLoading = ref(false)
const itemsError = ref(null)

// --- Equipo ---
const equippedItems = ref([])   // character-items con is_equipped = true
const selectedEquipped = ref(null)
const equipLoading = ref(false)
const equipError = ref(null)

// Slots del personaje: key coincide con item.type o armor_type para mapear
const equipSlots = [
  { key: 'head',       label: 'Cabeza',   css: 'head' },
  { key: 'chest',      label: 'Pecho',    css: 'chest' },
  { key: 'legs',       label: 'Piernas',  css: 'legs' },
  { key: 'weapon',     label: 'Arma',     css: 'weapon' },
  { key: 'shield',     label: 'Escudo',   css: 'shield' },
]

// Mapa slot-key → character-item equipado
const equippedMap = computed(() => {
  const map = {}
  for (const ci of equippedItems.value) {
    const type = ci.item?.type
    const armorType = ci.item?.details?.armor_type
    // armas → slot 'weapon', armaduras por tipo, consumibles no tienen slot
    if (type === 'weapon') map['weapon'] = ci
    else if (type === 'armor') {
      if (armorType?.includes('cabeza') || armorType?.includes('head')) map['head'] = ci
      else if (armorType?.includes('pierna') || armorType?.includes('leg')) map['legs'] = ci
      else map['chest'] = ci   // pecho por defecto
    }
  }
  return map
})

const labelsByType = { weapon: 'Arma', armor: 'Armadura', consumable: 'Consumible' }
const spriteByType = { weapon: '⚔', armor: '🛡', consumable: '🧪' }
const filterTypes = [
  { value: 'all', label: 'Todo' },
  { value: 'weapon', label: 'Armas' },
  { value: 'armor', label: 'Armaduras' },
  { value: 'consumable', label: 'Consumibles' },
]

const { arenaRef, x, y, focused, moving, locked } = useWasd(1000, startY)

const filteredItems = computed(() => {
  if (activeFilter.value === 'all') return items.value
  return items.value.filter((item) => item.type === activeFilter.value)
})

const playerMapStyle = computed(() => {
  const mapWidth = 520
  const mapHeight = 320
  const worldSize = 2000
  const px = Math.max(0, Math.min(mapWidth - 16, (x.value / worldSize) * mapWidth))
  const py = Math.max(0, Math.min(mapHeight - 16, (y.value / worldSize) * mapHeight))
  return { left: `${px}px`, top: `${py}px` }
})

function openCharacterPanel(tab) {
  showMapPanel.value = false
  activePanelTab.value = tab
  showCharacterPanel.value = true
  if (tab === 'inventory' && !selectedItem.value && filteredItems.value.length > 0) {
    selectedItem.value = filteredItems.value[0]
  }
  if (tab === 'equipment' && !equippedItems.value.length && !equipLoading.value) {
    loadEquipment()
  }
}

function toggleMapPanel() {
  showCharacterPanel.value = false
  showMapPanel.value = !showMapPanel.value
}

async function loadItems() {
  itemsLoading.value = true
  itemsError.value = null
  selectedItem.value = null
  try {
    items.value = await fetchItems()
    if (items.value.length > 0) selectedItem.value = items.value[0]
  } catch (err) {
    items.value = []
    itemsError.value =
      err?.response?.data?.message ??
      'No se pudo conectar con el servidor. Asegúrate de que el backend está activo.'
  } finally {
    itemsLoading.value = false
  }
}

async function loadEquipment() {
  equipLoading.value = true
  equipError.value = null
  selectedEquipped.value = null
  try {
    // Trae todos los character-items equipados (sin filtrar por personaje aún,
    // hasta que el login de Keycloak esté activo y podamos obtener el id del personaje)
    const all = await fetchCharacterItems()
    equippedItems.value = all.filter((ci) => ci.is_equipped)
    if (equippedItems.value.length > 0) selectedEquipped.value = equippedItems.value[0]
  } catch (err) {
    equippedItems.value = []
    equipError.value =
      err?.response?.data?.message ??
      'No se pudo cargar el equipo. Asegúrate de que el backend está activo.'
  } finally {
    equipLoading.value = false
  }
}

onMounted(() => {
  loadItems()
  if (lastTransition.value === 'second-to-main') {
    locked.value = true
    moving.value = true
    setTimeout(() => {
      isFading.value = false
    }, 50)
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

watch([x, y], ([newX, newY]) => {
  const WORLD_HEIGHT = 2000
  const PLAYER_SIZE = 40
  if (!locked.value && newY >= WORLD_HEIGHT - PLAYER_SIZE && newX > 800 && newX < 1200) {
    locked.value = true
    moving.value = true
    isFading.value = true
    const exitLoop = () => {
      y.value += 4
      if (y.value >= WORLD_HEIGHT + 60) {
        lastTransition.value = 'main-to-second'
        router.push({ name: 'SecondGame' })
      } else {
        requestAnimationFrame(exitLoop)
      }
    }
    requestAnimationFrame(exitLoop)
  }
})

const cameraTransform = computed(() => {
  const zoom = 2
  const WORLD_SIZE = 2000
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const halfViewW = cx / zoom
  const halfViewH = cy / zoom
  const targetX = Math.max(halfViewW, Math.min(x.value + 20, WORLD_SIZE - halfViewW))
  const targetY = Math.max(halfViewH, Math.min(y.value + 20, WORLD_SIZE - halfViewH))
  return `translate(${cx}px, ${cy}px) scale(${zoom}) translate(-${targetX}px, -${targetY}px)`
})
</script>

<style scoped>
.viewport { width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; outline: none; overflow: hidden; background-color: #335b2f; font-family: 'Press Start 2P', 'Courier New', monospace; }
.world { position: absolute; width: 2000px; height: 2000px; transform-origin: 0 0; will-change: transform; }
.grid { position: absolute; width: 100%; height: 100%; background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 50px 50px; z-index: 1; }
.terrain { position: absolute; image-rendering: pixelated; z-index: 0; }
.grassland { inset: 0; background: linear-gradient(90deg, rgba(255,255,255,.05) 4px, transparent 4px), linear-gradient(rgba(255,255,255,.05) 4px, transparent 4px), #5ea650; background-size: 40px 40px, 40px 40px, auto; }
.forest-zone { left: 120px; top: 140px; width: 760px; height: 640px; border: 6px solid #214724; background: radial-gradient(circle at 20% 35%, #2f7b36 18px, transparent 19px), radial-gradient(circle at 60% 30%, #2f7b36 18px, transparent 19px), radial-gradient(circle at 35% 70%, #2f7b36 18px, transparent 19px), radial-gradient(circle at 78% 62%, #2f7b36 18px, transparent 19px), #3b8a42; background-size: 140px 140px; }
.mountain-zone { right: 180px; top: 150px; width: 680px; height: 480px; border: 6px solid #535353; background: linear-gradient(45deg, #8f8f8f 25%, transparent 25%), linear-gradient(-45deg, #8f8f8f 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #8f8f8f 75%), linear-gradient(-45deg, transparent 75%, #8f8f8f 75%), #707070; background-size: 46px 46px; }
.lake-zone { right: 220px; bottom: 190px; width: 620px; height: 420px; border: 6px solid #1e4f84; background: linear-gradient(90deg, rgba(255,255,255,.08) 4px, transparent 4px), linear-gradient(rgba(255,255,255,.08) 4px, transparent 4px), #3f86db; background-size: 40px 40px; }
.road-main { left: 130px; top: 980px; width: 1740px; height: 72px; border: 4px solid #5d4524; background: #b58956; }
.road-cross { left: 970px; top: 290px; width: 72px; height: 1500px; border: 4px solid #5d4524; background: #b58956; }
.village-zone { left: 230px; top: 1130px; width: 300px; height: 220px; border: 5px solid #6a361f; background: linear-gradient(90deg, #9f5f3e 22px, transparent 22px), linear-gradient(#9f5f3e 22px, transparent 22px), #c98259; background-size: 70px 70px; }
.ruins-zone { left: 1180px; top: 640px; width: 340px; height: 220px; border: 5px solid #4b3f31; background: linear-gradient(45deg, #7f7264 25%, transparent 25%), linear-gradient(-45deg, #7f7264 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #7f7264 75%), linear-gradient(-45deg, transparent 75%, #7f7264 75%), #9a8b79; background-size: 36px 36px; }
.player { position: absolute; width: 40px; height: 40px; border-radius: 6px; transition: background .1s; box-shadow: 0 4px 15px rgba(0,0,0,.3); z-index: 2; }
.game-logo { position: absolute; right: 18px; top: 18px; width: 108px; height: 108px; object-fit: contain; z-index: 30; filter: drop-shadow(0 6px 14px rgba(0,0,0,.45)); }
.hud-panel { position: absolute; top: 22px; left: 22px; z-index: 25; width: 190px; padding: 12px; border: 4px solid #2b1f13; background: linear-gradient(180deg, #6b4f2d 0%, #4a351f 100%); box-shadow: 0 0 0 4px #9a7a4d, 6px 8px 0 rgba(0,0,0,.45); display: flex; flex-direction: column; gap: 10px; }
.avatar-frame { height: 82px; border: 3px solid #1f1f1f; background: linear-gradient(45deg, #5a6f84 25%, transparent 25%), linear-gradient(-45deg, #5a6f84 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #5a6f84 75%), linear-gradient(-45deg, transparent 75%, #5a6f84 75%); background-size: 14px 14px; background-position: 0 0, 0 7px, 7px -7px, -7px 0; color: #f7ebd0; display: grid; place-items: center; font-size: 14px; }
.hud-btn { border: 2px solid #1f1f1f; background: #c9b27a; color: #1f1f1f; padding: 8px 6px; font-size: 10px; text-transform: uppercase; cursor: pointer; }
.hud-btn:hover { background: #e3cc8d; }
.hud-btn.secondary { background: #ad9a6a; }
.hud-btn.logout { margin-top: 8px; background: #8f3b2c; color: #f7ebd0; }
.character-panel,.map-panel { position: absolute; inset: 50% auto auto 50%; transform: translate(-50%, -50%); width: min(920px, 92vw); min-height: 520px; z-index: 45; border: 5px solid #1f1f1f; background: linear-gradient(180deg, #263238 0%, #1b2529 100%); box-shadow: 0 0 0 5px #607d8b, 12px 12px 0 rgba(0,0,0,.5); color: #f5f5f5; padding: 16px; }
.panel-header,.map-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.inventory-status { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 200px; border: 3px solid #111; background: #2a373d; padding: 20px; text-align: center; font-size: 10px; color: #b0bec5; }
.inventory-status.error { color: #ef9a9a; border-color: #b71c1c; background: #1a1a2a; }
.status-icon { font-size: 32px; }
.panel-header h2,.map-header h3 { font-size: 14px; margin: 0; }
.close-btn { width: 34px; height: 34px; border: 2px solid #0f1518; background: #b74a3c; color: #fff7e6; cursor: pointer; }
.panel-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.tab-btn { border: 2px solid #0f1518; background: #455a64; color: #e9eef0; padding: 8px 12px; font-size: 10px; cursor: pointer; }
.tab-btn.active { background: #8bc34a; color: #17210f; }
.inventory-content { display: flex; flex-direction: column; gap: 10px; }
.inventory-filters { display: flex; gap: 8px; }
.filter-btn { border: 2px solid #0f1518; background: #455a64; color: #e9eef0; padding: 8px 10px; font-size: 10px; cursor: pointer; }
.filter-btn.active { background: #8bc34a; color: #17210f; }
.inventory-grid { display: grid; grid-template-columns: 1.05fr .95fr; gap: 16px; }
.item-list { list-style: none; margin: 0; padding: 10px; border: 3px solid #111; background: #2a373d; max-height: 360px; overflow: auto; display: flex; flex-direction: column; gap: 8px; }
.item-list li { border: 2px solid #0f1518; padding: 10px; background: #607d8b; display: grid; grid-template-columns: 24px 1fr; gap: 10px; cursor: pointer; }
.item-list li.selected { background: #d4b16a; color: #1b1b1b; }
.item-icon { font-size: 16px; }
.item-name { margin: 0 0 5px; font-size: 10px; }
.item-type { margin: 0; font-size: 9px; }
.item-preview { border: 3px solid #111; background: #243238; padding: 12px; }
.sprite-box { width: 100%; height: 150px; border: 3px solid #0f1518; background: linear-gradient(45deg, #567 25%, transparent 25%), linear-gradient(-45deg, #567 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #567 75%), linear-gradient(-45deg, transparent 75%, #567 75%); background-size: 22px 22px; background-position: 0 0, 0 11px, 11px -11px, -11px 0; display: grid; place-items: center; font-size: 46px; margin-bottom: 10px; }
.item-preview h3 { margin: 0 0 8px; font-size: 12px; }
.item-preview p { margin: 0 0 8px; line-height: 1.45; font-size: 10px; }
.item-stats { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; }
.item-stats li { font-size: 10px; }
.equipment-content { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.character-silhouette { min-height: 380px; border: 3px solid #111; background: #2a373d; position: relative; }
.equip-slot { position: absolute; width: 120px; border: 2px dashed #d6bd8a; background: rgba(28,36,40,.65); color: #f5deb3; text-align: center; font-size: 9px; padding: 8px 6px; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.equip-slot.occupied { border-style: solid; border-color: #8bc34a; background: rgba(60,90,40,.75); }
.slot-icon { font-size: 18px; line-height: 1; }
.slot-name { font-size: 7px; color: #c5e1a5; word-break: break-word; max-width: 110px; }
.slot-empty { opacity: .6; }
.head { top: 20px; left: 50%; transform: translateX(-50%); }
.chest { top: 92px; left: 50%; transform: translateX(-50%); }
.legs { top: 164px; left: 50%; transform: translateX(-50%); }
.weapon { top: 130px; left: 18px; }
.shield { top: 130px; right: 18px; }
.equipment-detail { display: flex; flex-direction: column; gap: 10px; overflow: auto; }
.equip-section-title { margin: 0 0 6px; font-size: 9px; color: #8bc34a; text-transform: uppercase; letter-spacing: 1px; }
.pixel-map { width: 520px; max-width: 100%; aspect-ratio: 13/8; margin: 0 auto; position: relative; border: 4px solid #111; background: #5da25d; overflow: hidden; }
.biome,.road,.landmark,.player-marker { position: absolute; }
.grasslands { inset: 0; background: linear-gradient(90deg, rgba(255,255,255,.07) 2px, transparent 2px), linear-gradient(rgba(255,255,255,.07) 2px, transparent 2px), #62a84f; background-size: 20px 20px, 20px 20px, auto; }
.forest { width: 42%; height: 45%; left: 6%; top: 8%; background: #2f6e35; border: 3px solid #214f26; }
.water { width: 34%; height: 32%; right: 8%; bottom: 10%; background: #3c7ed6; border: 3px solid #245498; }
.mountains { width: 30%; height: 38%; right: 10%; top: 8%; background: linear-gradient(45deg, #8a8a8a 25%, transparent 25%), linear-gradient(-45deg, #8a8a8a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #8a8a8a 75%), linear-gradient(-45deg, transparent 75%, #8a8a8a 75%), #646464; background-size: 16px 16px; border: 3px solid #4d4d4d; }
.road { background: #a07b4b; }
.horizontal-road { width: 86%; height: 16px; left: 7%; top: 52%; }
.vertical-road { width: 16px; height: 80%; left: 49%; top: 10%; }
.landmark { font-size: 9px; color: #fff4d1; background: rgba(20,20,20,.55); border: 2px solid #101010; padding: 3px 6px; }
.village { left: 14%; top: 58%; }
.ruins { left: 52%; top: 24%; }
.tower { right: 14%; bottom: 18%; }
.player-marker { width: 16px; height: 16px; border: 2px solid #1a1a1a; background: #ffe082; box-shadow: 0 0 0 2px #3b2d16; display: grid; place-items: center; z-index: 2; font-size: 11px; }
.fade-overlay { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background-color: black; opacity: 0; pointer-events: none; transition: opacity .5s ease-in-out; z-index: 1000; }
.fade-overlay.active { opacity: 1; }
</style>
