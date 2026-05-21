import api from './axios'

export async function login(email, password) {
  const { data } = await api.post('/login', { email, password })
  return data
}

export async function register(payload) {
  const { data } = await api.post('/register', payload)
  return data
}
