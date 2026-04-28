<template>
  <aside class="hud-panel">
    <!-- Avatar Section -->
    <div class="hud-frame">
      <div class="hud-avatar-container">
        <div v-if="characterStore.spriteData && !isEmptySprite(characterStore.spriteData)" class="hud-avatar-grid">
          <div 
            v-for="(color, pIdx) in parseSprite(characterStore.spriteData)" 
            :key="pIdx"
            class="pixel"
            :style="{ backgroundColor: color || 'transparent' }"
          ></div>
        </div>
        <div v-else class="hud-avatar-placeholder"></div>
        <!-- Scanline Overlay on Avatar -->
        <div class="avatar-scanlines"></div>
      </div>
      <div class="hud-info">
        <span class="hud-label">SISTEMA</span>
        <div class="hud-name-wrapper">
          <span class="hud-name text-truncate">{{ characterStore.name.toUpperCase() }}</span>
          <span class="hud-status-dot animate-pulse"></span>
        </div>
      </div>
    </div>

    <!-- Actions Section -->
    <nav class="hud-nav">
      <div class="nav-group">
        <button class="nav-btn primary" @click.stop="$emit('open-equipment')">
          <span class="btn-text">EQUIPO</span>
          <div class="btn-glow"></div>
        </button>
        <button class="nav-btn primary" @click.stop="$emit('open-inventory')">
          <span class="btn-text">MOCHILA</span>
          <div class="btn-glow"></div>
        </button>
        <button class="nav-btn secondary" @click.stop="$emit('toggle-map')">
          <span class="btn-text">{{ mapOpen ? 'CERRAR' : 'MAPA' }}</span>
        </button>
      </div>

      <div class="nav-divider"></div>

      <div class="nav-group">
        <button class="nav-btn hero-btn" @click.stop="$emit('character-menu')">
          <span class="btn-text">HÉROES</span>
        </button>
        <button class="nav-btn exit-btn" @click.stop="$emit('logout')">
          <span class="btn-text">SALIR</span>
        </button>
      </div>
    </nav>

    <!-- Decorative Elements -->
    <div class="hud-footer">
      <div class="footer-line"></div>
      <span class="footer-ver">V.0.1.5</span>
    </div>
  </aside>
</template>

<script setup>
import { useCharacterStore } from '../stores/character'

defineProps({
  mapOpen: { type: Boolean, default: false },
})

defineEmits(['open-equipment', 'open-inventory', 'toggle-map', 'character-menu', 'logout'])

const characterStore = useCharacterStore()

function parseSprite(data) {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    return Array.isArray(parsed) ? parsed : Array(256).fill('')
  } catch {
    return Array(256).fill('')
  }
}

function isEmptySprite(data) {
  const pixels = parseSprite(data)
  return !pixels.some(p => p && p !== '')
}
</script>

<style scoped>
.hud-panel {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 100;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Press Start 2P', monospace;
  pointer-events: auto;
}

/* Frame Section */
.hud-frame {
  background: #0f172a;
  border: 4px solid #facc15;
  box-shadow: 8px 8px 0 #854d0e, 0 10px 25px rgba(0,0,0,0.5);
  padding: 12px;
  position: relative;
}

.hud-avatar-container {
  aspect-ratio: 1;
  background: #0b0d17;
  border: 2px solid rgba(250, 204, 21, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 12px;
}

.hud-avatar-grid {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  width: 80%;
  height: 80%;
  image-rendering: pixelated;
}

.pixel { width: 100%; height: 100%; }

.hud-avatar-placeholder {
  font-size: 24px;
  color: #854d0e;
}

.avatar-scanlines {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%);
  background-size: 100% 4px;
  pointer-events: none;
}

.hud-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hud-label {
  font-size: 6px;
  color: #facc15;
  opacity: 0.5;
  letter-spacing: 0.1em;
}

.hud-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hud-name {
  font-size: 8px;
  color: #facc15;
  text-shadow: 2px 2px 0 #431407;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.hud-status-dot {
  width: 6px;
  height: 6px;
  background: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 8px #4ade80;
}

/* Navigation Section */
.hud-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-btn {
  width: 100%;
  padding: 14px 10px;
  border: 3px solid #facc15;
  background: #ca8a04;
  color: #fef9c3;
  font-family: inherit;
  font-size: 7px;
  cursor: pointer;
  box-shadow: 4px 4px 0 #854d0e;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #854d0e;
  background: #facc15;
  color: #431407;
}

.nav-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 #854d0e;
}

.nav-btn.secondary {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
  box-shadow: 4px 4px 0 #0f172a;
}

.nav-btn.secondary:hover {
  background: #334155;
  color: #f8fafc;
  border-color: #facc15;
}

.btn-icon { font-size: 12px; }

.btn-glow {
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-btn:hover .btn-glow { left: 100%; }

.nav-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(250, 204, 21, 0.3), transparent);
  margin: 4px 0;
}

.hero-btn { background: #1e40af; border-color: #1d4ed8; color: #dbeafe; box-shadow: 4px 4px 0 #1e3a8a; }
.hero-btn:hover { background: #2563eb; color: white; }

.exit-btn { background: #991b1b; border-color: #b91c1c; color: #fecaca; box-shadow: 4px 4px 0 #7f1d1d; }
.exit-btn:hover { background: #dc2626; color: white; }

/* Footer */
.hud-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 4px;
}

.footer-line { flex: 1; height: 1px; background: rgba(250, 204, 21, 0.1); }
.footer-ver { font-size: 5px; color: rgba(250, 204, 21, 0.2); }
</style>
