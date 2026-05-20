<script setup>
import { computed, ref } from 'vue'
import UserAvatar from '../UserAvatar.vue'

const props = defineProps({
  post: { type: Object, required: true },
  commentsLoading: { type: Boolean, default: false },
  comments: { type: Array, default: () => [] },
  commentDraft: { type: String, default: '' },
  likePending: { type: Boolean, default: false },
  commentSubmitting: { type: Boolean, default: false },
  isLoggedIn: { type: Boolean, default: false },
  formatDate: { type: Function, required: true },
})

const emit = defineEmits([
  'close',
  'like',
  'remove-post',
  'remove-comment',
  'submit-comment',
  'update:comment-draft',
])

const isImagePost = computed(() => props.post.has_image && props.post.image_url)
const canDeletePost = computed(() => Boolean(props.post.can_delete))
const isModeratorDelete = computed(() => canDeletePost.value && !props.post.is_mine)

const showDeleteConfirm = ref(false)

const confirmDeletePost = () => {
  emit('remove-post')
  showDeleteConfirm.value = false
}
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
    <div class="absolute inset-0 bg-black/90 backdrop-blur-xl" @click="emit('close')"></div>
    
    <div class="relative z-10 w-full max-w-6xl h-full max-h-[90vh] bg-[#0f172a] border-4 border-[#facc15] shadow-[0_0_50px_rgba(250,204,21,0.2)] flex flex-col md:flex-row overflow-hidden">
      
      <!-- Botón Cerrar (Mobile & Desktop) -->
      <button @click="emit('close')" class="absolute top-2 right-2 md:top-4 md:right-4 w-10 h-10 bg-[#ef4444] border-2 border-white text-white flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform z-20">
        ×
      </button>

      <!-- Izquierda: Imagen (si la hay) -->
      <div v-if="isImagePost" class="w-full md:w-3/5 lg:w-2/3 bg-black border-b-4 md:border-b-0 md:border-r-4 border-[#facc15]/30 relative flex items-center justify-center overflow-hidden h-[40vh] md:h-auto">
        <img :src="post.image_url" :alt="post.caption" class="w-full h-full object-contain" />
        <div class="absolute top-4 left-4 px-3 py-1 bg-black/80 border border-[#facc15]/20 text-[8px] tracking-widest font-press-start" :class="post.faction === 'PHP' ? 'text-[#3b82f6]' : 'text-[#ef4444]'">
          REGION: {{ post.faction }}
        </div>
      </div>

      <!-- Derecha (o Todo si no hay imagen): Detalles y Comentarios -->
      <div class="w-full flex flex-col h-full bg-[#0b0d17] overflow-hidden" :class="isImagePost ? 'md:w-2/5 lg:w-1/3' : 'w-full'">
        
        <!-- Header: Info del Autor y Likes -->
        <div class="p-4 md:p-6 border-b-2 border-[#facc15]/10 shrink-0 bg-[#0f172a]">
          <div class="flex items-center gap-3">
            <UserAvatar :name="post.author" :avatar-url="post.author_avatar_url" size="md" />
            <div class="flex flex-col gap-1 min-w-0">
              <span class="text-[#facc15] text-[10px] tracking-widest font-bold font-press-start truncate">{{ post.author }}</span>
              <span class="text-[#facc15]/30 text-[8px] uppercase font-press-start truncate">{{ formatDate(post.created_at) }}</span>
            </div>
          </div>
          
          <div class="mt-4 flex items-center gap-6">
            <button
              class="flex items-center gap-2 text-[10px] tracking-widest font-press-start transition-colors"
              :class="post.viewer_has_liked ? 'text-[#ef4444]' : 'text-white/40 hover:text-white'"
              :disabled="likePending"
              @click="emit('like')"
            >
              <span class="text-xl">{{ post.viewer_has_liked ? '♥' : '♡' }}</span>
              <span>{{ post.likes_count || 0 }}</span>
            </button>
            <div class="flex items-center gap-2 text-[10px] tracking-widest text-white/40 font-press-start">
              <span class="text-xl">💬</span>
              <span>{{ post.comments_count || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Scrollable Body: Caption + Comentarios -->
        <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          <!-- Caption -->
          <div class="space-y-2">
            <p v-if="post.character_name" class="text-[8px] text-[#facc15]/40 tracking-widest uppercase font-press-start">HÉROE: {{ post.character_name }}</p>
            <p class="text-[10px] text-white/90 leading-loose italic font-press-start">
              "{{ post.caption || 'Una nueva leyenda escrita en el reino.' }}"
            </p>
          </div>

          <div class="w-full h-px bg-[#facc15]/10"></div>

          <!-- Comentarios -->
          <div class="space-y-4">
            <h3 class="text-[#facc15]/60 text-[9px] tracking-widest uppercase font-press-start">COMENTARIOS</h3>
            
            <div v-if="commentsLoading" class="text-[8px] text-[#facc15]/40 tracking-widest py-4 text-center font-press-start animate-pulse">
              CARGANDO...
            </div>
            
            <div v-else-if="comments.length === 0" class="text-[8px] text-[#facc15]/30 tracking-widest py-4 text-center font-press-start">
              SÉ EL PRIMERO EN COMENTAR ESTA CRÓNICA.
            </div>

            <div v-else class="flex flex-col gap-5">
              <div v-for="comment in comments" :key="comment.id" class="flex items-start gap-3">
                <UserAvatar :name="comment.author" :avatar-url="comment.author_avatar_url" size="sm" />
                <div class="flex-1 min-w-0 bg-[#0f172a] p-3 border border-[#facc15]/10">
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="text-[8px] text-[#facc15] tracking-widest font-bold font-press-start truncate">{{ comment.author }}</span>
                    <span class="text-[7px] text-[#facc15]/30 uppercase font-press-start whitespace-nowrap">{{ formatDate(comment.created_at) }}</span>
                  </div>
                  <p class="text-[9px] text-white/80 leading-relaxed font-press-start break-words">{{ comment.body }}</p>
                  
                  <button
                    v-if="comment.is_mine"
                    class="text-[#ef4444]/50 hover:text-[#ef4444] text-[7px] tracking-widest mt-3 font-press-start transition-colors"
                    @click="emit('remove-comment', comment.id)"
                  >
                    BORRAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer: Input de Comentario y Retirar -->
        <div class="p-4 md:p-6 border-t-2 border-[#facc15]/10 shrink-0 bg-[#0f172a] space-y-4">
          <div v-if="isLoggedIn" class="flex flex-col gap-3">
            <textarea
              :value="commentDraft"
              rows="2"
              maxlength="500"
              class="w-full bg-[#0b0d17] border-2 border-[#facc15]/30 text-white p-3 text-[9px] tracking-widest focus:outline-none focus:border-[#facc15] transition-colors resize-none font-press-start"
              placeholder="Escribe tu comentario..."
              @input="emit('update:comment-draft', $event.target.value)"
            ></textarea>
            <div class="flex justify-between items-center">
              <span class="text-[8px] text-white/30 font-press-start">{{ commentDraft?.length || 0 }}/500</span>
              <button
                class="bg-[#2563eb] border-2 border-[#3b82f6] text-white shadow-[2px_2px_0_#1e40af] hover:shadow-[4px_4px_0_#1e40af] hover:-translate-y-0.5 text-[9px] px-6 py-2 transition-all font-press-start disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!commentDraft?.trim() || commentSubmitting"
                @click="emit('submit-comment')"
              >
                {{ commentSubmitting ? 'ENVIANDO...' : 'COMENTAR' }}
              </button>
            </div>
          </div>
          <p v-else class="text-[8px] text-[#facc15]/30 tracking-widest font-press-start text-center">
            <router-link to="/login" class="text-[#facc15]/60 hover:text-[#facc15] underline">Inicia sesión</router-link>
            para comentar.
          </p>

          <div v-if="canDeletePost" class="flex justify-center border-t-4 border-[#ef4444]/20 pt-6 mt-4">
            <button 
              class="w-full bg-[#ef4444]/10 hover:bg-[#ef4444] border-2 border-[#ef4444] text-[#ef4444] hover:text-white text-[9px] py-3 tracking-[0.2em] font-press-start transition-all shadow-[4px_4px_0_rgba(239,68,68,0.2)] hover:shadow-[6px_6px_0_rgba(239,68,68,0.4)] hover:-translate-y-1" 
              @click="showDeleteConfirm = true"
            >
              {{ isModeratorDelete ? '⚠ ELIMINAR (MODERADOR)' : '⚠ RETIRAR PUBLICACIÓN' }}
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal de Confirmación de Borrado -->
    <Transition name="fade">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-black/90 backdrop-blur-md" @click="showDeleteConfirm = false"></div>
        
        <div class="relative z-10 bg-[#0f172a] border-4 border-[#ef4444] p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center">
          <div class="text-4xl mb-4">🗑️</div>
          <h2 class="text-[#ef4444] text-sm mb-4 tracking-widest font-press-start leading-loose">
            {{ isModeratorDelete ? '¿ELIMINAR CRÓNICA?' : '¿RETIRAR CRÓNICA?' }}
          </h2>
          <p class="text-white/70 text-[9px] tracking-widest mb-8 font-press-start leading-loose">
            <template v-if="isModeratorDelete">
              Acción de moderador: la publicación de {{ post.author }} se borrará del tablón para todos.
            </template>
            <template v-else>
              Esta acción no se puede deshacer. La publicación desaparecerá del tablón de la comunidad para siempre.
            </template>
          </p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <button
              @click="showDeleteConfirm = false"
              class="bg-transparent border-2 border-white/30 text-white hover:border-white text-[9px] px-6 py-3 tracking-widest transition-colors font-press-start"
            >
              NO, CANCELAR
            </button>
            <button
              @click="confirmDeletePost"
              class="bg-[#ef4444] border-2 border-[#b91c1c] text-white shadow-[4px_4px_0_#991b1b] hover:shadow-[6px_6px_0_#7f1d1d] hover:-translate-y-1 text-[9px] px-6 py-3 tracking-widest transition-all font-press-start"
            >
              {{ isModeratorDelete ? 'SÍ, ELIMINAR' : 'SÍ, RETIRAR' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.font-press-start {
  font-family: 'Press Start 2P', monospace;
}
</style>
