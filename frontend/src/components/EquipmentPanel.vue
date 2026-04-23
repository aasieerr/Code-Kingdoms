<template>
  <section class="character-panel" @click.stop>
    <header class="panel-header">
      <div class="panel-tabs">
        <button class="tab-btn" @click="$emit('switch-panel', 'inventory')">Inventario</button>
        <button class="tab-btn active">Equipo</button>
      </div>
      <button class="close-btn" @click="$emit('close')">X</button>
    </header>

    <!-- Cargando -->
    <div v-if="loading" class="panel-status">
      <span class="status-icon">⏳</span>
      <p>Cargando equipo...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="panel-status error">
      <span class="status-icon">⚠</span>
      <p>{{ error }}</p>
      <button class="filter-btn" @click="load">Reintentar</button>
    </div>

    <!-- Contenido cargado -->
    <div v-else class="equipment-content">
      <!-- Silueta con slots -->
      <div class="character-silhouette">
        <div
          v-for="slot in SLOTS"
          :key="slot.key"
          class="equip-slot"
          :class="[slot.css, { occupied: equippedMap[slot.key] }]"
          :title="slot.label"
        >
          <template v-if="equippedMap[slot.key]">
            <span class="slot-icon">{{ SPRITES[equippedMap[slot.key].item?.type] }}</span>
            <span class="slot-name">{{ equippedMap[slot.key].item?.name }}</span>
          </template>
          <template v-else>
            <span class="slot-empty">{{ slot.label }}</span>
          </template>
        </div>
      </div>

      <!-- Panel derecho: lista + detalle -->
      <div class="equipment-detail">
        <template v-if="equippedItems.length">
          <p class="equip-section-title">Items equipados</p>
          <ul class="item-list">
            <li
              v-for="ci in equippedItems"
              :key="ci.id"
              :class="{ selected: selectedItem?.id === ci.id }"
              @click="selectedItem = ci"
            >
              <span class="item-icon">{{ SPRITES[ci.item?.type] }}</span>
              <div>
                <p class="item-name">{{ ci.item?.name }}</p>
                <p class="item-type">{{ LABELS[ci.item?.type] }} · x{{ ci.quantity }}</p>
              </div>
            </li>
          </ul>

          <article class="item-preview" v-if="selectedItem?.item">
            <div class="sprite-box">{{ SPRITES[selectedItem.item.type] }}</div>
            <h3>{{ selectedItem.item.name }}</h3>
            <p>{{ selectedItem.item.description }}</p>
            <ul class="item-stats">
              <li v-if="selectedItem.item.type === 'weapon'">Daño: {{ selectedItem.item.details?.damage ?? '-' }}</li>
              <li v-if="selectedItem.item.type === 'weapon'">Tipo: {{ selectedItem.item.details?.weapon_type ?? '-' }}</li>
              <li v-if="selectedItem.item.type === 'armor'">Defensa: {{ selectedItem.item.details?.defense ?? '-' }}</li>
              <li v-if="selectedItem.item.type === 'armor'">Clase: {{ selectedItem.item.details?.armor_type ?? '-' }}</li>
              <li v-if="selectedItem.item.type === 'consumable'">Efecto: {{ selectedItem.item.details?.effect ?? '-' }}</li>
              <li v-if="selectedItem.item.type === 'consumable'">Potencia: {{ selectedItem.item.details?.power ?? '-' }}</li>
            </ul>
          </article>
        </template>

        <div v-else class="panel-status" style="min-height:120px">
          <span class="status-icon">🗡</span>
          <p>Sin objetos equipados.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchCharacterItems } from '../api/inventario'

defineEmits(['close', 'switch-panel'])

const LABELS  = { weapon: 'Arma', armor: 'Armadura', consumable: 'Consumible' }
const SPRITES = { weapon: '⚔', armor: '🛡', consumable: '🧪' }

const SLOTS = [
  { key: 'head',   label: 'Cabeza',  css: 'head' },
  { key: 'chest',  label: 'Pecho',   css: 'chest' },
  { key: 'legs',   label: 'Piernas', css: 'legs' },
  { key: 'weapon', label: 'Arma',    css: 'weapon' },
  { key: 'shield', label: 'Escudo',  css: 'shield' },
]

const equippedItems = ref([])
const selectedItem  = ref(null)
const loading       = ref(false)
const error         = ref(null)

// Mapea cada slot-key al character-item que ocupa ese slot
const equippedMap = computed(() => {
  const map = {}
  for (const ci of equippedItems.value) {
    const type      = ci.item?.type
    const armorType = ci.item?.details?.armor_type ?? ''
    if (type === 'weapon') {
      map['weapon'] = ci
    } else if (type === 'armor') {
      if (armorType.includes('cabeza') || armorType.includes('head')) map['head']  = ci
      else if (armorType.includes('pierna') || armorType.includes('leg'))  map['legs']  = ci
      else map['chest'] = ci
    }
  }
  return map
})

async function load() {
  loading.value    = true
  error.value      = null
  selectedItem.value = null
  try {
    // Filtra solo los que están equipados
    // TODO: cuando Keycloak esté activo, pasar el id del personaje del usuario
    const all = await fetchCharacterItems()
    equippedItems.value = all.filter((ci) => ci.is_equipped)
    if (equippedItems.value.length > 0) selectedItem.value = equippedItems.value[0]
  } catch (err) {
    equippedItems.value = []
    error.value =
      err?.response?.data?.message ??
      'No se pudo cargar el equipo. Asegúrate de que el backend está activo.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
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
  gap: 12px;
}
.panel-header { display: flex; justify-content: space-between; align-items: center; }
.panel-tabs { display: flex; gap: 8px; }
.tab-btn {
  border: 2px solid #0f1518; background: #455a64; color: #e9eef0;
  padding: 8px 12px; font-size: 10px; cursor: pointer; font-family: inherit;
}
.tab-btn.active { background: #8bc34a; color: #17210f; }
.panel-header h2 { font-size: 14px; margin: 0; }
.close-btn {
  width: 34px; height: 34px;
  border: 2px solid #0f1518; background: #b74a3c; color: #fff7e6;
  cursor: pointer; font-family: inherit;
}
.panel-status {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; min-height: 200px;
  border: 3px solid #111; background: #2a373d;
  padding: 20px; text-align: center; font-size: 10px; color: #b0bec5;
}
.panel-status.error { color: #ef9a9a; border-color: #b71c1c; background: #1a1a2a; }
.status-icon { font-size: 32px; }
.filter-btn {
  border: 2px solid #0f1518; background: #455a64; color: #e9eef0;
  padding: 8px 10px; font-size: 10px; cursor: pointer; font-family: inherit;
}
/* Layout equipo */
.equipment-content { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; flex: 1; }
.character-silhouette {
  min-height: 380px; border: 3px solid #111;
  background: #2a373d; position: relative;
}
.equip-slot {
  position: absolute; width: 120px;
  border: 2px dashed #d6bd8a; background: rgba(28, 36, 40, 0.65);
  color: #f5deb3; text-align: center; font-size: 9px; padding: 8px 6px;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
}
.equip-slot.occupied { border-style: solid; border-color: #8bc34a; background: rgba(60, 90, 40, 0.75); }
.slot-icon { font-size: 18px; line-height: 1; }
.slot-name { font-size: 7px; color: #c5e1a5; word-break: break-word; max-width: 110px; }
.slot-empty { opacity: 0.6; }
.head   { top: 20px;  left: 50%; transform: translateX(-50%); }
.chest  { top: 92px;  left: 50%; transform: translateX(-50%); }
.legs   { top: 164px; left: 50%; transform: translateX(-50%); }
.weapon { top: 130px; left: 18px; }
.shield { top: 130px; right: 18px; }
/* Panel derecho */
.equipment-detail { display: flex; flex-direction: column; gap: 10px; overflow: auto; }
.equip-section-title {
  margin: 0 0 6px; font-size: 9px; color: #8bc34a;
  text-transform: uppercase; letter-spacing: 1px;
}
.item-list {
  list-style: none; margin: 0; padding: 10px;
  border: 3px solid #111; background: #2a373d;
  max-height: 280px; overflow: auto;
  display: flex; flex-direction: column; gap: 8px;
}
.item-list li {
  border: 2px solid #0f1518; padding: 10px; background: #607d8b;
  display: grid; grid-template-columns: 24px 1fr; gap: 10px; cursor: pointer;
}
.item-list li.selected { background: #d4b16a; color: #1b1b1b; }
.item-icon { font-size: 16px; }
.item-name { margin: 0 0 5px; font-size: 10px; }
.item-type { margin: 0; font-size: 9px; }
.item-preview { border: 3px solid #111; background: #243238; padding: 12px; }
.sprite-box {
  width: 100%; height: 100px; border: 3px solid #0f1518;
  background:
    linear-gradient(45deg, #567 25%, transparent 25%),
    linear-gradient(-45deg, #567 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #567 75%),
    linear-gradient(-45deg, transparent 75%, #567 75%);
  background-size: 22px 22px;
  background-position: 0 0, 0 11px, 11px -11px, -11px 0;
  display: grid; place-items: center; font-size: 36px; margin-bottom: 8px;
}
.item-preview h3 { margin: 0 0 6px; font-size: 11px; }
.item-preview p  { margin: 0 0 6px; line-height: 1.45; font-size: 10px; }
.item-stats { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
.item-stats li { font-size: 10px; }
</style>
