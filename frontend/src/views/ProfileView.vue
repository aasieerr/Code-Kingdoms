<template>
  <div class="pixel-page min-h-screen flex flex-col">
    <AppHeader />

    <div
      class="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
      style="background: repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 2px);"
    ></div>

    <main class="relative z-10 max-w-5xl mx-auto px-6 py-20 flex-grow w-full">
      <div class="text-center mb-16">
        <div class="inline-block relative mb-6">
          <h1 class="text-[#facc15] text-3xl tracking-tighter" style="text-shadow: 4px 4px 0 #854d0e;">
            MI PERFIL
          </h1>
          <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#facc15] to-transparent"></div>
        </div>
        <p class="text-[#facc15]/60 text-[9px] leading-8 max-w-2xl mx-auto uppercase tracking-widest">
          GESTIONA TU IDENTIDAD EN EL REINO, TU FOTO Y TUS CREDENCIALES.
        </p>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-6">
        <div class="w-16 h-16 border-4 border-[#facc15]/20 border-t-[#facc15] rounded-full animate-spin"></div>
        <span class="text-[#facc15] text-[10px] animate-pulse">CARGANDO PERFIL...</span>
      </div>

      <div v-else class="profile-grid">
        <section class="profile-panel">
          <h2 class="profile-panel__title">FOTO DE PERFIL</h2>
          <div class="profile-avatar-block">
            <UserAvatar :name="form.name" :avatar-url="avatarPreview" size="lg" />
            <div class="profile-avatar-actions">
              <label class="profile-upload-btn">
                SUBIR FOTO
                <input type="file" accept="image/png,image/jpeg,image/webp" class="sr-only" @change="onAvatarSelected" />
              </label>
              <button
                v-if="avatarPreview"
                type="button"
                class="profile-link-btn profile-link-btn--danger"
                :disabled="avatarBusy"
                @click="clearAvatar"
              >
                QUITAR FOTO
              </button>
            </div>
            <p class="profile-hint">PNG, JPG o WEBP. Máximo 2 MB.</p>
          </div>
        </section>

        <section class="profile-panel">
          <h2 class="profile-panel__title">DATOS DEL HÉROE</h2>
          <p v-if="profileMsg" class="profile-msg">{{ profileMsg }}</p>
          <p v-if="profileErr" class="profile-err">{{ profileErr }}</p>

          <form class="profile-form" @submit.prevent="saveProfile">
            <div class="pixel-field">
              <label class="pixel-label">NOMBRE DE USUARIO</label>
              <input v-model="form.name" type="text" class="pixel-input" required maxlength="255" autocomplete="name" />
            </div>

            <div class="pixel-field">
              <label class="pixel-label">EMAIL DE LA CUENTA</label>
              <p class="profile-email">{{ form.email }}</p>
              <p class="profile-email-note">
                Para cambiar el correo, contacta con
                <router-link to="/soporte" class="profile-support-link">soporte técnico</router-link>.
              </p>
            </div>

            <button type="submit" class="btn-pixel-gold profile-submit" :disabled="profileBusy">
              {{ profileBusy ? 'GUARDANDO...' : 'GUARDAR CAMBIOS' }}
            </button>
          </form>
        </section>

        <section class="profile-panel profile-panel--wide">
          <h2 class="profile-panel__title">SEGURIDAD</h2>
          <p v-if="passwordMsg" class="profile-msg">{{ passwordMsg }}</p>
          <p v-if="passwordErr" class="profile-err">{{ passwordErr }}</p>

          <form class="profile-form" @submit.prevent="savePassword">
            <div class="pixel-field">
              <label class="pixel-label">CONTRASEÑA ACTUAL</label>
              <input v-model="passwordForm.current_password" type="password" class="pixel-input" required autocomplete="current-password" />
            </div>

            <div class="pixel-field">
              <label class="pixel-label">NUEVA CONTRASEÑA</label>
              <input v-model="passwordForm.password" type="password" class="pixel-input" required autocomplete="new-password" />
            </div>

            <div class="pixel-field">
              <label class="pixel-label">REPETIR NUEVA CONTRASEÑA</label>
              <input v-model="passwordForm.password_confirmation" type="password" class="pixel-input" required autocomplete="new-password" />
            </div>

            <button type="submit" class="btn-pixel-gold profile-submit" :disabled="passwordBusy">
              {{ passwordBusy ? 'ACTUALIZANDO...' : 'CAMBIAR CONTRASEÑA' }}
            </button>
          </form>
        </section>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import UserAvatar from '../components/UserAvatar.vue'
import { fetchProfile, removeAvatar, updatePassword, updateProfile, uploadAvatar } from '../api/profile'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const loading = ref(true)
const profileBusy = ref(false)
const passwordBusy = ref(false)
const avatarBusy = ref(false)
const profileMsg = ref('')
const profileErr = ref('')
const passwordMsg = ref('')
const passwordErr = ref('')
const avatarPreview = ref(null)
const pendingAvatarData = ref(null)

const form = reactive({
  name: '',
  email: '',
})

const passwordForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

function applyUser(user) {
  form.name = user?.name || ''
  form.email = user?.email || ''
  avatarPreview.value = user?.avatar_url || null
  pendingAvatarData.value = null
  authStore.updateUser(user)
}

async function loadProfile() {
  loading.value = true
  try {
    const user = await fetchProfile()
    applyUser(user)
  } catch (error) {
    profileErr.value = error.response?.data?.message || 'No se pudo cargar el perfil.'
  } finally {
    loading.value = false
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })
}

async function onAvatarSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    profileErr.value = 'La imagen supera el límite de 2 MB.'
    return
  }

  profileErr.value = ''
  profileMsg.value = ''

  try {
    const dataUrl = await readFileAsDataUrl(file)
    pendingAvatarData.value = dataUrl
    avatarPreview.value = dataUrl
    await saveAvatar()
  } catch (error) {
    profileErr.value = error.message || 'No se pudo preparar la imagen.'
  }
}

async function saveAvatar() {
  if (!pendingAvatarData.value) return

  avatarBusy.value = true
  profileErr.value = ''
  profileMsg.value = ''

  try {
    const { user, message } = await uploadAvatar(pendingAvatarData.value)
    applyUser(user)
    profileMsg.value = message
  } catch (error) {
    profileErr.value = error.response?.data?.message || 'No se pudo subir la foto de perfil.'
    avatarPreview.value = authStore.user?.avatar_url || null
    pendingAvatarData.value = null
  } finally {
    avatarBusy.value = false
  }
}

async function clearAvatar() {
  if (!avatarPreview.value || avatarBusy.value) return
  if (!confirm('¿Quieres quitar tu foto de perfil?')) return

  avatarBusy.value = true
  profileErr.value = ''
  profileMsg.value = ''

  try {
    const { user, message } = await removeAvatar()
    applyUser(user)
    profileMsg.value = message
  } catch (error) {
    profileErr.value = error.response?.data?.message || 'No se pudo quitar la foto de perfil.'
  } finally {
    avatarBusy.value = false
  }
}

async function saveProfile() {
  profileBusy.value = true
  profileMsg.value = ''
  profileErr.value = ''

  try {
    const { user, message } = await updateProfile({
      name: form.name.trim(),
    })
    applyUser(user)
    profileMsg.value = message
  } catch (error) {
    profileErr.value = error.response?.data?.message || 'No se pudo actualizar el perfil.'
  } finally {
    profileBusy.value = false
  }
}

async function savePassword() {
  passwordBusy.value = true
  passwordMsg.value = ''
  passwordErr.value = ''

  try {
    const { message } = await updatePassword({ ...passwordForm })
    passwordMsg.value = message
    passwordForm.current_password = ''
    passwordForm.password = ''
    passwordForm.password_confirmation = ''
  } catch (error) {
    const fieldError = error.response?.data?.errors?.current_password?.[0]
    passwordErr.value = fieldError || error.response?.data?.message || 'No se pudo actualizar la contraseña.'
  } finally {
    passwordBusy.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.profile-panel {
  padding: 1.5rem;
  border: 2px solid rgba(250, 204, 21, 0.15);
  background: rgba(15, 23, 42, 0.65);
}

.profile-panel--wide {
  grid-column: 1 / -1;
}

.profile-panel__title {
  margin: 0 0 1.25rem;
  color: #facc15;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
}

.profile-avatar-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-avatar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.profile-upload-btn,
.profile-link-btn {
  border: 2px solid rgba(250, 204, 21, 0.25);
  background: rgba(11, 13, 23, 0.9);
  color: #facc15;
  padding: 0.65rem 1rem;
  font-family: inherit;
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-upload-btn:hover,
.profile-link-btn:hover {
  border-color: #facc15;
}

.profile-link-btn--danger {
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.35);
}

.profile-hint {
  margin: 0;
  color: rgba(250, 204, 21, 0.35);
  font-size: 0.5rem;
  letter-spacing: 0.08em;
  text-align: center;
}

.profile-email {
  margin: 0;
  padding: 0.85rem 1rem;
  border: 2px solid rgba(250, 204, 21, 0.15);
  background: rgba(11, 13, 23, 0.75);
  color: #fef9c3;
  font-size: 0.55rem;
  letter-spacing: 0.06em;
  word-break: break-all;
}

.profile-email-note {
  margin: 0.75rem 0 0;
  color: rgba(250, 204, 21, 0.45);
  font-size: 0.5rem;
  line-height: 1.7;
  letter-spacing: 0.06em;
}

.profile-support-link {
  color: #facc15;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.profile-support-link:hover {
  color: #fff;
}

.profile-form {
  text-align: left;
}

.profile-submit {
  width: 100%;
  margin-top: 0.5rem;
}

.profile-msg,
.profile-err {
  margin: 0 0 1rem;
  padding: 0.75rem;
  font-size: 0.5rem;
  letter-spacing: 0.08em;
}

.profile-msg {
  background: rgba(34, 197, 94, 0.12);
  border: 2px solid rgba(74, 222, 128, 0.35);
  color: #bbf7d0;
}

.profile-err {
  background: rgba(127, 29, 29, 0.35);
  border: 2px solid rgba(239, 68, 68, 0.45);
  color: #fecaca;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
