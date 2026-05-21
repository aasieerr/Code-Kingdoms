export const BASE_CONTACT_DAMAGE = 10
export const ENEMY_SIZE = 36

export const ENEMY_XP_REWARD = {
  microservice: 8,
  composer_update: 14,
  dependency_injector: 18,
  thread_spammer: 22,
  boilerplate_guard: 24,
  garbage_collector: 28,
  legacy_monolith: 65,
  miniboss: 120,
  boss: 240,
}

const ROUND_ENEMY_CONFIG = [
  { garbage_collector: 2, thread_spammer: 2 },
  { dependency_injector: 2, thread_spammer: 2, garbage_collector: 1 },
  { thread_spammer: 2, dependency_injector: 2, boilerplate_guard: 1 },
  { microservice: 2, dependency_injector: 2, composer_update: 1, thread_spammer: 2 },
  { dependency_injector: 3, boilerplate_guard: 2, microservice: 3, composer_update: 2, legacy_monolith: 1 },
]

export const RANGED_ENEMY_TYPES = new Set([
  'thread_spammer',
  'dependency_injector',
  'composer_update',
  'boss',
  'miniboss',
])

export function getRoundConfig() {
  return ROUND_ENEMY_CONFIG
}

export function typeBaseStats(type) {
  switch (type) {
    case 'garbage_collector':
      return { hp: 220, speed: 1.2, contactDamage: 32 }
    case 'boilerplate_guard':
      return { hp: 170, speed: 2.5, contactDamage: 16 }
    case 'thread_spammer':
      return { hp: 95, speed: 1.45, contactDamage: 10, fireInterval: 1800, bulletDamage: 14 }
    case 'legacy_monolith':
      return { hp: 720, speed: 0.9, contactDamage: 24, size: 82 }
    case 'microservice':
      return { hp: 34, speed: 4.7, contactDamage: 8 }
    case 'dependency_injector':
      return { hp: 130, speed: 1.75, contactDamage: 10, fireInterval: 3200, bulletDamage: 12 }
    case 'composer_update':
      return { hp: 100, speed: 2.1, contactDamage: 0 }
    case 'miniboss':
      return { hp: 420, speed: 1.25, contactDamage: 22, size: 64, fireInterval: 2800, bulletDamage: 16 }
    default:
      return { hp: 100, speed: 2.3, contactDamage: BASE_CONTACT_DAMAGE }
  }
}

export function xpForEnemyType(type) {
  return ENEMY_XP_REWARD[type] ?? 12
}
