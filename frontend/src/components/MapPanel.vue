<template>
  <section class="game-panel" @click.stop>
    <div class="panel-scanlines"></div>

    <header class="panel-header">
      <div class="panel-tabs">
        <button class="tab-btn active">MAPA DEL REINO</button>
      </div>
      <button class="panel-close-btn" @click="$emit('close')">✖</button>
    </header>

    <div class="panel-content map-layout">
      <!-- LEFT: Visual Map -->
      <div class="map-visual-container">
        <div class="pixel-map-premium" ref="mapRef">
          <!-- Blueprint Biomes -->
          <div class="blueprint-biome b-forest"></div>
          <div class="blueprint-biome b-water"></div>
          <div class="blueprint-biome b-mountains"></div>
          <!-- Blueprint Roads -->
          <div class="blueprint-road bh-road"></div>
          <div class="blueprint-road bv-road"></div>
          <!-- Grid Overlay -->
          <div class="map-grid-overlay"></div>
          <!-- Landmarks -->
          <div class="landmark village">
            <div class="landmark-pointer color-village"></div>
            <span class="landmark-name">PUEBLO</span>
          </div>
          <div class="landmark ruins">
            <div class="landmark-pointer color-ruins"></div>
            <span class="landmark-name">RUINAS</span>
          </div>
          <div class="landmark tower">
            <div class="landmark-pointer color-tower"></div>
            <span class="landmark-name">TORRE</span>
          </div>
          <div class="landmark arena">
            <div class="landmark-pointer color-arena"></div>
            <span class="landmark-name">ARENA</span>
          </div>
          <!-- NPC Markers -->
          <div
            v-for="npc in npcs"
            :key="npc.id"
            class="npc-dot"
            :class="npc.tipo"
            :style="getNpcStyle(npc)"
          >
            <div class="dot-pulse"></div>
          </div>
          <!-- Player Marker -->
          <div class="player-pointer" :style="playerMarkerStyle">
            <div class="pointer-label">TÚ</div>
            <div class="pointer-spacer"></div>
            <div class="pointer-arrow"></div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Legend & Status -->
      <aside class="map-sidebar">
        <div class="sidebar-section">
          <h4 class="sidebar-title">COORDENADAS</h4>
          <div class="coord-display">
            X: {{ Math.floor(playerX) }} Y: {{ Math.floor(playerY) }}
          </div>
        </div>
        <div class="sidebar-section">
          <h4 class="sidebar-title">REGIONES</h4>
          <ul class="region-list">
            <li class="region-item">BOSQUE SUSURRANTE</li>
            <li class="region-item">LAGO DE CRISTAL</li>
            <li class="region-item">PICOS HELADOS</li>
            <li class="region-item">TIERRAS BALDÍAS</li>
          </ul>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { WORLD_EDGE } from '../constants/world'

const props = defineProps({
  playerX: { type: Number, default: WORLD_EDGE / 2 },
  playerY: { type: Number, default: WORLD_EDGE / 2 },
  npcs:    { type: Array, default: () => [] },
})

defineEmits(['close'])

const mapRef = ref(null)
const MAP_W = 600
const MAP_H = 450
const WORLD = WORLD_EDGE

const playerMarkerStyle = computed(() => {
  const px = Math.max(0, Math.min(MAP_W - 20, (props.playerX / WORLD) * MAP_W))
  const py = Math.max(0, Math.min(MAP_H - 20, (props.playerY / WORLD) * MAP_H))
  return { left: `${px}px`, top: `${py}px` }
})

function getNpcStyle(npc) {
  if (npc.x === undefined || npc.y === undefined) return { display: 'none' }
  const nx = Math.max(0, Math.min(MAP_W - 10, (npc.x / WORLD) * MAP_W))
  const ny = Math.max(0, Math.min(MAP_H - 10, (npc.y / WORLD) * MAP_H))
  return { left: `${nx}px`, top: `${ny}px` }
}
</script>

<style>
@import '../styles/game-panel.css';
</style>

<style scoped>
/* ── Map-specific styles ── */
.map-layout { display: flex; flex: 1; min-height: 0; }

.map-visual-container {
  flex: 1; display: flex; align-items: center;
  justify-content: center; padding: 20px; overflow: hidden;
}

.pixel-map-premium {
  width: 600px; height: 450px;
  background: #0b1120;
  border: 3px solid rgba(250,204,21,0.2);
  position: relative; overflow: hidden;
  image-rendering: pixelated;
}

.map-grid-overlay {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(250,204,21,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(250,204,21,0.03) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
}

.blueprint-biome { position: absolute; opacity: 0.6; }
.b-forest { left: 5%; top: 10%; width: 38%; height: 42%; background: #1a3a20; border: 2px solid #2d6e37; }
.b-water  { right: 10%; bottom: 12%; width: 31%; height: 28%; background: #0e2847; border: 2px solid #1a4a7a; }
.b-mountains { right: 9%; top: 9%; width: 34%; height: 32%; background: #2a2a2a; border: 2px solid #4a4a4a; }

.blueprint-road { position: absolute; background: #5d4524; opacity: 0.5; }
.bh-road { left: 6%; top: 58%; width: 87%; height: 4%; border-top: 1px solid #8a6535; border-bottom: 1px solid #8a6535; }
.bv-road { left: 48%; top: 16%; width: 4%; height: 76%; border-left: 1px solid #8a6535; border-right: 1px solid #8a6535; }

.landmark {
  position: absolute; display: flex;
  flex-direction: column; align-items: center; gap: 4px;
  font-size: 6px; color: rgba(250,204,21,0.7);
}
.village { left: 15%; top: 65%; }
.ruins   { left: 55%; top: 25%; }
.tower   { right: 15%; top: 20%; }
.arena   { right: 20%; bottom: 15%; }

.landmark-pointer {
  width: 8px; height: 8px; border-radius: 50%;
  border: 2px solid rgba(0,0,0,0.5);
}
.color-village { background: #c98259; }
.color-ruins   { background: #9a8b79; }
.color-tower   { background: #9b59b6; }
.color-arena   { background: #e74c3c; }
.landmark-name { font-size: 5px; letter-spacing: 0.1em; }

.npc-dot {
  position: absolute; width: 6px; height: 6px;
  background: #3b82f6; border-radius: 50%;
  border: 1px solid white; z-index: 10;
  transform: translate(-50%, -50%);
}
.npc-dot.vendedor { background: #f59e0b; }
.dot-pulse {
  position: absolute; inset: -3px; border-radius: 50%;
  background: inherit; opacity: 0.4;
  animation: map-pulse 2s infinite;
}
@keyframes map-pulse {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(2.5); opacity: 0; }
}

.player-pointer {
  position: absolute; z-index: 20;
  display: flex; flex-direction: column; align-items: center;
  transform: translate(-50%, -100%);
}
.pointer-arrow {
  width: 14px; height: 14px; background: #facc15;
  clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
  filter: drop-shadow(0 2px 4px black);
  animation: map-float 1s ease-in-out infinite;
}
.pointer-label { font-size: 6px; color: #facc15; margin-bottom: 2px; text-shadow: 2px 2px 0 black; }
.pointer-spacer { height: 2px; }
@keyframes map-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

.map-sidebar {
  width: 280px; background: #1e293b;
  border-left: 2px solid rgba(250,204,21,0.1);
  padding: 24px; display: flex; flex-direction: column; gap: 24px;
}
.sidebar-title { font-size: 8px; color: #facc15; margin-bottom: 12px; opacity: 0.7; }
.coord-display { font-size: 9px; color: white; background: #0b0d17; padding: 12px; border: 1px solid rgba(250,204,21,0.2); }
.region-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.region-item { font-size: 7px; padding: 8px; background: #0f172a; border: 1px solid rgba(255,255,255,0.05); color: #94a3b8; }
</style>
