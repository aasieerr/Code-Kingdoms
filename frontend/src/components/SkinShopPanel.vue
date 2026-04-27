<template>
  <section class="skin-panel" @click.stop>
    <header class="skin-h">
      <h2>Apariencia (CodeCoins)</h2>
      <button type="button" class="close-btn" @click="$emit('close')">X</button>
    </header>
    <p class="skin-balance">CodeCoins: <strong>{{ codeCoinsDisplay }}</strong></p>

    <div v-if="loading" class="skin-status">Cargando…</div>
    <div v-else-if="err" class="skin-status err">{{ err }}</div>
    <ul v-else class="skin-list">
      <li
        v-for="s in skins"
        :key="s.id"
        class="skin-row"
        :class="{ current: s.id === equippedId }"
      >
        <div
          class="swatch"
          :style="{
            background: `linear-gradient(135deg, ${s.color_still} 50%, ${s.color_moving} 50%)`,
          }"
        />
        <div class="skin-info">
          <p class="skin-name">{{ s.name }}</p>
          <p class="skin-price">{{ s.price_code_coins }} CodeCoins</p>
        </div>
        <div class="skin-actions">
          <button
            v-if="!isOwned(s.id)"
            type="button"
            class="act buy"
            :disabled="actionId === s.id"
            @click="buy(s)"
          >
            {{ actionId === s.id ? '…' : 'Comprar' }}
          </button>
          <button
            v-else-if="s.id !== equippedId"
            type="button"
            class="act equip"
            :disabled="actionId === s.id"
            @click="equip(s.id)"
          >
            Equipar
          </button>
          <span v-else class="tag">En uso</span>
        </div>
      </li>
    </ul>
    <p v-if="msg" class="skin-msg">{{ msg }}</p>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { fetchSkinsCatalog, purchaseSkin, equipSkin } from '../api/skins'
import { ensureActiveCharacterId, fetchCharacter } from '../api/character'
import { activeCharacterId } from '../gameState'
import { useCharacterStore } from '../stores/character'


const emit = defineEmits(['close', 'wallet-updated'])

const skins = ref([])
const ownedIds = ref(new Set())
const characterStore = useCharacterStore()
const equippedId = ref(null)

const loading = ref(true)
const err = ref(null)
const actionId = ref(null)
const msg = ref('')

const codeCoinsDisplay = computed(() => (loading.value ? '—' : characterStore.codeCoins))


function isOwned(id) {
  return ownedIds.value.has(id)
}

async function load() {
  loading.value = true
  err.value = null
  msg.value = ''
  try {
    await ensureActiveCharacterId()
    if (activeCharacterId.value == null) {
      err.value = 'Crea un personaje en el mapa principal antes de ir a la tienda de apariencias.'
      return
    }
    const [list, ch] = await Promise.all([fetchSkinsCatalog(), fetchCharacter(activeCharacterId.value)])
    skins.value = list
    // Actualizar el store también para que todo esté sincronizado
    characterStore.codeCoins = ch.code_coins ?? 0
    characterStore.gold = ch.gold ?? 0
    equippedId.value = ch.equipped_skin_id ?? null

    const ids = ch.owned_skin_ids
    if (Array.isArray(ids)) {
      ownedIds.value = new Set(ids.map(Number))
    }
  } catch (e) {
    err.value = e?.message ?? e?.response?.data?.message ?? 'Error al cargar.'
  } finally {
    loading.value = false
  }
}

async function buy(s) {
  actionId.value = s.id
  msg.value = ''
  try {
    const res = await purchaseSkin(s.id)
    if (res?.user?.code_coins != null) {
      characterStore.codeCoins = res.user.code_coins
    }
    ownedIds.value.add(s.id)
    emit('wallet-updated')
    await characterStore.refresh()
    await equip(s.id)

  } catch (e) {
    const d = e?.response?.data
    msg.value = d?.message
      || d?.errors?.code_coins?.[0]
      || d?.errors?.skin_id?.[0]
      || e?.message
      || 'No se pudo comprar.'
  } finally {
    actionId.value = null
  }
}

async function equip(skinId) {
  actionId.value = skinId
  msg.value = ''
  try {
    const ch = await equipSkin(skinId)
    equippedId.value = ch.equipped_skin_id
    emit('wallet-updated')
    await characterStore.refresh()

  } catch (e) {
    const d = e?.response?.data
    msg.value = d?.message || 'No se pudo equipar.'
  } finally {
    actionId.value = null
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.skin-panel {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  width: min(520px, 94vw);
  max-height: min(80vh, 560px);
  overflow: auto;
  border: 5px solid #1f1f1f;
  background: linear-gradient(180deg, #1e1428 0%, #0f0a16 100%);
  box-shadow: 0 0 0 5px #5e35b1, 12px 12px 0 rgba(0, 0, 0, 0.5);
  color: #ede7f6;
  padding: 16px;
  font-family: 'Press Start 2P', 'Courier New', monospace;
}
.skin-h {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.skin-h h2 { font-size: 11px; margin: 0; }
.close-btn {
  width: 34px;
  height: 34px;
  border: 2px solid #0f1518;
  background: #b74a3c;
  color: #fff7e6;
  cursor: pointer;
  font-family: inherit;
}
.skin-balance { font-size: 8px; margin: 0 0 12px; color: #b39ddb; }
.skin-status { min-height: 100px; display: grid; place-items: center; font-size: 9px; }
.skin-status.err { color: #ef9a9a; }
.skin-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.skin-row {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 3px solid #111;
  background: #2a1f3d;
  padding: 8px 10px;
}
.skin-row.current { border-color: #8bc34a; }
.swatch {
  width: 40px;
  height: 40px;
  border: 2px solid #0a0a0a;
  flex-shrink: 0;
  border-radius: 4px;
}
.skin-info { flex: 1; min-width: 0; }
.skin-name { font-size: 8px; margin: 0 0 4px; }
.skin-price { font-size: 7px; margin: 0; opacity: 0.9; }
.skin-actions { flex-shrink: 0; }
.act {
  font-size: 7px;
  font-family: inherit;
  padding: 8px 10px;
  border: 2px solid #111;
  cursor: pointer;
  text-transform: uppercase;
}
.act:disabled { opacity: 0.5; cursor: not-allowed; }
.act.buy { background: #7b1fa2; color: #f3e5f5; }
.act.equip { background: #558b2f; color: #f1f8e9; }
.tag { font-size: 7px; color: #aed581; }
.skin-msg { font-size: 7px; color: #ffab91; margin: 10px 0 0; }
</style>
