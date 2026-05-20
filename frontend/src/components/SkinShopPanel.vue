<template>
  <!-- Overlay a pantalla completa: el panel tenía z-index 50 y quedaba detrás del HUD (100) y paneles (200). -->
  <div class="skin-shop-overlay" @click.self="$emit('close')">
    <section class="skin-panel" @click.stop>
    <header class="skin-h">
      <h2>Apariencia</h2>
      <button type="button" class="close-btn" @click="$emit('close')">X</button>
    </header>
    <p class="skin-balance">CodeCoins: <strong>{{ codeCoinsDisplay }}</strong></p>

    <div v-if="loading" class="skin-status">Cargando…</div>
    <div v-else-if="err" class="skin-status err">{{ err }}</div>
    <template v-else>
      <p v-if="displayedSkins.length === 0" class="catalog-hint">
        No hay aspectos de tienda en el catálogo (¿migración / seed?). Puedes seguir usando tu pixel-art.
      </p>
      <ul class="skin-list">
        <li
          v-for="row in shopRows"
          :key="row.rowKey"
          class="skin-row"
          :class="{ current: row.isDefaultPixel ? equippedId == null : row.id === equippedId }"
        >
          <div
            class="swatch"
            :class="{
              'swatch--portrait': !row.isDefaultPixel && portraitSrc(row),
              'swatch--mini-grid': row.isDefaultPixel,
            }"
          >
            <template v-if="row.isDefaultPixel">
              <div
                v-if="characterStore.spriteData && !isEmptySprite(characterStore.spriteData)"
                class="swatch-mini-grid"
              >
                <div
                  v-for="(color, pIdx) in parseSprite(characterStore.spriteData)"
                  :key="pIdx"
                  class="swatch-mini-grid__px"
                  :style="{ backgroundColor: color || 'transparent' }"
                />
              </div>
              <div v-else class="swatch__fill swatch__fill--muted" />
            </template>
            <img
              v-else-if="portraitSrc(row)"
              class="swatch__img"
              :src="portraitSrc(row)"
              alt=""
            >
            <template v-else>
              <div
                class="swatch__fill"
                :style="{
                  background: `linear-gradient(135deg, ${row.color_still} 50%, ${row.color_moving} 50%)`,
                }"
              />
            </template>
          </div>
          <div class="skin-info">
            <p class="skin-name">{{ row.isDefaultPixel ? 'Tu personaje' : row.name }}</p>
            <p v-if="row.isDefaultPixel" class="skin-price skin-price--sub">
              Pixel-art del creador de personajes
            </p>
            <p v-else class="skin-price">{{ row.price_code_coins }} CodeCoins</p>
          </div>
          <div class="skin-actions">
            <template v-if="row.isDefaultPixel">
              <button
                v-if="equippedId != null"
                type="button"
                class="act equip"
                :disabled="actionId !== null"
                @click="equipDefaultPixel"
              >
                {{ actionId === ACTION_DEFAULT ? '…' : 'Equipar' }}
              </button>
              <span v-else class="tag">En uso</span>
            </template>
            <template v-else>
              <button
                v-if="!isOwned(row.id)"
                type="button"
                class="act buy"
                :disabled="actionId !== null"
                @click="buy(row)"
              >
                {{ actionId === row.id ? '…' : 'Comprar' }}
              </button>
              <button
                v-else-if="row.id !== equippedId"
                type="button"
                class="act equip"
                :disabled="actionId !== null"
                @click="equip(row.id)"
              >
                {{ actionId === row.id ? '…' : 'Equipar' }}
              </button>
              <span v-else class="tag">En uso</span>
            </template>
          </div>
        </li>
      </ul>
    </template>
    <p v-if="msg" class="skin-msg">{{ msg }}</p>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { fetchSkinsCatalog, purchaseSkin, equipSkin } from '../api/skins'
import { ensureActiveCharacterId, fetchCharacter } from '../api/character'
import { activeCharacterId } from '../gameState'
import { useCharacterStore } from '../stores/character'
import { ASIER_SLUG, getCosmeticShopPreviewBySlug } from '../constants/cosmeticVisuals'
import { parseSprite, isEmptySprite } from '../utils/sprite'

const ACTION_DEFAULT = 'default-pixel'

const emit = defineEmits(['close', 'wallet-updated'])

function portraitSrc(s) {
  return getCosmeticShopPreviewBySlug(s?.slug)
}

const skins = ref([])
const ownedIds = ref(new Set())
const characterStore = useCharacterStore()
const equippedId = ref(null)

/** Solo Asier aunque la API devuelva skins antiguas (hasta migrar BD). */
const displayedSkins = computed(() =>
  skins.value.filter((s) => String(s?.slug ?? '').toLowerCase() === ASIER_SLUG),
)

const shopRows = computed(() => {
  const rows = [{ rowKey: 'default-pixel', isDefaultPixel: true }]
  for (const s of displayedSkins.value) {
    rows.push({ rowKey: `skin-${s.id}`, isDefaultPixel: false, ...s })
  }
  return rows
})

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
    await characterStore.refresh()
    equippedId.value = ch.equipped_skin_id ?? ch.equipped_skin?.id ?? null

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
    await purchaseSkin(s.id)
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
    equippedId.value = ch.equipped_skin_id ?? ch.equipped_skin?.id ?? null
    emit('wallet-updated')
    await characterStore.refresh()

  } catch (e) {
    const d = e?.response?.data
    msg.value = d?.message || 'No se pudo equipar.'
  } finally {
    actionId.value = null
  }
}

async function equipDefaultPixel() {
  actionId.value = ACTION_DEFAULT
  msg.value = ''
  try {
    const ch = await equipSkin(null)
    equippedId.value = ch.equipped_skin_id ?? ch.equipped_skin?.id ?? null
    emit('wallet-updated')
    await characterStore.refresh()
  } catch (e) {
    const d = e?.response?.data
    msg.value = d?.message || 'No se pudo volver al personaje creado.'
  } finally {
    actionId.value = null
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.skin-shop-overlay {
  position: fixed;
  inset: 0;
  z-index: 220;
  background: rgba(0, 0, 0, 0.72);
  display: grid;
  place-items: center;
  padding: 16px;
}
.skin-panel {
  position: relative;
  width: min(520px, 94vw);
  max-height: min(80vh, 560px);
  overflow: auto;
  border: 3px solid #1f1f1f;
  background: linear-gradient(180deg, #1e1428 0%, #0f0a16 100%);
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.45);
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
  overflow: hidden;
  position: relative;
}
.swatch__fill {
  position: absolute;
  inset: 0;
}
.swatch--portrait {
  border-color: #0a0a0a;
}
.swatch__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  display: block;
  image-rendering: pixelated;
}
.skin-info { flex: 1; min-width: 0; }
.skin-name { font-size: 8px; margin: 0 0 4px; }
.skin-price { font-size: 7px; margin: 0; opacity: 0.9; }
.skin-price--sub {
  font-size: 6px;
  line-height: 1.4;
  opacity: 0.75;
}
.swatch__fill--muted {
  background: #1a1528 !important;
}
.swatch-mini-grid {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  grid-template-rows: repeat(16, 1fr);
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}
.swatch-mini-grid__px {
  min-width: 0;
  min-height: 0;
}
.catalog-hint {
  font-size: 7px;
  color: #ce93d8;
  margin: 0 0 12px;
  line-height: 1.45;
}
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
