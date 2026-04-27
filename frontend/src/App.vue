<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'

onMounted(() => {
  window.addEventListener('mousedown', (e) => {
    createShockwave(e.clientX, e.clientY)
    const amount = 12
    for (let i = 0; i < amount; i++) {
      createParticle(e.clientX, e.clientY)
    }
  })
})

function createShockwave(x, y) {
  const wave = document.createElement('div')
  wave.className = 'click-shockwave'
  document.body.appendChild(wave)

  wave.style.left = `${x}px`
  wave.style.top = `${y}px`

  const animation = wave.animate([
    { width: '0px', height: '0px', opacity: 0.9, borderWidth: '6px' },
    { width: '140px', height: '140px', opacity: 0, borderWidth: '0px' }
  ], {
    duration: 500,
    easing: 'ease-out'
  })

  animation.onfinish = () => wave.remove()
}

function createParticle(x, y) {
  const particle = document.createElement('div')
  particle.className = 'click-particle'
  document.body.appendChild(particle)

  const size = Math.floor(Math.random() * 4) + 2
  const destinationX = (Math.random() - 0.5) * 60
  const destinationY = (Math.random() - 0.5) * 60
  const rotation = Math.random() * 360
  const delay = Math.random() * 100

  particle.style.width = `${size}px`
  particle.style.height = `${size}px`
  particle.style.left = `${x}px`
  particle.style.top = `${y}px`

  const animation = particle.animate([
    {
      transform: `translate(-50%, -50%) translate(0, 0) rotate(0deg)`,
      opacity: 1
    },
    {
      transform: `translate(-50%, -50%) translate(${destinationX}px, ${destinationY}px) rotate(${rotation}deg)`,
      opacity: 0
    }
  ], {
    duration: 400 + Math.random() * 200,
    easing: 'cubic-bezier(0, .9, .57, 1)',
    delay: delay
  })

  animation.onfinish = () => {
    particle.remove()
  }
}
</script>

<template>
  <router-view />
</template>

<style>
#app {
  width: 100%;
}
</style>
