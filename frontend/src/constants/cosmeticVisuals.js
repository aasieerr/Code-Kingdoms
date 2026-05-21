/**
 * Skin `asier`: tienda → `asier.png`; en juego → sprites por mirada en `characters/asier/`.
 * Mirada del código: n/s/e/w = norte / sur / este / oeste en pantalla.
 */
import asierShop from '../assets/cosmetics/portraits/asier.png'
import imgArriba from '../assets/characters/asier/walk-north.png'
import imgAbajo from '../assets/characters/asier/walk-south.png'
import imgIzquierda from '../assets/characters/asier/walk-west.png'
import imgDerecha from '../assets/characters/asier/walk-east.png'
import magicClosetWardrobe from '../assets/cosmetics/wardrobe/magic-closet.png'

export const ASIER_SLUG = 'asier'

const ASIER_WORLD_BY_FACING = Object.freeze({
  n: imgArriba,
  s: imgAbajo,
  e: imgDerecha,
  w: imgIzquierda,
})

/** Imagen del armario en el lobby (zona apariencia). */
export const WARDROBE_LOBBY_IMAGE = magicClosetWardrobe

function normalizeFacing(facing) {
  const f = String(facing ?? 's').toLowerCase().charAt(0)
  return f === 'n' || f === 's' || f === 'e' || f === 'w' ? f : 's'
}

/** Vista previa en el menú de compra (solo tienda). */
export function getCosmeticShopPreviewBySlug(slug) {
  if (String(slug ?? '').toLowerCase() === ASIER_SLUG) return asierShop
  return null
}

/** Sprite equipado en mundo / arena / HUD según mirada (solo `asier`). */
export function getDirectionalSkinWorldSrc(slug, facing) {
  if (String(slug ?? '').toLowerCase() !== ASIER_SLUG) return null
  const f = normalizeFacing(facing)
  return ASIER_WORLD_BY_FACING[f] ?? ASIER_WORLD_BY_FACING.s
}

/** @deprecated */
export function getCosmeticPortraitBySlug(slug) {
  return getCosmeticShopPreviewBySlug(slug)
}

export function equippedSkinUsesPortrait(equippedSkin) {
  return String(equippedSkin?.slug ?? '').toLowerCase() === ASIER_SLUG
}
