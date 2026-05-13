import { activeCharacterId } from '../gameState'

/**
 * ID del personaje activo o lanza si no hay uno (mensaje estable para la tienda / API).
 */
export function requireActiveCharacterId() {
  const cid = activeCharacterId.value
  if (!cid) {
    throw new Error('No hay personaje activo')
  }
  return cid
}
