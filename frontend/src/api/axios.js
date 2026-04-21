import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost/api',
})

export function setAuthToken(token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

export default api