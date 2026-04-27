<template>
  <section class="map-panel" @click.stop>
    <header class="map-header">
      <h3>Mapa del reino</h3>
      <button class="close-btn" @click="$emit('close')">X</button>
    </header>
    <div class="pixel-map">
      <div class="biome grasslands"></div>
      <div class="biome forest"></div>
      <div class="biome water"></div>
      <div class="biome mountains"></div>
      <div class="road horizontal-road"></div>
      <div class="road vertical-road"></div>
      <div class="landmark village">Pueblo</div>
      <div class="landmark ruins">Ruinas</div>
      <div class="landmark tower">Torre</div>
      
      <!-- Marcadores de NPCs -->
      <div 
        v-for="npc in npcs" 
        :key="npc.id" 
        class="npc-marker"
        :class="npc.tipo"
        :style="getNpcStyle(npc)"
        :title="npc.nombre"
      ></div>

      <div class="player-marker" :style="playerMarkerStyle">🧍</div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { WORLD_EDGE } from '../constants/world'

const props = defineProps({
  playerX: { type: Number, default: WORLD_EDGE / 2 },
  playerY: { type: Number, default: WORLD_EDGE / 2 },
  npcs: { type: Array, default: () => [] },
})

defineEmits(['close'])

const MAP_W    = 520
const MAP_H    = 320
const WORLD    = WORLD_EDGE

const playerMarkerStyle = computed(() => {
  const px = Math.max(0, Math.min(MAP_W - 16, (props.playerX / WORLD) * MAP_W))
  const py = Math.max(0, Math.min(MAP_H - 16, (props.playerY / WORLD) * MAP_H))
  return { left: `${px}px`, top: `${py}px` }
})

function getNpcStyle(npc) {
  if (npc.x === undefined || npc.y === undefined || npc.x === null || npc.y === null) {
    return { display: 'none' }
  }
  const nx = Math.max(0, Math.min(MAP_W - 8, (npc.x / WORLD) * MAP_W))
  const ny = Math.max(0, Math.min(MAP_H - 8, (npc.y / WORLD) * MAP_H))
  return { left: `${nx}px`, top: `${ny}px` }
}
</script>

<style scoped>
.map-panel {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  width: min(920px, 92vw);
  z-index: 45;
  border: 5px solid #1f1f1f;
  background: linear-gradient(180deg, #263238 0%, #1b2529 100%);
  box-shadow: 0 0 0 5px #607d8b, 12px 12px 0 rgba(0, 0, 0, 0.5);
  color: #f5f5f5;
  padding: 16px;
  font-family: 'Press Start 2P', 'Courier New', monospace;
}
.map-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.map-header h3 { font-size: 14px; margin: 0; }
.close-btn {
  width: 34px; height: 34px;
  border: 2px solid #0f1518; background: #b74a3c; color: #fff7e6;
  cursor: pointer; font-family: inherit;
}
.pixel-map {
  width: 520px; max-width: 100%; aspect-ratio: 13/8;
  margin: 0 auto; position: relative;
  border: 4px solid #111; background: #5da25d; overflow: hidden;
}
.biome, .road, .landmark, .player-marker { position: absolute; }
.grasslands {
  inset: 0;
  background:
    linear-gradient(90deg, rgba(255,255,255,.07) 2px, transparent 2px),
    linear-gradient(rgba(255,255,255,.07) 2px, transparent 2px),
    #62a84f;
  background-size: 20px 20px, 20px 20px, auto;
}
.forest   { width: 42%; height: 45%; left: 6%;  top: 8%;    background: #2f6e35; border: 3px solid #214f26; }
.water    { width: 34%; height: 32%; right: 8%; bottom: 10%; background: #3c7ed6; border: 3px solid #245498; }
.mountains {
  width: 30%; height: 38%; right: 10%; top: 8%;
  background:
    linear-gradient(45deg, #8a8a8a 25%, transparent 25%),
    linear-gradient(-45deg, #8a8a8a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #8a8a8a 75%),
    linear-gradient(-45deg, transparent 75%, #8a8a8a 75%),
    #646464;
  background-size: 16px 16px;
  border: 3px solid #4d4d4d;
}
.road { background: #a07b4b; }
.horizontal-road { width: 86%; height: 16px; left: 7%;  top: 52%; }
.vertical-road   { width: 16px; height: 80%; left: 49%; top: 10%; }
.landmark {
  font-size: 9px; color: #fff4d1;
  background: rgba(20,20,20,.55); border: 2px solid #101010;
  padding: 3px 6px;
}
.village { left: 14%; top: 58%; }
.ruins   { left: 52%; top: 24%; }
.tower   { right: 14%; bottom: 18%; }
.player-marker {
  width: 16px; height: 16px;
  border: 2px solid #1a1a1a; background: #ffe082;
  box-shadow: 0 0 0 2px #3b2d16;
  display: grid; place-items: center;
  z-index: 2; font-size: 11px;
}

.npc-marker {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid #000;
  background: #4a90e2;
  z-index: 1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.npc-marker.vendedor {
  background: #f5a623;
}
</style>
