<template>
  <div v-if="isVisible" class="narrator-overlay">
    <div class="narrator-container">
      <!-- Personaje Narrador -->
      <div class="narrator-portrait">
        <div class="portrait-frame">
          <img :src="narratorSprite" :alt="narratorName" class="narrator-img" />
        </div>
        <div class="narrator-name-tag">{{ narratorTitle }}</div>
      </div>

      <!-- Globo de Diálogo -->
      <div class="narrator-dialogue">
        <div class="dialogue-header">
          <span class="tutorial-badge">TUTORIAL</span>
          <div class="step-dots">
            <span
              v-for="(_, i) in steps"
              :key="i"
              class="step-dot"
              :class="{ active: i === currentStep, done: i < currentStep }"
            ></span>
          </div>
        </div>

        <div class="dialogue-content">
          <h3>{{ currentStepData.title }}</h3>
          <p>{{ currentStepData.text }}</p>
        </div>

        <div class="dialogue-footer">
          <span class="step-count">PASO {{ currentStep + 1 }} DE {{ steps.length }}</span>
          <button class="narrator-btn" @click="nextStep">
            {{ currentStep === steps.length - 1 ? '¡EMPEZAR!' : 'CONTINUAR' }}
            <span class="btn-arrow">▶</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { activeCharacterId } from '../gameState'
import npcSprites from '../constants/npcSprites'

const props = defineProps({
  isPhp: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tutorial-finished'])

const isVisible = ref(false)
const currentStep = ref(0)

const narratorName = computed(() => props.isPhp ? 'Guardián del Reino' : 'Maestro del Bytecode')
const narratorTitle = computed(() => props.isPhp ? 'LORD DE LAS RUTAS' : 'SEÑOR DEL BYTECODE')
const narratorSprite = computed(() => npcSprites[narratorName.value])

const steps = computed(() => {
  const merchantName = props.isPhp ? 'Mercader Astuto' : 'Mercader de Maven'
  const otherShopName = props.isPhp ? 'Herrero de las Ruinas' : 'Forjador del JAR'

  return [
    {
      title: '¡BIENVENIDO, HÉROE DEL CÓDIGO!',
      text: `Soy el ${narratorName.value}. Has sido elegido para proteger el Reino de ${props.isPhp ? 'Peachepe' : 'Java'}. Tu misión es dominar los lenguajes y derrotar a los bugs que amenazan nuestra paz.`,
    },
    {
      title: 'EQUÍPATE PARA LA AVENTURA',
      text: `Si necesitas suministros, busca al ${merchantName}. Él tiene las mejores pociones. Para equipo avanzado, el ${otherShopName} forjará lo que necesites.`,
    },
    {
      title: 'EL DESAFÍO DE LA ARENA',
      text: 'Cuando te sientas preparado, cruza la puerta hacia la Arena. Allí pondrás a prueba tu lógica y velocidad. ¡He puesto una flecha para que no te pierdas!',
    },
    {
      title: 'CONTROLES BÁSICOS',
      text: 'Usa WASD para moverte, I para el inventario y E para interactuar con nosotros. ¡Mucha suerte, el destino del código está en tus manos!, además tienes la interfaz que es más intuitiva',
    }
  ]
})

const currentStepData = computed(() => steps.value[currentStep.value])

function checkAndShow() {
  const id = activeCharacterId.value
  console.log('[Tutorial] checkAndShow → characterId:', id)
  if (!id) return
  const key = `ck_tutorial_v1_${id}`
  const seen = localStorage.getItem(key)
  console.log('[Tutorial] localStorage key:', key, '→ value:', seen)
  if (seen !== 'true') {
    console.log('[Tutorial] Mostrando tutorial para personaje', id)
    isVisible.value = true
  } else {
    console.log('[Tutorial] Personaje ya vio el tutorial')
  }
}

function nextStep() {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
  } else {
    finishTutorial()
  }
}

function finishTutorial() {
  const id = activeCharacterId.value
  if (id) {
    localStorage.setItem(`ck_tutorial_v1_${id}`, 'true')
    console.log('[Tutorial] Marcado como visto para personaje', id)
  }
  isVisible.value = false
  emit('tutorial-finished')
}

onMounted(() => {
  console.log('[Tutorial] onMounted. characterId actual:', activeCharacterId.value)
  // Si el personaje ya está cargado, comprobar ahora
  if (activeCharacterId.value) {
    checkAndShow()
  }
})

// Si el personaje carga después del componente, reaccionar igualmente
watch(activeCharacterId, (newId) => {
  console.log('[Tutorial] watch activeCharacterId cambió a:', newId)
  if (newId && !isVisible.value) {
    checkAndShow()
  }
}, { immediate: false })
</script>

<style scoped>
.narrator-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Press Start 2P', cursive;
}

.narrator-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  max-width: 820px;
  width: 100%;
}

@media (min-width: 768px) {
  .narrator-container {
    flex-direction: row;
    align-items: flex-end;
  }
}

.narrator-portrait {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.portrait-frame {
  width: 150px;
  height: 150px;
  background: #0f172a;
  border: 6px solid #facc15;
  box-shadow: 0 0 30px rgba(250, 204, 21, 0.25), 8px 8px 0 #854d0e;
  display: flex;
  align-items: center;
  justify-content: center;
  image-rendering: pixelated;
  padding: 10px;
}

.narrator-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.narrator-name-tag {
  margin-top: 12px;
  background: #facc15;
  color: #000;
  padding: 8px 14px;
  font-size: 9px;
  border: 4px solid #854d0e;
  white-space: nowrap;
  text-align: center;
}

.narrator-dialogue {
  flex-grow: 1;
  background: #1e293b;
  border: 4px solid #334155;
  box-shadow: 10px 10px 0 rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.dialogue-header {
  background: #0f172a;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #334155;
}

.tutorial-badge {
  font-size: 8px;
  color: #facc15;
  letter-spacing: 2px;
}

.step-dots {
  display: flex;
  gap: 8px;
}

.step-dot {
  width: 8px;
  height: 8px;
  background: #334155;
  border-radius: 50%;
  transition: background 0.3s;
}

.step-dot.active {
  background: #facc15;
}

.step-dot.done {
  background: #854d0e;
}

.dialogue-content {
  padding: 28px 30px;
  min-height: 160px;
}

.dialogue-content h3 {
  color: #facc15;
  font-size: 13px;
  margin-bottom: 18px;
  line-height: 1.6;
}

.dialogue-content p {
  color: #cbd5e1;
  font-size: 9px;
  line-height: 2.2;
}

.dialogue-footer {
  padding: 18px 30px;
  border-top: 2px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-count {
  font-size: 7px;
  color: #475569;
}

.narrator-btn {
  background: #ca8a04;
  color: #fef9c3;
  border: 3px solid #facc15;
  padding: 12px 20px;
  font-family: inherit;
  font-size: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 4px 4px 0 #854d0e;
  transition: all 0.1s;
}

.narrator-btn:hover {
  background: #facc15;
  color: #431407;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #854d0e;
}

.btn-arrow {
  font-size: 12px;
}
</style>
