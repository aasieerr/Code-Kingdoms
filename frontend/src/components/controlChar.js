import { ref, onMounted, onUnmounted } from 'vue'
import { WORLD_EDGE } from '../constants/world'

export function useWasd(initialX = 280, initialY = 170) {
  const arenaRef = ref(null)
  const x = ref(initialX)
  const y = ref(initialY)
  const focused = ref(false)
  const moving = ref(false)
  const locked = ref(false)

  const keys = { w: false, a: false, s: false, d: false }
  const SIZE = 40
  const SPEED = 4.5
  let rafId = null

  function onKeyDown(e) {
    const k = e.key.toLowerCase()
    if (k in keys) {
      if (focused.value && !locked.value) e.preventDefault()
      if (!locked.value) keys[k] = true
    }
  }

  function onKeyUp(e) {
    const k = e.key.toLowerCase()
    if (k in keys) keys[k] = false
  }

  function loop() {
    const arena = arenaRef.value
    if (arena && !locked.value) {
      const WORLD_WIDTH = WORLD_EDGE
      const WORLD_HEIGHT = WORLD_EDGE
      const W = WORLD_WIDTH - SIZE
      const H = WORLD_HEIGHT - SIZE

      if (keys.w) y.value = Math.max(0, y.value - SPEED)
      if (keys.s) y.value = Math.min(H, y.value + SPEED)
      if (keys.a) x.value = Math.max(0, x.value - SPEED)
      if (keys.d) x.value = Math.min(W, x.value + SPEED)

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