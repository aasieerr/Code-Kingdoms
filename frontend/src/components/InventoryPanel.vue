<template>
  <section class="character-panel" @click.stop>
    <header class="panel-header">
      <div class="panel-tabs" v-if="!isShop">
        <button class="tab-btn active">Inventario</button>
        <button class="tab-btn" @click="$emit('switch-panel', 'equipment')">Equipo</button>
      </div>
      <h2 v-else>Tienda del Reino</h2>
      <button class="close-btn" @click="$emit('close')">X</button>
    </header>

    <!-- Filtros -->
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

    <!-- Cargando -->
    <div v-if="loading" class="inventory-status">
      <span class="status-icon">⏳</span>
      <p>Cargando inventario...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="inventory-status error">
      <span class="status-icon">⚠</span>
      <p>{{ error }}</p>
      <button class="filter-btn" @click="load">Reintentar</button>
    </div>

    <!-- Sin items -->
    <div v-else-if="filteredItems.length === 0" class="inventory-status">
      <span class="status-icon">📦</span>
      <p>No hay items de este tipo.</p>
    </div>

    <!-- Datos del backend -->
    <div v-else class="inventory-grid">
      <ul class="item-list">
        <li
          v-for="ci in filteredItems"
          :key="ci.item.id_item"
          :class="{ selected: selectedItem?.item?.id_item === ci.item.id_item }"
          @click="selectedItem = ci"
        >
          <span class="item-icon">{{ spriteByType[ci.item.type] }}</span>
          <div>
            <p class="item-name">{{ ci.item.name }} <span v-if="ci.is_equipped">(E)</span></p>
            <p class="item-type">
              {{ labelsByType[ci.item.type] }} 
              <span v-if="!isShop && ci.id">· x{{ ci.quantity }}</span>
              <span v-if="isShop || !ci.id">· {{ ci.item.price }} 🪙</span>
            </p>
          </div>
        </li>
      </ul>

      <article class="item-preview" v-if="selectedItem?.item">
        <div class="sprite-box">{{ spriteByType[selectedItem.item.type] }}</div>
        <h3>{{ selectedItem.item.name }}</h3>
        <p>{{ selectedItem.item.description }}</p>
        <ul class="item-stats">
          <li v-if="selectedItem.item.type === 'weapon'">Daño: {{ selectedItem.item.details?.damage ?? '-' }}</li>
          <li v-if="selectedItem.item.type === 'weapon'">Tipo: {{ selectedItem.item.details?.weapon_type ?? '-' }}</li>
          <li v-if="selectedItem.item.type === 'weapon'">Durabilidad: {{ selectedItem.item.details?.durability ?? '-' }}</li>
          
          <li v-if="selectedItem.item.type === 'armor'">Defensa: {{ selectedItem.item.details?.defense ?? '-' }}</li>
          <li v-if="selectedItem.item.type === 'armor'">Clase: {{ selectedItem.item.details?.armor_type ?? '-' }}</li>
          <li v-if="selectedItem.item.type === 'armor'">Durabilidad: {{ selectedItem.item.details?.durability ?? '-' }}</li>
          
          <li v-if="selectedItem.item.type === 'consumable'">Efecto: {{ selectedItem.item.details?.effect ?? '-' }}</li>
          <li v-if="selectedItem.item.type === 'consumable'">Potencia: {{ selectedItem.item.details?.power ?? '-' }}</li>
          <li v-if="selectedItem.item.type === 'consumable'">Duración: {{ selectedItem.item.details?.duration ?? '-' }}</li>
        </ul>

        <div class="item-actions">
          <!-- Solo en la tienda se puede comprar -->
          <button
            v-if="isShop"
            class="action-btn buy"
            @click="handleBuy(selectedItem.item)"
            :disabled="busy"
          >
            Comprar ({{ selectedItem.item.price || 0 }} 🪙)
          </button>

          <!-- Solo en el inventario se puede vender o equipar -->
          <template v-else>
            <button 
              v-if="selectedItem.id && !selectedItem.is_equipped"
              class="action-btn sell"
              @click="handleSell(selectedItem)"
              :disabled="busy"
            >
              Vender ({{ Math.floor((selectedItem.item.price || 0) * 0.5) }} 🪙)
            </button>
            
            <button 
              v-if="selectedItem.id && ['weapon', 'armor'].includes(selectedItem.item.type)" 
              class="action-btn equip" 
              @click="handleEquip(selectedItem)"
              :disabled="busy"
            >
              {{ selectedItem.is_equipped ? 'Desequipar' : 'Equipar' }}
            </button>
          </template>
        </div>
      </article>
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
  { value: 'consumable',label: 'Consumibles' },
]

const selectedItem = ref(null)
const activeFilter = ref('all')
const busy = ref(false)

// Se exponen directamente los refs globales al template
const loading = isInventoryLoading
const error = lastInventoryError

const filteredItems = computed(() => {
  const source = props.isShop 
    ? globalItems.value.map(item => ({ item, id: null, quantity: 0, is_equipped: false }))
    : myCharacterItems.value

  if (activeFilter.value === 'all') return source
  return source.filter((ci) => ci.item?.type === activeFilter.value)
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
      const toUnequip = items.value.filter(x => x.is_equipped && x.id && x.id !== ci.id && getSlot(x.item) === mySlot)
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
    if (currentIdItem) selectedItem.value = items.value.find(x => x.item?.id_item === currentIdItem)
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
    if (currentIdItem) selectedItem.value = items.value.find(x => x.item?.id_item === currentIdItem)
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
    if (currentIdItem) selectedItem.value = items.value.find(x => x.item?.id_item === currentIdItem)
  }
}
</script>

<style scoped>
.character-panel {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  width: min(920px, 92vw);
  min-height: 520px;
  z-index: 45;
  border: 5px solid #1f1f1f;
  background: linear-gradient(180deg, #263238 0%, #1b2529 100%);
  box-shadow: 0 0 0 5px #607d8b, 12px 12px 0 rgba(0, 0, 0, 0.5);
  color: #f5f5f5;
  padding: 16px;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-tabs { display: flex; gap: 8px; }
.tab-btn {
  border: 2px solid #0f1518; background: #455a64; color: #e9eef0;
  padding: 8px 12px; font-size: 10px; cursor: pointer; font-family: inherit;
}
.tab-btn.active { background: #8bc34a; color: #17210f; }
.panel-header h2 { font-size: 14px; margin: 0; }
.close-btn {
  width: 34px;
  height: 34px;
  border: 2px solid #0f1518;
  background: #b74a3c;
  color: #fff7e6;
  cursor: pointer;
  font-family: inherit;
}
.inventory-filters { display: flex; gap: 8px; }
.filter-btn {
  border: 2px solid #0f1518;
  background: #455a64;
  color: #e9eef0;
  padding: 8px 10px;
  font-size: 10px;
  cursor: pointer;
  font-family: inherit;
}
.filter-btn.active { background: #8bc34a; color: #17210f; }
.inventory-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 200px;
  border: 3px solid #111;
  background: #2a373d;
  padding: 20px;
  text-align: center;
  font-size: 10px;
  color: #b0bec5;
}
.inventory-status.error { color: #ef9a9a; border-color: #b71c1c; background: #1a1a2a; }
.status-icon { font-size: 32px; }
.inventory-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 16px; }
.item-list {
  list-style: none;
  margin: 0;
  padding: 10px;
  border: 3px solid #111;
  background: #2a373d;
  max-height: 360px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item-list li {
  border: 2px solid #0f1518;
  padding: 10px;
  background: #607d8b;
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 10px;
  cursor: pointer;
}
.item-list li.selected { background: #d4b16a; color: #1b1b1b; }
.item-icon { font-size: 16px; }
.item-name { margin: 0 0 5px; font-size: 10px; }
.item-type { margin: 0; font-size: 9px; }
.item-preview { border: 3px solid #111; background: #243238; padding: 12px; }
.sprite-box {
  width: 100%;
  height: 150px;
  border: 3px solid #0f1518;
  background:
    linear-gradient(45deg, #567 25%, transparent 25%),
    linear-gradient(-45deg, #567 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #567 75%),
    linear-gradient(-45deg, transparent 75%, #567 75%);
  background-size: 22px 22px;
  background-position: 0 0, 0 11px, 11px -11px, -11px 0;
  display: grid;
  place-items: center;
  font-size: 46px;
  margin-bottom: 10px;
}
.item-preview h3 { margin: 0 0 8px; font-size: 12px; }
.item-preview p { margin: 0 0 8px; line-height: 1.45; font-size: 10px; }
.item-stats { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; margin-bottom: 15px;}
.item-stats li { font-size: 10px; }

.item-actions { display: flex; flex-direction: column; gap: 8px; }
.action-btn {
  width: 100%; border: 2px solid #0f1518; padding: 10px;
  font-size: 10px; cursor: pointer; font-family: inherit; font-weight: bold;
}
.action-btn:hover:not(:disabled) { filter: brightness(1.1); }
.action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.action-btn.buy { background: #8bc34a; color: #17210f; }
.action-btn.sell { background: #b74a3c; color: #fff7e6; }
.action-btn.equip { background: #c9b27a; color: #1f1f1f; }
</style>
