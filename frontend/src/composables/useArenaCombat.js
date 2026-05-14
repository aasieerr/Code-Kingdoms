import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import { WORLD_EDGE as BASE_WORLD } from '../constants/world'
import { getArenaWalkBoundsRect } from '../constants/arenaWalkBounds'
import {
  BASE_CONTACT_DAMAGE,
  ENEMY_SIZE,
  getRoundConfig,
  typeBaseStats,
  xpForEnemyType,
} from './arenaEnemies'
import {
  BASE_MOVE_SPEED,
  BULLET_DAMAGE,
  BULLET_LIFETIME_MS,
  BULLET_SPEED,
  COIN_PICKUP_R,
  CONTACT_COOLDOWN_MS,
  DEPENDENCY_MARK_DURATION_MS,
  DEPENDENCY_MARK_MOVE_THRESHOLD,
  DEPENDENCY_MARK_PUSH_PX,
  DEPENDENCY_MARK_RANGE,
  earlyWaveEnemyCountMultiplier,
  earlyWaveMultiplier,
  FIRE_INTERVAL_MS,
  INTERMEDIATE_SECTIONS,
  isJavaBossShielded,
  isJavaFinalBoss,
  isPhpKingdom,
  JAVA_BOSS_SHIELD_GAP_MS,
  JAVA_BOSS_SHIELD_MS,
  JAVA_ROUTE_STEPS,
  LEVEL_DAMAGE_BONUS,
  MAGNET_RANGE,
  MAGNET_SPEED,
  maxWavesForSection,
  MELEE_LIFETIME,
  MELEE_RANGE,
  MELEE_TYPES,
  PHP_ROUTE_STEPS,
  PLAYER_COLLISION_SIZE,
  PLAYER_SIZE,
  randomSpawnEdgePosition,
  resolveOptionValue,
  sectionMultiplier,
  TOTAL_SECTIONS,
  waveMultiplier,
  WAVES_PER_SECTION,
} from './arenaCombatShared'

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
  const characterLevel = options.characterLevel ?? ref(1)
  const characterArmor = options.characterArmor ?? ref(0)
  const characterAttackSpeed = options.characterAttackSpeed ?? ref(1)
  const characterMoveSpeed = options.characterMoveSpeed ?? ref(1)
  const characterBaseDamage = options.characterBaseDamage ?? ref(BULLET_DAMAGE)
  const isWalkable = typeof options.isWalkable === 'function' ? options.isWalkable : null
  const getWalkMapName = typeof options.getWalkMapName === 'function' ? options.getWalkMapName : () => ''

  const arenaRef = ref(null)
  const x = ref(startX)
  const y = ref(startY)
  const focused = ref(false)
  const moving = ref(false)
  const locked = ref(false)
  const playerFacing = ref('s')

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
  const dependencyMark = ref(null)

  function getWalkRectForSpawn() {
    if (section.value >= TOTAL_SECTIONS) return null
    return getArenaWalkBoundsRect(getWalkMapName())
  }

  /** Buff temporal de daño (Elixir de fuerza, etc.); milisegundos con performance.now(). */
  let strengthBuffFlat = 0
  let strengthBuffUntil = 0

  function resetArenaConsumableBuffs() {
    strengthBuffFlat = 0
    strengthBuffUntil = 0
  }

  /**
   * Aplica efecto de consumible en la sesión de arena (vida, buff, marca, etc.).
   * `duration` en BD es “turnos”; aquí se interpreta como ~2.5s por turno.
   */
  function applyArenaConsumable(payload) {
    const effect = String(payload?.effect || '')
    const power = Math.max(0, Math.round(Number(payload?.power) || 0))
    const duration = payload?.duration
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now()

    switch (effect) {
      case 'heal': {
        playerHp.value = Math.min(playerMaxHp.value, playerHp.value + power)
        break
      }
      case 'mana_restore':
        break
      case 'buff_strength': {
        const turns = Number(duration)
        const msExtra = Number.isFinite(turns) && turns > 0 ? turns * 2500 : 10000
        strengthBuffFlat = power
        strengthBuffUntil = nowMs + msExtra
        break
      }
      case 'cure_poison':
        clearDependencyMark()
        break
      case 'revive':
        if (playerHp.value <= 0) {
          playerHp.value = Math.min(playerMaxHp.value, Math.max(1, power))
        } else {
          playerHp.value = Math.min(playerMaxHp.value, playerHp.value + power)
        }
        break
      default:
        break
    }
  }

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

  function grantExperience(amount, reason = 'combat') {
    const safeAmount = Math.max(0, Math.floor(Number(amount) || 0))
    if (safeAmount <= 0) return
    options.onExperienceGain?.({
      amount: safeAmount,
      reason,
      section: section.value,
      wave: sectionWave.value,
    })
  }

  function grantEnemyKillExperience(type) {
    const baseXp = xpForEnemyType(type)
    const sectionBonus = 1 + Math.max(0, section.value - 1) * 0.1
    const waveBonus = 1 + Math.max(0, sectionWave.value - 1) * 0.03
    grantExperience(Math.round(baseXp * sectionBonus * waveBonus), `enemy:${type}`)
  }

  function applyPlayerDamage(rawDamage) {
    const safeDamage = Math.max(0, Math.round(Number(rawDamage) || 0))
    if (safeDamage <= 0) return
    const armorReduction = Math.min(0.55, Math.max(0, Number(characterArmor.value || 0) * 0.006))
    const mitigatedDamage = Math.max(1, Math.round(safeDamage * (1 - armorReduction)))
    playerHp.value = Math.max(0, playerHp.value - mitigatedDamage)
  }

  function clearDependencyMark() {
    dependencyMark.value = null
  }

  function applyDependencyMark(now, pcx, pcy, damage, sourceX, sourceY) {
    dependencyMark.value = {
      expiresAt: now + DEPENDENCY_MARK_DURATION_MS,
      anchorX: pcx,
      anchorY: pcy,
      sourceX,
      sourceY,
      damage: Math.max(4, Math.round(Number(damage) || 0)),
    }
  }

  function resolveDependencyMark(now) {
    const mark = dependencyMark.value
    if (!mark || now < Number(mark.expiresAt || 0)) return
    const pcx = x.value + PLAYER_SIZE / 2
    const pcy = y.value + PLAYER_SIZE / 2
    const moved = Math.hypot(pcx - mark.anchorX, pcy - mark.anchorY)
    dependencyMark.value = null
    if (moved >= DEPENDENCY_MARK_MOVE_THRESHOLD) return
    applyPlayerDamage(mark.damage)
    let pushX = pcx - mark.anchorX
    let pushY = pcy - mark.anchorY
    let len = Math.hypot(pushX, pushY)
    if (len < 4) {
      pushX = pcx - mark.sourceX
      pushY = pcy - mark.sourceY
      len = Math.hypot(pushX, pushY) || 1
    }
    movePlayerConstrained(
      x.value + (pushX / len) * DEPENDENCY_MARK_PUSH_PX,
      y.value + (pushY / len) * DEPENDENCY_MARK_PUSH_PX,
    )
  }

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

  function spawnMicroservicesFromMonolith(elist, source, now) {
    for (let i = 0; i < 4; i++) {
      const ang = (Math.PI * 2 * i) / 4
      const base = typeBaseStats('microservice')
      const mhp = Math.round(base.hp * sectionMultiplier(section.value))
      elist.push({
        id: enemyId++,
        x: source.x + Math.cos(ang) * 24,
        y: source.y + Math.sin(ang) * 24,
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

  function pushEnemyCoin(newCoins, enemy, bonus = 0) {
    newCoins.push({
      id: coinId++,
      x: enemy.x + 8,
      y: enemy.y + 8,
      value: 2 + Math.floor(Math.random() * 2) + bonus,
    })
  }

  function killEnemyAt(elist, index, now, newCoins) {
    const enemy = elist[index]
    if (!enemy) return
    grantEnemyKillExperience(enemy.type)
    pushEnemyCoin(newCoins, enemy)
    if (enemy.type === 'legacy_monolith') {
      spawnMicroservicesFromMonolith(elist, enemy, now)
    }
    elist.splice(index, 1)
  }

  function applyDamageToEnemy(elist, index, rawDamage, now, newCoins) {
    const enemy = elist[index]
    if (!enemy || enemy.hp <= 0) return false
    if (isJavaBossShielded(enemy, now)) return false
    const damage = Math.max(1, Math.round(rawDamage))
    const nextHp = enemy.hp - damage
    if (nextHp <= 0) {
      killEnemyAt(elist, index, now, newCoins)
    } else {
      elist[index] = { ...enemy, hp: nextHp }
    }
    return true
  }

  function createSpawnedEnemy(type, spawnPos, multiplier, earlyMult, now, extra = {}) {
    const base = typeBaseStats(type)
    const hp = Math.max(24, Math.round(base.hp * multiplier * earlyMult))
    const fireInterval = base.fireInterval
      ? Math.max(1100, Math.round((base.fireInterval * (1 / multiplier)) / earlyMult))
      : null
    return {
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
      lastFireAt: now + Math.random() * 1200,
      zigSeed: Math.random() * Math.PI * 2,
      auraRange: 170,
      ...extra,
    }
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
        speed: 2.2,
        size: 132,
        type: 'boss',
        contactDamage: Math.round(26 * multiplier),
        fireInterval: 1400,
        bulletDamage: Math.round(24 * multiplier),
        lastFireAt: performance.now() + 1100,
        zigSeed: Math.random() * Math.PI * 2,
        bossShotIndex: 0,
        shieldUntil: 0,
        nextShieldAt: performance.now() + 7000,
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

    const cfg = getRoundConfig()[Math.max(0, Math.min(INTERMEDIATE_SECTIONS - 1, section.value - 1))]
    const now = performance.now()
    const types = Object.entries(cfg)
    for (const [type, count] of types) {
      const adjustedCount = Math.max(1, Math.round(count * enemyCountMult))
      for (let i = 0; i < adjustedCount; i++) {
        const sz = Math.max(ENEMY_SIZE, Number(typeBaseStats(type).size) || ENEMY_SIZE)
        const spawnPos = randomSpawnEdgePosition(WORLD_W, WORLD_H, pad, sz, getWalkRectForSpawn)
        list.push(createSpawnedEnemy(type, spawnPos, multiplier, earlyMult, now))
      }
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

    speed *= Math.max(0.3, Number(characterMoveSpeed.value || 1))
    return Math.max(1.2, Math.min(6.4, speed))
  }

  function entityWalkable(nextX, nextY, size) {
    if (!isWalkable) return true
    return Boolean(isWalkable(nextX, nextY, {
      playerSize: size,
      entitySize: size,
      worldWidth: WORLD_W,
      worldHeight: WORLD_H,
      section: section.value,
      mapName: getWalkMapName(),
      startKingdom: startKingdom.value,
      enemyFaction: enemyFaction.value,
    }))
  }

  function canPlayerStandAt(nextX, nextY) {
    return entityWalkable(nextX, nextY, PLAYER_COLLISION_SIZE)
  }

  function clampEntityWalkable(prevX, prevY, nx, ny, size) {
    const bx = Math.max(0, Math.min(WORLD_W - size, nx))
    const by = Math.max(0, Math.min(WORLD_H - size, ny))
    if (!isWalkable) {
      return { x: bx, y: by }
    }
    if (entityWalkable(bx, by, size)) {
      return { x: bx, y: by }
    }
    const canX = entityWalkable(bx, prevY, size)
    const canY = entityWalkable(prevX, by, size)
    return { x: canX ? bx : prevX, y: canY ? by : prevY }
  }

  function movePlayerConstrained(nextX, nextY) {
    const prevX = x.value
    const prevY = y.value
    const boundedX = Math.max(0, Math.min(WORLD_W - PLAYER_SIZE, nextX))
    const boundedY = Math.max(0, Math.min(WORLD_H - PLAYER_SIZE, nextY))

    if (!isWalkable || canPlayerStandAt(boundedX, boundedY)) {
      x.value = boundedX
      y.value = boundedY
      return
    }

    const canSlideX = canPlayerStandAt(boundedX, prevY)
    const canSlideY = canPlayerStandAt(prevX, boundedY)
    x.value = canSlideX ? boundedX : prevX
    y.value = canSlideY ? boundedY : prevY
  }

  function tick() {
    const now = performance.now()

    if (!locked.value && arenaRef.value) {
      const moveSpeed = resolveMovementSpeed()
      const prevX = x.value
      const prevY = y.value
      let nextX = x.value
      let nextY = y.value
      if (keys.w) {
        nextY -= moveSpeed
      }
      if (keys.s) {
        nextY += moveSpeed
      }
      if (keys.a) {
        nextX -= moveSpeed
      }
      if (keys.d) {
        nextX += moveSpeed
      }
      movePlayerConstrained(nextX, nextY)
      moving.value = Object.values(keys).some(Boolean)

      const pdx = x.value - prevX
      const pdy = y.value - prevY
      if (moving.value && (Math.abs(pdx) > 0.001 || Math.abs(pdy) > 0.001)) {
        if (Math.abs(pdx) > Math.abs(pdy)) {
          playerFacing.value = pdx > 0 ? 'e' : 'w'
        } else {
          playerFacing.value = pdy > 0 ? 's' : 'n'
        }
      }
    }

    if (phase.value === 'fighting') {
      const px = x.value
      const py = y.value
      const pcx = px + PLAYER_SIZE / 2
      const pcy = py + PLAYER_SIZE / 2

      resolveDependencyMark(now)

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

        if (e.type === 'boss') {
          // Boss mago: kiting + strafe lateral. Mantiene ~360px de distancia.
          const preferred = 360
          const strafeAngle = now / 700 + (e.zigSeed || 0)
          const strafeAmt = Math.sin(strafeAngle) * 1.6
          if (len > preferred + 30) {
            nx = e.x + dx * (e.speed * 0.7) + (-dy) * strafeAmt
            ny = e.y + dy * (e.speed * 0.7) + (dx) * strafeAmt
          } else if (len < preferred - 30) {
            nx = e.x - dx * e.speed + (-dy) * strafeAmt
            ny = e.y - dy * e.speed + (dx) * strafeAmt
          } else {
            nx = e.x + (-dy) * strafeAmt * 1.2
            ny = e.y + (dx) * strafeAmt * 1.2
          }
        } else if (e.type === 'dependency_injector' || e.type === 'thread_spammer' || e.type === 'miniboss') {
          const preferred = e.type === 'miniboss' ? 185 : 195
          if (len > preferred + 20) {
            nx = e.x + dx * (e.speed * 0.72)
            ny = e.y + dy * (e.speed * 0.72)
          } else if (len < preferred - 20) {
            nx = e.x - dx * (e.speed * 0.88)
            ny = e.y - dy * (e.speed * 0.88)
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

        // Separación entre enemigos para evitar superposición intensa
        let sepX = 0, sepY = 0
        for (const other of enemies.value) {
          if (other.id === e.id) continue
          const osize = other.size || ENEMY_SIZE
          const odx = e.x - other.x
          const ody = e.y - other.y
          const dist = Math.hypot(odx, ody)
          const minDist = (esize + osize) / 2
          if (dist > 0 && dist < minDist) {
            const force = (minDist - dist) / dist
            sepX += odx * force * 0.15
            sepY += ody * force * 0.15
          }
        }
        nx += sepX
        ny += sepY

        const pos = clampEntityWalkable(e.x, e.y, nx, ny, esize)
        nx = pos.x
        ny = pos.y

        let nextEnemy = { ...e, x: nx, y: ny }
        if (e.type === 'boss') {
          nextEnemy.isMoving = Math.hypot(nx - e.x, ny - e.y) > 0.15
          if (isJavaFinalBoss(e, enemyFaction.value) && !isJavaBossShielded(e, now) && now >= Number(e.nextShieldAt || 0)) {
            nextEnemy.shieldUntil = now + JAVA_BOSS_SHIELD_MS
            nextEnemy.nextShieldAt = now + JAVA_BOSS_SHIELD_GAP_MS
          }
        }

        const heal = supportHealMap.get(e.id) || 0
        if (heal > 0 && e.hp > 0) {
          nextEnemy.hp = Math.min(nextEnemy.maxHp, nextEnemy.hp + heal)
        }

        // Enemy firing logic
        const bossShielded = isJavaBossShielded(nextEnemy, now)
        if (e.fireInterval && now - e.lastFireAt > e.fireInterval && !bossShielded) {
          const fireX = e.x + esize / 2
          const fireY = e.y + esize / 2
          const fdx = pcx - fireX
          const fdy = pcy - fireY
          const flen = Math.hypot(fdx, fdy) || 1
          const fAngle = Math.atan2(fdy, fdx)

          if (e.type === 'dependency_injector') {
            if (Math.hypot(pcx - fireX, pcy - fireY) <= DEPENDENCY_MARK_RANGE) {
              nextEnemy.lastFireAt = now
              applyDependencyMark(now, pcx, pcy, e.bulletDamage || 12, fireX, fireY)
            }
          } else {
          nextEnemy.lastFireAt = now
          const newEBullets = []
          if (e.type === 'boss') {
            if (enemyFaction.value === 'java') {
              const phase = (e.bossShotIndex || 0) % 4
              const bulletDamage = e.bulletDamage || 24
              const pushJavaOrb = (ang, speed) => {
                newEBullets.push({
                  id: bulletId++,
                  x: fireX,
                  y: fireY,
                  vx: Math.cos(ang) * speed,
                  vy: Math.sin(ang) * speed,
                  born: now,
                  damage: bulletDamage,
                  faction: enemyFaction.value,
                  kind: 'java_orb',
                })
              }
              if (phase === 0) {
                for (const spread of [-0.24, 0, 0.24]) {
                  pushJavaOrb(fAngle + spread, 5.4)
                }
              } else if (phase === 1) {
                for (let i = 0; i < 8; i++) {
                  pushJavaOrb(fAngle + (Math.PI * 2 * i) / 8, 3.7)
                }
              } else if (phase === 2) {
                for (let i = -2; i <= 2; i++) {
                  pushJavaOrb(fAngle + i * 0.2, 5.8)
                }
              } else {
                for (let i = 0; i < 6; i++) {
                  pushJavaOrb(fAngle + (Math.PI * 2 * i) / 6 + 0.18, 4.2)
                }
              }
              nextEnemy.bossShotIndex = (e.bossShotIndex || 0) + 1
            } else {
              // Mago boss PHP: orbe arcano grande. Cada 4ª salva, abanico de 5 orbes.
              const burstCount = (e.bossShotIndex || 0) % 4 === 3 ? 5 : 1
              const spread = burstCount === 5 ? 0.34 : 0
              const half = (burstCount - 1) / 2
              for (let i = 0; i < burstCount; i++) {
                const ang = fAngle + (i - half) * spread
                newEBullets.push({
                  id: bulletId++,
                  x: fireX,
                  y: fireY,
                  vx: Math.cos(ang) * 4.6,
                  vy: Math.sin(ang) * 4.6,
                  born: now,
                  damage: e.bulletDamage || 24,
                  faction: enemyFaction.value,
                  kind: 'arcane_orb',
                })
              }
              nextEnemy.bossShotIndex = (e.bossShotIndex || 0) + 1
            }
          } else if (e.type === 'thread_spammer') {
            for (let i = -1; i <= 1; i++) {
              const ang = fAngle + i * 0.22
              newEBullets.push({
                id: bulletId++,
                x: fireX,
                y: fireY,
                vx: Math.cos(ang) * 4.6,
                vy: Math.sin(ang) * 4.6,
                born: now,
                damage: e.bulletDamage || 14,
                faction: enemyFaction.value,
              })
            }
          } else {
            newEBullets.push({
              id: bulletId++,
              x: fireX,
              y: fireY,
              vx: (fdx / flen) * 4.1,
              vy: (fdy / flen) * 4.1,
              born: now,
              damage: e.bulletDamage || 14,
              faction: enemyFaction.value,
            })
          }
          enemyBullets.value = [...enemyBullets.value, ...newEBullets]
          }
        }

        return nextEnemy
      })
      enemies.value = elist

      let maxContactDamage = 0
      let contacting = false
      for (const e of elist) {
        const esize = e.size || ENEMY_SIZE
        const ecx = e.x + esize / 2
        const ecy = e.y + esize / 2

        const dist = Math.hypot(ecx - pcx, ecy - pcy)
        if (dist < (esize / 2 + 10)) {
          contacting = true
          const sectionContactDamage = Math.max(1, Math.round(e.contactDamage || BASE_CONTACT_DAMAGE))
          if (sectionContactDamage > maxContactDamage) {
            maxContactDamage = sectionContactDamage
          }
        }
      }
      if (contacting && now - lastContactAt > CONTACT_COOLDOWN_MS) {
        applyPlayerDamage(maxContactDamage || BASE_CONTACT_DAMAGE)
        lastContactAt = now
      }

      // Calcular intervalo y daño según el arma
      let currentFireInterval = FIRE_INTERVAL_MS
      let currentDamage = BULLET_DAMAGE
      const newCoins = [...coins.value]

      if (equippedWeapon.value) {
        currentDamage = equippedWeapon.value.damage || BULLET_DAMAGE
      } else {
        currentDamage = Number(characterBaseDamage.value || BULLET_DAMAGE)
      }
      const levelBonus = 1 + (Math.max(1, Number(characterLevel.value) || 1) - 1) * LEVEL_DAMAGE_BONUS
      currentDamage = Math.max(1, Math.round(currentDamage * levelBonus))

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
      const attackSpeedScale = Math.max(0.25, Number(characterAttackSpeed.value || 1))
      currentFireInterval = Math.max(110, Math.round(currentFireInterval / attackSpeedScale))

      // Reducir daño melee un poco para equilibrar
      if (MELEE_TYPES.includes(effectiveType)) {
        currentDamage = Math.ceil(currentDamage * 0.75)
      }

      const nowCombat = typeof performance !== 'undefined' ? performance.now() : Date.now()
      if (nowCombat < strengthBuffUntil) {
        currentDamage = Math.max(1, currentDamage + strengthBuffFlat)
      } else if (strengthBuffUntil > 0) {
        resetArenaConsumableBuffs()
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
              let dmgToApply = currentDamage
              if (e.type === 'boilerplate_guard' && angleDiff < Math.PI / 2.1) {
                dmgToApply = Math.max(1, Math.round(currentDamage * 0.25))
              }
              if (applyDamageToEnemy(elist, i, dmgToApply, now, newCoins)) {
                changed = true
              }
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
        if (isJavaBossShielded(e, now)) {
          keptBullets.push(b)
          continue
        }
        let bulletDamageToApply = b.damage || BULLET_DAMAGE
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
            bulletDamageToApply = Math.max(1, Math.round(bulletDamageToApply * 0.25))
          }
        }
        applyDamageToEnemy(elist, hitIndex, bulletDamageToApply, now, newCoins)
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
        let hitRadius
        if (b.isZone) hitRadius = b.radius || 58
        else if (b.kind === 'arcane_orb') hitRadius = 30
        else if (b.kind === 'java_orb') hitRadius = 26
        else hitRadius = 25
        if (dist < hitRadius) {
          applyPlayerDamage(b.damage || 15)
          if (b.isZone) {
            const pxDir = (pcx - b.x) / (dist || 1)
            const pyDir = (pcy - b.y) / (dist || 1)
            movePlayerConstrained(x.value + pxDir * 0.8, y.value + pyDir * 0.8)
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
        clearDependencyMark()
        phase.value = 'gameover'
      } else if (enemies.value.length === 0 && phase.value === 'fighting') {
        if (section.value >= TOTAL_SECTIONS) {
          phase.value = 'victory'
          enemies.value = []
          bullets.value = []
          enemyBullets.value = []
          options.onVictory?.()
        } else {
          clearDependencyMark()
          phase.value = 'between'
        }
      }
    }

    rafId = requestAnimationFrame(tick)
  }

  function startNextWave() {
    const clearedSection = section.value
    const maxWavesInCurrentSection = maxWavesForSection(section.value)
    if (sectionWave.value >= maxWavesInCurrentSection) {
      section.value = Math.min(TOTAL_SECTIONS, section.value + 1)
      sectionWave.value = 1
      const sectionXp = 85 + clearedSection * 20
      grantExperience(sectionXp, 'section_clear')
    } else {
      sectionWave.value += 1
    }
    const waveXp = 30 + Math.max(0, sectionWave.value - 1) * 9 + Math.max(0, section.value - 1) * 8
    grantExperience(waveXp, 'wave_clear')
    wave.value = sectionWave.value
    resolveRouteContext()
    playerMaxHp.value = Math.max(1, Math.round(Number(options.playerMaxHp?.value ?? options.playerMaxHp ?? playerMaxHp.value) || playerMaxHp.value))
    playerHp.value = Math.min(playerMaxHp.value, playerHp.value + Math.floor(playerMaxHp.value * 0.12))
    clearDependencyMark()
    phase.value = 'fighting'
    spawnWave()
  }

  function beginFirstWave() {
    section.value = 1
    sectionWave.value = 1
    wave.value = 1
    resolveRouteContext()
    playerMaxHp.value = Math.max(1, Math.round(Number(options.playerMaxHp?.value ?? options.playerMaxHp ?? playerMaxHp.value) || playerMaxHp.value))
    playerHp.value = playerMaxHp.value
    clearDependencyMark()
    resetArenaConsumableBuffs()
    phase.value = 'fighting'
    spawnWave()
  }

  function resumeAt(sectionValue, waveValue) {
    const safeSection = Math.min(TOTAL_SECTIONS, Math.max(1, Number(sectionValue) || 1))
    const safeWave = Math.min(maxWavesForSection(safeSection), Math.max(1, Number(waveValue) || 1))
    section.value = safeSection
    sectionWave.value = safeWave
    wave.value = safeWave
    resolveRouteContext()
    clearDependencyMark()
    resetArenaConsumableBuffs()
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
    dependencyMark,
    enemies,
    bullets,
    enemyBullets,
    coins,
    slashes,
    playerFacing,
    startNextWave,
    beginFirstWave,
    resumeAt,
    applyArenaConsumable,
    resetArenaConsumableBuffs,
  }
}
