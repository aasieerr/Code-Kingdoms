import { createApp } from 'vue'
import './index.css'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore()
authStore.hydrateFromStorage()

app.use(router)
app.mount('#app')

window.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault()
  }
}, { passive: false })

window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
    e.preventDefault()
  }
})
