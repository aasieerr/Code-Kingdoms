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

      <div class="pixel-field">
        <label class="pixel-label">NOMBRE DEL HÉROE</label>
        <input v-model.trim="name" type="text" required maxlength="50" autocomplete="username" class="pixel-input" />
      </div>

      <div class="pixel-field">
        <label class="pixel-label">REINO</label>
        <select v-model="id_kingdom" required class="pixel-input">
          <option v-for="k in kingdoms" :key="k.id_kingdom" :value="k.id_kingdom">
            {{ k.name }}
          </option>
        </select>
      </div>

      <div class="pixel-field">
        <label class="pixel-label">RAZA</label>
        <select v-model="id_race" required class="pixel-input">
          <option v-for="r in races" :key="r.id_race" :value="r.id_race">
            {{ r.name }}
          </option>
        </select>
      </div>

      <div class="pixel-field">
        <label class="pixel-label">CLASE</label>
        <select v-model="id_class" required class="pixel-input">
          <option v-for="c in classes" :key="c.id_class" :value="c.id_class">
            {{ c.name }}
          </option>
        </select>
      </div>

      <div class="pixel-field mt-4">
        <PixelArtEditor v-model="sprite" />
      </div>

      <p v-if="err" class="create-form__err">{{ err }}</p>

      <button class="btn-pixel-gold w-full mt-2" type="submit" :disabled="sending">
        {{ sending ? 'FORJANDO...' : submitLabel }}
      </button>

    </form>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import api from '../api/axios'
import { createCharacter } from '../api/character'
import PixelArtEditor from './PixelArtEditor.vue'

const props = defineProps({
  embedded: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'CREAR Y ENTRAR' },
})

const emit = defineEmits(['created'])

const name = ref('')
const id_kingdom = ref(null)
const id_race = ref(null)
const id_class = ref(null)

const sprite = ref(Array(256).fill(''))
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
    err.value = e?.response?.data?.message ?? e?.message ?? 'No se han podido cargar los datos.'
  }
})

watch([kingdoms, races, classes], () => {
  if (id_kingdom.value == null && kingdoms.value[0]) id_kingdom.value = kingdoms.value[0].id_kingdom
  if (id_race.value == null && races.value[0]) id_race.value = races.value[0].id_race
  if (id_class.value == null && classes.value[0]) id_class.value = classes.value[0].id_class
}, { deep: true })

async function onSubmit() {
  if (sending.value) return
  err.value = null
  sending.value = true
  try {
    const ch = await createCharacter({
      name: name.value,
      id_kingdom: id_kingdom.value,
      id_race: id_race.value,
      id_class: id_class.value,
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
</style>
