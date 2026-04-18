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

  // Limpiar los parámetros OAuth de la URL (state, code, session_state, iss)
  // que Keycloak deja tras el redirect de autenticación
  const cleanUrl = window.location.origin + window.location.pathname

  window.history.replaceState({}, document.title, cleanUrl)

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.provide('keycloak', keycloak)
  app.mount('#app')

  // Pinia ya está activa después del mount, ahora sí se puede usar
  const authStore = useAuthStore()
  authStore.setSession(keycloak)
  setAuthToken(keycloak.token)

  // Renovar token automáticamente antes de que expire
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