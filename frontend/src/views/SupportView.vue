<template>
  <div class="pixel-page min-h-screen flex flex-col">
    <AppHeader />

    <div
      class="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
      style="background: repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 2px);"
    ></div>

    <main class="relative z-10 max-w-4xl mx-auto px-6 py-20 flex-grow w-full">
      <div class="text-center mb-16">
        <div class="inline-block relative mb-6">
          <h1 class="text-[#facc15] text-3xl tracking-tighter" style="text-shadow: 4px 4px 0 #854d0e;">
            SOPORTE TÉCNICO
          </h1>
          <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#facc15] to-transparent"></div>
        </div>
        <p class="text-[#facc15]/60 text-[9px] leading-8 max-w-2xl mx-auto uppercase tracking-widest">
          CONTACTA CON EL EQUIPO DE CODE & KINGDOMS PARA INCIDENCIAS, ACCESO O DUDAS SOBRE EL REINO.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <a
          v-for="contact in contacts"
          :key="contact.email"
          :href="contact.mailto"
          class="support-card group"
        >
          <span class="support-card__label">CONTACTO</span>
          <span class="support-card__name">{{ contact.name }}</span>
          <span class="support-card__email">{{ contact.email }}</span>
          <span class="support-card__action">ESCRIBIR CORREO</span>
        </a>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const contacts = [
  {
    name: 'Asier Aragón',
    email: 'aragonatanes@gmail.com',
    mailto: 'mailto:aragonatanes@gmail.com?subject=Soporte%20Code%20%26%20Kingdoms',
  },
  {
    name: 'Thani Amaru',
    email: 'thani.martinez2@gmail.com',
    mailto: 'mailto:thani.martinez2@gmail.com?subject=Soporte%20Code%20%26%20Kingdoms',
  },
  {
    name: 'Juan Diego Vazquez',
    email: 'juandiegovazquezsantana@gmail.com',
    mailto: 'mailto:juandiegovazquezsantana@gmail.com?subject=Soporte%20Code%20%26%20Kingdoms',
  },
]
</script>

<style scoped>
.support-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border: 2px solid rgba(250, 204, 21, 0.15);
  background: rgba(15, 23, 42, 0.65);
  text-decoration: none;
  transition: all 0.25s ease;
}

.support-card:hover {
  border-color: #facc15;
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.support-card__label {
  color: rgba(250, 204, 21, 0.45);
  font-size: 7px;
  letter-spacing: 0.25em;
}

.support-card__name {
  color: #facc15;
  font-size: 11px;
  letter-spacing: 0.08em;
}

.support-card__email {
  color: rgba(255, 255, 255, 0.75);
  font-size: 8px;
  word-break: break-all;
}

.support-card__action {
  margin-top: 8px;
  color: rgba(250, 204, 21, 0.55);
  font-size: 7px;
  letter-spacing: 0.2em;
}
</style>
