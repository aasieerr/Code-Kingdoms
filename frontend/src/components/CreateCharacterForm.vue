<template>
  <div
    class="create-root"
    :class="embedded ? 'create-root--inline' : 'create-root--modal'"
    role="dialog"
  >
    <form class="create-form" @submit.prevent="onSubmit">

      <template v-if="!embedded">
        <h1 class="create-form__title">FORJAR HÉROE</h1>
        <p class="create-form__sub">ELIGE TU DESTINO EN EL REINO DEL CÓDIGO</p>
      </template>

      <div class="field">
        <label class="field__label">NOMBRE DEL HÉROE</label>
        <input v-model.trim="name" type="text" required maxlength="50" autocomplete="username" class="field__input" />
      </div>

      <div class="field">
        <label class="field__label">REINO</label>
        <select v-model="id_kingdom" required class="field__input" :disabled="kingdoms.length === 0">
          <option value="" disabled>{{ loadingCatalogs ? 'CARGANDO REINOS...' : 'SELECCIONA UN REINO' }}</option>
          <option v-for="k in kingdoms" :key="getId(k, 'id_kingdom')" :value="getId(k, 'id_kingdom')">
            {{ k.name ?? k.nombre ?? 'Sin nombre' }}
          </option>
        </select>
      </div>

      <div class="field">
        <label class="field__label">RAZA</label>
        <select v-model="id_race" required class="field__input" :disabled="races.length === 0">
          <option value="" disabled>{{ loadingCatalogs ? 'CARGANDO RAZAS...' : 'SELECCIONA UNA RAZA' }}</option>
          <option v-for="r in races" :key="getId(r, 'id_race')" :value="getId(r, 'id_race')">
            {{ r.name ?? r.nombre ?? 'Sin nombre' }}
          </option>
        </select>
      </div>

      <div class="field">
        <label class="field__label">CLASE</label>
        <select v-model="id_class" required class="field__input" :disabled="classes.length === 0">
          <option value="" disabled>{{ loadingCatalogs ? 'CARGANDO CLASES...' : 'SELECCIONA UNA CLASE' }}</option>
          <option v-for="c in classes" :key="getId(c, 'id_class')" :value="getId(c, 'id_class')">
            {{ c.name ?? c.nombre ?? 'Sin nombre' }}
          </option>
        </select>
      </div>

      <div class="field mt-4">
        <PixelArtEditor v-model="sprite" />
      </div>

      <p v-if="err" class="create-form__err">{{ err }}</p>

      <button class="create-form__btn" type="submit" :disabled="sending || loadingCatalogs || !kingdoms.length || !races.length || !classes.length || !id_kingdom || !id_race || !id_class">
        {{ sending ? 'FORJANDO...' : submitLabel }}
      </button>

    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../api/axios'
import { createCharacter } from '../api/character'
import PixelArtEditor from './PixelArtEditor.vue'

const props = defineProps({
  embedded: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'CREAR Y ENTRAR' },
})

const emit = defineEmits(['created'])

const name = ref('')
const id_kingdom = ref('')
const id_race = ref('')
const id_class = ref('')

function getStickman() {
  const s = Array(256).fill('')
  const c = '#ffffff' // White stickman
  // Head
  const head = [36,37,38,39,51,56,67,72,84,85,86,87]
  head.forEach(i => s[i] = c)
  // Torso
  for(let i=6; i<=11; i++) s[i*16 + 7] = c;
  for(let i=6; i<=11; i++) s[i*16 + 8] = c;
  // Arms
  for(let i=4; i<=11; i++) s[8*16 + i] = c;
  // Legs
  s[12*16+6]=c; s[12*16+9]=c;
  s[13*16+5]=c; s[13*16+10]=c;
  s[14*16+4]=c; s[14*16+11]=c;
  return s
}

const sprite = ref(Array(256).fill(''))
const kingdoms = ref([])
const races = ref([])
const classes = ref([])

const err = ref(null)
const sending = ref(false)
const loadingCatalogs = ref(false)

onMounted(async () => {
  err.value = null
  loadingCatalogs.value = true
  await loadCatalogs()
  loadingCatalogs.value = false
})

function extractCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

async function loadCatalogs() {
  const results = await Promise.allSettled([
    api.get('/kingdoms', { timeout: 8000 }),
    api.get('/races', { timeout: 8000 }),
    api.get('/classes', { timeout: 8000 }),
  ])

  const [kingdomsResult, racesResult, classesResult] = results

  kingdoms.value = kingdomsResult.status === 'fulfilled'
    ? extractCollection(kingdomsResult.value?.data)
    : []
  races.value = racesResult.status === 'fulfilled'
    ? extractCollection(racesResult.value?.data)
    : []
  classes.value = classesResult.status === 'fulfilled'
    ? extractCollection(classesResult.value?.data)
    : []

  const errors = results
    .filter(result => result.status === 'rejected')
    .map(result => result.reason?.response?.data?.message ?? result.reason?.message)
    .filter(Boolean)

  if (errors.length > 0 && !kingdoms.value.length && !races.value.length && !classes.value.length) {
    err.value = errors[0] ?? 'No se han podido cargar los datos.'
  }
}

function getId(item, preferredKey) {
  if (!item || typeof item !== 'object') return null
  const raw = item[preferredKey] ?? item.id ?? null
  if (raw == null || raw === '') return null
  return String(raw)
}

async function onSubmit() {
  if (sending.value) return
  if (!id_kingdom.value || !id_race.value || !id_class.value) {
    err.value = 'Selecciona reino, raza y clase.'
    return
  }
  err.value = null
  sending.value = true
  try {
    const ch = await createCharacter({
      name: name.value,
      id_kingdom: Number(id_kingdom.value),
      id_race: Number(id_race.value),
      id_class: Number(id_class.value),
      sprite_data: JSON.stringify(sprite.value)
    })
    emit('created', ch)
  } catch (e) {
    const data = e?.response?.data
    const errors = data?.errors
    if (errors && typeof errors === 'object') {
      err.value = Object.values(errors).flat().join(' ')
    } else if (typeof data?.message === 'string') {
      err.value = data.message
    } else {
      err.value = e?.message || 'Error al crear el personaje.'
    }
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
/* Modal mode */
.create-root--modal {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 13, 23, 0.95);
}
.create-root--inline {
  position: static;
  width: 100%;
  display: block;
  background: transparent;
}

/* Form */
.create-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  font-family: 'Press Start 2P', monospace;
  color: #facc15;
}
.create-form__title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  text-align: center;
  text-shadow: 3px 3px 0 #854d0e;
}
.create-form__sub {
  margin: 0 0 1rem;
  font-size: 0.5rem;
  text-align: center;
  color: rgba(250, 204, 21, 0.4);
  letter-spacing: 0.15em;
}
.create-form__err {
  margin: 0;
  padding: 0.75rem;
  background: #7f1d1d;
  border: 2px solid #ef4444;
  color: white;
  font-size: 0.5rem;
  line-height: 1.6;
}

/* Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.field__label {
  font-size: 0.5rem;
  letter-spacing: 0.15em;
  color: rgba(250, 204, 21, 0.7);
}
.field__input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 0.9rem;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  border: 3px solid #854d0e;
  background: #0b0d17;
  color: #facc15;
  appearance: none;
}
.field__input:focus {
  outline: none;
  border-color: #facc15;
}
.field__input option {
  background: #0f172a;
  color: #facc15;
}

/* Submit button */
.create-form__btn {
  margin-top: 0.5rem;
  padding: 1rem;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  border: 4px solid #facc15;
  background: #ca8a04;
  color: #fef9c3;
  box-shadow: 4px 4px 0 #854d0e;
  transition: all 0.1s;
}
.create-form__btn:hover:not(:disabled) {
  background: #facc15;
  color: #431407;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #854d0e;
}
.create-form__btn:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 #854d0e;
}
.create-form__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
