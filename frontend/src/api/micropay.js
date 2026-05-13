import api from './axios'

export async function claimCodeCoinsPack(pkg) {
  const { data } = await api.post('/micropay/code-coins/claim', {
    package: pkg,
  })
  return data
}
