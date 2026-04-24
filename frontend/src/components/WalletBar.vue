<template>
  <div class="wallet-bar" @click.stop>
    <!-- Fila 1: oro -->
    <span class="cell icon-wrap" title="Oro (en juego)">
      <span class="icon-gold" aria-hidden="true">🪙</span>
    </span>
    <span class="cell amt" title="Oro (en juego)">{{ gold ?? '—' }}</span>
    <span class="cell action-spacer" aria-hidden="true" />

    <!-- Fila 2: CodeCoins -->
    <span class="cell icon-wrap" title="CodeCoins (micropagos)">
      <span class="icon-cc" aria-hidden="true">◆</span>
    </span>
    <span class="cell amt amt-cc" title="CodeCoins (micropagos)">{{ codeCoins ?? '—' }}</span>
    <button
      type="button"
      class="cell cc-plus"
      title="Obtener CodeCoins (micropagos)"
      @click="$emit('open-micropay')"
    >
      <span class="cc-plus-txt" aria-hidden="true">+</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  gold: { type: [Number, String], default: null },
  codeCoins: { type: [Number, String], default: null },
})

defineEmits(['open-micropay'])
</script>

<style scoped>
/* Grid: icono + cantidad juntos; 3ª col [+]. Alineado vertical con el logo (18px + mitad 108px ≈ centro) */
.wallet-bar {
  position: absolute;
  /* Logo: top 18px, height 108px — centramos este bloque con el logo */
  top: 40px;
  right: 138px;
  z-index: 29;
  display: grid;
  grid-template-columns: 24px minmax(0, max-content) 24px;
  grid-template-rows: auto auto;
  align-items: center;
  /* icono y cantidad juntos; poca separación hasta el + */
  column-gap: 4px;
  row-gap: 6px;
  padding: 0 4px 0 0;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  background: none;
  border: none;
  box-shadow: none;
}

.cell {
  min-width: 0;
}

/* Columna 1: icono pegado a la columna de cantidad */
.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}
.icon-gold {
  font-size: 16px;
  line-height: 1;
  display: block;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
}
.icon-cc {
  font-size: 14px;
  line-height: 1;
  display: block;
  color: #d1c4e9;
  text-shadow: 0 0 6px rgba(123, 31, 162, 0.45);
}

/* Columna 2: cantidades alineadas; “grosor” con trazo + sombra (pixel font) */
.amt {
  font-size: 11px;
  line-height: 1.2;
  font-weight: 700;
  color: #fff8e1;
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  -webkit-text-stroke: 0.45px rgba(0, 0, 0, 0.9);
  paint-order: stroke fill;
  text-shadow:
    0 1px 0 #0d0d0d,
    1px 0 0 #0d0d0d,
    -1px 0 0 #0d0d0d,
    0 -1px 0 #0d0d0d,
    0 2px 3px rgba(0, 0, 0, 0.85);
}
.amt-cc {
  color: #f3e5f5;
  -webkit-text-stroke: 0.45px rgba(40, 20, 60, 0.95);
  text-shadow:
    0 1px 0 #1a0a24,
    1px 0 0 #1a0a24,
    -1px 0 0 #1a0a24,
    0 -1px 0 #1a0a24,
    0 2px 3px rgba(0, 0, 0, 0.85);
}

/* Columna 3: celda vacía (oro) = mismo ancho que el botón + */
.action-spacer {
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  pointer-events: none;
}
.cc-plus {
  width: 24px;
  height: 24px;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  color: #e1bee7;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font: inherit;
  border-radius: 4px;
}
.cc-plus-txt {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  text-shadow: 0 1px 2px #000;
}
.cc-plus:hover {
  color: #fff;
  text-shadow: 0 0 8px rgba(225, 190, 231, 0.8);
}
.cc-plus:focus-visible {
  outline: 2px solid #b39ddb;
  outline-offset: 2px;
}
</style>
