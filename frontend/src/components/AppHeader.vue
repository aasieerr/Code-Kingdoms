<template>
  <nav class="app-header relative z-[100] flex items-center justify-between px-8 py-5 border-b-4 border-[#facc15] bg-[#0b0d17] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
    
    <!-- Logo Section -->
    <div class="flex items-center gap-6 cursor-pointer group" @click="router.push('/')">
      <img
        src="/code-kingdoms-logo.png"
        alt="Code & Kingdoms logo"
        width="64"
        height="64"
        class="logo-img"
      >
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
          <router-link
            to="/perfil"
            class="header-profile-link"
            :class="{ 'header-profile-link--active': route.path === '/perfil' }"
            aria-label="Ir a mi perfil"
          >
            <UserAvatar
              :name="authStore.user?.name || 'Héroe'"
              :avatar-url="authStore.user?.avatar_url"
              size="md"
            />
          </router-link>
          
          <!-- Campana de Notificaciones -->
          <div class="relative" ref="notificationsDropdownRef">
            <button 
              @click="toggleNotifications" 
              class="relative p-2 text-[#facc15]/60 hover:text-[#facc15] transition-colors"
              :class="{ 'animate-wiggle': isRinging }"
              title="Notificaciones"
            >
              <span class="text-xl">🔔</span>
              <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-3 h-3 bg-[#ef4444] border border-[#0f172a] rounded-full"></span>
            </button>

            <!-- Dropdown Menu -->
            <Transition name="fade">
              <div v-if="showNotifications" class="absolute right-0 mt-4 w-72 bg-[#0f172a] border-2 border-[#facc15]/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-[200]">
                <div class="p-3 border-b border-[#facc15]/10 flex justify-between items-center bg-[#0b0d17]">
                  <span class="text-[#facc15] text-[9px] tracking-widest font-press-start">NOTIFICACIONES</span>
                  <div class="flex items-center gap-3">
                    <button 
                      v-if="unreadCount > 0" 
                      @click="markAllAsRead"
                      class="text-[#3b82f6]/80 hover:text-[#3b82f6] text-[7px] tracking-widest font-press-start transition-colors"
                      title="Marcar todo como leído"
                    >
                      ✓ LEER TODO
                    </button>
                    <span class="text-white/50 text-[8px] font-press-start">{{ notifications.length }}</span>
                  </div>
                </div>
                
                <div class="max-h-64 overflow-y-auto">
                  <div v-if="notifications.length === 0" class="p-4 text-center text-white/40 text-[8px] font-press-start">
                    No tienes notificaciones nuevas.
                  </div>
                  
                  <div 
                    v-for="notif in visibleNotifications" 
                    :key="notif.id"
                    class="p-3 border-b border-[#facc15]/5 hover:bg-[#1e293b] transition-colors flex gap-3 items-start"
                    :class="{ 'bg-[#facc15]/5': notif.read_at === null }"
                  >
                    <UserAvatar :name="notif.data?.liker_name || '?'" :avatar-url="notif.data?.liker_avatar" size="sm" />
                    <div class="flex flex-col gap-1">
                      <p class="text-white/90 text-[8px] font-press-start leading-tight">
                        {{ notif.data?.message || 'Tienes una nueva interacción.' }}
                      </p>
                    </div>
                  </div>
                </div>

                <div v-if="notifications.length > 10" class="p-2 border-t border-[#facc15]/10 bg-[#0b0d17] text-center">
                  <button @click="showAll = !showAll" class="text-[#facc15]/60 hover:text-[#facc15] text-[8px] tracking-widest font-press-start transition-colors">
                    {{ showAll ? 'MOSTRAR MENOS' : 'VER MÁS' }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>

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
import UserAvatar from './UserAvatar.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { fetchNotifications, markNotificationsRead } from '../api/profile'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const notificationsDropdownRef = ref(null)
const showNotifications = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const showAll = ref(false)
const isRinging = ref(false)

const visibleNotifications = computed(() => {
  return showAll.value ? notifications.value : notifications.value.slice(0, 10)
})

const playChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3) // Drop to A4
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch (e) {
    console.warn('Web Audio API not supported', e)
  }
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const markAllAsRead = async () => {
  if (unreadCount.value === 0) return
  
  try {
    await markNotificationsRead()
    unreadCount.value = 0
    notifications.value.forEach(n => n.read_at = new Date().toISOString())
  } catch (e) {
    console.error('Error marking notifications as read', e)
  }
}

const handleClickOutside = (event) => {
  if (notificationsDropdownRef.value && !notificationsDropdownRef.value.contains(event.target)) {
    showNotifications.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  
  if (authStore.token) {
    try {
      const data = await fetchNotifications()
      notifications.value = data.notifications || []
      unreadCount.value = data.unread_count || 0
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }

    // Suscripción a WebSockets (requiere laravel-echo y pusher-js configurados en main.js)
    if (window.Echo && authStore.user?.id) {
      window.Echo.private(`App.Models.User.${authStore.user.id}`)
        .notification((notification) => {
          notifications.value.unshift({
            id: Date.now().toString(),
            data: notification.data || notification,
            read_at: null
          })
          unreadCount.value++
          
          isRinging.value = true
          playChime()
          
          setTimeout(() => {
            isRinging.value = false
          }, 1000)
        })
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.logo-img {
  display: block;
  width: 64px;
  height: 64px;
  object-fit: contain;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.4));
}

.group:hover .logo-img {
  transform: scale(1.1) rotate(2deg);
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

.header-profile-link {
  display: inline-flex;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.header-profile-link:hover {
  transform: translateY(-2px);
}

.header-profile-link--active :deep(.user-avatar) {
  border-color: #facc15;
  box-shadow: 0 0 12px rgba(250, 204, 21, 0.35);
}

.font-press-start {
  font-family: 'Press Start 2P', monospace;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg) scale(1.2); }
  50% { transform: rotate(15deg) scale(1.2); }
  75% { transform: rotate(-15deg) scale(1.2); }
}

.animate-wiggle {
  animation: wiggle 0.4s ease-in-out 2;
  color: #facc15;
}
</style>
