<template>
  <div
    class="create-root"
    :class="embedded ? 'create-root--inline' : 'create-root--modal'"
    role="dialog"
    :aria-label="embedded ? 'Formulario crear personaje' : 'Crear personaje'"
  >
    <form class="create-card" @submit.prevent="onSubmit">
      <template v-if="!embedded">
        <h1 class="title">Code Kingdoms</h1>
        <p class="sub">Crea tu personaje (cuenta Laravel + API)</p>
      </template>
      <label class="field">
        <span>Nombre</span>
        <input v-model.trim="name" type="text" required maxlength="50" autocomplete="username" />
      </label>
      <label class="field">
        <span>Reino</span>
        <select v-model="id_kingdom" required>
          <option v-for="k in kingdoms" :key="k.id_kingdom" :value="k.id_kingdom">
            {{ k.name }}
          </option>
        </select>
      </label>
      <label class="field">
        <span>Raza</span>
        <select v-model="id_race" required>
          <option v-for="r in races" :key="r.id_race" :value="r.id_race">
            {{ r.name }}
          </option>
        </select>
      </label>
      <label class="field">
        <span>Clase</span>
        <select v-model="id_class" required>
          <option v-for="c in classes" :key="c.id_class" :value="c.id_class">
            {{ c.name }}
          </option>
        </select>
      </label>
      <p v-if="err" class="err">{{ err }}</p>
      <button class="btn" type="submit" :disabled="sending">
        {{ sending ? 'Creando…' : submitLabel }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import api from '../api/axios'
import { createCharacter } from '../api/character'

const props = defineProps({
  /** Modo embebido en el menú: sin capa a pantalla completa ni cabecera de marca. */
  embedded: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Crear y entrar' },
})

const emit = defineEmits(['created'])

const name = ref('')
const id_kingdom = ref(null)
const id_race = ref(null)
const id_class = ref(null)
const kingdoms = ref([])
const races = ref([])
const classes = ref([])

const err = ref(null)
const sending = ref(false)

onMounted(async () => {
  err.value = null
  try {
    const [k, r, cl] = await Promise.all([api.get('/kingdoms'), api.get('/races'), api.get('/classes')])
    kingdoms.value = Array.isArray(k.data) ? k.data : []
    races.value = Array.isArray(r.data) ? r.data : []
    classes.value = Array.isArray(cl.data) ? cl.data : []
    if (kingdoms.value[0]) id_kingdom.value = kingdoms.value[0].id_kingdom
    if (races.value[0]) id_race.value = races.value[0].id_race
    if (classes.value[0]) id_class.value = classes.value[0].id_class
  } catch (e) {
    err.value = e?.response?.data?.message ?? e?.message ?? 'No se han podido cargar reino/raza/clase.'
  }
})

watch(
  [kingdoms, races, classes],
  () => {
    if (id_kingdom.value == null && kingdoms.value[0]) {
      id_kingdom.value = kingdoms.value[0].id_kingdom
    }
    if (id_race.value == null && races.value[0]) {
      id_race.value = races.value[0].id_race
    }
    if (id_class.value == null && classes.value[0]) {
      id_class.value = classes.value[0].id_class
    }
  },
  { deep: true },
)

async function onSubmit() {
  if (sending.value) {
    return
  }
  err.value = null
  sending.value = true
  try {
    const ch = await createCharacter({
      name: name.value,
      id_kingdom: id_kingdom.value,
      id_race: id_race.value,
      id_class: id_class.value,
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
      err.value = e?.message || 'Error al crear.'
    }
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.create-root--modal {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(12, 18, 10, 0.92);
}
.create-root--inline {
  position: static;
  width: 100%;
  display: block;
  background: transparent;
}
.create-card {
  width: min(420px, 92vw);
  padding: 1.4rem 1.25rem 1.5rem;
  border: 5px solid #2b1f13;
  background: linear-gradient(180deg, #4a3b28 0%, #2b2218 100%);
  box-shadow: 0 0 0 4px #6b5538, 10px 12px 0 rgba(0, 0, 0, 0.4);
  font-family: 'Press Start 2P', 'Courier New', monospace;
  color: #f7ebd0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.title {
  font-size: 12px;
  text-align: center;
  margin: 0 0 4px;
  color: #ffd7a0;
  text-shadow: 2px 2px 0 #1a1a1a;
}
.sub {
  font-size: 7px;
  line-height: 1.6;
  margin: 0 0 8px;
  text-align: center;
  color: #b8a88a;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 8px;
}
.field span {
  color: #c9b27a;
}
input,
select {
  font: 10px 'Press Start 2P', monospace;
  padding: 8px 6px;
  background: #1a1510;
  color: #f0e6d0;
  border: 2px solid #1f1f1f;
}
input:focus,
select:focus {
  outline: 2px solid #c98259;
}
.btn {
  margin-top: 8px;
  padding: 10px 8px;
  font: 9px 'Press Start 2P', monospace;
  text-transform: uppercase;
  border: 3px solid #1f1f1f;
  background: #5a8f4a;
  color: #0f0f0f;
  cursor: pointer;
  box-shadow: 3px 4px 0 #1a1a1a;
}
.btn:hover:enabled {
  background: #6b9e5a;
}
.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.err {
  margin: 0;
  font-size: 7px;
  line-height: 1.5;
  color: #e08070;
}
</style>
