import { defineStore } from 'pinia'
import { ref } from 'vue'
import api, { clearAuthToken, setAuthToken } from '../api/axios'

const STORAGE_KEY = 'ck_sanctum_session'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)

  function hydrateFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        return
      }
      const parsed = JSON.parse(raw)
      if (parsed?.token) {
        token.value = parsed.token
        user.value = parsed.user ?? null
        setAuthToken(parsed.token)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function persist() {
    try {
      if (token.value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: token.value, user: user.value }))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      /* */
    }
  }

  function setSession(payload) {
    token.value = payload.token
    user.value = payload.user ?? null
    setAuthToken(payload.token)
    persist()
  }

  function clearSession() {
    token.value = null
    user.value = null
    clearAuthToken()
    persist()
  }

  async function logout() {
    try {
      if (token.value) {
        await api.post('/logout')
      }
    } catch {
      /* */
    } finally {
      clearSession()
    }
  }

  return { token, user, hydrateFromStorage, setSession, clearSession, logout }
})
