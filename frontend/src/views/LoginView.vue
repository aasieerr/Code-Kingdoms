<template>
  <div class="auth-page min-h-screen flex flex-col bg-[#0b0d17]">
    <AppHeader />
    
    <div class="flex-grow flex items-center justify-center relative px-6 py-12">
      <!-- Split background effect -->
      <div class="fixed inset-0 z-0 pointer-events-none">
        <div class="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/10 via-transparent to-[#7f1d1d]/10"></div>
      </div>

      <div class="auth__card relative z-10">
        <img class="auth__logo" src="/code-kingdoms-logo.png" alt="logo" width="80" height="80" />
        <h1 class="auth__title">CODE & KINGDOMS</h1>
        <p class="auth__subtitle">INGRESA AL REINO DEL CÓDIGO</p>

        <p v-if="errorMsg" class="auth__err">{{ errorMsg }}</p>

        <form v-if="mode === 'login'" class="auth__form" @submit.prevent="submitLogin">
          <div class="auth__field">
            <label class="auth__label">EMAIL DE HÉROE</label>
            <input v-model="loginEmail" type="email" class="auth__input" required autocomplete="email" placeholder="ejemplo@reino.com" />
          </div>
          
          <div class="auth__field">
            <label class="auth__label">CONTRASEÑA ARCANO</label>
            <div class="auth__input-group">
              <input v-model="loginPassword" :type="showLoginPass ? 'text' : 'password'" class="auth__input" required autocomplete="current-password" placeholder="••••••••" />
              <button type="button" class="auth__pass-toggle" @click="showLoginPass = !showLoginPass">
                <svg v-if="!showLoginPass" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>

          <button type="submit" class="auth__btn" :disabled="busy">
            {{ busy ? 'CARGANDO...' : 'ENTRAR AL REINO' }}
          </button>
        </form>

        <form v-else class="auth__form" @submit.prevent="submitRegister">
          <div class="auth__field">
            <label class="auth__label">NOMBRE DEL HÉROE</label>
            <input v-model="regName" type="text" class="auth__input" required maxlength="255" autocomplete="name" placeholder="Tu nombre" />
          </div>
          
          <div class="auth__field">
            <label class="auth__label">EMAIL DE HÉROE</label>
            <input v-model="regEmail" type="email" class="auth__input" required autocomplete="email" placeholder="tu@email.com" />
          </div>
          
          <div class="auth__field">
            <label class="auth__label">CONTRASEÑA</label>
            <div class="auth__input-group">
              <input v-model="regPassword" :type="showRegPass ? 'text' : 'password'" class="auth__input" required autocomplete="new-password" placeholder="••••••••" />
              <button type="button" class="auth__pass-toggle" @click="showRegPass = !showRegPass">
                <svg v-if="!showRegPass" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>

          <div class="auth__field">
            <label class="auth__label">REPETIR CONTRASEÑA</label>
            <div class="auth__input-group">
              <input v-model="regPassword2" :type="showRegPass2 ? 'text' : 'password'" class="auth__input" required autocomplete="new-password" placeholder="••••••••" />
              <button type="button" class="auth__pass-toggle" @click="showRegPass2 = !showRegPass2">
                <svg v-if="!showRegPass2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>

          <button type="submit" class="auth__btn" :disabled="busy">
            {{ busy ? 'CARGANDO...' : 'REGISTRARSE' }}
          </button>
        </form>

        <p class="auth__switch">
          <button type="button" class="auth__link" @click="toggleMode">
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
import api from '../api/axios'
import { useAuthStore } from '../stores/auth'
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
  busy.value = true
  errorMsg.value = ''
  try {
    const res = await api.post('/login', {
      email: loginEmail.value,
      password: loginPassword.value
    })
    authStore.setSession(res.data)
    router.push('/personajes')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Error al iniciar sesión'
  } finally {
    busy.value = false
  }
}

async function submitRegister() {
  if (regPassword.value !== regPassword2.value) {
    errorMsg.value = 'Las contraseñas no coinciden'
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
.auth__input-group .auth__input {
  padding-right: 3rem;
}
.auth__field {
  margin-bottom: 1.5rem;
}
.auth__input-group {
  position: relative;
}
.auth__pass-toggle {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  user-select: none;
  color: #facc15;
  z-index: 20;
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
}
.auth__link {
  font-family: inherit;
  font-size: inherit;
  background: none;
  border: none;
  color: #facc15;
  text-decoration: underline;
  cursor: pointer;
  opacity: 0.6;
}
.auth__link:hover {
  opacity: 1;
}
</style>
