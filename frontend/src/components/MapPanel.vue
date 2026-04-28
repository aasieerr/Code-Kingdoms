<template>
  <section class="premium-inventory-panel" @click.stop>
    <!-- SCANLINES -->
    <div class="scanlines"></div>

    <header class="panel-header">
      <div class="panel-tabs">
        <button class="tab-btn active">MAPA DEL REINO</button>
      </div>
      <button class="close-btn" @click="$emit('close')">✖</button>
    </header>

    <div class="panel-content map-layout">
      <!-- LEFT: The Visual Map -->
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
            <li class="region-item forest">BOSQUE SUSURRANTE</li>
            <li class="region-item lake">LAGO DE CRISTAL</li>
            <li class="region-item peaks">PICOS HELADOS</li>
            <li class="region-item wasteland">TIERRAS BALDÍAS</li>
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
  npcs: { type: Array, default: () => [] },
})

defineEmits(['close'])

const mapRef = ref(null)

// El mapa visual ahora es más grande, ajustamos los ratios
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
  font-family: 'Press Start 2P', monospace;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  image-rendering: pixelated;
}

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

.coord-display {
  font-size: 8px;
  color: #facc15;
  background: #0b0d17;
  padding: 8px 16px;
  border: 1px solid rgba(250, 204, 21, 0.3);
}

.tab-btn {
  border: 4px solid #facc15;
  background: #ca8a04;
  color: #fef9c3;
  padding: 12px 24px;
  font-size: 8px;
  font-family: inherit;
  box-shadow: 4px 4px 0 #854d0e;
}

.close-btn {
  width: 40px; height: 40px;
  border: 4px solid #facc15; background: #991b1b; color: #fecaca;
  cursor: pointer; font-family: inherit;
  box-shadow: 4px 4px 0 #431407;
}

.map-layout {
  flex: 1;
  display: flex;
  min-height: 0;
}

.map-visual-container {
  flex: 1;
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b0d17;
}

.pixel-map-premium {
  width: 600px;
  height: 450px;
  position: relative;
  background: #0b0d17;
  border: 4px solid #facc15;
  box-shadow: 0 0 40px rgba(0,0,0,0.8);
  overflow: hidden;
}

/* Blueprint Style Biomes */
.blueprint-biome { position: absolute; border: 1px solid rgba(250, 204, 21, 0.1); }
.b-forest { width: 45%; height: 50%; left: 0; top: 0; background: rgba(45, 90, 39, 0.1); }
.b-water { width: 40%; height: 40%; right: 0; bottom: 0; background: rgba(30, 64, 175, 0.1); }
.b-mountains { width: 30%; height: 35%; right: 5%; top: 5%; background: rgba(71, 85, 105, 0.1); clip-path: polygon(50% 0%, 100% 100%, 0% 100%); }

.blueprint-road { position: absolute; background: rgba(250, 204, 21, 0.15); }
.bh-road { width: 100%; height: 4px; top: 60%; }
.bv-road { width: 4px; height: 100%; left: 45%; }

.map-grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(250, 204, 21, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(250, 204, 21, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 2;
}

/* Antenna Design */
.panel-antenna {
  position: absolute;
  top: -30px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: -1;
}

.antenna-pole {
  width: 4px;
  height: 34px;
  background: #1e293b;
  border: 1px solid #facc15;
}

.antenna-tip {
  width: 10px;
  height: 10px;
  background: #facc15;
  border-radius: 50%;
  box-shadow: 0 0 10px #facc15;
  margin-bottom: -2px;
}

.landmark-name { 
  font-size: 10px; /* Un poco más grande para sans-serif */
  color: white; 
  background: rgba(0,0,0,0.8); 
  padding: 2px 6px; 
  border: 1px solid rgba(250, 204, 21, 0.3); 
  white-space: nowrap;
  font-family: system-ui, -apple-system, sans-serif; /* Fuente moderna y clara */
  font-weight: 600;
  letter-spacing: 0.5px;
}

.player-pointer {
  position: absolute;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: none; 
  transform: translate(-50%, -100%);
}

.pointer-spacer {
  height: 8px; /* Espacio entre el texto y la flecha */
}

.pointer-arrow {
  width: 16px;
  height: 16px;
  background: #facc15;
  clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
  filter: drop-shadow(0 2px 4px black);
}

.pointer-label {
  font-size: 11px;
  color: #facc15;
  text-shadow: 0 2px 4px black;
  font-weight: 800;
  font-family: system-ui, -apple-system, sans-serif; /* Consistencia con landmarks */
}

/* Landmarks */
.landmark {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 5;
  transform: translate(-50%, -50%);
}

.landmark-pointer {
  width: 8px;
  height: 8px;
  background: white;
  clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
  filter: drop-shadow(0 2px 2px black);
}

.color-village { background: #4ade80; }
.color-ruins { background: #94a3b8; }
.color-tower { background: #60a5fa; }
.color-arena { background: #f87171; }

.landmark-name { 
  font-size: 5px; 
  color: white; 
  background: rgba(0,0,0,0.8); 
  padding: 1px 4px; 
  border: 1px solid rgba(255,255,255,0.2); 
  white-space: nowrap;
}

.village { left: 15%; top: 65%; }
.ruins { left: 55%; top: 25%; }
.tower { right: 15%; top: 20%; }
.arena { right: 20%; bottom: 15%; }

/* Markers */
.npc-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  border: 1px solid white;
  z-index: 10;
  transform: translate(-50%, -50%);
}

.npc-dot.vendedor { background: #f59e0b; }

.dot-pulse {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: inherit;
  opacity: 0.4;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(2.5); opacity: 0; }
}

.player-pointer {
  position: absolute;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Eliminamos la transición para que no vaya lag */
  transition: none; 
  transform: translate(-50%, -100%);
}

.pointer-arrow {
  width: 14px;
  height: 14px;
  background: #facc15;
  /* Apuntando hacia ABAJO */
  clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
  filter: drop-shadow(0 2px 4px black);
  animation: float 1s ease-in-out infinite;
}

.pointer-label {
  font-size: 6px;
  color: #facc15;
  margin-bottom: 2px;
  text-shadow: 2px 2px 0 black;
  font-weight: bold;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* Sidebar */
.map-sidebar {
  width: 320px;
  background: #1e293b;
  border-left: 2px solid rgba(250, 204, 21, 0.1);
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.sidebar-title { font-size: 8px; color: #facc15; margin-bottom: 15px; opacity: 0.7; }

.legend-list, .region-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; }

.legend-list li { font-size: 7px; display: flex; align-items: center; gap: 10px; color: #cbd5e1; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.player { background: #facc15; box-shadow: 0 0 5px #facc15; }
.dot.npc { background: #3b82f6; }
.dot.vendor { background: #f59e0b; }
.dot.quest { background: #ef4444; }

.region-item {
  font-size: 7px;
  padding: 10px;
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.05);
  color: #94a3b8;
}

.sidebar-footer {
  margin-top: auto;
  border-top: 1px solid rgba(250,204,21,0.1);
  padding-top: 20px;
}

.map-status { font-size: 6px; color: #4ade80; margin-bottom: 10px; }
.signal-bars { display: flex; gap: 4px; }
.bar { width: 6px; height: 12px; background: #334155; }
.bar.active { background: #4ade80; box-shadow: 0 0 5px #4ade80; }
</style>
