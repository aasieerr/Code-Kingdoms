<template>
  <div class="auth-page min-h-screen flex flex-col bg-[#0b0d17]">
    <AppHeader />
    
    <div class="flex-grow flex items-center justify-center relative px-6 py-12">
      <div class="fixed inset-0 z-0 pointer-events-none">
        <div class="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/10 via-transparent to-[#7f1d1d]/10"></div>
      </div>

      <div class="auth__card relative z-10">
        <img class="auth__logo" src="/code-kingdoms-logo.png" alt="logo" width="80" height="80" />
        <h1 class="auth__title">CODE & KINGDOMS</h1>
        <p class="auth__subtitle">FORJA TU LEYENDA</p>

        <p v-if="errorMsg" class="auth__err">{{ errorMsg }}</p>

        <form class="auth__form" @submit.prevent="submitRegister">
          <label class="auth__label">NOMBRE DEL HÉROE</label>
          <input v-model="regName" type="text" class="auth__input" required maxlength="255" autocomplete="name" />
          <label class="auth__label">EMAIL DE HÉROE</label>
          <input v-model="regEmail" type="email" class="auth__input" required autocomplete="email" />
          <label class="auth__label">CONTRASEÑA</label>
          <input v-model="regPassword" type="password" class="auth__input" required autocomplete="new-password" />
          <label class="auth__label">REPETIR CONTRASEÑA</label>
          <input v-model="regPassword2" type="password" class="auth__input" required autocomplete="new-password" />
          <button type="submit" class="auth__btn" :disabled="busy">
            {{ busy ? 'CREANDO HÉROE...' : '► CREAR CUENTA' }}
          </button>
        </form>

        <p class="auth__switch">
          ¿YA TIENES CUENTA?
          <router-link to="/login" class="auth__link">INICIA SESIÓN</router-link>
        </p>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'
import { useAuthStore } from '../stores/auth'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const router = useRouter()
const authStore = useAuthStore()

const busy = ref(false)
const errorMsg = ref('')

const regName = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regPassword2 = ref('')

async function submitRegister() {
  if (regPassword.value !== regPassword2.value) {
    errorMsg.value = 'LAS CONTRASEÑAS NO COINCIDEN'
    return
  }
  
  busy.value = true
  errorMsg.value = ''
  try {
    const res = await api.post('/register', {
      name: regName.value,
      email: regEmail.value,
      password: regPassword.value,
      password_confirmation: regPassword2.value
    })
    authStore.setSession(res.data)
    router.push('/personajes')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Error al registrarse'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.auth-page {
  font-family: 'Press Start 2P', monospace;
  image-rendering: pixelated;
}
.auth__card {
  width: 100%;
  max-width: 480px;
  padding: 3rem 2rem;
  border: 4px solid #facc15;
  background: #0f172a;
  box-shadow: 10px 10px 0 #854d0e;
  color: #facc15;
  text-align: center;
}
.auth__logo {
  display: block;
  margin: 0 auto 1.5rem;
}
.auth__title {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  letter-spacing: 0.1em;
  text-shadow: 3px 3px 0 #854d0e;
}
.auth__subtitle {
  margin: 0 0 2.5rem;
  font-size: 0.55rem;
  color: rgba(250, 204, 21, 0.5);
  letter-spacing: 0.2em;
}
.auth__err {
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: #7f1d1d;
  border: 2px solid #ef4444;
  color: white;
  font-size: 0.5rem;
  text-align: center;
}
.auth__form {
  text-align: left;
}
.auth__label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.5rem;
  letter-spacing: 0.1em;
}
.auth__input {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 1.25rem;
  padding: 0.8rem 1rem;
  font-family: inherit;
  font-size: 0.6rem;
  border: 3px solid #854d0e;
  background: #0b0d17;
  color: #facc15;
}
.auth__input:focus {
  outline: none;
  border-color: #facc15;
}
.auth__btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 1rem;
  font-family: inherit;
  font-size: 0.7rem;
  cursor: pointer;
  border: 4px solid #facc15;
  background: #ca8a04;
  color: #fef9c3;
  box-shadow: 4px 4px 0 #854d0e;
  transition: all 0.1s;
}
.auth__btn:hover:not(:disabled) {
  background: #facc15;
  color: #431407;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #854d0e;
}
.auth__btn:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0 #854d0e;
}
.auth__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.auth__switch {
  margin-top: 2rem;
  font-size: 0.5rem;
  color: rgba(250, 204, 21, 0.4);
}
.auth__link {
  color: #facc15;
  text-decoration: underline;
  margin-left: 0.5rem;
}
.auth__link:hover {
  color: white;
}
</style>
