<template>
  <div class="char-page min-h-screen flex flex-col bg-[#0b0d17]" 
    :class="{ 'is-zooming': isZooming }"
    :style="{ 
      fontFamily: '\'Press Start 2P\', monospace',
      transformOrigin: zoomOrigin
    }">
    <AppHeader />

    <!-- Background -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/15 via-[#0b0d17] to-[#7f1d1d]/15"></div>
      <div class="absolute inset-0 opacity-[0.04]"
        style="background-image: linear-gradient(#facc15 1px, transparent 1px), linear-gradient(90deg, #facc15 1px, transparent 1px); background-size: 40px 40px;">
      </div>
    </div>

    <main class="relative z-10 flex-grow max-w-7xl mx-auto w-full px-6 py-12">

      <!-- Page Header -->
      <div class="mb-16 text-center">
        <p class="text-[#facc15]/30 text-[8px] tracking-[0.5em] mb-4 animate-pulse">── REINO DE HÉROES ──</p>
        <h1 class="text-[#facc15] text-4xl md:text-5xl lg:text-6xl" 
          style="text-shadow: 6px 6px 0 #854d0e, 10px 10px 0 #431407; letter-spacing: -2px;">
          MIS PERSONAJES
        </h1>
        <p v-if="authName" class="text-[#facc15]/50 text-[10px] mt-8 tracking-[0.2em] bg-[#facc15]/5 py-2 px-4 inline-block border-x-2 border-[#facc15]/20">
          HÉROE: {{ authName.toUpperCase() }}
        </p>
      </div>

      <!-- Error -->
      <div v-if="loadErr" class="max-w-xl mx-auto mb-8 p-4 border-2 border-[#ef4444] bg-[#7f1d1d] text-white text-[8px] text-center">
        {{ loadErr }}
      </div>

      <!-- Grid: Characters + Create Form -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <!-- LEFT: Character List -->
        <section class="panel">
          <div class="panel__header">
            <h2 class="text-[#facc15] text-[10px] tracking-widest">HÉROES FORJADOS</h2>
          </div>
          <div class="panel__body">
            <p v-if="loading" class="text-[#facc15]/30 text-[8px] text-center py-8 animate-blink">
              CARGANDO REGISTROS...
            </p>
            <p v-else-if="characters.length === 0" class="text-[#facc15]/30 text-[8px] text-center py-12 leading-7">
              AÚN NO HAS FORJADO NINGÚN HÉROE.<br/>
              CREA UNO PARA EMPEZAR TU VIAJE.
            </p>
            <ul v-else class="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <li
                v-for="c in characters"
                :key="c.id"
                class="char-card"
                :class="{ 'char-card--active': activeCharacterId === c.id }"
              >
                <div class="flex-1">
                  <h3 class="text-[#facc15] text-[9px] mb-2 tracking-widest">{{ c.name.toUpperCase() }}</h3>
                  <p class="text-[#facc15]/40 text-[7px] leading-6">
                    LVL {{ c.level }} · {{ labelKingdom(c) }}<br/>
                    {{ labelRace(c) }} · {{ labelClass(c) }}
                  </p>
                </div>
                <div class="flex flex-col gap-2">
                  <button type="button" class="btn-play" @click="playAs($event, c)">
                    ► JUGAR
                  </button>
                  <button type="button" class="btn-delete" @click="askDelete(c.id)">
                    ✖ ELIMINAR
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <!-- RIGHT: Create Character Form -->
        <section class="panel">
          <div class="panel__header">
            <h2 class="text-[#facc15] text-[10px] tracking-widest">FORJAR HÉROE</h2>
          </div>
          <div class="panel__body">
            <div v-if="characters.length >= 4" class="text-center py-4">
              <p class="text-[#ef4444] text-[8px] leading-6 mb-4">LÍMITE DE HÉROES ALCANZADO (4/4)</p>
              <p class="text-[#facc15]/40 text-[7px] leading-6">NO PUEDES FORJAR MÁS LEYENDAS POR AHORA.</p>
            </div>
            <template v-else>
              <p class="text-[#facc15]/40 text-[7px] leading-6 mb-8">
                ELIGE REINO, RAZA Y CLASE. TU LEYENDA EMPIEZA AQUÍ. ({{ characters.length }}/4)
              </p>
              <CreateCharacterForm
                embedded
                submit-label="CREAR HÉROE"
                @created="onCharacterCreated"
              />
            </template>
          </div>
        </section>
      </div>

      <!-- Custom Confirmation Modal -->
      <transition name="modal">
        <div v-if="showConfirm" class="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div class="absolute inset-0 bg-[#0b0d17]/90 backdrop-blur-sm"></div>
          <div class="relative w-full max-w-md p-8 border-4 border-[#ef4444] bg-[#0f172a] shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <h3 class="text-[#ef4444] text-[12px] mb-6 tracking-widest text-center" style="text-shadow: 2px 2px 0 #450a0a;">
              ⚠ ¿ELIMINAR HÉROE?
            </h3>
            <p class="text-[#facc15]/60 text-[8px] leading-7 text-center mb-10">
              ESTA ACCIÓN ES IRREVERSIBLE. EL HÉROE SERÁ BORRADO DE LOS REGISTROS DEL REINO PARA SIEMPRE.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <button @click="confirmDelete" class="flex-1 py-4 bg-[#7f1d1d] text-white border-4 border-[#ef4444] text-[8px] hover:bg-[#ef4444] transition-colors">
                SÍ, ELIMINAR
              </button>
              <button @click="showConfirm = false" class="flex-1 py-4 bg-[#1e293b] text-[#facc15] border-4 border-[#facc15]/20 text-[8px] hover:border-[#facc15] transition-colors">
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      </transition>

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

/* Blink */
.animate-blink {
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(-100px);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.modal-enter-active .absolute,
.modal-leave-active .absolute {
  transition: opacity 0.3s ease;
}

.modal-enter-from .absolute,
.modal-leave-to .absolute {
  opacity: 0;
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
  100% { transform: scale(4); filter: blur(10px); }
}

@keyframes fadeToBlack {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
</style>
