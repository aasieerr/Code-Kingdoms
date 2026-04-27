<template>
  <nav class="relative z-50 flex items-center justify-between px-6 py-4"
    style="border-bottom: 4px solid #facc15; background: #0b0d17; box-shadow: 0 4px 0 #854d0e;">
    
    <!-- Logo -->
    <div class="flex items-center gap-4 cursor-pointer group" @click="router.push('/')">
      <div class="relative">
        <img src="/code-kingdoms-logo.png" alt="logo" width="60" height="60" 
          class="logo-img transition-transform group-hover:scale-110 duration-300">
        <!-- Subtle glow effect -->
        <div class="absolute inset-0 bg-[#facc15]/20 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div class="flex flex-col gap-1 hidden sm:flex">
        <span class="text-[#facc15] text-[10px] tracking-[0.25em] font-bold" style="text-shadow: 2px 2px 0 #854d0e;">CODE &</span>
        <span class="text-[#facc15] text-[10px] tracking-[0.25em] font-bold" style="text-shadow: 2px 2px 0 #854d0e;">KINGDOMS</span>
      </div>
    </div>

    <!-- Nav links -->
    <div class="hidden md:flex items-center gap-10 text-[8px]">
      <router-link to="/" class="nav-link" :class="{ 'active': route.path === '/' }">INICIO</router-link>
      <router-link to="/comunidad" class="nav-link" :class="{ 'active': route.path === '/comunidad' }">COMUNIDAD</router-link>
    </div>

    <!-- Auth Group -->
    <div class="flex items-center gap-3">
      <template v-if="!authStore.token">
        <router-link to="/login" class="login-link hidden sm:inline-block">LOGIN</router-link>
        <button @click="router.push('/register')" class="pixel-btn-gold text-[8px] px-5 py-2">
          REGISTRARSE
        </button>
      </template>
      <template v-else>
        <router-link to="/personajes" class="login-link hidden sm:inline-block">MIS HÉROES</router-link>
        <button @click="handleLogout" class="pixel-btn-red text-[8px] px-5 py-2">
          LOGOUT
        </button>
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
.logo-img {
  filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.3));
}
.nav-link {
  color: rgba(250, 204, 21, 0.6);
  text-decoration: none;
  transition: all 0.2s;
  letter-spacing: 0.1em;
}
.nav-link:hover {
  color: #facc15;
}
.nav-link.active {
  color: #facc15;
  border-bottom: 2px solid #facc15;
  padding-bottom: 4px;
}

.login-link {
  color: rgba(250, 204, 21, 0.7);
  text-decoration: none;
  font-size: 8px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: 2px solid rgba(250, 204, 21, 0.3);
  padding: 8px 20px;
  transition: all 0.2s;
  font-family: 'Press Start 2P', monospace;
  display: inline-block;
}
.login-link:hover {
  color: #facc15;
  border-color: #facc15;
}

.pixel-btn-gold {
  background: #ca8a04;
  color: #fef9c3;
  border: 3px solid #facc15;
  box-shadow: 3px 3px 0 #854d0e;
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
}
.pixel-btn-gold:hover {
  background: #facc15;
  color: #431407;
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 #854d0e;
}

.pixel-btn-red {
  background: #7f1d1d;
  color: #f87171;
  border: 3px solid #ef4444;
  box-shadow: 3px 3px 0 #7f1d1d;
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
}
.pixel-btn-red:hover {
  background: #ef4444;
  color: white;
}
</style>
