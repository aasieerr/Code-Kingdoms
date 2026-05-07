import { ref, onMounted, onUnmounted } from 'vue'
import { WORLD_EDGE } from '../constants/world'
import { useGameSettings } from '../composables/useGameSettings'

export function useWasd(initialX = 280, initialY = 170, worldWidth = WORLD_EDGE, worldHeight = WORLD_EDGE) {
  const arenaRef = ref(null)
  const x = ref(initialX)
  const y = ref(initialY)
  const focused = ref(false)
  const moving = ref(false)
  const locked = ref(false)

  const keys = { moveUp: false, moveLeft: false, moveDown: false, moveRight: false }
  const { keyMatches } = useGameSettings()
  const SIZE = 40
  const SPEED = 4.5
  let rafId = null

  function onKeyDown(e) {
    const action = Object.keys(keys).find((a) => keyMatches(e, a))
    if (!action) return
    if (focused.value && !locked.value) e.preventDefault()
    if (!locked.value) keys[action] = true
  }

  function onKeyUp(e) {
    const action = Object.keys(keys).find((a) => keyMatches(e, a))
    if (action) keys[action] = false
  }

  function loop() {
    const arena = arenaRef.value
    if (arena && !locked.value) {
      const WORLD_WIDTH = worldWidth
      const WORLD_HEIGHT = worldHeight
      const W = WORLD_WIDTH - SIZE
      const H = WORLD_HEIGHT - SIZE

      if (keys.moveUp) y.value = Math.max(0, y.value - SPEED)
      if (keys.moveDown) y.value = Math.min(H, y.value + SPEED)
      if (keys.moveLeft) x.value = Math.max(0, x.value - SPEED)
      if (keys.moveRight) x.value = Math.min(W, x.value + SPEED)

      moving.value = Object.values(keys).some(Boolean)
    }
    rafId = requestAnimationFrame(loop)
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(loop)
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
    locked
  }
}