<script setup>
defineProps({
  hudMapLabel: { type: String, required: true },
  hudSectionLabel: { type: String, required: true },
  isFinalKingdomSection: { type: Boolean, required: true },
  finalBossName: { type: String, required: true },
  finalBossHpPct: { type: Number, required: true },
  finalBossHp: { type: Number, required: true },
  finalBossMaxHp: { type: Number, required: true },
  sectionWave: { type: Number, required: true },
  maxWavesInSection: { type: Number, required: true },
  startKingdom: { type: String, required: true },
  targetKingdom: { type: String, required: true },
  routeInstruction: { type: String, required: true },
  sessionGold: { type: Number, required: true },
  bankGold: { type: Number, required: true },
  playerHpPct: { type: Number, required: true },
  playerHp: { type: Number, required: true },
  playerMaxHp: { type: Number, required: true },
  levelState: { type: Object, required: true },
  xpProgressPct: { type: Number, required: true },
  arenaPotionHudCells: { type: Array, required: true },
  keyLabel: { type: Function, required: true },
  settings: { type: Object, required: true },
})
</script>

<template>
  <div class="premium-arena-hud">
    <div class="hud-top-center">
      <div class="wave-display">
        <span class="wave-label">{{ hudMapLabel }}</span>
        <span class="wave-label-sub">{{ hudSectionLabel }}</span>
        <template v-if="isFinalKingdomSection">
          <div class="boss-hud">
            <span class="boss-name">{{ finalBossName }}</span>
            <div class="boss-hp-frame">
              <div class="boss-hp-fill" :style="{ width: `${finalBossHpPct}%` }"></div>
            </div>
            <span class="boss-hp-text">{{ finalBossHp }} / {{ finalBossMaxHp }}</span>
          </div>
        </template>
        <template v-else>
          <span class="wave-number">{{ sectionWave }} / {{ maxWavesInSection }}</span>
          <span class="route-label">{{ startKingdom }} → {{ targetKingdom }} · {{ routeInstruction }}</span>
        </template>
      </div>
    </div>

    <div class="hud-stats-left">
      <div class="gold-display">
        <div class="gold-item current">
          <span class="gold-icon">🪙</span>
          <span class="gold-val">{{ sessionGold }}</span>
          <span class="gold-lbl">RUN</span>
        </div>
        <div class="gold-item bank">
          <span class="gold-icon">🏛️</span>
          <span class="gold-val">{{ bankGold }}</span>
          <span class="gold-lbl">BANCO</span>
        </div>
      </div>

      <div class="hp-container">
        <div class="hp-label">VIDA</div>
        <div class="hp-bar-frame">
          <div class="hp-bar-fill" :style="{ width: playerHpPct + '%' }">
            <div class="hp-glow"></div>
          </div>
        </div>
        <div class="hp-numeric">{{ playerHp }} / {{ playerMaxHp }}</div>
      </div>
      <div class="xp-container">
        <div class="xp-label">NIVEL {{ levelState.level }}</div>
        <div class="xp-bar-frame">
          <div class="xp-bar-fill" :style="{ width: xpProgressPct + '%' }"></div>
        </div>
        <div class="xp-numeric">{{ levelState.experience }} / {{ levelState.nextLevelXp }} XP</div>
      </div>
      <div class="arena-potion-hud" aria-label="Pociones de arena">
        <div class="arena-potion-title">POCIONES</div>
        <div class="arena-potion-row">
          <div
            v-for="cell in arenaPotionHudCells"
            :key="cell.slotIndex"
            class="arena-potion-pill"
            :class="{ 'arena-potion-pill--empty': !cell.itemName, 'arena-potion-pill--out': cell.itemName && cell.quantity < 1 }"
          >
            <span class="ap-key">{{ keyLabel(cell.key) }}</span>
            <span class="ap-name">{{ cell.shortName }}</span>
            <span class="ap-q">×{{ cell.quantity }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="hud-bottom-hints">
      <div class="hint-pill">
        <span class="key">{{ keyLabel(settings.keybinds.moveUp) }}/{{ keyLabel(settings.keybinds.moveLeft) }}/{{ keyLabel(settings.keybinds.moveDown) }}/{{ keyLabel(settings.keybinds.moveRight) }}</span> MOVIMIENTO
      </div>
      <div class="hint-pill">
        <span class="key">{{ keyLabel(settings.keybinds.inventory) }}</span> MOCHILA
      </div>
      <div class="hint-pill">
        <span class="key">{{ keyLabel(settings.keybinds.equipment) }}</span> EQUIPO
      </div>
      <div class="hint-pill">
        <span class="key">{{ keyLabel(settings.keybinds.map) }}</span> MAPA
      </div>
    </div>
  </div>
</template>

<style scoped src="./ArenaPremiumHud.css"></style>
