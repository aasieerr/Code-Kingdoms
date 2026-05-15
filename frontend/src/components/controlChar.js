import { ref, onMounted, onUnmounted } from 'vue'
import { WORLD_EDGE } from '../constants/world'
import { useGameSettings } from '../composables/useGameSettings'

export function useWasd(initialX = 280, initialY = 170, worldWidth = WORLD_EDGE, worldHeight = WORLD_EDGE, speedStat = null) {
  const arenaRef = ref(null)
  const x = ref(initialX)
  const y = ref(initialY)
  const focused = ref(false)
  const moving = ref(false)
  const locked = ref(false)
  const stamina = ref(100)
  const isSprinting = ref(false)
  let isExhausted = false

  const keys = { 
    moveUp: false, moveLeft: false, moveDown: false, moveRight: false,
    shift: false 
  }
  const { keyMatches } = useGameSettings()
  const SIZE = 40
  const BASE_SPEED = 120 
  let rafId = null
  let lastTime = 0

  function onKeyDown(e) {
    if (e.shiftKey) keys.shift = true
    const action = Object.keys(keys).find((a) => keyMatches(e, a))
    if (!action && !e.shiftKey) return
    if (focused.value && !locked.value) e.preventDefault()
    if (!locked.value && action) keys[action] = true
  }

  function onKeyUp(e) {
    if (!e.shiftKey) keys.shift = false
    const action = Object.keys(keys).find((a) => keyMatches(e, a))
    if (action) keys[action] = false
  }

  function loop(now) {
    if (!lastTime) lastTime = now
    const dt = (now - lastTime) / 1000 
    lastTime = now

    const arena = arenaRef.value
    if (arena && !locked.value) {
      const W = worldWidth - SIZE
      const H = worldHeight - SIZE

      // Lógica de Estamina
      const isMoving = keys.moveUp || keys.moveDown || keys.moveLeft || keys.moveRight
      
      if (stamina.value <= 0) {
        isExhausted = true
      } else if (stamina.value >= 25) {
        isExhausted = false
      }

      const wantsToSprint = keys.shift && isMoving && !isExhausted
      
      if (wantsToSprint) {
        isSprinting.value = true
        stamina.value = Math.max(0, stamina.value - 25 * dt) // Agota en 4 seg
      } else {
        isSprinting.value = false
        stamina.value = Math.min(100, stamina.value + 15 * dt) // Recupera en ~6 seg
      }

      // Calcular velocidad
      const currentStat = Number(speedStat?.value ?? speedStat ?? 100)
      const cappedStat = Math.min(200, currentStat)
      const speedScale = cappedStat / 100
      let moveMult = speedScale
      if (isSprinting.value) moveMult *= 1.6

      const currentSpeed = BASE_SPEED * moveMult * dt

      if (keys.moveUp) y.value = Math.max(0, y.value - currentSpeed)
      if (keys.moveDown) y.value = Math.min(H, y.value + currentSpeed)
      if (keys.moveLeft) x.value = Math.max(0, x.value - currentSpeed)
      if (keys.moveRight) x.value = Math.min(W, x.value + currentSpeed)

      moving.value = isMoving
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