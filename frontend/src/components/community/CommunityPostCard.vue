<script setup>
import UserAvatar from '../UserAvatar.vue'

defineProps({
  post: { type: Object, required: true },
  index: { type: Number, required: true },
  expanded: { type: Boolean, default: false },
  commentsLoading: { type: Boolean, default: false },
  comments: { type: Array, default: () => [] },
  commentDraft: { type: String, default: '' },
  likePending: { type: Boolean, default: false },
  commentSubmitting: { type: Boolean, default: false },
  isLoggedIn: { type: Boolean, default: false },
  formatDate: { type: Function, required: true },
})

const emit = defineEmits([
  'like',
  'toggle-comments',
  'remove-post',
  'remove-comment',
  'submit-comment',
  'update:comment-draft',
])
</script>

<template>
  <article
    class="post-card group relative p-5 bg-[#0f172a] border-4 border-[#facc15]/10 hover:border-[#facc15] transition-all duration-300"
    :style="{ animationDelay: (index * 100) + 'ms' }"
  >
    <div class="absolute -top-1 -left-1 w-3 h-3 border-t-4 border-l-4 border-[#facc15] opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div class="absolute -bottom-1 -right-1 w-3 h-3 border-b-4 border-r-4 border-[#facc15] opacity-0 group-hover:opacity-100 transition-opacity"></div>

    <div
      v-if="post.has_image && post.image_url"
      class="aspect-video bg-[#0b0d17] mb-5 overflow-hidden relative border-2 border-[#facc15]/10 group-hover:border-[#facc15]/30"
    >
      <img :src="post.image_url" :alt="post.caption || 'Captura de Code & Kingdoms'" class="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-500" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#0b0d17] to-transparent opacity-60"></div>
      <div
        class="absolute bottom-3 left-3 px-3 py-1 bg-black/80 border border-[#facc15]/20 text-[6px] tracking-widest"
        :class="post.faction === 'PHP' ? 'text-[#3b82f6]' : 'text-[#ef4444]'"
      >
        REGION: {{ post.faction }}
      </div>
    </div>

    <div
      v-else
      class="mb-5 p-5 bg-[#0b0d17] border-2 border-[#facc15]/10 group-hover:border-[#facc15]/30 min-h-[120px] flex flex-col justify-between"
    >
      <span class="text-[6px] tracking-[0.3em] text-[#facc15]/40 uppercase">Crónica del reino</span>
      <div
        class="mt-3 px-3 py-1 self-start bg-black/80 border border-[#facc15]/20 text-[6px] tracking-widest"
        :class="post.faction === 'PHP' ? 'text-[#3b82f6]' : 'text-[#ef4444]'"
      >
        REGION: {{ post.faction }}
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <UserAvatar :name="post.author" :avatar-url="post.author_avatar_url" size="sm" />
        <div class="flex flex-col gap-1">
          <span class="text-[#facc15] text-[8px] tracking-widest font-bold">{{ post.author }}</span>
          <span class="text-[#facc15]/30 text-[6px] uppercase">{{ formatDate(post.created_at) }}</span>
        </div>
      </div>

      <p class="text-[8px] text-white/80 leading-6 italic" :class="post.has_image ? 'line-clamp-3' : ''">
        "{{ post.caption || 'Una nueva leyenda escrita en el reino.' }}"
      </p>
      <p v-if="post.character_name" class="text-[7px] text-[#facc15]/40 tracking-widest uppercase">HÉROE: {{ post.character_name }}</p>

      <div class="flex items-center gap-4 border-t-2 border-[#facc15]/5 pt-4">
        <button
          class="engagement-button"
          :class="{ active: post.viewer_has_liked }"
          :disabled="likePending"
          @click="emit('like')"
        >
          <span>{{ post.viewer_has_liked ? '♥' : '♡' }}</span>
          <span>{{ post.likes_count || 0 }}</span>
        </button>

        <button class="engagement-button" @click="emit('toggle-comments')">
          <span>💬</span>
          <span>{{ post.comments_count || 0 }}</span>
        </button>
      </div>

      <div v-if="expanded" class="comments-panel">
        <div v-if="commentsLoading" class="text-[7px] text-[#facc15]/40 tracking-widest py-2">
          CARGANDO COMENTARIOS...
        </div>

        <div v-else-if="comments.length === 0" class="text-[7px] text-[#facc15]/30 tracking-widest py-2">
          SÉ EL PRIMERO EN COMENTAR ESTA CRÓNICA.
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="flex items-start gap-3">
              <UserAvatar :name="comment.author" :avatar-url="comment.author_avatar_url" size="sm" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[7px] text-[#facc15] tracking-widest font-bold">{{ comment.author }}</span>
                  <span class="text-[6px] text-[#facc15]/30 uppercase">{{ formatDate(comment.created_at) }}</span>
                </div>
                <p class="text-[7px] text-white/75 leading-6 mt-1 break-words">{{ comment.body }}</p>
                <button
                  v-if="comment.is_mine"
                  class="text-[#ef4444]/60 hover:text-[#ef4444] text-[6px] tracking-widest mt-2"
                  @click="emit('remove-comment', comment.id)"
                >
                  BORRAR
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoggedIn" class="mt-4 flex flex-col gap-3">
          <textarea
            :value="commentDraft"
            rows="2"
            maxlength="500"
            class="publish-caption"
            placeholder="Escribe tu comentario sobre esta crónica..."
            @input="emit('update:comment-draft', $event.target.value)"
          ></textarea>
          <button
            class="btn-pixel-gold text-[8px] px-4 py-2 self-end"
            :disabled="!commentDraft?.trim() || commentSubmitting"
            @click="emit('submit-comment')"
          >
            {{ commentSubmitting ? 'ENVIANDO...' : 'COMENTAR' }}
          </button>
        </div>
        <p v-else class="text-[7px] text-[#facc15]/30 tracking-widest mt-4">
          <router-link to="/login" class="text-[#facc15]/60 hover:text-[#facc15] underline">Inicia sesión</router-link>
          para comentar.
        </p>
      </div>

      <div v-if="post.is_mine" class="flex justify-end border-t-2 border-[#facc15]/5 pt-4">
        <button class="text-[#ef4444]/60 hover:text-[#ef4444] text-[7px] tracking-widest" @click="emit('remove-post')">
          RETIRAR PUBLICACIÓN
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped src="./CommunityPostCard.css"></style>
