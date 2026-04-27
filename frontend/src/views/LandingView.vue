<template>
  <div class="min-h-screen bg-[#0b0d17] text-white overflow-x-hidden" style="font-family: 'Press Start 2P', monospace; image-rendering: pixelated;">
    <AppHeader />

    <!-- Scanlines overlay -->
    <div class="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
      style="background: repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 2px);">
    </div>

    <!-- Dynamic Background -->
    <div class="fixed inset-0 z-0 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/20 via-[#0b0d17] to-[#7f1d1d]/20"></div>
      <div class="absolute inset-0 opacity-[0.05]"
        style="background-image: linear-gradient(#facc15 1px, transparent 1px), linear-gradient(90deg, #facc15 1px, transparent 1px); background-size: 40px 40px;">
      </div>
    </div>

    <!-- HERO -->
    <section class="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-36 pb-24">
      <div class="relative mb-6">
        <!-- Typewriter title -->
        <h1 class="text-[#facc15] leading-none mb-1"
          style="font-size: clamp(32px, 9vw, 88px); text-shadow: 4px 4px 0 #854d0e, 8px 8px 0 #431407;">
          <span>{{ displayedLine1 }}</span><span v-if="!line1Done" class="typewriter-cursor">█</span>
        </h1>
        <h1 class="text-[#facc15] leading-none"
          style="font-size: clamp(32px, 9vw, 88px); text-shadow: 4px 4px 0 #854d0e, 8px 8px 0 #431407;">
          <span>{{ displayedLine2 }}</span><span v-if="line1Done && !typingDone" class="typewriter-cursor">█</span>
        </h1>
        <div class="absolute -top-10 -left-10 w-20 h-20 bg-blue-500/20 blur-3xl animate-pulse-glow"></div>
        <div class="absolute -bottom-10 -right-10 w-20 h-20 bg-red-500/20 blur-3xl animate-pulse-glow" style="animation-delay: 1s"></div>
      </div>

      <p class="max-w-lg text-[#facc15]/40 text-[9px] leading-8 mt-10 tracking-widest reveal-item">
        DONDE LA <span class="text-[#3b82f6]">LÓGICA</span> SE CONVIERTE EN <span class="text-[#ef4444]">PODER</span>.<br/>
        ¿PHP O JAVA? ELIGE TU BANDO Y CONQUISTA.
      </p>

      <div class="flex items-center gap-3 mt-12 reveal-item" style="transition-delay: 0.2s">
        <div class="w-16 h-1 bg-gradient-to-r from-transparent to-[#3b82f6]"></div>
        <div class="w-3 h-3 rotate-45 bg-[#facc15]"></div>
        <div class="w-16 h-1 bg-gradient-to-l from-transparent to-[#ef4444]"></div>
      </div>
    </section>

    <!-- FINAL CTA CARD -->
    <section class="relative z-10 px-6 py-20 reveal-item">
      <div class="max-w-2xl mx-auto text-center">
        <div class="p-12 relative overflow-hidden" 
          style="border: 4px solid #facc15; background: #0f172a; box-shadow: 8px 8px 0 #854d0e;">
          <div class="absolute inset-1 border-2 border-[#facc15]/20 pointer-events-none"></div>
          
          <h2 class="text-[#facc15] text-2xl mb-4 leading-loose tracking-widest" style="text-shadow: 3px 3px 0 #854d0e;">
            RECLAMA TU TRONO
          </h2>
          
          <p class="text-[#facc15]/60 text-[9px] mb-10 leading-7 max-w-md mx-auto">
            LA BATALLA ENTRE <span class="text-[#3b82f6]">PHP</span> Y <span class="text-[#ef4444]">JAVA</span> HA COMENZADO. 
            FORJA TU HÉROE, ESCRIBE CÓDIGO REAL PARA LANZAR HECHIZOS Y DOMINA LOS REINOS. 
            ¿ESTÁS LISTO PARA EL COMPILADOR?
          </p>
          
          <button @click="router.push('/register')" class="pixel-btn-gold text-[12px] px-12 py-5 w-full max-w-sm mx-auto block">
            ► CREAR CUENTA GRATIS
          </button>

          <p class="mt-5 text-[7px] text-[#facc15]/30">
            ¿YA TIENES CUENTA? 
            <span @click="router.push('/login')" class="text-[#facc15]/60 hover:text-[#facc15] underline cursor-pointer transition-colors">
              INICIA SESIÓN AQUÍ
            </span>
          </p>

          <p class="mt-3 text-[7px] text-[#facc15]/30">ÚNETE A +50.000 PROGRAMADORES</p>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="relative z-10 py-12 px-6 reveal-item"
      style="border-top: 4px solid #854d0e; border-bottom: 4px solid #854d0e; background: #0a0c14;">
      <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
        <div v-for="stat in stats" :key="stat.label" class="flex flex-col gap-4">
          <span class="text-[#facc15] text-2xl" style="text-shadow: 2px 2px 0 #854d0e;">{{ stat.value }}</span>
          <span class="text-[#facc15]/30 text-[7px] tracking-[0.2em] uppercase">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const router = useRouter()

// ── TYPEWRITER ──────────────────────────────────────────────
const line1 = 'CODE &'
const line2 = 'KINGDOMS'
const displayedLine1 = ref('')
const displayedLine2 = ref('')
const line1Done = ref(false)
const typingDone = ref(false)

function startTypewriter() {
  const speed = 90
  let i = 0

  // Type line 1
  const timer1 = setInterval(() => {
    displayedLine1.value += line1[i]
    i++
    if (i >= line1.length) {
      clearInterval(timer1)
      line1Done.value = true
      // Pause then type line 2
      let j = 0
      setTimeout(() => {
        const timer2 = setInterval(() => {
          displayedLine2.value += line2[j]
          j++
          if (j >= line2.length) {
            clearInterval(timer2)
            typingDone.value = true
          }
        }, speed)
      }, 300)
    }
  }, speed)
}

// ── SCROLL REVEAL ────────────────────────────────────────────
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-item')
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
        observer.unobserve(entry.target) // Solo una vez
      }
    })
  }, { threshold: 0.15 })

  items.forEach(item => observer.observe(item))
}

onMounted(() => {
  startTypewriter()
  // Small delay so the DOM is ready for observer
  setTimeout(initScrollReveal, 100)
})

const stats = [
  { value: '50K+', label: 'HÉROES' },
  { value: 'PHP', label: 'ELÉCTRICO' },
  { value: 'JAVA', label: 'FIERO' },
  { value: '4.9★', label: 'VALORACIÓN' },
]
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

/* ── TYPEWRITER CURSOR ─────────────── */
.typewriter-cursor {
  animation: blink-cursor 0.7s step-end infinite;
  color: #facc15;
}
.typewriter-cursor.hidden {
  display: none;
}
@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ── SCROLL REVEAL ────────────────── */
.reveal-item {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal-item.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* ── GOLD BUTTON ──────────────────── */
.pixel-btn-gold {
  background: #ca8a04;
  color: #fef9c3;
  border: 4px solid #facc15;
  box-shadow: 4px 4px 0 #854d0e, 8px 8px 0 #431407;
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
  transition: all 0.1s;
}
.pixel-btn-gold:hover {
  background: #facc15;
  color: #431407;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #854d0e, 10px 10px 0 #431407;
}
.pixel-btn-gold:active {
  transform: translate(4px, 4px);
  box-shadow: 0px 0px 0 #854d0e;
}

/* ── BACKGROUND GLOW ──────────────── */
.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}
@keyframes pulse-glow {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-track { background: #0b0d17; }
::-webkit-scrollbar-thumb { background: #854d0e; border: 2px solid #facc15; }
</style>