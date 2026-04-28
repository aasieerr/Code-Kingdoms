<template>
  <div class="min-h-screen bg-[#0b0d17] text-white flex flex-col" style="font-family: 'Press Start 2P', monospace; image-rendering: pixelated;">
    <AppHeader />
    
    <!-- Scanlines overlay -->
    <div class="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
      style="background: repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 2px);">
    </div>

    <!-- CONTENT -->
    <main class="relative z-10 max-w-6xl mx-auto px-6 py-20 flex-grow w-full">
      
      <!-- Header Section -->
      <div class="text-center mb-16">
        <div class="inline-block relative mb-6">
          <h1 class="text-[#facc15] text-3xl tracking-tighter" style="text-shadow: 4px 4px 0 #854d0e;">MIS CAPTURAS</h1>
          <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#facc15] to-transparent"></div>
        </div>
        <p class="text-[#facc15]/60 text-[9px] leading-8 max-w-2xl mx-auto uppercase tracking-widest">
          TUS MOMENTOS ÉPICOS EN <span class="text-[#3b82f6]">CODE KINGDOMS</span>. PULSA <span class="text-white border border-white/20 px-2 py-0.5 rounded bg-white/5">F8</span> EN EL JUEGO PARA CAPTURAR MÁS.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-6">
        <div class="w-16 h-16 border-4 border-[#facc15]/20 border-t-[#facc15] rounded-full animate-spin"></div>
        <span class="text-[#facc15] text-[10px] animate-pulse">CARGANDO RECUERDOS...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="screenshots.length === 0" class="text-center py-20 border-4 border-dashed border-[#facc15]/10 rounded-3xl">
        <div class="text-5xl mb-6 opacity-20">📸</div>
        <p class="text-[#facc15]/40 text-[10px] tracking-widest">NO HAS HECHO NINGUNA CAPTURA TODAVÍA.</p>
        <router-link to="/game" class="inline-block mt-8 text-[#3b82f6] hover:text-white text-[8px] underline decoration-2 underline-offset-8 transition-colors">
          IR A LA AVENTURA ->
        </router-link>
      </div>

      <!-- Screenshots Grid -->
      <div v-else class="flex flex-col items-center gap-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          <div v-for="(screenshot, index) in screenshots.slice(0, visibleCount)" :key="screenshot.id" 
            class="screenshot-card group relative p-3 bg-[#0f172a] border-4 border-[#facc15]/10 hover:border-[#facc15] transition-all duration-300"
            :style="{ animationDelay: (index * 50) + 'ms' }">
            
            <!-- Image Container -->
            <div class="aspect-video bg-black overflow-hidden relative border-2 border-[#facc15]/10 group-hover:border-[#facc15]/30 cursor-pointer"
                 @click="openLightbox(screenshot)">
              <img :src="screenshot.image_url" class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span class="text-white text-[8px] font-bold tracking-widest">VER EN GRANDE</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-3 flex justify-between items-center px-1">
              <span class="text-[#facc15]/40 text-[7px] uppercase tracking-tighter">{{ formatDate(screenshot.created_at) }}</span>
              <button @click="deleteScreenshot(screenshot.id)" 
                      class="text-[#ef4444]/40 hover:text-[#ef4444] text-[8px] transition-colors flex items-center gap-1 group/del">
                <span class="group-hover/del:scale-125 transition-transform">🗑</span>
                <span class="hidden group-hover/del:inline ml-1">ELIMINAR</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <button v-if="visibleCount < screenshots.length" 
                @click="loadMore"
                class="load-more-btn group">
          <span class="relative z-10 flex items-center gap-4">
            VER MÁS RECUERDOS
            <span class="animate-bounce">↓</span>
          </span>
          <div class="btn-shine"></div>
        </button>
      </div>
    </main>

    <!-- Lightbox -->
    <Transition name="fade">
      <div v-if="selectedScreenshot" class="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-20">
        <div class="absolute inset-0 bg-black/95 backdrop-blur-xl" @click="selectedScreenshot = null"></div>
        
        <div class="relative z-10 max-w-full max-h-full flex flex-col gap-6">
          <div class="relative bg-[#0f172a] p-2 border-4 border-[#facc15] shadow-[0_0_50px_rgba(250,204,21,0.2)] group-lightbox">
            <img :src="selectedScreenshot.image_url" class="max-w-full max-h-[70vh] object-contain" />
            
            <button @click="selectedScreenshot = null" 
                    class="absolute top-2 right-2 w-10 h-10 bg-[#ef4444] border-2 border-white text-white flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform z-[101]">
              ×
            </button>
          </div>
          
          <div class="flex justify-center gap-6">
            <a :href="selectedScreenshot.image_url" download 
               class="pixel-btn-blue text-[9px] px-8 py-3">
              DESCARGAR PNG
            </a>
          </div>
        </div>
      </div>
    </Transition>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import screenshotsApi from '../api/screenshots'

const screenshots = ref([])
const loading = ref(true)
const selectedScreenshot = ref(null)
const visibleCount = ref(6)

const loadMore = () => {
  visibleCount.value += 3
}

const fetchScreenshots = async () => {
  try {
    const response = await screenshotsApi.getAll()
    screenshots.value = response.data
  } catch (error) {
    console.error('Error fetching screenshots:', error)
  } finally {
    loading.value = false
  }
}

const deleteScreenshot = async (id) => {
  if (!confirm('¿Seguro que quieres borrar este recuerdo?')) return
  
  try {
    await screenshotsApi.delete(id)
    screenshots.value = screenshots.value.filter(s => s.id !== id)
  } catch (error) {
    console.error('Error deleting screenshot:', error)
    alert('No se pudo borrar la captura del servidor.')
  }
}

const openLightbox = (screenshot) => {
  selectedScreenshot.value = screenshot
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(fetchScreenshots)
</script>

<style scoped>
.screenshot-card {
  opacity: 0;
  transform: translateY(20px);
  animation: cardEntry 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes cardEntry {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pixel-btn-blue {
  background: #2563eb;
  color: white;
  border: 4px solid #3b82f6;
  box-shadow: 4px 4px 0 #1e40af;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.pixel-btn-blue:hover {
  background: #3b82f6;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #1e40af;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.load-more-btn {
  background: transparent;
  color: #facc15;
  border: 4px solid #facc15;
  padding: 16px 32px;
  font-family: inherit;
  font-size: 10px;
  letter-spacing: 0.2em;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 6px 6px 0 #854d0e;
}

.load-more-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0 #854d0e;
  background: #facc15;
  color: #0b0d17;
}

.load-more-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 #854d0e;
}

.btn-shine {
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.5s;
}
.load-more-btn:hover .btn-shine {
  left: 100%;
}
</style>
