/**
 * Rectángulo interior caminable en coordenadas de arena (mismo tamaño de escena que
 * `WORLD_WIDTH` × `WORLD_EDGE` en `constants/world.js`).
 *
 * Todas las secciones comparten el MISMO rect (arte y hitbox alineados con los
 * prompts unificados: ~16.18% / 83.82% ancho, ~8.75% / 91.25% alto).
 * Si el pipeline de imágenes cambia, solo ajusta ARENA_UNIFIED_WALK_RECT.
 */
export const ARENA_UNIFIED_WALK_RECT = Object.freeze({
  left: 150,
  right: 1550,
  top: 105,
  bottom: 1080,
})

const SECTION_ARENA_MAP_NAMES = Object.freeze([
  'Array Islands',
  'JVM Volcano',
  'Maven Mountains',
  'Spring Boot City',
  'Hibernate Ruins',
  'Spring Border Gate',
  'Eloquent Swamps',
  'Composer Desert',
  'Laravel Citadel',
  'PHP Frontier Marshes',
])

/** Copia superficial del rect (cada mapa tiene su propio objeto, sin compartir referencia). */
function cloneWalkRect(template) {
  return { ...template }
}

/** Misma caja por nombre de mapa (copia por entrada para evitar mutaciones compartidas). */
function buildWalkBoundsByMapName(mapNames, templateRect) {
  return Object.fromEntries(
    mapNames.map((name) => [name, cloneWalkRect(templateRect)]),
  )
}

export const ARENA_WALK_BOUNDS_BY_MAP_NAME = buildWalkBoundsByMapName(
  SECTION_ARENA_MAP_NAMES,
  ARENA_UNIFIED_WALK_RECT,
)

export const ARENA_BOSS_SECTION = 6

export function getArenaWalkBoundsRect(mapName) {
  if (!mapName) return null
  return ARENA_WALK_BOUNDS_BY_MAP_NAME[mapName] ?? null
}
