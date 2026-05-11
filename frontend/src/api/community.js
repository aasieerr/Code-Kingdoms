import axios from './axios'

export default {
  getPosts(page = 1, perPage = 12) {
    return axios.get('/community/posts', {
      params: { page, per_page: perPage },
    })
  },
  publish(payload = {}) {
    return axios.post('/community/posts', payload)
  },
  publishScreenshot(screenshotId, payload = {}) {
    return axios.post('/community/posts', {
      screenshot_id: screenshotId,
      ...payload,
    })
  },
  remove(id) {
    return axios.delete(`/community/posts/${id}`)
  },
  toggleLike(postId) {
    return axios.post(`/community/posts/${postId}/likes`)
  },
  getComments(postId, page = 1, perPage = 20) {
    return axios.get(`/community/posts/${postId}/comments`, {
      params: { page, per_page: perPage },
    })
  },
  addComment(postId, body) {
    return axios.post(`/community/posts/${postId}/comments`, { body })
  },
  removeComment(commentId) {
    return axios.delete(`/community/comments/${commentId}`)
  },
}
