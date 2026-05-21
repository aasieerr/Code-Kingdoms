/**
 * Rectángulos en coordenadas del mundo del lobby (1700×1200, `WORLD_WIDTH` × `WORLD_EDGE`).
 * Cada mapa PNG (1024×723) se estira al mundo completo; las zonas están calibradas por reino.
 * Armario ~tamaño NPC (contenedor 56px + margen); un poco a la derecha del centro.
 */
const LOBBY_CENTER_ZONE = { x: 876, y: 562, w: 64, h: 64, pad: 20 }

export const SKIN_SHOP_LOBBY_ZONES = {
  php: LOBBY_CENTER_ZONE,
  java: LOBBY_CENTER_ZONE,
}
