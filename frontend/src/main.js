import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Keycloak from 'keycloak-js'
import App from './App.vue'
import router from './router'
import { setAuthToken } from './api/axios'
import { useAuthStore } from './stores/auth'

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'code-kingdoms',
  clientId: 'vue-frontend',
})

keycloak.init({
  onLoad: 'login-required',
  checkLoginIframe: false,
  pkceMethod: 'S256',
}).then((authenticated) => {
  if (!authenticated) {
    window.location.reload()
    return
  }

  const cleanUrl = window.location.origin + window.location.pathname
  window.history.replaceState({}, document.title, cleanUrl)

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.provide('keycloak', keycloak)
  app.mount('#app')

  const authStore = useAuthStore()
  authStore.setSession(keycloak)
  setAuthToken(keycloak.token)

  setInterval(() => {
    keycloak.updateToken(30).then((refreshed) => {
      if (refreshed) {
        setAuthToken(keycloak.token)
        authStore.setSession(keycloak)
      }
    })
  }, 10000)

}).catch(() => {
  console.error('Error al conectar con Keycloak')
})

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