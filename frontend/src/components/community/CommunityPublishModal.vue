<script setup>
defineProps({
  hasToken: { type: Boolean, required: true },
  publishMode: { type: String, required: true },
  publishCaption: { type: String, required: true },
  loadingScreenshots: { type: Boolean, default: false },
  unpublishedScreenshots: { type: Array, default: () => [] },
  selectedScreenshotId: { type: [Number, String], default: null },
  publishing: { type: Boolean, default: false },
  formatDate: { type: Function, required: true },
})

const emit = defineEmits([
  'close',
  'update:publish-mode',
  'update:publish-caption',
  'update:selected-screenshot-id',
  'publish-text',
  'publish-screenshot',
])
</script>

<template>
  <div class="fixed inset-0 z-[120] flex items-center justify-center p-6">
    <div class="absolute inset-0 bg-black/90 backdrop-blur-md" @click="emit('close')"></div>

    <div class="relative z-10 w-full max-w-3xl bg-[#0f172a] border-4 border-[#facc15] p-6 shadow-[0_0_50px_rgba(250,204,21,0.15)]">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-[#facc15] text-[12px] tracking-[0.2em]">NUEVA PUBLICACIÓN</h2>
        <button class="text-[#facc15]/60 hover:text-[#facc15] text-xl" type="button" @click="emit('close')">×</button>
      </div>

      <p v-if="!hasToken" class="text-[8px] text-white/70 leading-6 mb-6">
        Debes iniciar sesión para publicar en el tablón.
      </p>
      <router-link v-if="!hasToken" to="/login" class="btn-pixel-gold text-[9px] px-6 py-3 inline-block">
        ENTRAR AL REINO
      </router-link>

      <template v-else>
        <div class="publish-tabs">
          <button
            type="button"
            class="publish-tab"
            :class="{ active: publishMode === 'text' }"
            @click="emit('update:publish-mode', 'text')"
          >
            CRÓNICA
          </button>
          <button
            type="button"
            class="publish-tab"
            :class="{ active: publishMode === 'screenshot' }"
            @click="emit('update:publish-mode', 'screenshot')"
          >
            CAPTURA
          </button>
        </div>

        <div v-if="publishMode === 'text'" class="mt-6 flex flex-col gap-4">
          <label class="text-[#facc15]/60 text-[7px] tracking-[0.2em] uppercase">Comparte algo del juego</label>
          <textarea
            :value="publishCaption"
            rows="5"
            maxlength="500"
            class="publish-caption"
            placeholder="Pregunta, consejo, teoría, reto o lo que estés jugando ahora mismo..."
            @input="emit('update:publish-caption', $event.target.value)"
          ></textarea>

          <div class="flex justify-end gap-4">
            <button type="button" class="text-[#facc15]/50 text-[8px] tracking-widest" @click="emit('close')">CANCELAR</button>
            <button
              type="button"
              class="btn-pixel-gold text-[9px] px-6 py-3"
              :disabled="!publishCaption.trim() || publishing"
              @click="emit('publish-text')"
            >
              {{ publishing ? 'PUBLICANDO...' : 'PUBLICAR CRÓNICA' }}
            </button>
          </div>
        </div>

        <div v-else class="mt-6">
          <div v-if="loadingScreenshots" class="text-[#facc15]/50 text-[8px] tracking-widest py-10 text-center">
            CARGANDO TUS CAPTURAS...
          </div>

          <div v-else-if="unpublishedScreenshots.length === 0" class="text-[8px] text-white/70 leading-6">
            No tienes capturas pendientes de publicar. Pulsa <span class="text-[#facc15]">F8</span> en el juego para guardar una nueva.
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
            <button
              v-for="screenshot in unpublishedScreenshots"
              :key="screenshot.id"
              type="button"
              class="publish-option"
              :class="{ active: selectedScreenshotId === screenshot.id }"
              @click="emit('update:selected-screenshot-id', screenshot.id)"
            >
              <img :src="screenshot.image_url" alt="" class="publish-option__image" />
              <div class="publish-option__meta">
                <span>{{ screenshot.character_name || 'Sin héroe' }}</span>
                <span>{{ formatDate(screenshot.created_at) }}</span>
              </div>
            </button>
          </div>

          <div v-if="unpublishedScreenshots.length > 0" class="mt-6 flex flex-col gap-4">
            <label class="text-[#facc15]/60 text-[7px] tracking-[0.2em] uppercase">Crónica opcional</label>
            <textarea
              :value="publishCaption"
              rows="3"
              maxlength="500"
              class="publish-caption"
              placeholder="Describe el momento épico que quieres compartir..."
              @input="emit('update:publish-caption', $event.target.value)"
            ></textarea>

            <div class="flex justify-end gap-4">
              <button type="button" class="text-[#facc15]/50 text-[8px] tracking-widest" @click="emit('close')">CANCELAR</button>
              <button
                type="button"
                class="btn-pixel-gold text-[9px] px-6 py-3"
                :disabled="!selectedScreenshotId || publishing"
                @click="emit('publish-screenshot')"
              >
                {{ publishing ? 'PUBLICANDO...' : 'PUBLICAR CAPTURA' }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped src="./CommunityPublishModal.css"></style>
