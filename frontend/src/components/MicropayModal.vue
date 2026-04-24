<template>
  <div class="mp-overlay" @click.self="$emit('close')">
    <div class="mp-box" @click.stop>
      <header class="mp-h">
        <h2>Conseguir CodeCoins</h2>
        <button type="button" class="mp-x" @click="$emit('close')">×</button>
      </header>
      <p class="mp-p">
        Los <strong>CodeCoins</strong> se obtendrán mediante micropagos seguros (p. ej. Stripe
        o PayPal). Cada compra es <strong>puramente cosmética</strong> y no desequilibra el juego.
      </p>
      <p class="mp-p muted">Integración pendiente: aquí conectaréis el flujo de pago real.</p>
      <button type="button" class="mp-ok" @click="$emit('close')">Entendido</button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])
</script>

<style scoped>
.mp-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.65);
  display: grid;
  place-items: center;
  padding: 20px;
}
.mp-box {
  max-width: 420px;
  width: 100%;
  border: 5px solid #2b1f13;
  background: #263238;
  color: #eceff1;
  padding: 18px;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  box-shadow: 0 0 0 4px #607d8b, 12px 12px 0 rgba(0, 0, 0, 0.45);
}
.mp-h {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}
.mp-h h2 {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  color: #d1c4e9;
}
.mp-x {
  width: 32px;
  height: 32px;
  border: 2px solid #111;
  background: #b74a3c;
  color: #fff7e6;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
}
.mp-p {
  font-size: 8px;
  line-height: 1.7;
  margin: 0 0 10px;
}
.mp-p.muted { color: #b0bec5; }
.mp-ok {
  width: 100%;
  margin-top: 8px;
  border: 2px solid #111;
  background: #8bc34a;
  color: #1a230f;
  padding: 10px;
  font-size: 8px;
  font-family: inherit;
  cursor: pointer;
  text-transform: uppercase;
}
.mp-ok:hover { filter: brightness(1.05); }
</style>
