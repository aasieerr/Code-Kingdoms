<template>
  <section class="premium-inventory-panel" @click.stop>
    <!-- SCANLINES -->
    <div class="scanlines"></div>

    <header class="panel-header">
      <div class="panel-tabs" v-if="!isShop">
        <button class="tab-btn active">Inventario</button>
        <button class="tab-btn" @click="$emit('switch-panel', 'equipment')">Equipo</button>
      </div>
      <h2 v-else>Tienda del Reino</h2>
      <button class="close-btn" @click="$emit('close')">X</button>
    </header>

    <div class="panel-content">
      <div class="inventory-main">
        <div class="inventory-header-actions">
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
          <div class="search-wrapper">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="BUSCAR ÍTEM..." 
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
        </div>

        <div class="list-wrapper custom-scrollbar">
          <div v-if="loading" class="status-box">
            <div class="loading-spinner"></div>
            <p>ACCEDIENDO A LOS ARCHIVOS...</p>
          </div>
          <div v-else-if="error" class="status-box error">
            <p>{{ error }}</p>
            <button class="retry-btn" @click="load">REINTENTAR</button>
          </div>
          <div v-else-if="filteredItems.length === 0" class="status-box empty">
            <p>SISTEMA DE ALMACENAMIENTO VACÍO</p>
          </div>
          <ul v-else class="item-list">
            <li
              v-for="ci in filteredItems"
              :key="ci.item.id_item"
              :class="{ 
                'selected': selectedItem?.item?.id_item === ci.item.id_item,
                'equipped': ci.is_equipped 
              }"
              @click="selectedItem = ci"
            >
              <div class="item-icon-box">
                <span class="item-icon">{{ spriteByType[ci.item.type] }}</span>
              </div>
              <div class="item-info">
                <div class="item-name-row">
                  <span class="item-name">{{ ci.item.name.toUpperCase() }}</span>
                  <span v-if="ci.is_equipped" class="equipped-tag">E</span>
                </div>
                <div class="item-meta">
                  <span class="meta-type">{{ labelsByType[ci.item.type] }}</span>
                  <span class="meta-qty" v-if="ci.id">CANT: {{ ci.quantity }}</span>
                  <span class="meta-price" v-else>{{ ci.item.price }} 🪙</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- RIGHT: Preview & Actions -->
      <aside class="item-preview" v-if="selectedItem?.item">
        <div class="preview-header">
          <div class="sprite-display">
            <span class="display-icon">{{ spriteByType[selectedItem.item.type] }}</span>
            <div class="display-glow"></div>
          </div>
          <h3 class="preview-title">{{ selectedItem.item.name.toUpperCase() }}</h3>
          <p class="preview-desc">{{ selectedItem.item.description }}</p>
        </div>

        <div class="preview-stats">
          <h4 class="stats-label">ATRIBUTOS</h4>
          <ul class="stats-list">
            <template v-if="selectedItem.item.type === 'weapon'">
              <li><span>DAÑO:</span> <span class="stat-val">{{ selectedItem.item.details?.damage ?? '-' }}</span></li>
              <li><span>TIPO:</span> <span class="stat-val">{{ selectedItem.item.details?.weapon_type ?? '-' }}</span></li>
              <li><span>DURABILIDAD:</span> <span class="stat-val">{{ selectedItem.item.details?.durability ?? '-' }}</span></li>
            </template>
            <template v-if="selectedItem.item.type === 'armor'">
              <li><span>DEFENSA:</span> <span class="stat-val">{{ selectedItem.item.details?.defense ?? '-' }}</span></li>
              <li><span>CLASE:</span> <span class="stat-val">{{ selectedItem.item.details?.armor_type ?? '-' }}</span></li>
              <li><span>DURABILIDAD:</span> <span class="stat-val">{{ selectedItem.item.details?.durability ?? '-' }}</span></li>
            </template>
            <template v-if="selectedItem.item.type === 'consumable'">
              <li><span>EFECTO:</span> <span class="stat-val">{{ selectedItem.item.details?.effect ?? '-' }}</span></li>
              <li><span>POTENCIA:</span> <span class="stat-val">{{ selectedItem.item.details?.power ?? '-' }}</span></li>
              <li><span>DURACIÓN:</span> <span class="stat-val">{{ selectedItem.item.details?.duration ?? '-' }}</span></li>
            </template>
          </ul>
        </div>

        <div class="preview-actions">
          <button
            v-if="isShop"
            class="action-btn buy"
            @click="handleBuy(selectedItem.item)"
            :disabled="busy"
          >
            COMPRAR ({{ selectedItem.item.price || 0 }} 🪙)
          </button>
          <template v-else>
            <button 
              v-if="selectedItem.id && !selectedItem.is_equipped"
              class="action-btn sell"
              @click="handleSell(selectedItem)"
              :disabled="busy"
            >
              VENDER ({{ Math.floor((selectedItem.item.price || 0) * 0.5) }} 🪙)
            </button>
            <button 
              v-if="selectedItem.id && ['weapon', 'armor'].includes(selectedItem.item.type)" 
              class="action-btn equip" 
              @click="handleEquip(selectedItem)"
              :disabled="busy"
            >
              {{ selectedItem.is_equipped ? 'DESEQUIPAR' : 'EQUIPAR' }}
            </button>
          </template>
        </div>
      </aside>
      <div v-else class="preview-placeholder">
        <p>SELECCIONA UN OBJETO</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  globalItems,
  myCharacterItems,
  isInventoryLoading,
  lastInventoryError,
  fetchInventoryData,
  toggleEquipItem
} from '../api/inventario'
import { purchaseItem, sellItem } from '../api/shop'

const props = defineProps({
  isShop: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'switch-panel'])

const LABELS = { weapon: 'Arma', armor: 'Armadura', consumable: 'Consumible' }
const SPRITES = { weapon: '⚔', armor: '🛡', consumable: '🧪' }

const labelsByType = LABELS
const spriteByType = SPRITES

const filterTypes = [
  { value: 'all',       label: 'Todo' },
  { value: 'weapon',    label: 'Armas' },
  { value: 'armor',     label: 'Armaduras' },
  { value: 'consumable',label: 'Pociones' },
]

const selectedItem = ref(null)
const activeFilter = ref('all')
const searchQuery = ref('')
const busy = ref(false)

const loading = isInventoryLoading
const error = lastInventoryError

const filteredItems = computed(() => {
  const source = props.isShop 
    ? globalItems.value.map(item => ({ item, id: null, quantity: 0, is_equipped: false }))
    : myCharacterItems.value

  let list = source
  
  if (activeFilter.value !== 'all') {
    list = list.filter((ci) => ci.item?.type === activeFilter.value)
  }
  
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((ci) => ci.item?.name?.toLowerCase().includes(q))
  }
  
  return list
})

onMounted(async () => {
  await fetchInventoryData(true)
  if (!selectedItem.value && filteredItems.value.length > 0) {
    selectedItem.value = filteredItems.value[0]
  }
})

function getSlot(item) {
  if (!item) return null
  if (item.type === 'weapon') return 'weapon'
  if (item.type === 'armor') {
    const t = (item.details?.armor_type || '').toLowerCase()
    if (t.includes('cabeza') || t.includes('head')) return 'head'
    if (t.includes('pierna') || t.includes('leg')) return 'legs'
    if (t.includes('escudo') || t.includes('shield')) return 'shield'
    return 'chest'
  }
  return null
}

async function handleEquip(ci) {
  if (busy.value) return
  busy.value = true
  try {
    if (!ci.is_equipped) {
      const mySlot = getSlot(ci.item)
      const source = myCharacterItems.value
      const toUnequip = source.filter(x => x.is_equipped && x.id && x.id !== ci.id && getSlot(x.item) === mySlot)
      for (const u of toUnequip) {
        await toggleEquipItem(u.id, false)
      }
      await toggleEquipItem(ci.id, true, ci.item.id_item)
    } else {
      await toggleEquipItem(ci.id, false)
    }
  } catch (err) {
    console.error("Error al equipar/desequipar", err)
  } finally {
    busy.value = false
    const currentIdItem = selectedItem.value?.item?.id_item
    if (currentIdItem) {
      selectedItem.value = myCharacterItems.value.find(x => x.item?.id_item === currentIdItem)
    }
  }
}

async function handleBuy(item) {
  if (busy.value) return
  busy.value = true
  try {
    await purchaseItem(item.id_item)
  } catch (err) {
    alert(err?.response?.data?.message || 'Error al comprar')
  } finally {
    busy.value = false
    const currentIdItem = selectedItem.value?.item?.id_item
    if (currentIdItem) {
      const source = props.isShop 
        ? globalItems.value.map(item => ({ item, id: null, quantity: 0, is_equipped: false }))
        : myCharacterItems.value
      selectedItem.value = source.find(x => x.item?.id_item === currentIdItem)
    }
  }
}

async function handleSell(ci) {
  if (busy.value) return
  busy.value = true
  try {
    await sellItem(ci.id)
  } catch (err) {
    alert(err?.response?.data?.message || 'Error al vender')
  } finally {
    busy.value = false
    const currentIdItem = selectedItem.value?.item?.id_item
    if (currentIdItem) {
      const source = props.isShop 
        ? globalItems.value.map(item => ({ item, id: null, quantity: 0, is_equipped: false }))
        : myCharacterItems.value
      selectedItem.value = source.find(x => x.item?.id_item === currentIdItem)
    }
  }
}
</script>

<style scoped>
.premium-inventory-panel {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  width: min(1000px, 95vw);
  height: 600px;
  z-index: 200;
  border: 4px solid #facc15;
  background: #0f172a;
  box-shadow: 12px 12px 0 #854d0e, 0 30px 60px rgba(0,0,0,0.8);
  color: #fef9c3;
  padding: 0;
  font-family: 'Press Start 2P', monospace;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  image-rendering: pixelated;
}

/* Scanlines */
.scanlines {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.05) 50%);
  background-size: 100% 4px;
  z-index: 10;
  pointer-events: none;
}

.panel-header {
  padding: 20px 30px;
  background: #1e293b;
  border-bottom: 4px solid #facc15;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 5;
}

.panel-tabs { display: flex; gap: 12px; }

.tab-btn {
  border: 4px solid #facc15;
  background: #0f172a;
  color: #facc15;
  padding: 12px 24px;
  font-size: 8px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
}

.tab-btn.active {
  background: #ca8a04;
  color: #fef9c3;
  box-shadow: 4px 4px 0 #854d0e;
  transform: translateY(-2px);
}

.close-btn {
  width: 40px;
  height: 40px;
  border: 4px solid #facc15;
  background: #991b1b;
  color: #fecaca;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 4px 4px 0 #431407;
}

/* Content Layout */
.panel-content {
  flex: 1;
  display: flex;
  min-height: 0;
}

.inventory-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-right: 2px solid rgba(250, 204, 21, 0.1);
}

.inventory-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.inventory-filters {
  display: flex;
  gap: 8px;
}

.search-wrapper {
  flex: 1;
  position: relative;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 40px;
  background: #0b0d17;
  border: 2px solid #334155;
  color: #facc15;
  font-family: inherit;
  font-size: 7px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #facc15;
  box-shadow: 0 0 10px rgba(250, 204, 21, 0.2);
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  opacity: 0.5;
  pointer-events: none;
}

.filter-btn {
  padding: 10px 14px;
  background: #1e293b;
  border: 2px solid #334155;
  color: #94a3b8;
  font-size: 7px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  border-color: #facc15;
  color: #facc15;
  background: #1e293b;
}

.list-wrapper {
  flex: 1;
  overflow-y: auto;
  background: #0b0d17;
  border: 3px solid #1e293b;
  padding: 12px;
}

.item-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-list li {
  padding: 12px;
  background: #1e293b;
  border: 2px solid #334155;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.item-list li:hover {
  border-color: #facc15;
  background: #334155;
  transform: translateX(4px);
}

.item-list li.selected {
  background: #ca8a04;
  border-color: #facc15;
  color: #fef9c3;
}

.item-icon-box {
  width: 40px;
  height: 40px;
  background: #0f172a;
  border: 2px solid rgba(250, 204, 21, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.item-info { flex: 1; }
.item-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.item-name { font-size: 9px; font-weight: bold; }
.equipped-tag { font-size: 7px; background: #facc15; color: #431407; padding: 2px 4px; }

.item-meta { display: flex; gap: 12px; font-size: 7px; color: #94a3b8; }

/* Preview Section */
.item-preview {
  width: 360px;
  padding: 30px;
  background: #1e293b;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-placeholder {
  width: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 8px;
  text-align: center;
}

.sprite-display {
  width: 100%;
  aspect-ratio: 1;
  background: #0b0d17;
  border: 4px solid #facc15;
  box-shadow: 4px 4px 0 #854d0e;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 20px;
}

.display-icon { font-size: 80px; z-index: 1; }
.display-glow {
  position: absolute;
  inset: 20%;
  background: #facc15;
  filter: blur(40px);
  opacity: 0.15;
}

.preview-title { font-size: 14px; color: #facc15; text-shadow: 2px 2px 0 #431407; margin-bottom: 12px; }
.preview-desc { font-size: 8px; line-height: 1.8; color: #cbd5e1; }

.stats-label { font-size: 7px; color: #facc15; opacity: 0.6; margin-bottom: 12px; }
.stats-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.stats-list li { font-size: 8px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(250, 204, 21, 0.1); padding-bottom: 4px; }
.stat-val { color: #facc15; }

.preview-actions { display: flex; flex-direction: column; gap: 12px; margin-top: auto; }

.action-btn {
  padding: 16px;
  font-family: inherit;
  font-size: 8px;
  font-weight: bold;
  border: 4px solid #facc15;
  cursor: pointer;
  transition: all 0.1s;
}

.action-btn.buy { background: #ca8a04; color: #fef9c3; box-shadow: 4px 4px 0 #854d0e; }
.action-btn.sell { background: #991b1b; color: #fecaca; border-color: #ef4444; box-shadow: 4px 4px 0 #450a0a; }
.action-btn.equip { background: #1e40af; color: #dbeafe; border-color: #3b82f6; box-shadow: 4px 4px 0 #1e3a8a; }

.action-btn:hover:not(:disabled) { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #000; }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }

/* Status Boxes */
.status-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
  text-align: center;
  font-size: 8px;
  color: #94a3b8;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #0b0d17; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #ca8a04; border: 2px solid #facc15; }
</style>
