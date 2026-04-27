<template>
  <div class="min-h-screen bg-[#0b0d17] text-white flex flex-col" style="font-family: 'Press Start 2P', monospace; image-rendering: pixelated;">
    <AppHeader />
    
    <!-- Scanlines overlay -->
    <div class="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
      style="background: repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 2px);">
    </div>

    <!-- CONTENT -->
    <main class="relative z-10 max-w-6xl mx-auto px-6 py-20 flex-grow">
      
      <!-- Header Section -->
      <div class="text-center mb-20">
        <h1 class="text-[#facc15] text-3xl mb-6" style="text-shadow: 4px 4px 0 #854d0e;">TABLÓN DE LEYENDAS</h1>
        <p class="text-[#facc15]/40 text-[9px] leading-7 max-w-2xl mx-auto">
          EL LUGAR DONDE LOS HÉROES DE <span class="text-[#3b82f6]">PHP</span> Y <span class="text-[#ef4444]">JAVA</span> COMPARTEN SUS CONQUISTAS.
        </p>
        
        <button class="mt-10 pixel-btn-blue text-[10px] px-10 py-4">
          + SUBIR CAPTURA
        </button>
      </div>

      <!-- Community Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div v-for="post in posts" :key="post.id" 
          class="group relative p-4 bg-[#0f172a] border-4 border-[#facc15]/20 hover:border-[#facc15] transition-all"
          style="box-shadow: 6px 6px 0 rgba(0,0,0,0.5);">
          
          <div class="aspect-video bg-[#0b0d17] mb-4 overflow-hidden relative border-2 border-[#facc15]/10">
            <img :src="post.image" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div class="absolute top-2 right-2 px-2 py-1 bg-black/60 text-[6px]" :class="post.faction === 'PHP' ? 'text-[#3b82f6]' : 'text-[#ef4444]'">
              {{ post.faction }}
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex justify-between items-center">
              <span class="text-[#facc15] text-[8px] tracking-widest">{{ post.author }}</span>
              <span class="text-[#facc15]/30 text-[6px]">{{ post.date }}</span>
            </div>
            <p class="text-[7px] text-white/60 leading-5 italic">"{{ post.desc }}"</p>
            
            <div class="flex items-center gap-4 mt-2 border-t border-[#facc15]/10 pt-3">
              <div class="flex items-center gap-2 cursor-pointer hover:text-[#facc15]">
                <span class="text-[8px]">❤</span>
                <span class="text-[6px]">{{ post.likes }}</span>
              </div>
              <div class="flex items-center gap-2 cursor-pointer hover:text-[#3b82f6]">
                <span class="text-[8px]">⌨</span>
                <span class="text-[6px]">{{ post.comments }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-20">
        <button class="text-[#facc15]/40 hover:text-[#facc15] text-[8px] tracking-[0.4em] animate-pulse">
          ▼ CARGAR MÁS BITÁCORAS
        </button>
      </div>

    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const posts = ref([
  {
    id: 1,
    author: 'GANDALF_JS',
    faction: 'PHP',
    date: 'HACE 2H',
    desc: 'DERROTANDO AL DRAGÓN DE LA CACHE CON UN SCRIPT RECURSIVO.',
    image: 'https://picsum.photos/seed/code1/600/400',
    likes: 124,
    comments: 12
  },
  {
    id: 2,
    author: 'JAVA_KNIGHT',
    faction: 'JAVA',
    date: 'HACE 5H',
    desc: 'NUEVA ARMADURA DE CLASE ADQUIRIDA EN EL REINO DE SPRING.',
    image: 'https://picsum.photos/seed/code2/600/400',
    likes: 89,
    comments: 4
  },
  {
    id: 3,
    author: 'BIT_HUNTER',
    faction: 'PHP',
    date: 'HACE 1D',
    desc: 'EXPLORANDO LAS RUINAS DE LARAVEL. MUCHOS TESOROS ENCONTRADOS.',
    image: 'https://picsum.photos/seed/code3/600/400',
    likes: 256,
    comments: 45
  },
  {
    id: 4,
    author: 'ERROR_404',
    faction: 'JAVA',
    date: 'HACE 1D',
    desc: 'MI PERSONAJE SE QUEDÓ ATRAPADO EN UN BUCLE INFINITO. AYUDA.',
    image: 'https://picsum.photos/seed/code4/600/400',
    likes: 42,
    comments: 88
  }
])
</script>

<style scoped>
.pixel-btn-blue {
  background: #1e40af;
  color: #bfdbfe;
  border: 4px solid #3b82f6;
  box-shadow: 4px 4px 0 #1e3a8a;
  cursor: pointer;
  font-family: inherit;
}
.pixel-btn-blue:hover {
  background: #3b82f6;
  color: white;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #1e3a8a;
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>
