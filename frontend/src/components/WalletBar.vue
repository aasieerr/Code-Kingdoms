<template>
  <div class="wallet-bar" @click.stop>
    <div class="wallet-item">
      <span class="wallet-icon gold">🪙</span>
      <span class="wallet-val">{{ gold ?? 0 }}</span>
    </div>
    
    <div class="wallet-divider"></div>
    
    <div class="wallet-item">
      <span class="wallet-icon cc">◆</span>
      <span class="wallet-val cc">{{ codeCoins ?? 0 }}</span>
      <button
        type="button"
        class="wallet-plus"
        @click="$emit('open-micropay')"
      >+</button>
    </div>
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
.wallet-bar {
  position: absolute;
  top: 64px;
  right: 140px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: #0f172a;
  border: 4px solid #facc15;
  box-shadow: 6px 6px 0 #854d0e, 0 10px 20px rgba(0,0,0,0.5);
  font-family: 'Press Start 2P', monospace;
  animation: float-bar 4s ease-in-out infinite;
}

@keyframes float-bar {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.wallet-bar::after {
  content: '';
  position: absolute;
  inset: 2px;
  border: 1px solid rgba(250, 204, 21, 0.2);
  pointer-events: none;
}

.wallet-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wallet-icon {
  font-size: 14px;
  filter: drop-shadow(0 2px 0 rgba(0,0,0,0.5));
  transition: transform 0.3s ease;
}

.wallet-item:hover .wallet-icon {
  transform: scale(1.2) rotate(10deg);
}

.wallet-icon.gold { color: #facc15; filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.4)); }
.wallet-icon.cc { color: #a855f7; filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.4)); }

.wallet-val {
  font-size: 9px;
  color: #fef9c3;
  text-shadow: 2px 2px 0 #431407;
}

.wallet-val.cc {
  color: #e9d5ff;
}

.wallet-divider {
  width: 2px;
  height: 20px;
  background: rgba(250, 204, 21, 0.2);
}

.wallet-plus {
  margin-left: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #a855f7;
  border: 3px solid #fef9c3;
  color: white;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 3px 3px 0 #4c1d95;
  font-family: inherit;
  padding: 0;
  line-height: 1;
  transition: all 0.1s;
}

.wallet-plus:hover {
  background: #c084fc;
  transform: scale(1.1);
  box-shadow: 4px 4px 0 #4c1d95;
}

.wallet-plus:active {
  transform: scale(0.9);
  box-shadow: 0 0 0 #4c1d95;
}
</style>
