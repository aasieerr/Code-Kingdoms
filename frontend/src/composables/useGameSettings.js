import { ref } from 'vue'

const STORAGE_KEY = 'code-kingdoms.settings.v1'

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
}

const settings = ref({ ...DEFAULT_SETTINGS, keybinds: { ...DEFAULT_SETTINGS.keybinds } })
let initialized = false

function normalizeKey(rawKey) {
  if (!rawKey) return ''
  if (rawKey === ' ') return 'space'
  return String(rawKey).toLowerCase().trim()
}

function keyLabel(key) {
  const normalized = normalizeKey(key)
  if (!normalized) return '—'
  if (normalized === 'space') return 'SPACE'
  if (normalized.startsWith('arrow')) return normalized.replace('arrow', 'ARROW ')
  return normalized.length === 1 ? normalized.toUpperCase() : normalized.toUpperCase()
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

function sanitizeLoadedSettings(raw) {
  const safe = {
    volume: Math.max(0, Math.min(100, Number(raw?.volume) || DEFAULT_SETTINGS.volume)),
    keybinds: { ...DEFAULT_SETTINGS.keybinds },
  }
  const keybinds = raw?.keybinds
  if (keybinds && typeof keybinds === 'object') {
    Object.keys(safe.keybinds).forEach((action) => {
      const normalized = normalizeKey(keybinds[action])
      if (normalized) safe.keybinds[action] = normalized
    })
  }
  // Evita colisiones: si 2 acciones comparten tecla, la segunda vuelve a default.
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
  return safe
}

export function initGameSettings() {
  if (initialized) return
  initialized = true
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    settings.value = sanitizeLoadedSettings(raw)
  } catch {
    settings.value = { ...DEFAULT_SETTINGS, keybinds: { ...DEFAULT_SETTINGS.keybinds } }
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

  function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS, keybinds: { ...DEFAULT_SETTINGS.keybinds } }
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
    resetSettings,
    keyMatches,
    keyLabel,
    normalizeKey,
  }
}
