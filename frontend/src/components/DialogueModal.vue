<template>
  <div class="dialogue-overlay" @click.self="$emit('close')">
    <div class="dialogue-card">
      <div class="npc-info">
        <div class="npc-avatar" :class="npc.tipo">
          <img v-if="npcImage" :src="npcImage" alt="npc" style="width:40px;height:40px;object-fit:contain;border-radius:6px;" />
        </div>
        <div class="npc-meta">
          <h3>{{ npc.nombre }}</h3>
          <span class="npc-type">{{ npc.tipo }}</span>
        </div>
      </div>

      <div class="dialogue-content">
        <p>{{ displayedText }}</p>
      </div>

      <div class="dialogue-footer">
        <button
          v-if="['vendedor', 'shop', 'merchant', 'comerciante', 'mercader', 'tienda'].includes(npc.tipo?.toLowerCase()) && !isTyping"
          class="shop-btn"
          @click="$emit('open-shop', npc)"
        >
          Comerciar
        </button>
        <button
          v-if="!['vendedor', 'shop', 'merchant', 'comerciante', 'mercader', 'tienda'].includes(npc.tipo?.toLowerCase()) && !isTyping"
          class="shop-btn stage-btn"
          @click="$emit('open-stage-selector', npc)"
        >
          Viajar
        </button>
        <button class="next-btn" @click="nextDialogue">
          {{ isTyping ? 'Saltar' : (isLastDialogue ? 'Cerrar' : 'Siguiente') }}
          <span class="btn-hint" v-if="!isLastDialogue">Enter</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import npcSprites from '../constants/npcSprites'

const props = defineProps({
  npc: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'open-shop', 'open-stage-selector'])

const currentIndex = ref(0)
const displayedText = ref('')
const isTyping = ref(false)
let typingInterval = null

const dialogues = computed(() => props.npc.dialogos || [])
const currentDialogue = computed(() => dialogues.value[currentIndex.value] || '...')
const isLastDialogue = computed(() => currentIndex.value >= dialogues.value.length - 1)
const npcImage = computed(() => npcSprites[props.npc?.nombre] || null)

function startTyping() {
  isTyping.value = true
  displayedText.value = ''
  let i = 0
  const text = currentDialogue.value

  if (typingInterval) clearInterval(typingInterval)

  typingInterval = setInterval(() => {
    if (i < text.length) {
      displayedText.value += text.charAt(i)
      i++
    } else {
      finishTyping()
    }
  }, 30) // Velocidad de escritura
}

function finishTyping() {
  clearInterval(typingInterval)
  displayedText.value = currentDialogue.value
  isTyping.value = false
}

function nextDialogue() {
  if (isTyping.value) {
    finishTyping()
    return
  }

  if (isLastDialogue.value) {
    emit('close')
  } else {
    currentIndex.value++
    startTyping()
  }
}

function handleKeyDown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    nextDialogue()
  } else if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  startTyping()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (typingInterval) clearInterval(typingInterval)
})
</script>

<style scoped>
.dialogue-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 80px;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.dialogue-card {
  width: 90%;
  max-width: 600px;
  background: #1a1a2e;
  border: 3px solid #4a90e2;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  font-family: 'Press Start 2P', cursive;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.npc-info {
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 2px solid rgba(255,255,255,0.1);
  padding-bottom: 12px;
}

.npc-avatar {
  width: 50px;
  height: 50px;
  background: transparent;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  }

.vendedor.npc-avatar {
  /* keep avatar background transparent so the NPC image shows through */
  background: transparent;
}

.npc-avatar img {
  display: block;
  background: transparent;
}

.npc-meta h3 {
  margin: 0;
  color: #fff;
  font-size: 14px;
}

.npc-type {
  font-size: 8px;
  color: #4a90e2;
  text-transform: uppercase;
}

.vendedor .npc-type {
  color: #f5a623;
}

.dialogue-content {
  min-height: 80px;
}

.dialogue-content p {
  margin: 0;
  color: #e0e0e0;
  font-size: 11px;
  line-height: 1.8;
}

.dialogue-footer {
  display: flex;
  justify-content: flex-end;
}

.next-btn {
  background: #4a90e2;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.next-btn:hover {
  background: #357abd;
  transform: translateY(-2px);
}
.shop-btn {
  background: #f5a623;
  border: none;
  color: #1a1a2e;
  padding: 10px 20px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 9px;
  cursor: pointer;
  margin-right: auto;
  transition: all 0.2s;
  font-weight: bold;
}
.shop-btn:hover {
  background: #ffb142;
  transform: translateY(-2px);
}
.stage-btn {
  background: #4a90e2;
  color: #fff;
}
.stage-btn:hover {
  background: #357abd;
}

.btn-hint {
  font-size: 7px;
  background: rgba(0,0,0,0.2);
  padding: 2px 4px;
  border-radius: 3px;
  opacity: 0.8;
}
</style>
