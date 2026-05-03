<template>
  <section class="game-panel" @click.stop>
    <!-- SCANLINES -->
    <div class="panel-scanlines"></div>

    <header class="panel-header">
      <div class="panel-tabs" v-if="!isShop">
        <button class="tab-btn active">Inventario</button>
        <button class="tab-btn" @click="$emit('switch-panel', 'equipment')">Equipo</button>
      </div>
      <h2 v-else>Tienda del Reino</h2>
      <div class="header-gold">
        <span class="gold-icon">🪙</span>
        <span class="gold-amount">{{ characterStore.gold }}</span>
      </div>
      <button class="panel-close-btn" @click="$emit('close')">X</button>
    </header>

    <div class="panel-content">
      <div class="panel-main">
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
        <div class="preview-header-box">
          <div class="sprite-display">
            <span class="display-icon">{{ spriteByType[selectedItem.item.type] }}</span>
            <div class="display-glow"></div>
          </div>
          <div class="preview-info">
            <h3 class="preview-title">{{ selectedItem.item.name.toUpperCase() }}</h3>
            <div class="preview-type-tag">{{ labelsByType[selectedItem.item.type] }}</div>
          </div>
        </div>

        <div class="description-box">
          <h4 class="section-label">DESCRIPCIÓN</h4>
          <p class="preview-desc">{{ selectedItem.item.description }}</p>
        </div>

        <div class="preview-stats">
          <h4 class="section-label">ATRIBUTOS DEL SISTEMA</h4>
          <ul class="stats-list">
            <template v-if="selectedItem.item.type === 'weapon'">
              <li class="stat-item">
                <span class="stat-label">POTENCIA DE ATAQUE:</span> 
                <span class="stat-val highlight">{{ selectedItem.item.details?.damage ?? '0' }} DMG</span>
              </li>
              <li class="stat-item">
                <span class="stat-label">CATEGORÍA:</span> 
                <span class="stat-val">{{ selectedItem.item.details?.weapon_type?.toUpperCase() ?? '-' }}</span>
              </li>
              <li class="stat-item">
                <span class="stat-label">INTEGRIDAD:</span> 
                <span class="stat-val">{{ selectedItem.item.details?.durability ?? '-' }}%</span>
              </li>
            </template>
            <template v-if="selectedItem.item.type === 'armor'">
              <li class="stat-item">
                <span class="stat-label">NIVEL DE DEFENSA:</span> 
                <span class="stat-val highlight">{{ selectedItem.item.details?.defense ?? '0' }} DEF</span>
              </li>
              <li class="stat-item">
                <span class="stat-label">TIPO DE ARMADURA:</span> 
                <span class="stat-val">{{ selectedItem.item.details?.armor_type?.toUpperCase() ?? '-' }}</span>
              </li>
              <li class="stat-item">
                <span class="stat-label">INTEGRIDAD:</span> 
                <span class="stat-val">{{ selectedItem.item.details?.durability ?? '-' }}%</span>
              </li>
            </template>
            <template v-if="selectedItem.item.type === 'consumable'">
              <li class="stat-item">
                <span class="stat-label">EFECTO PRIMARIO:</span> 
                <span class="stat-val">{{ selectedItem.item.details?.effect?.toUpperCase() ?? '-' }}</span>
              </li>
              <li class="stat-item">
                <span class="stat-label">POTENCIA:</span> 
                <span class="stat-val highlight">{{ selectedItem.item.details?.power ?? '-' }}</span>
              </li>
              <li class="stat-item">
                <span class="stat-label">DURACIÓN:</span> 
                <span class="stat-val">{{ selectedItem.item.details?.duration ? selectedItem.item.details.duration + 's' : 'INSTANTÁNEO' }}</span>
              </li>
            </template>
          </ul>
        </div>

        <div class="preview-actions">
          <!-- BOTÓN DE COMPRA: visible cuando estamos en modo tienda -->
          <button
            v-if="isShop"
            class="action-btn buy"
            @click="handleBuy(selectedItem.item)"
            :disabled="busy || (characterStore.gold < (selectedItem.item?.price || 0))"
          >
            {{ (characterStore.gold < (selectedItem.item?.price || 0)) ? 'FALTA ORO' : `COMPRAR AHORA (${selectedItem.item?.price || 0} 🪙)` }}
          </button>

          <div v-else class="inventory-actions">
            <button 
              v-if="!selectedItem.is_equipped"
              class="action-btn sell"
              @click="handleSell(selectedItem)"
              :disabled="busy"
            >
              VENDER ({{ Math.floor((selectedItem.item.price || 0) * 0.5) }} 🪙)
            </button>
            <button 
              v-if="['weapon', 'armor'].includes(selectedItem.item.type)" 
              class="action-btn equip" 
              @click="handleEquip(selectedItem)"
              :disabled="busy"
            >
              {{ selectedItem.is_equipped ? 'DESEQUIPAR' : 'EQUIPAR' }}
            </button>
          </div>
        </div>
      </aside>
      <div v-else class="preview-placeholder">
        <p>SELECCIONA UN OBJETO</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  globalItems,
  myCharacterItems,
  isInventoryLoading,
  lastInventoryError,
  fetchInventoryData,
  toggleEquipItem
} from '../api/inventario'
import { purchaseItem, sellItem } from '../api/shop'
import { useCharacterStore } from '../stores/character'

const characterStore = useCharacterStore()

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

// Refrescar datos al cambiar entre inventario y tienda
watch(() => props.isShop, async () => {
  // Resetear selección ANTES de cargar para evitar que un item con id real
  // quede seleccionado mientras llegan los datos de la tienda
  selectedItem.value = null
  await fetchInventoryData(true)
  if (filteredItems.value.length > 0) {
    selectedItem.value = filteredItems.value[0]
  }
})

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
  selectedItem.value = null
  await fetchInventoryData(true)
  if (filteredItems.value.length > 0) {
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
    await characterStore.refresh() // Refrescar para que SecondView detecte el cambio de arma inmediatamente
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
    await characterStore.refresh() // Refrescar oro tras compra
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
    await characterStore.refresh() // Refrescar oro tras venta
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

<style>
@import '../styles/game-panel.css';
</style>

<style scoped>
/* ── Inventory-specific styles ── */
.inventory-header-actions {
  display: flex; justify-content: space-between; align-items: center;
  gap: 20px; margin-bottom: 24px;
}
.inventory-filters { display: flex; gap: 8px; }
.search-wrapper { flex: 1; position: relative; max-width: 300px; }
.search-input {
  width: 100%; padding: 10px 14px 10px 40px;
  background: #0b0d17; border: 2px solid #334155;
  color: #facc15; font-family: 'Press Start 2P', monospace;
  font-size: 7px; transition: all 0.2s; box-sizing: border-box;
}
.search-input:focus { outline: none; border-color: #facc15; box-shadow: 0 0 10px rgba(250,204,21,0.2); }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 12px; opacity: 0.5; pointer-events: none; }
.filter-btn {
  padding: 10px 14px; background: #1e293b; border: 2px solid #334155;
  color: #94a3b8; font-size: 7px; font-family: 'Press Start 2P', monospace;
  cursor: pointer; transition: all 0.2s;
}
.filter-btn.active { border-color: #facc15; color: #facc15; }
.equipped-tag { font-size: 7px; background: #facc15; color: #431407; padding: 2px 4px; }
.meta-price { font-size: 7px; color: #94a3b8; }
.retry-btn {
  padding: 8px 16px; background: #ca8a04; border: 2px solid #facc15;
  color: #fef9c3; font-family: 'Press Start 2P', monospace; font-size: 7px; cursor: pointer;
}
</style>
