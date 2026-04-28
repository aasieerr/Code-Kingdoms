import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import { WORLD_EDGE as WORLD } from '../constants/world'

const PLAYER_SIZE = 40
const MOVE_SPEED = 7
const MELEE_TYPES = ['daga', 'espada', 'hacha']
const MELEE_RANGE = 135
const MELEE_LIFETIME = 250
const COIN_PICKUP_R = 52
const CONTACT_DAMAGE = 10
const CONTACT_COOLDOWN_MS = 480
const BULLET_SPEED = 8
const BULLET_LIFETIME_MS = 2200
const FIRE_INTERVAL_MS = 320
const BULLET_DAMAGE = 12
const ENEMY_SIZE = 36
const ENEMY_HIT_R = 16
const MAGNET_RANGE = 120
const MAGNET_SPEED = 5


/** Combate en arena por rondas: WASD, disparo automático al enemigo más cercano, monedas al eliminar. */
export function useArenaCombat(options = {}) {
  const startX = options.startX ?? WORLD / 2
  const startY = options.startY ?? WORLD / 2
  const equippedWeapon = options.equippedWeapon ?? ref(null)
  const characterClass = options.characterClass ?? ref('')

  const arenaRef = ref(null)
  const x = ref(startX)
  const y = ref(startY)
  const focused = ref(false)
  const moving = ref(false)
  const locked = ref(false)

  const keys = { w: false, a: false, s: false, d: false }

  const wave = ref(1)
  /** idle (sin run aún) | fighting | between | gameover */
  const phase = ref('idle')
  const playerHp = ref(100)
  const playerMaxHp = ref(100)
  /** Oro recogido en esta sesión de arena (antes de sincronizar con API) */
  const sessionGold = ref(0)

  const enemies = shallowRef([])
  const bullets = shallowRef([])
  const coins = shallowRef([])
  const slashes = shallowRef([])

  let enemyId = 1
  let bulletId = 1
  let coinId = 1
  let lastFireAt = 0
  let lastContactAt = 0
  let rafId = null

  function spawnWave() {
    const n = Math.min(42, 4 + wave.value * 2)
    const list = []
    const pad = 80
    for (let i = 0; i < n; i++) {
      const edge = Math.floor(Math.random() * 4)
      let ex
      let ey
      if (edge === 0) {
        ex = Math.random() * (WORLD - pad * 2) + pad
        ey = pad
      } else if (edge === 1) {
        ex = WORLD - pad
        ey = Math.random() * (WORLD - pad * 2) + pad
      } else if (edge === 2) {
        ex = Math.random() * (WORLD - pad * 2) + pad
        ey = WORLD - pad
      } else {
        ex = pad
        ey = Math.random() * (WORLD - pad * 2) + pad
      }
      const hp = 16 + wave.value * 7
      list.push({
        id: enemyId++,
        x: ex,
        y: ey,
        hp,
        maxHp: hp,
        speed: 3.4 + wave.value * 0.12,
      })
    }
    enemies.value = list
  }

  function nearestEnemy(px, py) {
    let best = null
    let bestD = Infinity
    const pcx = px + PLAYER_SIZE / 2
    const pcy = py + PLAYER_SIZE / 2
    for (const e of enemies.value) {
      const ecx = e.x + ENEMY_SIZE / 2
      const ecy = e.y + ENEMY_SIZE / 2
      const dx = ecx - pcx
      const dy = ecy - pcy
      const d = dx * dx + dy * dy
      if (d < bestD) {
        bestD = d
        best = e
      }
    }
    return best
  }

  function tick() {
    const now = performance.now()

    if (!locked.value && arenaRef.value) {
      const W = WORLD - PLAYER_SIZE
      const H = WORLD - PLAYER_SIZE
      if (keys.w) {
        y.value = Math.max(0, y.value - MOVE_SPEED)
      }
      if (keys.s) {
        y.value = Math.min(H, y.value + MOVE_SPEED)
      }
      if (keys.a) {
        x.value = Math.max(0, x.value - MOVE_SPEED)
      }
      if (keys.d) {
        x.value = Math.min(W, x.value + MOVE_SPEED)
      }
      moving.value = Object.values(keys).some(Boolean)
    }

    if (phase.value === 'fighting') {
      const px = x.value
      const py = y.value
      const pcx = px + PLAYER_SIZE / 2
      const pcy = py + PLAYER_SIZE / 2

      let elist = enemies.value.map((e) => {
        const ecx = e.x + ENEMY_SIZE / 2
        const ecy = e.y + ENEMY_SIZE / 2
        let dx = pcx - ecx
        let dy = pcy - ecy
        const len = Math.hypot(dx, dy) || 1
        dx /= len
        dy /= len
        let nx = e.x + dx * e.speed
        let ny = e.y + dy * e.speed
        nx = Math.max(0, Math.min(WORLD - ENEMY_SIZE, nx))
        ny = Math.max(0, Math.min(WORLD - ENEMY_SIZE, ny))
        return { ...e, x: nx, y: ny }
      })
      enemies.value = elist

      for (const e of elist) {
        const ecx = e.x + ENEMY_SIZE / 2
        const ecy = e.y + ENEMY_SIZE / 2
        const dist = Math.hypot(ecx - pcx, ecy - pcy)
        if (dist < 30 && now - lastContactAt > CONTACT_COOLDOWN_MS) {
          playerHp.value = Math.max(0, playerHp.value - CONTACT_DAMAGE)
          lastContactAt = now
          break
        }
      }

      // Calcular intervalo y daño según el arma
      let currentFireInterval = FIRE_INTERVAL_MS
      let currentDamage = BULLET_DAMAGE
      const newCoins = [...coins.value]

      if (equippedWeapon.value) {
        currentDamage = equippedWeapon.value.damage || BULLET_DAMAGE
        const type = equippedWeapon.value.weaponType
        if (type === 'daga') currentFireInterval = 250
        else if (type === 'arco') currentFireInterval = 280
        else if (type === 'varita') currentFireInterval = 320
        else if (type === 'espada') currentFireInterval = 650
        else if (type === 'hacha') currentFireInterval = 850

        // Reducir daño melee un poco para equilibrar
        if (MELEE_TYPES.includes(type)) {
          currentDamage = Math.ceil(currentDamage * 0.75)
        }
      }

      const tgt = nearestEnemy(px, py)
      
      // Mover detecciones arriba para el log
      const wType = equippedWeapon.value?.weaponType
      const charClass = (characterClass.value || '').toLowerCase()
      const isWarrior = charClass.includes('guerrero') || charClass.includes('warrior')

      if (tgt && now - lastFireAt >= currentFireInterval) {
        lastFireAt = now
        const ecx = tgt.x + ENEMY_SIZE / 2
        const ecy = tgt.y + ENEMY_SIZE / 2
        let dx = ecx - pcx
        let dy = ecy - pcy
        const len = Math.hypot(dx, dy) || 1
        const angle = Math.atan2(dy, dx)

        if (MELEE_TYPES.includes(wType) || (isWarrior && !wType)) {
          // Ataque Melee
          slashes.value = [
            ...slashes.value,
            {
              id: bulletId++, // Reusamos ID counter
              x: pcx + Math.cos(angle) * 25,
              y: pcy + Math.sin(angle) * 25,
              angle: angle,
              born: now
            }
          ]

          // Daño en área melee
          let changed = false
          for (let i = elist.length - 1; i >= 0; i--) {
            const e = elist[i]
            const e_ecx = e.x + ENEMY_SIZE / 2
            const e_ecy = e.y + ENEMY_SIZE / 2
            const dist = Math.hypot(e_ecx - pcx, e_ecy - pcy)
            
            // Ángulo entre jugador y este enemigo específico
            const angleToEnemy = Math.atan2(e_ecy - pcy, e_ecx - pcx)
            // Diferencia angular con la dirección del ataque
            let angleDiff = Math.abs(angleToEnemy - angle)
            // Normalizar a [0, PI]
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff

            // Solo dañar si está en rango Y dentro de un arco de ~120 grados
            if (dist < MELEE_RANGE && angleDiff < Math.PI / 1.5) {
              const nh = e.hp - currentDamage
              if (nh <= 0) {
                newCoins.push({
                  id: coinId++,
                  x: e.x + 8,
                  y: e.y + 8,
                  value: 2 + Math.floor(Math.random() * 2),
                })
                elist.splice(i, 1)
              } else {
                elist[i] = { ...e, hp: nh }
              }
              changed = true
            }
          }
          if (changed) enemies.value = elist
        } else {
          // Ataque a Distancia
          bullets.value = [
            ...bullets.value,
            {
              id: bulletId++,
              x: pcx,
              y: pcy,
              vx: (dx / len) * BULLET_SPEED,
              vy: (dy / len) * BULLET_SPEED,
              born: now,
              damage: currentDamage
            },
          ]
        }
      }

      // Limpiar slashes antiguos
      if (slashes.value.length > 0) {
        const filteredSlashes = slashes.value.filter(s => now - s.born < MELEE_LIFETIME)
        if (filteredSlashes.length !== slashes.value.length) {
          slashes.value = filteredSlashes
        }
      }

      const moved = bullets.value
        .map((b) => ({
          ...b,
          x: b.x + b.vx,
          y: b.y + b.vy,
        }))
        .filter((b) => now - b.born < BULLET_LIFETIME_MS)
        .filter((b) => b.x >= -40 && b.x <= WORLD + 40 && b.y >= -40 && b.y <= WORLD + 40)

      const keptBullets = []

      for (const b of moved) {
        let hitIndex = -1
        for (let i = 0; i < elist.length; i++) {
          const e = elist[i]
          const ecx = e.x + ENEMY_SIZE / 2
          const ecy = e.y + ENEMY_SIZE / 2
          if (Math.hypot(b.x - ecx, b.y - ecy) < ENEMY_HIT_R + 6) {
            hitIndex = i
            break
          }
        }
        if (hitIndex < 0) {
          keptBullets.push(b)
          continue
        }
        const e = elist[hitIndex]
        const nh = e.hp - (b.damage || BULLET_DAMAGE)
        if (nh <= 0) {
          newCoins.push({
            id: coinId++,
            x: e.x + 8,
            y: e.y + 8,
            value: 2 + Math.floor(Math.random() * 2),
          })
          elist.splice(hitIndex, 1)
        } else {
          elist[hitIndex] = { ...e, hp: nh }
        }
      }

      bullets.value = keptBullets
      enemies.value = elist

      coins.value = newCoins
        .map((c) => {
          const cx = c.x + 10
          const cy = c.y + 10
          const dist = Math.hypot(cx - pcx, cy - pcy)
          if (dist < MAGNET_RANGE) {
            let dx = pcx - cx
            let dy = pcy - cy
            const len = Math.hypot(dx, dy) || 1
            return {
              ...c,
              x: c.x + (dx / len) * MAGNET_SPEED,
              y: c.y + (dy / len) * MAGNET_SPEED,
            }
          }
          return c
        })
        .filter((c) => {
          const cx = c.x + 10
          const cy = c.y + 10
          if (Math.hypot(cx - pcx, cy - pcy) < COIN_PICKUP_R) {
            sessionGold.value += c.value
            return false
          }
          return true
        })


      if (playerHp.value <= 0) {
        phase.value = 'gameover'
      } else if (enemies.value.length === 0 && phase.value === 'fighting') {
        phase.value = 'between'
      }
    }

    rafId = requestAnimationFrame(tick)
  }

  function startNextWave() {
    wave.value += 1
    playerHp.value = Math.min(
      playerMaxHp.value,
      playerHp.value + Math.floor(playerMaxHp.value * 0.12)
    )
    phase.value = 'fighting'
    spawnWave()
  }

  function beginFirstWave() {
    phase.value = 'fighting'
    spawnWave()
  }

  function onKeyDown(e) {
    const k = e.key.toLowerCase()
    if (k in keys) {
      if (focused.value && !locked.value) {
        e.preventDefault()
      }
      if (!locked.value) {
        keys[k] = true
      }
    }
  }

  function onKeyUp(e) {
    const k = e.key.toLowerCase()
    if (k in keys) {
      keys[k] = false
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(tick)
    arenaRef.value?.focus()
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    cancelAnimationFrame(rafId)
  })

  return {
    arenaRef,
    x,
    y,
    focused,
    moving,
    locked,
    PLAYER_SIZE,
    WORLD,
    ENEMY_SIZE,
    wave,
    phase,
    playerHp,
    playerMaxHp,
    sessionGold,
    enemies,
    bullets,
    coins,
    slashes,
    startNextWave,
    beginFirstWave,
  }
}
