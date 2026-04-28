<script setup>
import { RouterView } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue'
import html2canvas from 'html2canvas'
import screenshotsApi from './api/screenshots'
import { useAuthStore } from './stores/auth'

const isCapturing = ref(false)
const lastCaptureTime = ref(0)
const notification = ref({ show: false, message: '', type: 'info' })

let notificationTimeout = null
const showNotification = (message, type = 'info') => {
  if (notificationTimeout) clearTimeout(notificationTimeout)
  notification.value = { show: true, message, type }
  notificationTimeout = setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

const takeScreenshot = async () => {
  const authStore = useAuthStore()
  if (!authStore.token) return

  // Evitar múltiples capturas seguidas (cooldown de 2 segundos)
  const now = Date.now()
  if (now - lastCaptureTime.value < 2000) return
  
  if (isCapturing.value) return
  isCapturing.value = true
  lastCaptureTime.value = now
  showNotification('Capturando pantalla...', 'info')

  try {
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      logging: false,
      scale: 1, // Forzar escala 1 para evitar recortes o artefactos en pantallas de alta densidad
      ignoreElements: (element) => {
        // Lista de clases de interfaz que queremos ocultar en la foto
        const uiClasses = [
          'screenshot-notification',
          'hud-panel',
          'wallet-bar',
          'game-logo',
          'shop-hint',
          'app-header',
          'app-footer',
          'inventory-panel',
          'equipment-panel',
          'map-panel',
          'dialogue-overlay',
          'skin-shop-overlay',
          'micropay-overlay',
          'click-shockwave',
          'click-particle'
        ]
        return uiClasses.some(cls => element.classList.contains(cls))
      }
    })

    const imageData = canvas.toDataURL('image/png')
    await screenshotsApi.save(imageData)
    showNotification('¡Captura guardada!', 'success')
  } catch (error) {
    console.error('Error taking screenshot:', error)
    showNotification('Error al guardar la captura', 'error')
  } finally {
    isCapturing.value = false
  }
}

const handleKeyDown = (e) => {
  if (e.key === 'F8') {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return
    e.preventDefault()
    takeScreenshot()
  }
}

const handleMouseDown = (e) => {
  createShockwave(e.clientX, e.clientY)
  const amount = 12
  for (let i = 0; i < amount; i++) {
    createParticle(e.clientX, e.clientY)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('mousedown', handleMouseDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('mousedown', handleMouseDown)
})

function createShockwave(x, y) {
  const wave = document.createElement('div')
  wave.className = 'click-shockwave'
  document.body.appendChild(wave)

  wave.style.left = `${x}px`
  wave.style.top = `${y}px`

  const animation = wave.animate([
    { width: '0px', height: '0px', opacity: 0.9, borderWidth: '6px' },
    { width: '140px', height: '140px', opacity: 0, borderWidth: '0px' }
  ], {
    duration: 500,
    easing: 'ease-out'
  })

  animation.onfinish = () => wave.remove()
}

function createParticle(x, y) {
  const particle = document.createElement('div')
  particle.className = 'click-particle'
  document.body.appendChild(particle)

  const size = Math.floor(Math.random() * 4) + 2
  const destinationX = (Math.random() - 0.5) * 60
  const destinationY = (Math.random() - 0.5) * 60
  const rotation = Math.random() * 360
  const delay = Math.random() * 100

  particle.style.width = `${size}px`
  particle.style.height = `${size}px`
  particle.style.left = `${x}px`
  particle.style.top = `${y}px`

  const animation = particle.animate([
    {
      transform: `translate(-50%, -50%) translate(0, 0) rotate(0deg)`,
      opacity: 1
    },
    {
      transform: `translate(-50%, -50%) translate(${destinationX}px, ${destinationY}px) rotate(${rotation}deg)`,
      opacity: 0
    }
  ], {
    duration: 400 + Math.random() * 200,
    easing: 'cubic-bezier(0, .9, .57, 1)',
    delay: delay
  })

  animation.onfinish = () => {
    particle.remove()
  }
}
</script>

<template>
  <router-view />
  
  <!-- Notificación de Captura -->
  <Transition name="fade">
    <div v-if="notification.show" 
         class="screenshot-notification fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl z-[9999] flex items-center gap-3 border backdrop-blur-md"
         :class="{
           'bg-blue-500/90 border-blue-400 text-white': notification.type === 'info',
           'bg-emerald-500/90 border-emerald-400 text-white': notification.type === 'success',
           'bg-rose-500/90 border-rose-400 text-white': notification.type === 'error'
         }">
      <div v-if="notification.type === 'info'" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
      <span class="font-medium text-sm tracking-wide">{{ notification.message }}</span>
    </div>
  </Transition>
</template>

<style>
#app {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.screenshot-notification {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
