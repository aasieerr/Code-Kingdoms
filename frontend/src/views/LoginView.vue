<template>
  <div class="auth">
    <div class="auth__card">
      <img class="auth__logo" src="/code-kingdoms-logo.png" alt="" width="72" height="72" />
      <h1 class="auth__title">Code Kingdoms</h1>
      <p class="auth__subtitle">Cargando...</p>

      <!--
      <p v-if="errorMsg" class="auth__err">{{ errorMsg }}</p>

      <form v-if="mode === 'login'" class="auth__form" @submit.prevent="submitLogin">
        <label class="auth__label">Email</label>
        <input v-model="loginEmail" type="email" class="auth__input" required autocomplete="email" />
        <label class="auth__label">Contraseña</label>
        <input v-model="loginPassword" type="password" class="auth__input" required autocomplete="current-password" />
        <button type="submit" class="auth__btn" :disabled="busy">Entrar</button>
      </form>

      <form v-else class="auth__form" @submit.prevent="submitRegister">
        <label class="auth__label">Nombre</label>
        <input v-model="regName" type="text" class="auth__input" required maxlength="255" autocomplete="name" />
        <label class="auth__label">Email</label>
        <input v-model="regEmail" type="email" class="auth__input" required autocomplete="email" />
        <label class="auth__label">Contraseña</label>
        <input v-model="regPassword" type="password" class="auth__input" required autocomplete="new-password" />
        <label class="auth__label">Repite contraseña</label>
        <input v-model="regPassword2" type="password" class="auth__input" required autocomplete="new-password" />
        <button type="submit" class="auth__btn" :disabled="busy">Registrarse</button>
      </form>

      <p class="auth__switch">
        <button type="button" class="auth__link" @click="toggleMode">
          {{ mode === 'login' ? '¿Sin cuenta? Regístrate' : '¿Ya tienes cuenta? Entrar' }}
        </button>
      </p>
      -->
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { setActiveCharacterId } from '../gameState'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  // Bypass authentication and go directly to the game
  authStore.setSession({ token: 'fake-token', user: { id: 1, name: 'Demo User' } })
  setActiveCharacterId(1) // Fake character ID
  router.replace('/game')
})
</script>

<style scoped>
.auth {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  box-sizing: border-box;
  background: linear-gradient(180deg, #1a2418 0%, #0d120c 100%);
  font-family: 'Press Start 2P', 'Courier New', monospace;
}
.auth__card {
  width: 100%;
  max-width: 420px;
  padding: 1.75rem 1.5rem 1.5rem;
  border: 4px solid #2b1f13;
  border-radius: 4px;
  background: rgba(20, 28, 18, 0.95);
  color: #f0e6d0;
  text-align: center;
}
.auth__logo {
  display: block;
  margin: 0 auto 1rem;
  image-rendering: pixelated;
}
.auth__title {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  line-height: 1.4;
}
.auth__subtitle {
  margin: 0 0 1.25rem;
  font-size: 0.55rem;
  opacity: 0.85;
}
.auth__err {
  margin: 0 0 1rem;
  font-size: 0.45rem;
  line-height: 1.5;
  color: #f5a623;
  text-align: left;
}
.auth__form {
  text-align: left;
}
.auth__label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.45rem;
  opacity: 0.9;
}
.auth__input {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 0.85rem;
  padding: 0.55rem 0.65rem;
  font-family: inherit;
  font-size: 0.5rem;
  border: 3px solid #2b1f13;
  border-radius: 2px;
  background: #0d120c;
  color: #f0e6d0;
}
.auth__input:focus {
  outline: none;
  border-color: #6b9e4e;
}
.auth__btn {
  width: 100%;
  margin-top: 0.35rem;
  padding: 0.65rem 1rem;
  font-family: inherit;
  font-size: 0.5rem;
  cursor: pointer;
  border: 3px solid #2b1f13;
  border-radius: 2px;
  background: #6b9e4e;
  color: #0d120c;
}
.auth__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.auth__switch {
  margin: 1.25rem 0 0;
  font-size: 0.45rem;
}
.auth__link {
  font-family: inherit;
  font-size: inherit;
  background: none;
  border: none;
  color: #9bc88a;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}
</style>
