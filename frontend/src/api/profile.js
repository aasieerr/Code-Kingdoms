import api from './axios'

export async function fetchProfile() {
  const { data } = await api.get('/user')
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.patch('/user/profile', payload)
  return data
}

export async function updatePassword(payload) {
  const { data } = await api.put('/user/password', payload)
  return data
}

export async function uploadAvatar(imageData) {
  const { data } = await api.post('/user/avatar', { image: imageData })
  return data
}

export async function removeAvatar() {
  const { data } = await api.delete('/user/avatar')
  return data
}

export async function fetchNotifications() {
  const { data } = await api.get('/user/notifications')
  return data
}

export async function markNotificationsRead() {
  const { data } = await api.post('/user/notifications/read')
  return data
}
