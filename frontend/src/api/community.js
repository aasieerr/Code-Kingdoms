import api from './axios'

export default {
  getPosts(page = 1, perPage = 12) {
    return api.get('/community/posts', {
      params: { page, per_page: perPage },
    })
  },
  publish(payload = {}) {
    return api.post('/community/posts', payload)
  },
  publishScreenshot(screenshotId, payload = {}) {
    return api.post('/community/posts', {
      screenshot_id: screenshotId,
      ...payload,
    })
  },
  remove(id) {
    return api.delete(`/community/posts/${id}`)
  },
  toggleLike(postId) {
    return api.post(`/community/posts/${postId}/likes`)
  },
  getComments(postId, page = 1, perPage = 20) {
    return api.get(`/community/posts/${postId}/comments`, {
      params: { page, per_page: perPage },
    })
  },
  addComment(postId, body) {
    return api.post(`/community/posts/${postId}/comments`, { body })
  },
  removeComment(commentId) {
    return api.delete(`/community/comments/${commentId}`)
  },
}
