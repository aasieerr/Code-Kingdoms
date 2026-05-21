<script setup>
defineProps({
  phase: { type: String, required: true },
  showVictoryModal: { type: Boolean, required: true },
  section: { type: Number, required: true },
  sectionWave: { type: Number, required: true },
  sessionGold: { type: Number, required: true },
  conqueredKingdomLabel: { type: String, required: true },
  wavesPerSection: { type: Number, required: true },
  totalSections: { type: Number, required: true },
})

const emit = defineEmits(['continue-battle', 'leave-arena', 'explore'])
</script>

<template>
  <div v-if="phase === 'between'" class="premium-overlay">
    <div class="premium-modal victory-wave">
      <div class="modal-shine"></div>
      <h2 class="modal-title">OLEADA {{ sectionWave }} / {{ wavesPerSection }} COMPLETADA</h2>
      <div class="modal-body">
        <p class="summary">SECCIÓN ACTUAL: <span>{{ section }}</span> / {{ totalSections }}</p>
        <p class="reward-text">HAS RECOLECTADO <span>{{ sessionGold }}</span> MONEDAS DE ORO</p>
        <p class="action-hint">EQUIPA ÍTEMS EN EL PANEL O SIGUE LUCHANDO</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-continue" @click="emit('continue-battle')">CONTINUAR BATALLA</button>
        <button type="button" class="btn-exit" @click="emit('leave-arena')">VOLVER AL REINO</button>
      </div>
    </div>
  </div>

  <div v-if="phase === 'victory' && showVictoryModal" class="premium-overlay">
    <div class="premium-modal final-victory">
      <div class="modal-shine"></div>
      <div class="victory-crown">👑</div>
      <h2 class="modal-title">¡VICTORIA ABSOLUTA!</h2>
      <div class="modal-body">
        <p class="summary">HAS CONQUISTADO EL REINO {{ conqueredKingdomLabel }}</p>
        <p class="reward-text">ORO TOTAL CONSEGUIDO: <span>{{ sessionGold }}</span> 🪙</p>
        <p class="congrats">ERES EL VERDADERO REY DE LA ARENA</p>
      </div>
      <div class="modal-footer flex flex-col gap-4">
        <button type="button" class="btn-exit-gold" @click="emit('leave-arena')">VOLVER COMO UN HÉROE</button>
        <button type="button" class="btn-explore" @click="emit('explore')">SEGUIR EXPLORANDO</button>
      </div>
    </div>
  </div>

  <div v-if="phase === 'gameover'" class="premium-overlay">
    <div class="premium-modal defeat">
      <div class="modal-shine"></div>
      <h2 class="modal-title">DERROTA EN COMBATE</h2>
      <div class="modal-body">
        <p class="summary">CAÍSTE EN LA SECCIÓN <span>{{ section }}</span>, OLEADA <span>{{ sectionWave }}</span></p>
        <p class="reward-text">ORO ASEGURADO: <span>{{ sessionGold }}</span> 🪙</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-exit" @click="emit('leave-arena')">RETIRARSE AL REINO</button>
      </div>
    </div>
  </div>
</template>

<style scoped src="./ArenaPhaseModals.css"></style>
