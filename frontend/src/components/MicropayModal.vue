<template>
  <div class="mp-overlay" @click.self="$emit('close')">
    <div class="mp-box" @click.stop>
      <header class="mp-h">
        <h2>Conseguir CodeCoins</h2>
        <button type="button" class="mp-x" @click="$emit('close')">×</button>
      </header>
      <p class="mp-p">
        Elige un pack de <strong>CodeCoins</strong>. Las compras son cosméticas y no afectan
        al balance del combate.
      </p>

      <div class="mp-packs">
        <button
          v-for="pack in packs"
          :key="pack.id"
          type="button"
          class="mp-pack"
          :disabled="loading"
          @click="buyPack(pack.id)"
        >
          <span class="pack-coins">◆ {{ pack.coins }}</span>
          <span class="pack-name">{{ pack.name }}</span>
          <span class="pack-price">{{ pack.price }}</span>
        </button>
      </div>

      <p v-if="statusMessage" class="mp-p muted">{{ statusMessage }}</p>
      <p v-if="errorMessage" class="mp-p error">{{ errorMessage }}</p>

      <button type="button" class="mp-ok" :disabled="loading" @click="$emit('close')">
        Cerrar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createCodeCoinsCheckout } from '../api/micropay'

defineEmits(['close'])

const loading = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')

const packs = [
  { id: 'starter', name: 'Starter', coins: 100, price: '0.99 EUR' },
  { id: 'pro', name: 'Pro', coins: 275, price: '1.99 EUR' },
  { id: 'legend', name: 'Legend', coins: 750, price: '4.99 EUR' },
]

async function buyPack(packId) {
  if (loading.value) return
  loading.value = true
  statusMessage.value = 'Procesando micropago...'
  errorMessage.value = ''

  try {
    const returnPath = window.location.pathname
    const response = await createCodeCoinsCheckout(packId, returnPath)
    if (!response?.checkout_url) {
      throw new Error('No checkout URL')
    }
    window.location.assign(response.checkout_url)
  } catch (error) {
    const serverMessage = error?.response?.data?.message
      || error?.response?.data?.errors?.package?.[0]
    errorMessage.value = serverMessage || 'No se pudo procesar el micropago.'
    statusMessage.value = ''
  } finally {
    loading.value = false
  }
}
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
.mp-p.error { color: #ffab91; }

.mp-packs {
  display: grid;
  gap: 8px;
  margin: 12px 0 8px;
}

.mp-pack {
  border: 2px solid #111;
  background: #512da8;
  color: #f3e5f5;
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
  align-items: center;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.mp-pack:disabled {
  opacity: 0.7;
  cursor: wait;
}

.pack-coins {
  font-size: 9px;
  color: #e9d5ff;
}

.pack-name {
  font-size: 7px;
  color: #d1c4e9;
}

.pack-price {
  grid-column: 2;
  grid-row: 1 / span 2;
  font-size: 8px;
  color: #fff8e1;
}

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
.mp-ok:disabled { opacity: 0.7; cursor: wait; }
</style>
