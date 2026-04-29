import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import { WORLD_EDGE as BASE_WORLD } from '../constants/world'

const PLAYER_SIZE = 40
const MOVE_SPEED = 7
const MELEE_TYPES = ['daga', 'espada', 'hacha']
const MELEE_RANGE = 135
const MELEE_LIFETIME = 250
const COIN_PICKUP_R = 52
const BASE_CONTACT_DAMAGE = 10
const CONTACT_COOLDOWN_MS = 480
const BULLET_SPEED = 8
const BULLET_LIFETIME_MS = 2200
const FIRE_INTERVAL_MS = 320
const BULLET_DAMAGE = 12
const ENEMY_SIZE = 36
const ENEMY_HIT_R = 16
const MAGNET_RANGE = 120
const MAGNET_SPEED = 5
const TOTAL_SECTIONS = 8
const INTERMEDIATE_SECTIONS = 6
const WAVES_PER_SECTION = 20

const JAVA_ROUTE_STEPS = ['BAJAR', 'IZQUIERDA', 'BAJAR', 'DERECHA']
const PHP_ROUTE_STEPS = ['SUBIR', 'DERECHA', 'SUBIR', 'IZQUIERDA']

function resolveOptionValue(option, fallback = '') {
  if (option && typeof option === 'object' && 'value' in option) {
    return option.value ?? fallback
  }
  return option ?? fallback
}

function normalizeKingdomName(value) {
  return String(value || '').trim().toLowerCase()
}

function isPhpKingdom(value) {
  const normalized = normalizeKingdomName(value)
  return normalized.includes('php') || normalized.includes('peachepe') || normalized === '1'
}


/** Combate en arena por rondas: WASD, disparo automático al enemigo más cercano, monedas al eliminar. */
export function useArenaCombat(options = {}) {
  const WORLD_W = Number.isFinite(options.worldWidth)
    ? Number(options.worldWidth)
    : (Number.isFinite(options.worldSize) ? Number(options.worldSize) : BASE_WORLD)
  const WORLD_H = Number.isFinite(options.worldHeight)
    ? Number(options.worldHeight)
    : (Number.isFinite(options.worldSize) ? Number(options.worldSize) : BASE_WORLD)
  const startX = options.startX ?? WORLD_W / 2
  const startY = options.startY ?? WORLD_H / 2
  const equippedWeapon = options.equippedWeapon ?? ref(null)
  const characterClass = options.characterClass ?? ref('')
  const debugImmortal = options.debugImmortal === true
  const debugMaxDamage = options.debugMaxDamage === true
  const debugDamage = Number.isFinite(options.debugDamage) ? Number(options.debugDamage) : 99999

  const arenaRef = ref(null)
  const x = ref(startX)
  const y = ref(startY)
  const focused = ref(false)
  const moving = ref(false)
  const locked = ref(false)

  const keys = { w: false, a: false, s: false, d: false }

  const wave = ref(1)
  const section = ref(1)
  const sectionWave = ref(1)
  const routeInstruction = ref('INICIO')
  const startKingdom = ref('Java')
  const targetKingdom = ref('PHP')
  const enemyFaction = ref('php')
  /** idle (sin run aún) | fighting | between | gameover */
  const phase = ref('idle')
  const playerHp = ref(100)
  const playerMaxHp = ref(100)
  /** Oro recogido en esta sesión de arena (antes de sincronizar con API) */
  const sessionGold = ref(0)

  const enemies = shallowRef([])
  const bullets = shallowRef([])
  const enemyBullets = shallowRef([])
  const coins = shallowRef([])
  const slashes = shallowRef([])

  let enemyId = 1
  let bulletId = 1
  let coinId = 1
  let lastFireAt = 0
  let lastContactAt = 0
  let rafId = null

  function resolveRouteContext() {
    const kingdomRaw = resolveOptionValue(options.startKingdom, startKingdom.value)
    const isPhpStart = isPhpKingdom(kingdomRaw)
    startKingdom.value = isPhpStart ? 'PHP' : 'Java'
    targetKingdom.value = isPhpStart ? 'Java' : 'PHP'
    enemyFaction.value = isPhpStart ? 'java' : 'php'
    const pattern = isPhpStart ? PHP_ROUTE_STEPS : JAVA_ROUTE_STEPS
    const idx = (section.value - 2) % pattern.length
    routeInstruction.value = section.value <= 1 ? 'SALIDA DEL REINO' : section.value >= TOTAL_SECTIONS ? 'TRONO ENEMIGO' : pattern[idx]
    return { isPhpStart, pattern }
  }

  function spawnWave() {
    resolveRouteContext()
    const sectionFactor = section.value - 1
    const waveFactor = (sectionWave.value - 1) / WAVES_PER_SECTION
    const intensity = sectionFactor + waveFactor
    const n = Math.min(56, 6 + sectionFactor * 3 + sectionWave.value)
    const list = []
    const pad = 80

    const isFinalBossSection = section.value >= TOTAL_SECTIONS
    if (isFinalBossSection) {
      const hp = 2200 + sectionFactor * 350
      list.push({
        id: enemyId++,
        x: WORLD_W / 2 - 40,
        y: pad,
        hp,
        maxHp: hp,
        speed: 1.35,
        size: 132,
        type: 'boss',
        fireInterval: 1600,
        lastFireAt: performance.now() + 1100,
      })
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6
        list.push({
          id: enemyId++,
          x: WORLD_W / 2 + Math.cos(angle) * 180,
          y: WORLD_H / 2 + Math.sin(angle) * 180,
          hp: 130 + sectionFactor * 26,
          maxHp: 130 + sectionFactor * 26,
          speed: 2.4 + waveFactor,
          size: ENEMY_SIZE,
          type: i % 2 === 0 ? 'ranger' : 'mage',
          fireInterval: i % 2 === 0 ? 1900 : 2400,
          lastFireAt: performance.now() + 300 + i * 140,
        })
      }
      enemies.value = list
      return
    }

    for (let i = 0; i < n; i++) {
      const edge = Math.floor(Math.random() * 4)
      let ex
      let ey
      if (edge === 0) {
        ex = Math.random() * (WORLD_W - pad * 2) + pad
        ey = pad
      } else if (edge === 1) {
        ex = WORLD_W - pad
        ey = Math.random() * (WORLD_H - pad * 2) + pad
      } else if (edge === 2) {
        ex = Math.random() * (WORLD_W - pad * 2) + pad
        ey = WORLD_H - pad
      } else {
        ex = pad
        ey = Math.random() * (WORLD_H - pad * 2) + pad
      }
      const roll = Math.random()
      const type = roll < 0.55 ? 'melee' : roll < 0.8 ? 'ranger' : 'mage'
      const hpBase = type === 'melee' ? 34 : type === 'ranger' ? 30 : 26
      const speedBase = type === 'melee' ? 3.7 : type === 'ranger' ? 2.6 : 2.2
      list.push({
        id: enemyId++,
        x: ex,
        y: ey,
        hp: Math.round(hpBase + intensity * 22),
        maxHp: Math.round(hpBase + intensity * 22),
        speed: speedBase + sectionFactor * 0.16 + waveFactor * 0.5,
        size: ENEMY_SIZE,
        type,
        fireInterval: type === 'melee' ? null : type === 'ranger' ? 1800 - sectionFactor * 55 : 2400 - sectionFactor * 45,
        lastFireAt: performance.now() + Math.random() * 1200,
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
      const esize = e.size || ENEMY_SIZE
      const ecx = e.x + esize / 2
      const ecy = e.y + esize / 2
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
      const W = WORLD_W - PLAYER_SIZE
      const H = WORLD_H - PLAYER_SIZE
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
        const esize = e.size || ENEMY_SIZE
        const ecx = e.x + esize / 2
        const ecy = e.y + esize / 2
        let dx = pcx - ecx
        let dy = pcy - ecy
        const len = Math.hypot(dx, dy) || 1
        dx /= len
        dy /= len
        let nx = e.x + dx * e.speed
        let ny = e.y + dy * e.speed
        nx = Math.max(0, Math.min(WORLD_W - esize, nx))
        ny = Math.max(0, Math.min(WORLD_H - esize, ny))
        
        // Enemy firing logic
        if (e.fireInterval && now - e.lastFireAt > e.fireInterval) {
          e.lastFireAt = now
          const fireX = e.x + esize / 2
          const fireY = e.y + esize / 2
          const fdx = pcx - fireX
          const fdy = pcy - fireY
          const flen = Math.hypot(fdx, fdy) || 1
          const fAngle = Math.atan2(fdy, fdx)
          
          const newEBullets = []
          if (e.type === 'boss' || e.type === 'mage') {
            // 3 projectiles spread
            for (let i = -1; i <= 1; i++) {
              const ang = fAngle + i * 0.25
              newEBullets.push({
                id: bulletId++,
                x: fireX,
                y: fireY,
                vx: Math.cos(ang) * (e.type === 'boss' ? 5.2 : 4.4),
                vy: Math.sin(ang) * (e.type === 'boss' ? 5.2 : 4.4),
                born: now,
                damage: e.type === 'boss' ? 24 : 17,
                faction: enemyFaction.value,
                symbol: enemyFaction.value === 'java' ? '☕' : '</>',
              })
            }
          } else {
            // Single projectile
            newEBullets.push({
              id: bulletId++,
              x: fireX,
              y: fireY,
              vx: (fdx / flen) * 4.8,
              vy: (fdy / flen) * 4.8,
              born: now,
              damage: 14,
              faction: enemyFaction.value,
              symbol: enemyFaction.value === 'java' ? '☕' : '{}',
            })
          }
          enemyBullets.value = [...enemyBullets.value, ...newEBullets]
        }

        return { ...e, x: nx, y: ny }
      })
      enemies.value = elist

      for (const e of elist) {
        const esize = e.size || ENEMY_SIZE
        const ecx = e.x + esize / 2
        const ecy = e.y + esize / 2
        const dist = Math.hypot(ecx - pcx, ecy - pcy)
        if (dist < (esize / 2 + 10) && now - lastContactAt > CONTACT_COOLDOWN_MS) {
          const sectionContactDamage = BASE_CONTACT_DAMAGE + (section.value - 1) * 2
          if (!debugImmortal) {
            playerHp.value = Math.max(0, playerHp.value - sectionContactDamage)
          }
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
      }

      const tgt = nearestEnemy(px, py)

      const wType = (equippedWeapon.value?.weaponType || '').toLowerCase()
      const wName = (equippedWeapon.value?.name || '').toLowerCase()
      // Fallback: si weaponType está vacío pero el nombre contiene el tipo
      const effectiveType = wType || (wName.includes('arco') ? 'arco' : wName.includes('varita') ? 'varita' : wName.includes('daga') ? 'daga' : wName.includes('hacha') ? 'hacha' : wName.includes('espada') ? 'espada' : '')
      const charClass = (characterClass.value || '').toLowerCase()
      const isWarrior = charClass.includes('guerrero') || charClass.includes('warrior')

      // Ajustar intervalo y daño según tipo efectivo del arma
      if (effectiveType === 'daga') currentFireInterval = 250
      else if (effectiveType === 'arco') currentFireInterval = 280
      else if (effectiveType === 'varita') currentFireInterval = 320
      else if (effectiveType === 'espada') currentFireInterval = 650
      else if (effectiveType === 'hacha') currentFireInterval = 850

      // Reducir daño melee un poco para equilibrar
      if (MELEE_TYPES.includes(effectiveType)) {
        currentDamage = Math.ceil(currentDamage * 0.75)
      }
      if (debugMaxDamage) {
        currentDamage = debugDamage
      }

      if (tgt && now - lastFireAt >= currentFireInterval) {
        lastFireAt = now
        const tSize = tgt.size || ENEMY_SIZE
        const ecx = tgt.x + tSize / 2
        const ecy = tgt.y + tSize / 2
        let dx = ecx - pcx
        let dy = ecy - pcy
        const len = Math.hypot(dx, dy) || 1
        const angle = Math.atan2(dy, dx)

        if (MELEE_TYPES.includes(effectiveType) || (isWarrior && !equippedWeapon.value)) {
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
            const esize = e.size || ENEMY_SIZE
            const e_ecx = e.x + esize / 2
            const e_ecy = e.y + esize / 2
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
        .filter((b) => b.x >= -40 && b.x <= WORLD_W + 40 && b.y >= -40 && b.y <= WORLD_H + 40)

      const keptBullets = []

      for (const b of moved) {
        let hitIndex = -1
        for (let i = 0; i < elist.length; i++) {
          const e = elist[i]
          const esize = e.size || ENEMY_SIZE
          const ecx = e.x + esize / 2
          const ecy = e.y + esize / 2
          if (Math.hypot(b.x - ecx, b.y - ecy) < (esize / 2 + 6)) {
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

      // Enemy Bullets logic
      const movedE = enemyBullets.value
        .map((b) => ({
          ...b,
          x: b.x + b.vx,
          y: b.y + b.vy,
        }))
        .filter((b) => now - b.born < 4000) // Longer lifetime for boss bullets
        .filter((b) => b.x >= -100 && b.x <= WORLD_W + 100 && b.y >= -100 && b.y <= WORLD_H + 100)

      const keptEBullets = []
      for (const b of movedE) {
        const dist = Math.hypot(b.x - pcx, b.y - pcy)
        if (dist < 25) { // Hit player
          if (!debugImmortal) {
            playerHp.value = Math.max(0, playerHp.value - (b.damage || 15))
          }
          // No push to keptEBullets = bullet disappears
        } else {
          keptEBullets.push(b)
        }
      }
      enemyBullets.value = keptEBullets

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
        if (section.value >= TOTAL_SECTIONS) {
          phase.value = 'victory'
          enemies.value = []
          bullets.value = []
          enemyBullets.value = []
          options.onVictory?.()
        } else {
          phase.value = 'between'
        }
      }
    }

    rafId = requestAnimationFrame(tick)
  }

  function startNextWave() {
    if (sectionWave.value >= WAVES_PER_SECTION) {
      section.value = Math.min(TOTAL_SECTIONS, section.value + 1)
      sectionWave.value = 1
    } else {
      sectionWave.value += 1
    }
    wave.value = sectionWave.value
    resolveRouteContext()
    playerHp.value = Math.min(
      playerMaxHp.value,
      playerHp.value + Math.floor(playerMaxHp.value * 0.12)
    )
    phase.value = 'fighting'
    spawnWave()
  }

  function beginFirstWave() {
    section.value = 1
    sectionWave.value = 1
    wave.value = 1
    resolveRouteContext()
    phase.value = 'fighting'
    spawnWave()
  }

  function resumeAt(sectionValue, waveValue) {
    const safeSection = Math.min(TOTAL_SECTIONS, Math.max(1, Number(sectionValue) || 1))
    const safeWave = Math.min(WAVES_PER_SECTION, Math.max(1, Number(waveValue) || 1))
    section.value = safeSection
    sectionWave.value = safeWave
    wave.value = safeWave
    resolveRouteContext()
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
    WORLD: WORLD_W,
    WORLD_W,
    WORLD_H,
    ENEMY_SIZE,
    wave,
    section,
    sectionWave,
    routeInstruction,
    startKingdom,
    targetKingdom,
    enemyFaction,
    TOTAL_SECTIONS,
    INTERMEDIATE_SECTIONS,
    WAVES_PER_SECTION,
    phase,
    playerHp,
    playerMaxHp,
    sessionGold,
    enemies,
    bullets,
    enemyBullets,
    coins,
    slashes,
    startNextWave,
    beginFirstWave,
    resumeAt,
  }
}
