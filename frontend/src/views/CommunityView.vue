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
      <div class="text-center mb-24">
        <div class="inline-block relative mb-6">
          <h1 class="text-[#facc15] text-4xl tracking-tighter" style="text-shadow: 4px 4px 0 #854d0e;">TABLÓN DE LEYENDAS</h1>
          <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#facc15] to-transparent"></div>
        </div>
        <p class="text-[#facc15]/60 text-[9px] leading-8 max-w-2xl mx-auto uppercase tracking-widest">
          EL LUGAR DONDE LOS HÉROES DE <span class="text-[#3b82f6]">PHP</span> Y <span class="text-[#ef4444]">JAVA</span> COMPARTEN SUS CONQUISTAS Y CRÓNICAS.
        </p>
        
        <button class="mt-12 pixel-btn-gold text-[10px] px-12 py-5 group overflow-hidden relative">
          <span class="relative z-10">+ SUBIR CAPTURA</span>
          <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
        </button>
      </div>

      <!-- Community Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        <div v-for="(post, index) in displayedPosts" :key="post.id" 
          class="post-card group relative p-5 bg-[#0f172a] border-4 border-[#facc15]/10 hover:border-[#facc15] transition-all duration-300"
          :style="{ animationDelay: (index * 100) + 'ms' }">
          
          <!-- Decorative Corners -->
          <div class="absolute -top-1 -left-1 w-3 h-3 border-t-4 border-l-4 border-[#facc15] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="absolute -bottom-1 -right-1 w-3 h-3 border-b-4 border-r-4 border-[#facc15] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <!-- Image Container -->
          <div class="aspect-video bg-[#0b0d17] mb-5 overflow-hidden relative border-2 border-[#facc15]/10 group-hover:border-[#facc15]/30">
            <img :src="post.image" class="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0b0d17] to-transparent opacity-60"></div>
            <div class="absolute bottom-3 left-3 px-3 py-1 bg-black/80 border border-[#facc15]/20 text-[6px] tracking-widest" 
              :class="post.faction === 'PHP' ? 'text-[#3b82f6]' : 'text-[#ef4444]'">
              REGION: {{ post.faction }}
            </div>
          </div>

          <!-- Post Body -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gradient-to-br from-[#1e293b] to-[#0b0d17] border-2 border-[#facc15]/20 flex items-center justify-center overflow-hidden">
                <span class="text-[#facc15] text-[10px]">{{ post.author[0] }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-[#facc15] text-[8px] tracking-widest font-bold">{{ post.author }}</span>
                <span class="text-[#facc15]/30 text-[6px] uppercase">{{ post.date }}</span>
              </div>
            </div>
            
            <p class="text-[8px] text-white/80 leading-6 italic line-clamp-3">"{{ post.desc }}"</p>
            
            <!-- Interactions -->
            <div class="flex items-center gap-6 mt-2 border-t-2 border-[#facc15]/5 pt-4">
              <button class="flex items-center gap-2 group/btn hover:scale-110 transition-transform">
                <span class="text-[#ef4444] text-[10px] group-hover/btn:drop-shadow-[0_0_5px_#ef4444]">❤</span>
                <span class="text-[7px] text-[#facc15]/60">{{ post.likes }}</span>
              </button>
              <button class="flex items-center gap-2 group/btn hover:scale-110 transition-transform">
                <span class="text-[#3b82f6] text-[10px] group-hover/btn:drop-shadow-[0_0_5px_#3b82f6]">⌨</span>
                <span class="text-[7px] text-[#facc15]/60">{{ post.comments }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div class="text-center mt-24" v-if="visibleCount < allPosts.length">
        <button @click="loadMore" class="text-[#facc15]/40 hover:text-[#facc15] text-[9px] tracking-[0.5em] uppercase transition-all hover:tracking-[0.6em] animate-pulse">
          ▼ CARGAR MÁS CRÓNICAS ▼
        </button>
      </div>

    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const visibleCount = ref(6)

const allPosts = [
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
  },
  {
    id: 5,
    author: 'SQL_MASTER',
    faction: 'PHP',
    date: 'HACE 2D',
    desc: 'HACIENDO UN JOIN ÉPICO ENTRE EL REINO DE LOS DATOS Y LA UI.',
    image: 'https://picsum.photos/seed/code5/600/400',
    likes: 312,
    comments: 15
  },
  {
    id: 6,
    author: 'DOCKER_KING',
    faction: 'JAVA',
    date: 'HACE 3D',
    desc: 'CONTENEDOR DE DRAGONES LISTO PARA EL DESPLIEGUE FINAL.',
    image: 'https://picsum.photos/seed/code6/600/400',
    likes: 567,
    comments: 92
  },
  {
    id: 7,
    author: 'PYTHON_PYTHONESS',
    faction: 'PHP',
    date: 'HACE 4D',
    desc: 'ENCANTANDO SERPIENTES CON SCRIPTS DE AUTOMATIZACIÓN.',
    image: 'https://picsum.photos/seed/code7/600/400',
    likes: 423,
    comments: 31
  },
  {
    id: 8,
    author: 'CSS_WIZARD',
    faction: 'JAVA',
    date: 'HACE 5D',
    desc: 'CONJURO DE CENTRADO DE DIVS COMPLETADO CON ÉXITO.',
    image: 'https://picsum.photos/seed/code8/600/400',
    likes: 890,
    comments: 150
  },
  {
    id: 9,
    author: 'NODE_REAPER',
    faction: 'PHP',
    date: 'HACE 1W',
    desc: 'RECOLECTANDO ALMAS ASÍNCRONAS EN EL REINO DE V8.',
    image: 'https://picsum.photos/seed/code9/600/400',
    likes: 666,
    comments: 66
  }
]

const displayedPosts = computed(() => allPosts.slice(0, visibleCount.value))

function loadMore() {
  visibleCount.value += 3
}
</script>

<style scoped>
.pixel-btn-gold {
  background: #ca8a04;
  color: #fef9c3;
  border: 4px solid #facc15;
  box-shadow: 4px 4px 0 #854d0e;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.pixel-btn-gold:hover {
  background: #facc15;
  color: #431407;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #854d0e;
}

.post-card {
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

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>
