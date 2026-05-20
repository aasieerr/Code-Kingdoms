import api from './axios'

export default {
  getAll() {
    return api.get('/screenshots')
  },
  save(imageData, characterName = null) {
    return api.post('/screenshots', {
      image: imageData,
      character_name: characterName,
    })
  },
  delete(id) {
    return api.delete(`/screenshots/${id}`)
  },
}
