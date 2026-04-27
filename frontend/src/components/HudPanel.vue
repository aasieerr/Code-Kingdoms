<template>
  <aside class="hud-panel">
    <div class="avatar-frame">PJ</div>
    <button class="hud-btn" @click.stop="$emit('open-equipment')">Ver equipo</button>
    <button class="hud-btn" @click.stop="$emit('open-inventory')">Inventario</button>
    <button class="hud-btn secondary" @click.stop="$emit('toggle-map')">
      {{ mapOpen ? 'Cerrar mapa' : 'Mapa' }}
    </button>
    <button class="hud-btn menu-pj" @click.stop="$emit('character-menu')">Personajes</button>
    <button class="hud-btn logout" @click.stop="$emit('logout')">Cerrar sesión</button>
  </aside>
</template>

<script setup>
defineProps({
  mapOpen: { type: Boolean, default: false },
})

defineEmits(['open-equipment', 'open-inventory', 'toggle-map', 'character-menu', 'logout'])
</script>

<style scoped>
.hud-panel {
  position: absolute;
  top: 22px;
  left: 22px;
  z-index: 25;
  width: 190px;
  padding: 12px;
  border: 4px solid #2b1f13;
  background: linear-gradient(180deg, #6b4f2d 0%, #4a351f 100%);
  box-shadow: 0 0 0 4px #9a7a4d, 6px 8px 0 rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: 'Press Start 2P', 'Courier New', monospace;
}
.avatar-frame {
  height: 82px;
  border: 3px solid #1f1f1f;
  background:
    linear-gradient(45deg, #5a6f84 25%, transparent 25%),
    linear-gradient(-45deg, #5a6f84 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #5a6f84 75%),
    linear-gradient(-45deg, transparent 75%, #5a6f84 75%);
  background-size: 14px 14px;
  background-position: 0 0, 0 7px, 7px -7px, -7px 0;
  color: #f7ebd0;
  display: grid;
  place-items: center;
  font-size: 14px;
}
.hud-btn {
  border: 2px solid #1f1f1f;
  background: #c9b27a;
  color: #1f1f1f;
  padding: 8px 6px;
  font-size: 10px;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
}
.hud-btn:hover { background: #e3cc8d; }
.hud-btn.secondary { background: #ad9a6a; }
.hud-btn.menu-pj { margin-top: 8px; background: #3d5a6f; color: #e8f0f5; }
.hud-btn.logout { margin-top: 6px; background: #8f3b2c; color: #f7ebd0; }
</style>
