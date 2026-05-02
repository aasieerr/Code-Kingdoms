import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import { WORLD_EDGE as BASE_WORLD } from '../constants/world'

const PLAYER_SIZE = 40
const BASE_MOVE_SPEED = 3.8
const MELEE_TYPES = ['daga', 'espada', 'hacha']
const MELEE_RANGE = 135
const MELEE_LIFETIME = 250
const COIN_PICKUP_R = 52
const BASE_CONTACT_DAMAGE = 10
const CONTACT_COOLDOWN_MS = 480
const BULLET_SPEED = 6.5
const BULLET_LIFETIME_MS = 2200
const FIRE_INTERVAL_MS = 320
const BULLET_DAMAGE = 12
const ENEMY_SIZE = 36
const ENEMY_HIT_R = 16
const MAGNET_RANGE = 120
const MAGNET_SPEED = 2.2
const TOTAL_SECTIONS = 7
const INTERMEDIATE_SECTIONS = 6
const WAVES_PER_SECTION = 10
const GHOST_TANGIBLE_MS = 2000
const GHOST_INTANGIBLE_MS = 3000
const CORRUPTED_ZONE_LIFETIME_MS = 4200
const SECTION_GROWTH = 0.34
const WAVE_GROWTH = 0.035

const ROUND_ENEMY_CONFIG = [
  { garbage_collector: 3, thread_spammer: 2 },
  { global_ghost: 3, dependency_injector: 2, thread_spammer: 2 },
  { garbage_collector: 3, boilerplate_guard: 2, legacy_monolith: 1, thread_spammer: 3 },
  { global_ghost: 3, spaghetti_runner: 3, dependency_injector: 3, thread_spammer: 2 },
  { dependency_injector: 4, composer_update: 2, spaghetti_runner: 4, boilerplate_guard: 2 },
  { legacy_monolith: 1, dependency_injector: 5, composer_update: 3, spaghetti_runner: 5, boilerplate_guard: 2 },
]

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

function sectionMultiplier(sectionValue) {
  return 1 + Math.max(0, sectionValue - 1) * SECTION_GROWTH
}

function waveMultiplier(waveValue) {
  return 1 + Math.max(0, waveValue - 1) * WAVE_GROWTH
}

function earlyWaveMultiplier(sectionValue, waveValue) {
  if (sectionValue !== 1) return 1
  if (waveValue <= 2) return 0.45
  if (waveValue <= 4) return 0.65
  if (waveValue <= 6) return 0.82
  return 1
}

function earlyWaveEnemyCountMultiplier(sectionValue, waveValue) {
  if (sectionValue !== 1) return 1
  if (waveValue <= 2) return 0.5
  if (waveValue <= 4) return 0.7
  if (waveValue <= 6) return 0.85
  return 1
}

function typeBaseStats(type) {
  switch (type) {
    case 'garbage_collector':
      return { hp: 220, speed: 1.2, contactDamage: 32 }
    case 'boilerplate_guard':
      return { hp: 170, speed: 2.5, contactDamage: 16 }
    case 'thread_spammer':
      return { hp: 95, speed: 1.7, contactDamage: 10, fireInterval: 1800, bulletDamage: 14 }
    case 'legacy_monolith':
      return { hp: 720, speed: 0.9, contactDamage: 24, size: 82 }
    case 'microservice':
      return { hp: 34, speed: 4.7, contactDamage: 8 }
    case 'global_ghost':
      return { hp: 120, speed: 2.3, contactDamage: 15 }
    case 'spaghetti_runner':
      return { hp: 80, speed: 4.3, contactDamage: 17 }
    case 'dependency_injector':
      return { hp: 130, speed: 2.1, contactDamage: 10, fireInterval: 2300, bulletDamage: 8 }
    case 'composer_update':
      return { hp: 100, speed: 2.1, contactDamage: 0 }
    default:
      return { hp: 100, speed: 2.3, contactDamage: BASE_CONTACT_DAMAGE }
  }
}

function randomSpawnEdgePosition(worldW, worldH, pad = 80) {
  const edge = Math.floor(Math.random() * 4)
  if (edge === 0) return { x: Math.random() * (worldW - pad * 2) + pad, y: pad }
  if (edge === 1) return { x: worldW - pad, y: Math.random() * (worldH - pad * 2) + pad }
  if (edge === 2) return { x: Math.random() * (worldW - pad * 2) + pad, y: worldH - pad }
  return { x: pad, y: Math.random() * (worldH - pad * 2) + pad }
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
  const characterRace = options.characterRace ?? ref('')

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
    const multiplier = sectionMultiplier(section.value) * waveMultiplier(sectionWave.value)
    const earlyMult = earlyWaveMultiplier(section.value, sectionWave.value)
    const enemyCountMult = earlyWaveEnemyCountMultiplier(section.value, sectionWave.value)
    const list = []
    const pad = 80

    const isFinalBossSection = section.value >= TOTAL_SECTIONS
    if (isFinalBossSection) {
      const hp = Math.round(2600 * multiplier)
      list.push({
        id: enemyId++,
        x: WORLD_W / 2 - 40,
        y: pad,
        hp,
        maxHp: hp,
        speed: 1.55,
        size: 132,
        type: 'boss',
        contactDamage: Math.round(26 * multiplier),
        fireInterval: 1600,
        bulletDamage: Math.round(24 * multiplier),
        lastFireAt: performance.now() + 1100,
      })
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8
        const guardHp = Math.round((i % 2 === 0 ? 180 : 140) * multiplier)
        list.push({
          id: enemyId++,
          x: WORLD_W / 2 + Math.cos(angle) * 180,
          y: WORLD_H / 2 + Math.sin(angle) * 180,
          hp: guardHp,
          maxHp: guardHp,
          speed: i % 2 === 0 ? 2.6 : 2.2,
          size: ENEMY_SIZE,
          type: i % 2 === 0 ? 'boilerplate_guard' : 'dependency_injector',
          contactDamage: Math.round((i % 2 === 0 ? 16 : 10) * multiplier),
          fireInterval: i % 2 === 0 ? null : 2200,
          bulletDamage: i % 2 === 0 ? 0 : Math.round(8 * multiplier),
          lastFireAt: performance.now() + 300 + i * 140,
        })
      }
      enemies.value = list
      return
    }

    const cfg = ROUND_ENEMY_CONFIG[Math.max(0, Math.min(INTERMEDIATE_SECTIONS - 1, section.value - 1))]
    const types = Object.entries(cfg)
    for (const [type, count] of types) {
      const adjustedCount = Math.max(1, Math.round(count * enemyCountMult))
      for (let i = 0; i < adjustedCount; i++) {
        const base = typeBaseStats(type)
        const spawnPos = randomSpawnEdgePosition(WORLD_W, WORLD_H, pad)
        const hp = Math.max(24, Math.round(base.hp * multiplier * earlyMult))
        const fireInterval = base.fireInterval
          ? Math.max(1100, Math.round((base.fireInterval * (1 / multiplier)) / earlyMult))
          : null
        list.push({
          id: enemyId++,
          x: spawnPos.x,
          y: spawnPos.y,
          hp,
          maxHp: hp,
          speed: base.speed,
          size: base.size || ENEMY_SIZE,
          type,
          contactDamage: Math.max(3, Math.round((base.contactDamage || BASE_CONTACT_DAMAGE) * multiplier * earlyMult)),
          fireInterval,
          bulletDamage: Math.max(2, Math.round((base.bulletDamage || 12) * multiplier * earlyMult)),
          lastFireAt: performance.now() + Math.random() * 1200,
          zigSeed: Math.random() * Math.PI * 2,
          ghostPhaseOffset: Math.random() * (GHOST_INTANGIBLE_MS + GHOST_TANGIBLE_MS),
          auraRange: 170,
        })
      }
    }
    enemies.value = list
  }

  function nearestEnemy(px, py) {
    let best = null
    let bestD = Infinity
    const pcx = px + PLAYER_SIZE / 2
    const pcy = py + PLAYER_SIZE / 2
    const now = performance.now()
    for (const e of enemies.value) {
      if (e.type === 'global_ghost') {
        const cycle = GHOST_INTANGIBLE_MS + GHOST_TANGIBLE_MS
        const localT = (now + (e.ghostPhaseOffset || 0)) % cycle
        if (localT < GHOST_INTANGIBLE_MS) continue
      }
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

  function resolveMovementSpeed() {
    const klass = String(characterClass.value || '').toLowerCase()
    const race = String(characterRace.value || '').toLowerCase()
    let speed = BASE_MOVE_SPEED

    if (klass.includes('guerrero') || klass.includes('warrior') || klass.includes('paladin')) speed -= 0.4
    else if (klass.includes('mago') || klass.includes('mage') || klass.includes('wizard')) speed += 0.1
    else if (klass.includes('arquero') || klass.includes('archer') || klass.includes('hunter')) speed += 0.3
    else if (klass.includes('asesino') || klass.includes('rogue') || klass.includes('assassin')) speed += 0.5

    // Raza/facción base: PHP ligeramente más ágil, Java algo más pesado.
    if (isPhpKingdom(race)) speed += 0.25
    else speed -= 0.15

    return Math.max(2.8, Math.min(5.2, speed))
  }

  function tick() {
    const now = performance.now()

    if (!locked.value && arenaRef.value) {
      const W = WORLD_W - PLAYER_SIZE
      const H = WORLD_H - PLAYER_SIZE
      const moveSpeed = resolveMovementSpeed()
      if (keys.w) {
        y.value = Math.max(0, y.value - moveSpeed)
      }
      if (keys.s) {
        y.value = Math.min(H, y.value + moveSpeed)
      }
      if (keys.a) {
        x.value = Math.max(0, x.value - moveSpeed)
      }
      if (keys.d) {
        x.value = Math.min(W, x.value + moveSpeed)
      }
      moving.value = Object.values(keys).some(Boolean)
    }

    if (phase.value === 'fighting') {
      const px = x.value
      const py = y.value
      const pcx = px + PLAYER_SIZE / 2
      const pcy = py + PLAYER_SIZE / 2

      const supportHealMap = new Map()
      for (const supporter of enemies.value) {
        if (supporter.type !== 'composer_update') continue
        for (const ally of enemies.value) {
          if (ally.id === supporter.id) continue
          const d = Math.hypot((ally.x - supporter.x), (ally.y - supporter.y))
          if (d <= (supporter.auraRange || 170)) {
            supportHealMap.set(ally.id, (supportHealMap.get(ally.id) || 0) + Math.max(2, ally.maxHp * 0.012))
          }
        }
      }

      let elist = enemies.value.map((e) => {
        const esize = e.size || ENEMY_SIZE
        const ecx = e.x + esize / 2
        const ecy = e.y + esize / 2
        let dx = pcx - ecx
        let dy = pcy - ecy
        const len = Math.hypot(dx, dy) || 1
        dx /= len
        dy /= len
        let nx = e.x
        let ny = e.y

        if (e.type === 'dependency_injector' || e.type === 'thread_spammer') {
          const preferred = 260
          if (len > preferred + 20) {
            nx = e.x + dx * e.speed
            ny = e.y + dy * e.speed
          } else if (len < preferred - 20) {
            nx = e.x - dx * e.speed
            ny = e.y - dy * e.speed
          }
        } else if (e.type === 'composer_update') {
          const retreat = 280
          if (len < retreat) {
            nx = e.x - dx * e.speed
            ny = e.y - dy * e.speed
          } else {
            nx = e.x + dx * (e.speed * 0.35)
            ny = e.y + dy * (e.speed * 0.35)
          }
        } else if (e.type === 'spaghetti_runner') {
          const zigAngle = now / 140 + (e.zigSeed || 0)
          const sideX = -dy
          const sideY = dx
          nx = e.x + dx * e.speed + sideX * Math.sin(zigAngle) * 2.2
          ny = e.y + dy * e.speed + sideY * Math.sin(zigAngle) * 2.2
        } else {
          nx = e.x + dx * e.speed
          ny = e.y + dy * e.speed
        }

        nx = Math.max(0, Math.min(WORLD_W - esize, nx))
        ny = Math.max(0, Math.min(WORLD_H - esize, ny))
        let nextEnemy = { ...e, x: nx, y: ny }

        const heal = supportHealMap.get(e.id) || 0
        if (heal > 0 && e.hp > 0) {
          nextEnemy.hp = Math.min(nextEnemy.maxHp, nextEnemy.hp + heal)
        }
        
        // Enemy firing logic
        if (e.fireInterval && now - e.lastFireAt > e.fireInterval) {
          nextEnemy.lastFireAt = now
          const fireX = e.x + esize / 2
          const fireY = e.y + esize / 2
          const fdx = pcx - fireX
          const fdy = pcy - fireY
          const flen = Math.hypot(fdx, fdy) || 1
          const fAngle = Math.atan2(fdy, fdx)
          
          const newEBullets = []
          if (e.type === 'boss' || e.type === 'thread_spammer') {
            // Burst of 3 projectiles
            for (let i = -1; i <= 1; i++) {
              const ang = fAngle + i * 0.25
              newEBullets.push({
                id: bulletId++,
                x: fireX,
                y: fireY,
                vx: Math.cos(ang) * (e.type === 'boss' ? 5.4 : 6),
                vy: Math.sin(ang) * (e.type === 'boss' ? 5.4 : 6),
                born: now,
                damage: e.bulletDamage || (e.type === 'boss' ? 24 : 17),
                faction: enemyFaction.value,
                symbol: enemyFaction.value === 'java' ? '☕' : '</>',
              })
            }
          } else if (e.type === 'dependency_injector') {
            newEBullets.push({
              id: bulletId++,
              x: pcx + (Math.random() * 140 - 70),
              y: pcy + (Math.random() * 140 - 70),
              vx: 0,
              vy: 0,
              born: now,
              damage: e.bulletDamage || 8,
              faction: enemyFaction.value,
              symbol: '⊗',
              isZone: true,
              radius: 58,
              expiresAt: now + CORRUPTED_ZONE_LIFETIME_MS,
            })
          } else {
            // Single projectile
            newEBullets.push({
              id: bulletId++,
              x: fireX,
              y: fireY,
              vx: (fdx / flen) * 4.8,
              vy: (fdy / flen) * 4.8,
              born: now,
              damage: e.bulletDamage || 14,
              faction: enemyFaction.value,
              symbol: enemyFaction.value === 'java' ? '☕' : '{}',
            })
          }
          enemyBullets.value = [...enemyBullets.value, ...newEBullets]
        }

        return nextEnemy
      })
      enemies.value = elist

      for (const e of elist) {
        const esize = e.size || ENEMY_SIZE
        const ecx = e.x + esize / 2
        const ecy = e.y + esize / 2
        if (e.type === 'garbage_collector') {
          const dragDist = Math.hypot(ecx - pcx, ecy - pcy)
          if (dragDist < 210 && dragDist > 0) {
            const pullStrength = 0.65 * (1 - dragDist / 210)
            x.value = Math.max(0, Math.min(WORLD_W - PLAYER_SIZE, x.value + ((ecx - pcx) / dragDist) * pullStrength))
            y.value = Math.max(0, Math.min(WORLD_H - PLAYER_SIZE, y.value + ((ecy - pcy) / dragDist) * pullStrength))
          }
        }

        const dist = Math.hypot(ecx - pcx, ecy - pcy)
        if (dist < (esize / 2 + 10) && now - lastContactAt > CONTACT_COOLDOWN_MS) {
          const sectionContactDamage = Math.max(1, Math.round(e.contactDamage || BASE_CONTACT_DAMAGE))
          playerHp.value = Math.max(0, playerHp.value - sectionContactDamage)
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
              if (e.type === 'global_ghost') {
                const cycle = GHOST_INTANGIBLE_MS + GHOST_TANGIBLE_MS
                const localT = (now + (e.ghostPhaseOffset || 0)) % cycle
                if (localT < GHOST_INTANGIBLE_MS) continue
              }
              if (e.type === 'boilerplate_guard' && angleDiff < Math.PI / 2.1) {
                continue
              }
              const nh = e.hp - currentDamage
              if (nh <= 0) {
                newCoins.push({
                  id: coinId++,
                  x: e.x + 8,
                  y: e.y + 8,
                  value: 2 + Math.floor(Math.random() * 2),
                })
                if (e.type === 'legacy_monolith') {
                  for (let j = 0; j < 4; j++) {
                    const ang = (Math.PI * 2 * j) / 4
                    const base = typeBaseStats('microservice')
                    const mhp = Math.round(base.hp * sectionMultiplier(section.value))
                    elist.push({
                      id: enemyId++,
                      x: e.x + Math.cos(ang) * 24,
                      y: e.y + Math.sin(ang) * 24,
                      hp: mhp,
                      maxHp: mhp,
                      speed: base.speed,
                      size: 22,
                      type: 'microservice',
                      contactDamage: Math.round(base.contactDamage * sectionMultiplier(section.value)),
                      fireInterval: null,
                      bulletDamage: 0,
                      lastFireAt: now,
                    })
                  }
                }
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
        if (e.type === 'global_ghost') {
          const cycle = GHOST_INTANGIBLE_MS + GHOST_TANGIBLE_MS
          const localT = (now + (e.ghostPhaseOffset || 0)) % cycle
          if (localT < GHOST_INTANGIBLE_MS) {
            keptBullets.push(b)
            continue
          }
        }
        if (e.type === 'boilerplate_guard') {
          const esize = e.size || ENEMY_SIZE
          const ecx = e.x + esize / 2
          const ecy = e.y + esize / 2
          const toPlayerX = pcx - ecx
          const toPlayerY = pcy - ecy
          const toBulletX = b.x - ecx
          const toBulletY = b.y - ecy
          const frontDot = toPlayerX * toBulletX + toPlayerY * toBulletY
          if (frontDot > 0) {
            continue
          }
        }
        const nh = e.hp - (b.damage || BULLET_DAMAGE)
        if (nh <= 0) {
          newCoins.push({
            id: coinId++,
            x: e.x + 8,
            y: e.y + 8,
            value: 2 + Math.floor(Math.random() * 2),
          })
          if (e.type === 'legacy_monolith') {
            for (let i = 0; i < 4; i++) {
              const ang = (Math.PI * 2 * i) / 4
              const base = typeBaseStats('microservice')
              const mhp = Math.round(base.hp * sectionMultiplier(section.value))
              elist.push({
                id: enemyId++,
                x: e.x + Math.cos(ang) * 24,
                y: e.y + Math.sin(ang) * 24,
                hp: mhp,
                maxHp: mhp,
                speed: base.speed,
                size: 22,
                type: 'microservice',
                contactDamage: Math.round(base.contactDamage * sectionMultiplier(section.value)),
                fireInterval: null,
                bulletDamage: 0,
                lastFireAt: now,
              })
            }
          }
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
          x: b.x + (b.vx || 0),
          y: b.y + (b.vy || 0),
        }))
        .filter((b) => (b.isZone ? now <= (b.expiresAt || 0) : now - b.born < 4000))
        .filter((b) => b.x >= -100 && b.x <= WORLD_W + 100 && b.y >= -100 && b.y <= WORLD_H + 100)

      const keptEBullets = []
      for (const b of movedE) {
        const dist = Math.hypot(b.x - pcx, b.y - pcy)
        const hitRadius = b.isZone ? (b.radius || 58) : 25
        if (dist < hitRadius) {
          playerHp.value = Math.max(0, playerHp.value - (b.damage || 15))
          if (b.isZone) {
            const pxDir = (pcx - b.x) / (dist || 1)
            const pyDir = (pcy - b.y) / (dist || 1)
            x.value = Math.max(0, Math.min(WORLD_W - PLAYER_SIZE, x.value + pxDir * 0.8))
            y.value = Math.max(0, Math.min(WORLD_H - PLAYER_SIZE, y.value + pyDir * 0.8))
            keptEBullets.push(b)
          }
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
