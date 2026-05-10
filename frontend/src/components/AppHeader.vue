<template>
  <nav class="app-header relative z-[100] flex items-center justify-between px-8 py-5 border-b-4 border-[#facc15] bg-[#0b0d17] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
    
    <!-- Logo Section -->
    <div class="flex items-center gap-6 cursor-pointer group" @click="router.push('/')">
      <div class="relative">
        <div class="logo-frame">
          <img src="/code-kingdoms-logo.png" alt="logo" width="64" height="64" 
            class="logo-img transition-all group-hover:scale-110 group-hover:rotate-3 duration-300">
        </div>
        <!-- Logo Glow -->
        <div class="absolute inset-0 bg-[#facc15]/20 blur-2xl rounded-full -z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div class="flex flex-col gap-1 hidden lg:flex">
        <span class="text-[#facc15] text-[12px] tracking-[0.3em] font-bold title-glow">CODE &</span>
        <span class="text-[#facc15] text-[12px] tracking-[0.3em] font-bold title-glow">KINGDOMS</span>
      </div>
    </div>

    <!-- Navigation Links -->
    <div class="hidden md:flex items-center gap-12">
      <router-link to="/" class="nav-item" :class="{ 'active': route.path === '/' }">
        <span class="nav-dot"></span> INICIO
      </router-link>
      <router-link to="/comunidad" class="nav-item" :class="{ 'active': route.path === '/comunidad' }">
        <span class="nav-dot"></span> COMUNIDAD
      </router-link>
      <router-link v-if="authStore.token" to="/capturas" class="nav-item" :class="{ 'active': route.path === '/capturas' }">
        <span class="nav-dot"></span> CAPTURAS
      </router-link>
    </div>

    <!-- User Actions -->
    <div class="flex items-center gap-6">
      <template v-if="!authStore.token">
        <button @click="router.push('/login')" class="text-[#facc15]/60 hover:text-[#facc15] text-[8px] tracking-widest transition-colors hidden sm:block">
          ENTRAR
        </button>
        <button @click="router.push('/register')" class="header-btn-gold">
          ÚNETE AL REINO
        </button>
      </template>
      <template v-else>
        <div class="flex items-center gap-6">
          <router-link to="/personajes" class="text-[#facc15]/60 hover:text-[#facc15] text-[8px] tracking-widest transition-colors hidden sm:block" :class="{ '!text-[#facc15]': route.path === '/personajes' }">
            MIS HÉROES
          </router-link>
          <button @click="handleLogout" class="header-btn-red">
            SALIR
          </button>
        </div>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.logo-frame {
  padding: 4px;
  border: 2px solid rgba(250, 204, 21, 0.3);
  background: #0f172a;
  position: relative;
}

.logo-img {
  filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.4));
}

.title-glow {
  text-shadow: 0 0 10px rgba(250, 204, 21, 0.3), 2px 2px 0 #854d0e;
}

.nav-item {
  color: rgba(250, 204, 21, 0.5);
  text-decoration: none;
  font-size: 9px;
  letter-spacing: 0.2em;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item:hover {
  color: #facc15;
  transform: translateY(-2px);
}

.nav-item.active {
  color: #facc15;
}

.nav-dot {
  width: 4px;
  height: 4px;
  background: #facc15;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s;
}

.nav-item.active .nav-dot,
.nav-item:hover .nav-dot {
  opacity: 1;
  box-shadow: 0 0 8px #facc15;
}

.header-btn-gold {
  background: #ca8a04;
  color: #fef9c3;
  border: 3px solid #facc15;
  padding: 10px 20px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  box-shadow: 4px 4px 0 #854d0e;
  cursor: pointer;
  transition: all 0.15s;
}

.header-btn-gold:hover {
  background: #facc15;
  color: #431407;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #854d0e;
}

.header-btn-red {
  background: #991b1b;
  color: #fecaca;
  border: 3px solid #ef4444;
  padding: 10px 20px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  box-shadow: 4px 4px 0 #450a0a;
  cursor: pointer;
  transition: all 0.15s;
}

.header-btn-red:hover {
  background: #ef4444;
  color: white;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #450a0a;
}
</style>
