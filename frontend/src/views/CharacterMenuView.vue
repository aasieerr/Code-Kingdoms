<template>
  <div class="char-page min-h-screen flex flex-col bg-[#0b0d17] overflow-hidden" 
    :class="{ 'is-zooming': isZooming }"
    :style="{ 
      fontFamily: '\'Press Start 2P\', monospace',
      transformOrigin: zoomOrigin
    }">
    
    <AppHeader />

    <main class="flex-grow max-w-6xl mx-auto w-full px-6 py-10">
      <div class="mb-10 text-center">
        <h1 class="text-[#facc15] text-3xl md:text-5xl mb-4" style="text-shadow: 4px 4px 0 #854d0e;">MIS PERSONAJES</h1>
        <p v-if="authName" class="text-[#facc15]/60 text-[8px] tracking-widest">BIENVENIDO, {{ authName.toUpperCase() }}</p>
      </div>

      <!-- Error -->
      <div v-if="loadErr" class="bg-red-900/50 border-2 border-red-500 text-red-200 p-4 mb-6 text-[8px] text-center">
        {{ loadErr }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <!-- List -->
        <section class="panel">
          <div class="panel__header">
            <h2 class="text-[#facc15] text-[10px]">TUS HÉROES ({{ characters.length }}/4)</h2>
          </div>
          <div class="panel__body">
            <p v-if="loading" class="text-[#facc15]/40 text-[8px] text-center py-10">CARGANDO...</p>
            <p v-else-if="characters.length === 0" class="text-[#facc15]/30 text-[8px] text-center py-10 italic">
              AÚN NO TIENES NINGÚN PERSONAJE. ¡CREA UNO PARA EMPEZAR!
            </p>
            <ul v-else class="flex flex-col gap-4 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
              <li
                v-for="c in characters"
                :key="c.id"
                class="char-card"
                :class="{ 'char-card--active': activeCharacterId === c.id }"
              >
                <div class="char-card__avatar">
                  <div v-if="c.sprite_data && !isEmptySprite(c.sprite_data)" class="mini-grid">
                    <div 
                      v-for="(color, pIdx) in parseSprite(c.sprite_data)" 
                      :key="pIdx"
                      class="mini-grid__pixel"
                      :style="{ backgroundColor: color || 'transparent' }"
                    ></div>
                  </div>
                  <div v-else class="char-card__placeholder">?</div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-[#facc15] text-[10px] mb-2 truncate">{{ c.name.toUpperCase() }}</h3>
                  <div class="flex flex-wrap gap-x-3 gap-y-1">
                    <span class="text-[7px] text-[#facc15]/60">NIVEL {{ c.level }}</span>
                    <span class="text-[7px] text-yellow-500/80">{{ labelKingdom(c) }}</span>
                    <span class="text-[7px] text-blue-400/60">{{ labelRace(c) }}</span>
                    <span class="text-[7px] text-green-400/60">{{ labelClass(c) }}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button type="button" class="btn-play" @click="playAs($event, c)">JUGAR</button>
                  <button type="button" class="btn-delete" @click="askDelete(c.id)">ELIMINAR</button>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <!-- Form -->
        <section class="panel">
          <div class="panel__header">
            <h2 class="text-[#facc15] text-[10px]">NUEVA AVENTURA</h2>
          </div>
          <div class="panel__body">
            <div v-if="characters.length >= 4" class="text-center py-10">
              <p class="text-red-400 text-[8px] mb-2">LÍMITE DE PERSONAJES ALCANZADO</p>
              <p class="text-[#facc15]/40 text-[7px]">DEBES ELIMINAR UNO PARA CREAR OTRO.</p>
            </div>
            <CreateCharacterForm
              v-else
              embedded
              submit-label="CREAR HÉROE"
              @created="onCharacterCreated"
            />
          </div>
        </section>
      </div>

      <!-- Confirm Delete -->
      <div v-if="showConfirm" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
        <div class="panel max-w-sm w-full p-8 text-center border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <h3 class="text-red-500 text-[10px] mb-4">¿CONFIRMAS ELIMINACIÓN?</h3>
          <p class="text-[#facc15]/60 text-[8px] leading-relaxed mb-8">ESTA ACCIÓN NO SE PUEDE DESHACER.</p>
          <div class="flex gap-4 justify-center">
            <button @click="confirmDelete" class="btn-delete px-6 py-3">SÍ, BORRAR</button>
            <button @click="showConfirm = false" class="btn-play px-6 py-3 !bg-slate-700 !border-slate-500 !shadow-slate-900">CANCELAR</button>
          </div>
        </div>
      </div>

      <!-- Zoom Fade Overlay -->
      <div v-if="isZooming" class="fixed inset-0 z-[200] bg-[#0b0d17] animate-fade-to-black"></div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { lastTransition, activeCharacterId, setActiveCharacterId } from '../gameState'
import { fetchCharacters, deleteCharacter } from '../api/character'
import CreateCharacterForm from '../components/CreateCharacterForm.vue'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const router = useRouter()
const authStore = useAuthStore()

const characters = ref([])
const loading = ref(true)
const loadErr = ref(null)

const showConfirm = ref(false)
const characterToDelete = ref(null)

const authName = computed(
  () => authStore.user?.name || authStore.user?.username || authStore.user?.email || '',
)

onMounted(() => { loadList() })

async function loadList() {
  loading.value = true
  loadErr.value = null
  try {
    characters.value = await fetchCharacters()
  } catch (e) {
    loadErr.value = e?.response?.data?.message || e?.message || 'Error al cargar personajes.'
    characters.value = []
  } finally {
    loading.value = false
  }
}

function labelKingdom(c) { return c.kingdom?.name ?? '—' }
function labelRace(c) { return c.race?.name ?? '—' }
function labelClass(c) { return c.character_class?.name ?? c.characterClass?.name ?? '—' }

function parseSprite(data) {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    return Array.isArray(parsed) ? parsed : Array(256).fill('')
  } catch {
    return Array(256).fill('')
  }
}

function isEmptySprite(data) {
  const pixels = parseSprite(data)
  return !pixels.some(p => p && p !== '')
}

const isZooming = ref(false)
const zoomOrigin = ref('center center')

function playAs(event, c) {
  if (c?.id == null) return
  setActiveCharacterId(c.id)
  
  // Calculate zoom origin from button position
  if (event && event.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    zoomOrigin.value = `${x}px ${y}px`
  }

  lastTransition.value = 'menu-to-game'
  isZooming.value = true
  
  // Navigate after zoom and fade
  setTimeout(() => {
    router.push({ name: 'Game' })
  }, 900)
}

function askDelete(id) {
  characterToDelete.value = id
  showConfirm.value = true
}

async function confirmDelete() {
  if (!characterToDelete.value) return
  
  try {
    await deleteCharacter(characterToDelete.value)
    if (activeCharacterId.value === characterToDelete.value) {
      setActiveCharacterId(null)
    }
    await loadList()
  } catch (e) {
    alert('Error al eliminar el personaje.')
  } finally {
    showConfirm.value = false
    characterToDelete.value = null
  }
}

async function onCharacterCreated(ch) {
  if (ch?.id != null) setActiveCharacterId(ch.id)
  await loadList()
  router.push({ name: 'Game' })
}

async function logout() {
  setActiveCharacterId(null)
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.char-page {
  image-rendering: pixelated;
  position: relative;
}

/* Panel */
.panel {
  border: 4px solid #facc15;
  background: #0f172a;
  box-shadow: 8px 8px 0 #854d0e;
}
.panel__header {
  padding: 1rem 1.5rem;
  border-bottom: 3px solid #facc15;
  background: rgba(250, 204, 21, 0.05);
}
.panel__body {
  padding: 1.5rem;
}

/* Character card */
.char-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 3px solid rgba(250, 204, 21, 0.15);
  background: #0b0d17;
  transition: border-color 0.2s;
}
.char-card:hover {
  border-color: rgba(250, 204, 21, 0.4);
}
.char-card--active {
  border-color: #facc15;
  box-shadow: 0 0 10px rgba(250, 204, 21, 0.2);
}

.char-card__avatar {
  width: 48px;
  height: 48px;
  background: #0f172a;
  border: 2px solid #854d0e;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.char-card__placeholder {
  font-size: 14px;
  color: #854d0e;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(16, 2px);
  grid-template-rows: repeat(16, 2px);
  width: 32px;
  height: 32px;
}

.mini-grid__pixel {
  width: 2px;
  height: 2px;
}

/* Buttons */
.btn-play {
  width: 120px;
  padding: 0.6rem 0.5rem;
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  border: 3px solid #facc15;
  background: #ca8a04;
  color: #fef9c3;
  cursor: pointer;
  box-shadow: 3px 3px 0 #854d0e;
  transition: all 0.1s;
  text-align: center;
}
.btn-play:hover {
  background: #facc15;
  color: #431407;
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 #854d0e;
}

.btn-delete {
  width: 123px;
  padding: 0.5rem 0.5rem;
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  border: 2px solid #ef4444;
  background: #7f1d1d;
  color: #fca5a5;
  cursor: pointer;
  box-shadow: 2px 2px 0 #450a0a;
  transition: all 0.1s;
  text-align: center;
}
.btn-delete:hover {
  background: #ef4444;
  color: white;
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #450a0a;
}

/* Custom Scrollbar for the list */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #0b0d17;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #854d0e;
  border: 1px solid #facc15;
}

/* Zoom & Fade Animations */
.is-zooming {
  animation: zoomInScreen 0.9s cubic-bezier(0.7, 0, 0.84, 0) forwards;
  pointer-events: none;
}

.animate-fade-to-black {
  animation: fadeToBlack 0.9s ease-in forwards;
}

@keyframes zoomInScreen {
  0% { transform: scale(1); filter: blur(0); }
  100% { transform: scale(5); filter: blur(20px); }
}

@keyframes fadeToBlack {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
</style>
