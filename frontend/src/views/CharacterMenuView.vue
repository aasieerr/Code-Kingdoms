<template>
  <div class="char-menu">
    <header class="char-menu__header">
      <div class="char-menu__brand">
        <img class="char-menu__logo" src="/code-kingdoms-logo.png" alt="" width="64" height="64" />
        <div>
          <h1 class="char-menu__title">Code Kingdoms</h1>
          <p v-if="authName" class="char-menu__user">Sesión: {{ authName }}</p>
        </div>
      </div>
      <div class="char-menu__header-actions">
        <button type="button" class="btn-ghost" @click="goGame" :disabled="!activeCharacterId">
          Continuar
        </button>
        <button type="button" class="btn-logout" @click="logout">Cerrar sesión</button>
      </div>
    </header>

    <p v-if="loadErr" class="char-menu__err">{{ loadErr }}</p>

    <div v-else class="char-menu__grid">
      <section class="char-menu__panel char-menu__panel--list" aria-labelledby="h-list">
        <h2 id="h-list" class="char-menu__h2">Mis personajes</h2>
        <p v-if="!loading && characters.length === 0" class="char-menu__empty">
          Aún no tienes personajes. Crea uno en el panel de la derecha.
        </p>
        <ul v-else class="char-list">
          <li
            v-for="c in characters"
            :key="c.id"
            class="char-card"
            :class="{ 'char-card--active': activeCharacterId === c.id }"
          >
            <div class="char-card__body">
              <h3 class="char-card__name">{{ c.name }}</h3>
              <p class="char-card__meta">
                Nivel {{ c.level }} ·
                {{ labelKingdom(c) }} ·
                {{ labelRace(c) }} ·
                {{ labelClass(c) }}
              </p>
            </div>
            <div class="char-card__actions">
              <button type="button" class="btn-play" @click="playAs(c)">Jugar</button>
            </div>
          </li>
        </ul>
        <p v-if="loading" class="char-menu__loading">Cargando…</p>
      </section>

      <section class="char-menu__panel char-menu__panel--create" aria-labelledby="h-create">
        <h2 id="h-create" class="char-menu__h2">Crear personaje</h2>
        <p class="char-menu__hint">Elige reino, raza, clase y nombre. Luego podrás entrar al mapa.</p>
        <CreateCharacterForm
          embedded
          submit-label="Crear personaje"
          @created="onCharacterCreated"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { activeCharacterId, setActiveCharacterId } from '../gameState'
import { fetchCharacters } from '../api/character'
import CreateCharacterForm from '../components/CreateCharacterForm.vue'

const router = useRouter()
const authStore = useAuthStore()

const characters = ref([])
const loading = ref(true)
const loadErr = ref(null)

const authName = computed(
  () => authStore.user?.name || authStore.user?.username || authStore.user?.email || '',
)

onMounted(() => {
  loadList()
})

async function loadList() {
  loading.value = true
  loadErr.value = null
  try {
    characters.value = await fetchCharacters()
  } catch (e) {
    loadErr.value = e?.response?.data?.message || e?.message || 'Error al cargar personajes.'
    characters.value = []
  } finally {
    loading.value = false
  }
}

function labelKingdom(c) {
  return c.kingdom?.name ?? '—'
}
function labelRace(c) {
  return c.race?.name ?? '—'
}
function labelClass(c) {
  return c.character_class?.name ?? c.characterClass?.name ?? '—'
}

function playAs(c) {
  if (c?.id == null) {
    return
  }
  setActiveCharacterId(c.id)
  router.push({ name: 'Game' })
}

function goGame() {
  if (activeCharacterId.value == null) {
    return
  }
  router.push({ name: 'Game' })
}

async function onCharacterCreated(ch) {
  if (ch?.id != null) {
    setActiveCharacterId(ch.id)
  }
  await loadList()
  router.push({ name: 'Game' })
}

async function logout() {
  setActiveCharacterId(null)
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.char-menu {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 1.25rem 1.5rem 2rem;
  background:
    linear-gradient(180deg, #1a2418 0%, #0d120c 100%);
  font-family: 'Press Start 2P', 'Courier New', monospace;
  color: #f0e6d0;
}
.char-menu__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 4px solid #2b1f13;
  box-shadow: 0 4px 0 #0a0a0a;
}
.char-menu__brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
.char-menu__logo {
  object-fit: contain;
  image-rendering: pixelated;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}
.char-menu__title {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: #ffd7a0;
  text-shadow: 2px 2px 0 #0d0d0d;
}
.char-menu__user {
  margin: 0.4rem 0 0;
  font-size: 6px;
  line-height: 1.5;
  color: #8faf88;
  word-break: break-all;
}
.char-menu__header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.btn-ghost {
  padding: 0.5rem 0.75rem;
  font: 8px 'Press Start 2P', inherit;
  border: 3px solid #1f1f1f;
  background: #5a6f5a;
  color: #f0f0e0;
  cursor: pointer;
}
.btn-ghost:hover:not(:disabled) {
  background: #6b8a6b;
}
.btn-ghost:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-logout {
  padding: 0.5rem 0.75rem;
  font: 8px 'Press Start 2P', inherit;
  border: 3px solid #1f1f1f;
  background: #8f3b2c;
  color: #f7ebd0;
  cursor: pointer;
}
.btn-logout:hover {
  background: #a24a3a;
}
.char-menu__err {
  color: #e88878;
  font-size: 8px;
  line-height: 1.6;
}
.char-menu__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
}
@media (max-width: 900px) {
  .char-menu__grid {
    grid-template-columns: 1fr;
  }
}
.char-menu__panel {
  border: 4px solid #2b1f13;
  background: linear-gradient(180deg, #3d3225 0%, #252016 100%);
  box-shadow: 0 0 0 3px #5c4a32, 8px 8px 0 rgba(0, 0, 0, 0.35);
  padding: 1rem 0.9rem 1.1rem;
  min-width: 0;
}
.char-menu__h2 {
  margin: 0 0 0.6rem;
  font-size: 9px;
  color: #e8d4a8;
  border-bottom: 2px solid #1f1f1f;
  padding-bottom: 0.4rem;
}
.char-menu__empty,
.char-menu__hint {
  font-size: 6px;
  line-height: 1.6;
  color: #9a8f78;
  margin: 0.5rem 0 0.75rem;
}
.char-menu__loading {
  font-size: 7px;
  color: #b0a88a;
  margin: 0.5rem 0 0;
}
.char-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  max-height: min(60vh, 480px);
  overflow-y: auto;
}
.char-card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.55rem 0.5rem;
  border: 3px solid #1a1510;
  background: #1e1812;
  transition: box-shadow 0.15s ease, border-color 0.15s;
}
.char-card--active {
  border-color: #5a8f4a;
  box-shadow: 0 0 0 2px rgba(90, 143, 74, 0.4);
}
.char-card__name {
  margin: 0;
  font-size: 8px;
  color: #f5e6c0;
}
.char-card__meta {
  margin: 0;
  font-size: 5.5px;
  line-height: 1.7;
  color: #8a7b68;
}
.char-card__actions {
  display: flex;
  justify-content: flex-end;
}
.btn-play {
  padding: 0.35rem 0.55rem;
  font: 7px 'Press Start 2P', inherit;
  border: 2px solid #0f0f0f;
  background: #c9a24a;
  color: #1a1208;
  cursor: pointer;
  box-shadow: 2px 2px 0 #0a0a0a;
}
.btn-play:hover {
  background: #d4b15a;
}
</style>
