<template>
  <div class="stats-panel-overlay" @click.self="$emit('close')">
    <div class="stats-frame">
      <!-- Cabecera estilo Code Kingdoms -->
      <div class="panel-header">
        <h2 class="panel-title">ESTADÍSTICAS</h2>
        <button class="close-btn" @click="$emit('close')">X</button>
      </div>

      <!-- Resumen de Nivel -->
      <div class="stats-banner">
        <div class="level-box">
          <div class="box-label">LVL</div>
          <div class="box-value">{{ characterStore.level }}</div>
        </div>
        <div class="points-box">
          <div class="points-count">{{ characterStore.statPoints }}</div>
          <div class="points-text">PUNTOS DISPONIBLES</div>
        </div>
      </div>

      <!-- Lista de Atributos con estilo de botones de Code Kingdoms -->
      <div class="stats-list">
        <div class="stat-row">
          <div class="stat-label-group">
            <i class="fas fa-heart icon-hp"></i>
            <span class="stat-name">VIDA MÁXIMA</span>
          </div>
          <div class="stat-control">
            <span class="stat-value">{{ characterStore.maxHealth }}</span>
            <button 
              class="add-btn" 
              :disabled="characterStore.statPoints <= 0"
              @click="upgrade('health')"
            >+</button>
          </div>
        </div>

        <div class="stat-row">
          <div class="stat-label-group">
            <i class="fas fa-bolt icon-atk"></i>
            <span class="stat-name">DAÑO ATAQUE</span>
          </div>
          <div class="stat-control">
            <span class="stat-value">{{ characterStore.attackPower }}</span>
            <button 
              class="add-btn" 
              :disabled="characterStore.statPoints <= 0"
              @click="upgrade('attack')"
            >+</button>
          </div>
        </div>

        <div class="stat-row">
          <div class="stat-label-group">
            <i class="fas fa-wind icon-spd"></i>
            <span class="stat-name">VELOCIDAD</span>
          </div>
          <div class="stat-control">
            <span class="stat-value">{{ characterStore.speed }}</span>
            <button 
              class="add-btn" 
              :disabled="characterStore.statPoints <= 0"
              @click="upgrade('speed')"
            >+</button>
          </div>
        </div>
      </div>

      <div class="panel-footer">
        Sube de nivel para ganar puntos
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCharacterStore } from '../stores/character'

const characterStore = useCharacterStore()
const emit = defineEmits(['close'])

async function upgrade(stat) {
  if (characterStore.statPoints <= 0) return
  await characterStore.buyStat(stat)
}
</script>

<style scoped>
.stats-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  font-family: 'Press Start 2P', monospace;
}

.stats-frame {
  width: 400px;
  background: #0f172a;
  border: 4px solid #facc15;
  box-shadow: 10px 10px 0 #854d0e;
  padding: 20px;
  position: relative;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 10px;
  border-bottom: 4px solid rgba(250, 204, 21, 0.2);
}

.panel-title {
  font-size: 14px;
  color: #facc15;
  margin: 0;
  text-shadow: 2px 2px 0 #431407;
}

.close-btn {
  background: #991b1b;
  border: 2px solid #facc15;
  color: #fff;
  padding: 5px 10px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 4px 4px 0 #7f1d1d;
}

.close-btn:hover {
  background: #dc2626;
  transform: translate(-1px, -1px);
}

.stats-banner {
  display: flex;
  gap: 20px;
  background: rgba(250, 204, 21, 0.1);
  padding: 15px;
  border: 2px dashed #facc15;
  margin-bottom: 25px;
}

.level-box {
  background: #1e3a8a;
  border: 2px solid #3b82f6;
  padding: 10px;
  text-align: center;
  min-width: 60px;
}

.box-label { font-size: 8px; color: #93c5fd; margin-bottom: 5px; }
.box-value { font-size: 16px; color: #fff; }

.points-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.points-count {
  font-size: 20px;
  color: #facc15;
  margin-bottom: 4px;
}

.points-text { font-size: 7px; color: #94a3b8; }

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e293b;
  padding: 12px;
  border: 2px solid #334155;
}

.stat-label-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-name { font-size: 8px; color: #f8fafc; }

.icon-hp { color: #ef4444; }
.icon-atk { color: #fbbf24; }
.icon-spd { color: #22c55e; }

.stat-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-value {
  font-size: 10px;
  color: #facc15;
}

.add-btn {
  width: 30px;
  height: 30px;
  background: #ca8a04;
  border: 2px solid #facc15;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 3px 3px 0 #854d0e;
}

.add-btn:hover:not(:disabled) {
  background: #facc15;
  color: #431407;
  transform: translate(-1px, -1px);
}

.add-btn:disabled {
  background: #334155;
  border-color: #475569;
  color: #64748b;
  box-shadow: none;
  cursor: not-allowed;
}

.panel-footer {
  margin-top: 25px;
  font-size: 7px;
  color: #64748b;
  text-align: center;
}
</style>
