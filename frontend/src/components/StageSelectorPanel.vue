<template>
  <section class="stage-panel" @click.stop>
    <header class="stage-h">
      <h2>Seleccionar Sección</h2>
      <button type="button" class="close-btn" @click="$emit('close')">X</button>
    </header>
    <p class="stage-desc">Elige la sección a la que deseas viajar. Tu progreso máximo actual es la Sección {{ maxUnlocked }}.</p>

    <ul class="stage-list">
      <li
        v-for="(map, idx) in maps"
        :key="idx"
        class="stage-row"
        :class="{ locked: idx + 1 > maxUnlocked }"
      >
        <div class="stage-info">
          <p class="stage-name">Sección {{ idx + 1 }}: {{ map.name }}</p>
        </div>
        <div class="stage-actions">
          <button
            type="button"
            class="act equip"
            :disabled="idx + 1 > maxUnlocked"
            @click="selectStage(idx + 1)"
          >
            Viajar
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { SECTION_MAPS } from '../constants/maps'
import { useCharacterStore } from '../stores/character'
import { isPlayerPhpKingdom } from '../utils/realm'

const emit = defineEmits(['close', 'select-stage'])

const characterStore = useCharacterStore()

const isPhp = computed(() =>
  isPlayerPhpKingdom(characterStore.kingdomName, characterStore.kingdomId),
)

const enemyFaction = computed(() => (isPhp.value ? 'java' : 'php'))
const maps = computed(() => SECTION_MAPS[enemyFaction.value])

// The user can travel to any section up to their currently saved section
const maxUnlocked = computed(() => Number(characterStore.arenaSection || 1))

function selectStage(stageNum) {
  emit('select-stage', stageNum)
}
</script>

<style scoped>
.stage-panel {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  width: min(520px, 94vw);
  max-height: min(80vh, 560px);
  overflow: auto;
  border: 5px solid #1f1f1f;
  background: linear-gradient(180deg, #1e1428 0%, #0f0a16 100%);
  box-shadow: 0 0 0 5px #5e35b1, 12px 12px 0 rgba(0, 0, 0, 0.5);
  color: #ede7f6;
  padding: 16px;
  font-family: 'Press Start 2P', 'Courier New', monospace;
}
.stage-h {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.stage-h h2 { font-size: 11px; margin: 0; }
.close-btn {
  width: 34px;
  height: 34px;
  border: 2px solid #0f1518;
  background: #b74a3c;
  color: #fff7e6;
  cursor: pointer;
  font-family: inherit;
}
.stage-desc { font-size: 8px; margin: 0 0 12px; color: #b39ddb; line-height: 1.4; }
.stage-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.stage-row {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 3px solid #111;
  background: #2a1f3d;
  padding: 12px 10px;
}
.stage-row.locked { opacity: 0.5; filter: grayscale(1); }
.stage-info { flex: 1; min-width: 0; }
.stage-name { font-size: 9px; margin: 0; }
.stage-actions { flex-shrink: 0; }
.act {
  font-size: 8px;
  font-family: inherit;
  padding: 8px 12px;
  border: 2px solid #111;
  cursor: pointer;
  text-transform: uppercase;
}
.act:disabled { opacity: 0.5; cursor: not-allowed; }
.act.equip { background: #558b2f; color: #f1f8e9; }
</style>
