import { ref } from 'vue'

const STORAGE_KEY = 'code-kingdoms.settings.v1'

/** Nombres de consumibles del catálogo (coinciden con seed / tienda). */
export const ARENA_CONSUMABLE_NAMES = [
  '',
  'Poción de vida pequeña',
  'Poción de Curación',
  'Poción de Maná',
  'Elixir de Fuerza',
  'Antídoto',
  'Elixir de Vida',
]

export const ARENA_POTION_SLOT_COUNT = 4

const ALLOWED_CONSUMABLE_NAMES = new Set(ARENA_CONSUMABLE_NAMES.filter(Boolean))

const DEFAULT_ARENA_POTION_SLOTS = [
  { itemName: 'Poción de vida pequeña', key: '1' },
  { itemName: 'Poción de Curación', key: '2' },
  { itemName: 'Poción de Maná', key: '3' },
  { itemName: 'Elixir de Fuerza', key: '4' },
]

const ARENA_FALLBACK_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'q', 'r', 'f', 'z', 'c', 'v', 'x']

const DEFAULT_SETTINGS = {
  volume: 70,
  keybinds: {
    moveUp: 'w',
    moveDown: 's',
    moveLeft: 'a',
    moveRight: 'd',
    interact: 'e',
    inventory: 'i',
    equipment: 'k',
    map: 'm',
  },
  arenaPotionSlots: DEFAULT_ARENA_POTION_SLOTS.map((s) => ({ ...s })),
}

const settings = ref({
  volume: DEFAULT_SETTINGS.volume,
  keybinds: { ...DEFAULT_SETTINGS.keybinds },
  arenaPotionSlots: DEFAULT_SETTINGS.arenaPotionSlots.map((s) => ({ ...s })),
})
let initialized = false

export function normalizeKey(rawKey) {
  if (!rawKey) return ''
  if (rawKey === ' ') return 'space'
  return String(rawKey).toLowerCase().trim()
}

function pickFreeArenaKey(usedSlots, bindUsed) {
  for (const c of ARENA_FALLBACK_KEYS) {
    const k = normalizeKey(c)
    if (k && !usedSlots.has(k) && !bindUsed.has(k)) return k
  }
  return `p${usedSlots.size}`
}

/**
 * Ajusta teclas de ranuras de pociones: nombre permitido y sin duplicados ni conflicto con keybinds globales.
 */
export function normalizeArenaPotionSlots(keybinds, rawSlots) {
  const allowed = ALLOWED_CONSUMABLE_NAMES
  const bindUsed = new Set(Object.values(keybinds || {}).map(normalizeKey).filter(Boolean))
  const slots = []
  for (let i = 0; i < ARENA_POTION_SLOT_COUNT; i++) {
    const src = Array.isArray(rawSlots) && rawSlots[i] && typeof rawSlots[i] === 'object' ? rawSlots[i] : {}
    let itemName = String(src.itemName || '').trim()
    if (itemName && !allowed.has(itemName)) itemName = ''
    const def = DEFAULT_ARENA_POTION_SLOTS[i] || DEFAULT_ARENA_POTION_SLOTS[0]
    let key = normalizeKey(src.key) || normalizeKey(def.key)
    slots.push({ itemName, key })
  }
  const used = new Set()
  for (let i = 0; i < ARENA_POTION_SLOT_COUNT; i++) {
    let k = slots[i].key
    const defKey = normalizeKey(DEFAULT_ARENA_POTION_SLOTS[i].key)
    if (used.has(k) || bindUsed.has(k)) k = defKey
    while (used.has(k) || bindUsed.has(k)) {
      k = pickFreeArenaKey(used, bindUsed)
    }
    used.add(k)
    slots[i] = { ...slots[i], key: k }
  }
  return slots
}

export function keyLabel(key) {
  const normalized = normalizeKey(key)
  if (!normalized) return '—'
  if (normalized === 'space') return 'SPACE'
  if (normalized.startsWith('arrow')) return normalized.replace('arrow', 'ARROW ')
  return normalized.toUpperCase()
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
}

function applyMasterVolume() {
  const level = Math.max(0, Math.min(100, Number(settings.value.volume) || 0)) / 100
  const media = document.querySelectorAll('audio, video')
  media.forEach((el) => {
    el.volume = level
  })
}

export function sanitizeLoadedSettings(raw) {
  const rawObj = raw && typeof raw === 'object' ? raw : {}
  const safe = {
    volume: Math.max(0, Math.min(100, Number(rawObj.volume) || DEFAULT_SETTINGS.volume)),
    keybinds: { ...DEFAULT_SETTINGS.keybinds },
  }
  const keybinds = rawObj.keybinds
  if (keybinds && typeof keybinds === 'object') {
    Object.keys(safe.keybinds).forEach((action) => {
      const normalized = normalizeKey(keybinds[action])
      if (normalized) safe.keybinds[action] = normalized
    })
  }
  const seenKeys = new Set()
  Object.keys(safe.keybinds).forEach((action) => {
    const key = safe.keybinds[action]
    if (seenKeys.has(key)) {
      safe.keybinds[action] = DEFAULT_SETTINGS.keybinds[action]
      if (seenKeys.has(safe.keybinds[action])) {
        safe.keybinds[action] = ''
      }
    } else {
      seenKeys.add(key)
    }
  })
  safe.arenaPotionSlots = normalizeArenaPotionSlots(safe.keybinds, rawObj.arenaPotionSlots)
  return safe
}

export function initGameSettings() {
  if (initialized) return
  initialized = true
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    settings.value = sanitizeLoadedSettings(raw)
  } catch {
    settings.value = sanitizeLoadedSettings({})
  }
  applyMasterVolume()
}

export function useGameSettings() {
  initGameSettings()

  function setVolume(volume) {
    settings.value.volume = Math.max(0, Math.min(100, Number(volume) || 0))
    saveSettings()
    applyMasterVolume()
  }

  function setKeybind(action, key) {
    const normalized = normalizeKey(key)
    if (!normalized || !(action in settings.value.keybinds)) return
    Object.keys(settings.value.keybinds).forEach((otherAction) => {
      if (otherAction !== action && settings.value.keybinds[otherAction] === normalized) {
        settings.value.keybinds[otherAction] = DEFAULT_SETTINGS.keybinds[otherAction]
      }
    })
    settings.value.keybinds[action] = normalized
    const sanitized = sanitizeLoadedSettings(settings.value)
    settings.value = sanitized
    saveSettings()
  }

  function setArenaPotionKey(slotIndex, key) {
    const normalized = normalizeKey(key)
    if (!normalized) return
    const idx = Number(slotIndex)
    if (!Number.isFinite(idx) || idx < 0 || idx >= ARENA_POTION_SLOT_COUNT) return
    const next = settings.value.arenaPotionSlots.map((s, i) => (
      i === idx ? { ...s, key: normalized } : { ...s }
    ))
    settings.value.arenaPotionSlots = normalizeArenaPotionSlots(settings.value.keybinds, next)
    saveSettings()
  }

  function setArenaPotionItem(slotIndex, itemName) {
    const idx = Number(slotIndex)
    if (!Number.isFinite(idx) || idx < 0 || idx >= ARENA_POTION_SLOT_COUNT) return
    let name = String(itemName || '').trim()
    if (name && !ALLOWED_CONSUMABLE_NAMES.has(name)) name = ''
    const next = settings.value.arenaPotionSlots.map((s, i) => (
      i === idx ? { ...s, itemName: name } : { ...s }
    ))
    settings.value.arenaPotionSlots = next
    saveSettings()
  }

  function resetSettings() {
    settings.value = sanitizeLoadedSettings({})
    saveSettings()
    applyMasterVolume()
  }

  function keyMatches(event, action) {
    return normalizeKey(event?.key) === settings.value.keybinds[action]
  }

  return {
    settings,
    setVolume,
    setKeybind,
    setArenaPotionKey,
    setArenaPotionItem,
    resetSettings,
    keyMatches,
    keyLabel,
    normalizeKey,
  }
}
