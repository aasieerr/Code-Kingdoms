import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)

  function setSession(keycloak) {
    token.value = keycloak.token
    user.value = {
      username: keycloak.tokenParsed?.preferred_username,
      email: keycloak.tokenParsed?.email,
      name: keycloak.tokenParsed?.name,
    }
  }

  function clearSession() {
    token.value = null
    user.value = null
  }

  return { token, user, setSession, clearSession }
})