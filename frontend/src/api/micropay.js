import api from './axios'

export async function createCodeCoinsCheckout(pkg, returnPath) {
  const { data } = await api.post('/micropay/code-coins/checkout', {
    package: pkg,
    return_path: returnPath,
  })
  return data
}

export async function confirmCodeCoinsCheckout(sessionId) {
  const { data } = await api.post('/micropay/code-coins/confirm', {
    session_id: sessionId,
  })
  return data
}
