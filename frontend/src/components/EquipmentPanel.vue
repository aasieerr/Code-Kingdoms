<template>
  <section class="game-panel" @click.stop>
    <!-- SCANLINES -->
    <div class="panel-scanlines"></div>

    <header class="panel-header">
      <div class="panel-tabs">
        <button class="tab-btn" @click="$emit('switch-panel', 'inventory')">INVENTARIO</button>
        <button class="tab-btn active">EQUIPO</button>
      </div>
      <button class="panel-close-btn" @click="$emit('close')">✖</button>
    </header>

    <div class="panel-content">
      <!-- LEFT: Equipment List -->
      <div class="panel-main">
        <div class="equipment-stats-bar">
          <div class="stat-box">
            <span class="stat-label">ATAQUE</span>
            <span class="stat-value">{{ totalStats.attack }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">DEFENSA</span>
            <span class="stat-value">{{ totalStats.defense }}</span>
          </div>
        </div>

        <div class="list-wrapper custom-scrollbar">
          <div v-if="loading" class="status-box">
            <div class="loading-spinner"></div>
            <p>SINCRONIZANDO EQUIPO...</p>
          </div>
          <div v-else-if="equippedItems.length === 0" class="status-box empty">
            <p>SIN OBJETOS EQUIPADOS</p>
          </div>
          <ul v-else class="item-list">
            <li
              v-for="ci in equippedItems"
              :key="ci.id"
              :class="{ 'selected': selectedItem?.id === ci.id }"
              @click="selectedItem = ci"
            >
              <div class="item-icon-box">
                <span class="item-icon">{{ SPRITES[ci.item?.type] }}</span>
              </div>
              <div class="item-info">
                <div class="item-name-row">
                  <span class="item-name">{{ ci.item?.name.toUpperCase() }}</span>
                  <span class="slot-tag">{{ getSlotLabel(ci.item) }}</span>
                </div>
                <div class="item-meta">
                  <span class="meta-type">{{ ci.item?.type.toUpperCase() }}</span>
                  <span class="meta-power">LVL 1</span>
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
            <span class="display-icon">{{ SPRITES[selectedItem.item.type] }}</span>
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
          </ul>
        </div>

        <div class="preview-actions">
          <button
            class="action-btn sell"
            @click="handleUnequip(selectedItem)"
            :disabled="busy"
          >
            DESEQUIPAR
          </button>
        </div>
      </aside>
      <div v-else class="preview-placeholder">
        <p>SELECCIONA UN EQUIPO</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  equippedItems as globalEquippedItems,
  isInventoryLoading,
  fetchInventoryData,
  toggleEquipItem
} from '../api/inventario'
import { useCharacterStore } from '../stores/character'

const characterStore = useCharacterStore()

defineEmits(['close', 'switch-panel'])

const SPRITES = { weapon: '⚔', armor: '🛡', consumable: '🧪' }

const selectedItem = ref(null)
const busy = ref(false)
const loading = isInventoryLoading
const equippedItems = globalEquippedItems

const totalStats = computed(() => {
  let defense = 0; let attack = 0
  equippedItems.value.forEach(ci => {
    const d = ci.item?.details || {}
    defense += Number(d.defense || 0)
    attack += Number(d.damage || 0)
  })
  return { defense, attack }
})

onMounted(async () => {
  await fetchInventoryData()
  if (!selectedItem.value && equippedItems.value.length > 0) {
    selectedItem.value = equippedItems.value[0]
  }
})

function getSlotLabel(item) {
  if (!item) return ''
  if (item.type === 'weapon') return 'ARMA'
  const t = (item.details?.armor_type || '').toLowerCase()
  if (t.includes('cabeza')) return 'CABEZA'
  if (t.includes('pecho')) return 'PECHO'
  if (t.includes('pierna')) return 'PIERNAS'
  if (t.includes('escudo')) return 'ESCUDO'
  return 'ARMADURA'
}

async function handleUnequip(ci) {
  if (busy.value) return
  busy.value = true
  try {
    await toggleEquipItem(ci.id, false)
    selectedItem.value = null
  } catch (err) {
    console.error('Error al desequipar', err)
  } finally {
    busy.value = false
    await fetchInventoryData()
    await characterStore.refresh()
  }
}
</script>

<style>
@import '../styles/game-panel.css';
</style>

<style scoped>
/* ── Equipment-specific styles ── */
.equipment-stats-bar { display: flex; gap: 20px; margin-bottom: 24px; }

.stat-box {
  flex: 1; background: #0b0d17;
  border: 2px solid rgba(250,204,21,0.2);
  padding: 15px; display: flex; flex-direction: column;
  align-items: center; gap: 8px;
}
.stat-label { font-size: 6px; color: #facc15; opacity: 0.6; }
.stat-value { font-size: 14px; font-weight: bold; color: white; }

.slot-tag { font-size: 6px; background: rgba(250,204,21,0.1); color: #facc15; padding: 2px 6px; border: 1px solid #facc15; }
.meta-power { font-size: 7px; color: #94a3b8; }
</style>
