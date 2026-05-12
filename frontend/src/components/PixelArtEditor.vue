<template>
  <div class="pixel-editor" @mouseup="isDrawing = false" @mouseleave="isDrawing = false">
    <label class="pixel-editor__label">DIBUJA TU AVATAR (16x16)</label>
    
    <div class="pixel-editor__layout">
      <!-- CANVAS -->
      <div class="pixel-editor__canvas" :style="gridStyle">
        <div
          v-for="(color, index) in pixels"
          :key="index"
          class="pixel-editor__cell"
          :style="{ backgroundColor: color || 'rgba(255,255,255,0.05)' }"
          @mousedown="onMouseDown(index)"
          @mouseover="onMouseOver(index)"
        ></div>
      </div>

      <!-- CONTROLS -->
      <div class="pixel-editor__sidebar">
        <div class="pixel-editor__palette">
          <button
            v-for="c in palette"
            :key="c"
            type="button"
            class="pixel-editor__color-btn"
            :class="{ 'is-active': selectedColor === c && tool === 'pen' }"
            :style="{ backgroundColor: c }"
            @click="tool = 'pen'; selectedColor = c"
          ></button>
          <button 
            type="button"
            class="pixel-editor__tool-btn" 
            :class="{ 'is-active': tool === 'eraser' }"
            @click="tool = 'eraser'"
            title="Borrador"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z"></path><path d="M17 17L7 7"></path></svg>
          </button>
        </div>
        
        <button type="button" class="pixel-editor__action-btn" @click="clearCanvas">
          LIMPIAR
        </button>

        <!-- PREVIEW -->
        <div class="pixel-editor__preview-box">
          <span class="pixel-editor__preview-label">VISTA PREVIA</span>
          <div class="pixel-editor__preview-grid">
            <div 
              v-for="(color, pIdx) in pixels" 
              :key="pIdx"
              class="pixel-editor__preview-pixel"
              :style="{ backgroundColor: color || 'transparent' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue'])

const size = 16
const palette = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
  '#ffff00', '#ff00ff', '#00ffff', '#8b4513', '#facc15',
  '#ca8a04', '#ef4444', '#3b82f6', '#22c55e', '#a855f7'
]

const pixels = ref(props.modelValue.length === size * size ? [...props.modelValue] : Array(size * size).fill(''))
const selectedColor = ref('#facc15')
const tool = ref('pen') // 'pen' or 'eraser'
const isDrawing = ref(false)

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${size}, 1fr)`,
  width: '240px',
  height: '240px',
  border: '2px solid #854d0e',
  background: '#0b0d17',
  cursor: 'crosshair'
}))

function onMouseDown(index) {
  isDrawing.value = true
  applyTool(index)
}

function onMouseOver(index) {
  if (isDrawing.value) {
    applyTool(index)
  }
}

function applyTool(index) {
  if (tool.value === 'pen') {
    pixels.value[index] = selectedColor.value
  } else {
    pixels.value[index] = ''
  }
  emit('update:modelValue', [...pixels.value])
}

function clearCanvas() {
  pixels.value = Array(size * size).fill('')
  emit('update:modelValue', [...pixels.value])
}

watch(() => props.modelValue, (newVal) => {
  if (newVal.length === size * size && JSON.stringify(newVal) !== JSON.stringify(pixels.value)) {
    pixels.value = [...newVal]
  }
})
</script>

<style scoped>
.pixel-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #0f172a;
  border: 2px solid #facc15/20;
}
.pixel-editor__label {
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  color: #facc15;
  opacity: 0.7;
}
.pixel-editor__layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}
.pixel-editor__canvas {
  user-select: none;
}
.pixel-editor__cell {
  border: 1px solid rgba(255, 255, 255, 0.02);
}
.pixel-editor__cell:hover {
  filter: brightness(1.2);
  border-color: rgba(250, 204, 21, 0.3);
}

.pixel-editor__sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.pixel-editor__palette {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
}
.pixel-editor__color-btn {
  width: 24px;
  height: 24px;
  border: 2px solid #0b0d17;
  cursor: pointer;
  transition: transform 0.1s;
}
.pixel-editor__color-btn:hover {
  transform: scale(1.1);
}
.pixel-editor__color-btn.is-active {
  border-color: #facc15;
  box-shadow: 0 0 5px #facc15;
}

.pixel-editor__tool-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e293b;
  border: 2px solid #0b0d17;
  color: #facc15;
  cursor: pointer;
}
.pixel-editor__tool-btn.is-active {
  border-color: #facc15;
  background: #ca8a04;
  color: #fef9c3;
}

.pixel-editor__action-btn {
  padding: 0.6rem;
  font-family: inherit;
  font-size: 0.5rem;
  background: #7f1d1d;
  color: #fca5a5;
  border: 2px solid #ef4444;
  cursor: pointer;
}
.pixel-editor__action-btn:hover {
  background: #ef4444;
  color: white;
}

.pixel-editor__preview-box {
  margin-top: auto;
  padding: 1rem;
  background: #0b0d17;
  border: 2px solid rgba(250, 204, 21, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pixel-editor__preview-label {
  font-size: 6px;
  margin-bottom: 8px;
  display: block;
  opacity: 0.4;
  text-transform: uppercase;
}
.pixel-editor__preview-grid {
  display: grid;
  grid-template-columns: repeat(16, 4px);
  grid-template-rows: repeat(16, 4px);
  width: 64px;
  height: 64px;
  background: #0b0d17;
}
.pixel-editor__preview-pixel {
  width: 4px;
  height: 4px;
}
</style>
