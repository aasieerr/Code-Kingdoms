import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const AUTH_STORAGE_KEY = 'ck_sanctum_session'

const api = axios.create({
  baseURL,
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export function clearAuthToken() {
  delete api.defaults.headers.common.Authorization
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    if (status === 401 && !url.includes('/login') && !url.includes('/register')) {
      clearAuthToken()
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      } catch {
        /* */
      }
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export default api
