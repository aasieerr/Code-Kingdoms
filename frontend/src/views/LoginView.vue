<template>
  <div class="pixel-page min-h-screen flex flex-col">
    <AppHeader />
    
    <div class="flex-grow flex items-center justify-center relative px-6 py-12">
      <!-- Split background effect -->
      <div class="fixed inset-0 z-0 pointer-events-none">
        <div class="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/10 via-transparent to-[#7f1d1d]/10"></div>
      </div>

      <div class="auth-card relative z-10">
        <img class="auth-card__logo" src="/code-kingdoms-logo.png" alt="logo" width="80" height="80" />
        <h1 class="auth-card__title">CODE & KINGDOMS</h1>
        <p class="auth-card__subtitle">INGRESA AL REINO DEL CÓDIGO</p>

        <p v-if="errorMsg" class="auth-card__err">{{ errorMsg }}</p>

        <form v-if="mode === 'login'" class="auth-card__form" @submit.prevent="submitLogin">
          <div class="pixel-field">
            <label class="pixel-label">EMAIL DE HÉROE</label>
            <input v-model="loginEmail" type="email" class="pixel-input" required autocomplete="email" placeholder="ejemplo@reino.com" />
          </div>
          
          <div class="pixel-field">
            <label class="pixel-label">CONTRASEÑA ARCANO</label>
            <div class="pixel-input-group">
              <input v-model="loginPassword" :type="showLoginPass ? 'text' : 'password'" class="pixel-input" required autocomplete="current-password" placeholder="••••••••" />
              <button type="button" class="pixel-pass-toggle" @click="showLoginPass = !showLoginPass">
                <svg v-if="!showLoginPass" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>

          <button type="submit" class="btn-pixel-gold w-full mt-2" :disabled="busy">
            {{ busy ? 'CARGANDO...' : 'ENTRAR AL REINO' }}
          </button>
        </form>

        <form v-else class="auth-card__form" @submit.prevent="submitRegister">
          <div class="pixel-field">
            <label class="pixel-label">NOMBRE DEL HÉROE</label>
            <input v-model="regName" type="text" class="pixel-input" required maxlength="255" autocomplete="name" placeholder="Tu nombre" />
          </div>
          
          <div class="pixel-field">
            <label class="pixel-label">EMAIL DE HÉROE</label>
            <input v-model="regEmail" type="email" class="pixel-input" required autocomplete="email" placeholder="tu@email.com" />
          </div>
          
          <div class="pixel-field">
            <label class="pixel-label">CONTRASEÑA</label>
            <div class="pixel-input-group">
              <input v-model="regPassword" :type="showRegPass ? 'text' : 'password'" class="pixel-input" required autocomplete="new-password" placeholder="••••••••" />
              <button type="button" class="pixel-pass-toggle" @click="showRegPass = !showRegPass">
                <svg v-if="!showRegPass" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>

          <div class="pixel-field">
            <label class="pixel-label">REPETIR CONTRASEÑA</label>
            <div class="pixel-input-group">
              <input v-model="regPassword2" :type="showRegPass2 ? 'text' : 'password'" class="pixel-input" required autocomplete="new-password" placeholder="••••••••" />
              <button type="button" class="pixel-pass-toggle" @click="showRegPass2 = !showRegPass2">
                <svg v-if="!showRegPass2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>

          <button type="submit" class="btn-pixel-gold w-full mt-2" :disabled="busy">
            {{ busy ? 'CARGANDO...' : 'REGISTRARSE' }}
          </button>
        </form>

        <p class="auth-card__switch">
          <button type="button" class="auth-card__link" @click="toggleMode">
            {{ mode === 'login' ? '¿SIN CUENTA? FORJA UNA' : '¿YA TIENES CUENTA? ENTRAR' }}
          </button>
        </p>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { login, register } from '../api/auth'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref('login')
const busy = ref(false)
const errorMsg = ref('')

const loginEmail = ref('')
const loginPassword = ref('')
const showLoginPass = ref(false)

const regName = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regPassword2 = ref('')
const showRegPass = ref(false)
const showRegPass2 = ref(false)

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errorMsg.value = ''
}

async function submitLogin() {
  if (busy.value) return
  busy.value = true
  errorMsg.value = ''
  try {
    const data = await login(loginEmail.value, loginPassword.value)
    authStore.setSession(data)
    router.push('/personajes')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Error al iniciar sesión'
  } finally {
    busy.value = false
  }
}

async function submitRegister() {
  if (busy.value) return
  if (regPassword.value !== regPassword2.value) {
    errorMsg.value = 'Las contraseñas no coinciden'
    return
  }
  busy.value = true
  errorMsg.value = ''
  try {
    const data = await register({
      name: regName.value,
      email: regEmail.value,
      password: regPassword.value,
      password_confirmation: regPassword2.value
    })
    authStore.setSession(data)
    router.push('/personajes')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Error al registrarse'
  } finally {
    busy.value = false
  }
}
</script>
