<template>
  <div class="settings-overlay" @click.self="$emit('close')">
    <div class="settings-modal" @click.stop>
      <div class="settings-header">
        <h2>AJUSTES</h2>
        <button type="button" class="close-btn" @click="$emit('close')">X</button>
      </div>

      <section class="settings-section">
        <h3>VOLUMEN MAESTRO</h3>
        <div class="volume-row">
          <input
            :value="settings.volume"
            type="range"
            min="0"
            max="100"
            step="1"
            @input="setVolume($event.target.value)"
          />
          <span>{{ settings.volume }}%</span>
        </div>
      </section>

      <section class="settings-section">
        <h3>ARENA — POCIONES (SOLO OLEADAS /game/second)</h3>
        <p class="settings-hint">
          Asigna un tipo de poción por ranura y su tecla. Solo funciona durante el combate en oleadas,
          inventario cerrado.
        </p>
        <div class="arena-slot-grid">
          <div v-for="idx in arenaSlotIndexes" :key="idx" class="arena-slot-row">
            <span class="arena-slot-label">RANURA {{ idx + 1 }}</span>
            <select
              class="arena-select"
              :value="settings.arenaPotionSlots[idx]?.itemName || ''"
              @change="setArenaPotionItem(idx, $event.target.value)"
              @mousedown.stop
            >
              <option v-for="name in ARENA_CONSUMABLE_NAMES" :key="'n-' + idx + '-' + name" :value="name">
                {{ name === '' ? '(Vacío)' : name }}
              </option>
            </select>
            <button
              type="button"
              class="bind-btn arena-bind"
              :class="{ listening: listeningArenaSlot === idx }"
              @click="startArenaListen(idx)"
            >
              {{
                listeningArenaSlot === idx
                  ? 'PULSA UNA TECLA...'
                  : keyLabel(settings.arenaPotionSlots[idx]?.key)
              }}
            </button>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h3>KEYBINDS</h3>
        <div class="bind-grid">
          <div v-for="bind in binds" :key="bind.action" class="bind-row">
            <span class="bind-label">{{ bind.label }}</span>
            <button
              type="button"
              class="bind-btn"
              :class="{ listening: listeningAction === bind.action }"
              @click="startListening(bind.action)"
            >
              {{ listeningAction === bind.action ? 'PULSA UNA TECLA...' : keyLabel(settings.keybinds[bind.action]) }}
            </button>
          </div>
        </div>
      </section>

      <div class="settings-footer">
        <button type="button" class="reset-btn" @click="handleReset">REINICIAR AJUSTES</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useGameSettings, ARENA_CONSUMABLE_NAMES, ARENA_POTION_SLOT_COUNT } from '../composables/useGameSettings'

defineEmits(['close'])

const arenaSlotIndexes = Array.from({ length: ARENA_POTION_SLOT_COUNT }, (_, i) => i)

const binds = [
  { action: 'moveUp', label: 'Mover arriba' },
  { action: 'moveDown', label: 'Mover abajo' },
  { action: 'moveLeft', label: 'Mover izquierda' },
  { action: 'moveRight', label: 'Mover derecha' },
  { action: 'interact', label: 'Interactuar' },
  { action: 'inventory', label: 'Mochila' },
  { action: 'equipment', label: 'Equipo' },
  { action: 'map', label: 'Mapa' },
]

const listeningAction = ref(null)
const listeningArenaSlot = ref(null)

const {
  settings,
  setVolume,
  setKeybind,
  setArenaPotionKey,
  setArenaPotionItem,
  resetSettings,
  keyLabel,
  normalizeKey,
} = useGameSettings()

function startListening(action) {
  listeningArenaSlot.value = null
  listeningAction.value = action
}

function startArenaListen(slotIndex) {
  listeningAction.value = null
  listeningArenaSlot.value = slotIndex
}

function stopListening() {
  listeningAction.value = null
}

function stopArenaListen() {
  listeningArenaSlot.value = null
}

function onKeydown(event) {
  if (listeningArenaSlot.value !== null) {
    event.preventDefault()
    const key = normalizeKey(event.key)
    if (!key || key === 'escape') {
      stopArenaListen()
      return
    }
    setArenaPotionKey(listeningArenaSlot.value, key)
    stopArenaListen()
    return
  }
  if (!listeningAction.value) return
  event.preventDefault()
  const key = normalizeKey(event.key)
  if (!key || key === 'escape') {
    stopListening()
    return
  }
  setKeybind(listeningAction.value, key)
  stopListening()
}

function handleReset() {
  resetSettings()
  stopListening()
  stopArenaListen()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.settings-modal {
  width: min(720px, 100%);
  max-height: 90vh;
  overflow: auto;
  border: 4px solid #facc15;
  background: #0f172a;
  box-shadow: 10px 10px 0 #854d0e;
  color: #fef9c3;
  font-family: 'Press Start 2P', monospace;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 3px solid #facc15;
  background: #1e293b;
}

.settings-header h2 {
  margin: 0;
  font-size: 11px;
}

.close-btn {
  border: 2px solid #b91c1c;
  background: #991b1b;
  color: #fecaca;
  font-family: inherit;
  font-size: 9px;
  padding: 6px 10px;
  cursor: pointer;
}

.settings-section {
  padding: 18px 20px;
  border-bottom: 1px solid #334155;
}

.settings-section h3 {
  margin: 0 0 14px;
  font-size: 8px;
  color: #facc15;
}

.settings-hint {
  margin: 0 0 12px;
  font-size: 6px;
  line-height: 1.5;
  color: #94a3b8;
}

.arena-slot-grid {
  display: grid;
  gap: 10px;
}

.arena-slot-row {
  display: grid;
  grid-template-columns: 100px 1fr minmax(180px, 1fr);
  align-items: center;
  gap: 10px;
}

.arena-slot-label {
  font-size: 7px;
  color: #e2e8f0;
}

.arena-select {
  font-family: inherit;
  font-size: 7px;
  padding: 6px 8px;
  background: #0f172a;
  color: #e2e8f0;
  border: 2px solid #334155;
}

.arena-bind {
  min-width: 0;
}

.volume-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.volume-row input {
  width: 100%;
}

.volume-row span {
  min-width: 58px;
  text-align: right;
  font-size: 8px;
}

.bind-grid {
  display: grid;
  gap: 10px;
}

.bind-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.bind-label {
  font-size: 8px;
  color: #e2e8f0;
}

.bind-btn {
  min-width: 215px;
  border: 2px solid #1d4ed8;
  background: #1e40af;
  color: #dbeafe;
  font-family: inherit;
  font-size: 8px;
  padding: 8px 10px;
  cursor: pointer;
}

.bind-btn.listening {
  border-color: #facc15;
  background: #ca8a04;
  color: #431407;
}

.settings-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
}

.reset-btn {
  border: 2px solid #7c3aed;
  background: #6d28d9;
  color: #ede9fe;
  font-family: inherit;
  font-size: 8px;
  padding: 9px 12px;
  cursor: pointer;
}
</style>
