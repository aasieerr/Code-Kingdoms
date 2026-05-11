<template>
  <div class="pixel-page min-h-screen flex flex-col">
    <AppHeader />

    <div
      class="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
      style="background: repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 2px);"
    />

    <main class="relative z-10 max-w-6xl mx-auto px-6 py-20 flex-grow w-full">
      <div class="text-center mb-24">
        <div class="inline-block relative mb-6">
          <h1 class="text-[#facc15] text-4xl tracking-tighter" style="text-shadow: 4px 4px 0 #854d0e;">TABLÓN DE LEYENDAS</h1>
          <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#facc15] to-transparent"></div>
        </div>
        <p class="text-[#facc15]/60 text-[9px] leading-8 max-w-2xl mx-auto uppercase tracking-widest">
          EL LUGAR DONDE LOS HÉROES DE <span class="text-[#3b82f6]">PHP</span> Y <span class="text-[#ef4444]">JAVA</span> COMPARTEN SUS CONQUISTAS Y CRÓNICAS.
        </p>

        <button
          class="mt-12 btn-pixel-gold text-[10px] px-12 py-5 group overflow-hidden relative"
          @click="openPublishModal"
        >
          <span class="relative z-10">+ NUEVA PUBLICACIÓN</span>
          <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
        </button>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-6">
        <div class="w-16 h-16 border-4 border-[#facc15]/20 border-t-[#facc15] rounded-full animate-spin"></div>
        <span class="text-[#facc15] text-[10px] animate-pulse">CARGANDO CRÓNICAS...</span>
      </div>

      <div v-else-if="posts.length === 0" class="text-center py-20 border-4 border-dashed border-[#facc15]/10 rounded-3xl">
        <div class="text-5xl mb-6 opacity-20">📜</div>
        <p class="text-[#facc15]/40 text-[10px] tracking-widest">AÚN NO HAY PUBLICACIONES EN EL TABLÓN.</p>
        <p class="text-[#facc15]/25 text-[8px] tracking-widest mt-4">COMPARTE UNA CRÓNICA, UNA CAPTURA CON F8 O COMENTA LO QUE ESTÁS JUGANDO.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        <article
          v-for="(post, index) in posts"
          :key="post.id"
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
                :disabled="likePendingId === post.id"
                @click="toggleLike(post)"
              >
                <span>{{ post.viewer_has_liked ? '♥' : '♡' }}</span>
                <span>{{ post.likes_count || 0 }}</span>
              </button>

              <button class="engagement-button" @click="toggleComments(post.id)">
                <span>💬</span>
                <span>{{ post.comments_count || 0 }}</span>
              </button>
            </div>

            <div v-if="expandedComments[post.id]" class="comments-panel">
              <div v-if="commentsState[post.id]?.loading" class="text-[7px] text-[#facc15]/40 tracking-widest py-2">
                CARGANDO COMENTARIOS...
              </div>

              <div v-else-if="(commentsState[post.id]?.items || []).length === 0" class="text-[7px] text-[#facc15]/30 tracking-widest py-2">
                SÉ EL PRIMERO EN COMENTAR ESTA CRÓNICA.
              </div>

              <div v-else class="flex flex-col gap-3">
                <div
                  v-for="comment in commentsState[post.id].items"
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
                        @click="removeComment(post.id, comment.id)"
                      >
                        BORRAR
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="authStore.token" class="mt-4 flex flex-col gap-3">
                <textarea
                  v-model="commentDrafts[post.id]"
                  rows="2"
                  maxlength="500"
                  class="publish-caption"
                  placeholder="Escribe tu comentario sobre esta crónica..."
                ></textarea>
                <button
                  class="btn-pixel-gold text-[8px] px-4 py-2 self-end"
                  :disabled="!commentDrafts[post.id]?.trim() || commentSubmittingId === post.id"
                  @click="submitComment(post.id)"
                >
                  {{ commentSubmittingId === post.id ? 'ENVIANDO...' : 'COMENTAR' }}
                </button>
              </div>
              <p v-else class="text-[7px] text-[#facc15]/30 tracking-widest mt-4">
                <router-link to="/login" class="text-[#facc15]/60 hover:text-[#facc15] underline">Inicia sesión</router-link>
                para comentar.
              </p>
            </div>

            <div v-if="post.is_mine" class="flex justify-end border-t-2 border-[#facc15]/5 pt-4">
              <button class="text-[#ef4444]/60 hover:text-[#ef4444] text-[7px] tracking-widest" @click="removePost(post.id)">
                RETIRAR PUBLICACIÓN
              </button>
            </div>
          </div>
        </article>
      </div>

      <div v-if="!loading && currentPage < lastPage" class="text-center mt-24">
        <button
          class="text-[#facc15]/40 hover:text-[#facc15] text-[9px] tracking-[0.5em] uppercase transition-all hover:tracking-[0.6em] animate-pulse"
          :disabled="loadingMore"
          @click="loadMore"
        >
          ▼ {{ loadingMore ? 'CARGANDO...' : 'CARGAR MÁS CRÓNICAS' }} ▼
        </button>
      </div>
    </main>

    <Transition name="fade">
      <div v-if="publishModalOpen" class="fixed inset-0 z-[120] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-black/90 backdrop-blur-md" @click="closePublishModal"></div>

        <div class="relative z-10 w-full max-w-3xl bg-[#0f172a] border-4 border-[#facc15] p-6 shadow-[0_0_50px_rgba(250,204,21,0.15)]">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-[#facc15] text-[12px] tracking-[0.2em]">NUEVA PUBLICACIÓN</h2>
            <button class="text-[#facc15]/60 hover:text-[#facc15] text-xl" @click="closePublishModal">×</button>
          </div>

          <p v-if="!authStore.token" class="text-[8px] text-white/70 leading-6 mb-6">
            Debes iniciar sesión para publicar en el tablón.
          </p>
          <router-link v-if="!authStore.token" to="/login" class="btn-pixel-gold text-[9px] px-6 py-3 inline-block">
            ENTRAR AL REINO
          </router-link>

          <template v-else>
            <div class="publish-tabs">
              <button
                type="button"
                class="publish-tab"
                :class="{ active: publishMode === 'text' }"
                @click="publishMode = 'text'"
              >
                CRÓNICA
              </button>
              <button
                type="button"
                class="publish-tab"
                :class="{ active: publishMode === 'screenshot' }"
                @click="publishMode = 'screenshot'"
              >
                CAPTURA
              </button>
            </div>

            <div v-if="publishMode === 'text'" class="mt-6 flex flex-col gap-4">
              <label class="text-[#facc15]/60 text-[7px] tracking-[0.2em] uppercase">Comparte algo del juego</label>
              <textarea
                v-model="publishCaption"
                rows="5"
                maxlength="500"
                class="publish-caption"
                placeholder="Pregunta, consejo, teoría, reto o lo que estés jugando ahora mismo..."
              ></textarea>

              <div class="flex justify-end gap-4">
                <button class="text-[#facc15]/50 text-[8px] tracking-widest" @click="closePublishModal">CANCELAR</button>
                <button
                  class="btn-pixel-gold text-[9px] px-6 py-3"
                  :disabled="!publishCaption.trim() || publishing"
                  @click="publishTextPost"
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
                  @click="selectedScreenshotId = screenshot.id"
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
                  v-model="publishCaption"
                  rows="3"
                  maxlength="500"
                  class="publish-caption"
                  placeholder="Describe el momento épico que quieres compartir..."
                ></textarea>

                <div class="flex justify-end gap-4">
                  <button class="text-[#facc15]/50 text-[8px] tracking-widest" @click="closePublishModal">CANCELAR</button>
                  <button
                    class="btn-pixel-gold text-[9px] px-6 py-3"
                    :disabled="!selectedScreenshotId || publishing"
                    @click="publishSelectedScreenshot"
                  >
                    {{ publishing ? 'PUBLICANDO...' : 'PUBLICAR CAPTURA' }}
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <AppFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import UserAvatar from '../components/UserAvatar.vue'
import communityApi from '../api/community'
import screenshotsApi from '../api/screenshots'
import { fetchCharacters } from '../api/character'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const posts = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const currentPage = ref(1)
const lastPage = ref(1)

const publishModalOpen = ref(false)
const publishMode = ref('text')
const loadingScreenshots = ref(false)
const publishing = ref(false)
const screenshots = ref([])
const characters = ref([])
const selectedScreenshotId = ref(null)
const publishCaption = ref('')

const likePendingId = ref(null)
const commentSubmittingId = ref(null)
const expandedComments = reactive({})
const commentsState = reactive({})
const commentDrafts = reactive({})

const unpublishedScreenshots = computed(() => screenshots.value.filter((screenshot) => !screenshot.is_published))

async function fetchPosts(page = 1, append = false) {
  const { data } = await communityApi.getPosts(page)
  posts.value = append ? [...posts.value, ...data.data] : data.data
  currentPage.value = data.meta.current_page
  lastPage.value = data.meta.last_page
}

async function loadInitialPosts() {
  loading.value = true
  try {
    await fetchPosts(1)
  } catch (error) {
    console.error('Error loading community posts:', error)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || currentPage.value >= lastPage.value) return
  loadingMore.value = true
  try {
    await fetchPosts(currentPage.value + 1, true)
  } catch (error) {
    console.error('Error loading more community posts:', error)
  } finally {
    loadingMore.value = false
  }
}

function resolveFaction(characterName) {
  if (!characterName) return 'PHP'
  const character = characters.value.find((entry) => entry.name === characterName)
  return character?.kingdom?.name === 'Java' ? 'JAVA' : 'PHP'
}

async function loadPublishableScreenshots() {
  if (!authStore.token) return
  loadingScreenshots.value = true
  try {
    const [screenshotsResponse, characterList] = await Promise.all([
      screenshotsApi.getAll(),
      fetchCharacters(),
    ])
    screenshots.value = screenshotsResponse.data
    characters.value = characterList
    selectedScreenshotId.value = unpublishedScreenshots.value[0]?.id ?? null
  } catch (error) {
    console.error('Error loading screenshots for community publish:', error)
  } finally {
    loadingScreenshots.value = false
  }
}

async function openPublishModal() {
  if (!authStore.token) {
    router.push('/login')
    return
  }

  publishModalOpen.value = true
  publishMode.value = 'text'
  publishCaption.value = ''
  await loadPublishableScreenshots()
}

function closePublishModal() {
  publishModalOpen.value = false
  selectedScreenshotId.value = null
  publishCaption.value = ''
}

async function publishTextPost() {
  if (!publishCaption.value.trim() || publishing.value) return

  publishing.value = true
  try {
    const { data } = await communityApi.publish({
      caption: publishCaption.value.trim(),
    })

    posts.value = [data.post, ...posts.value]
    closePublishModal()
  } catch (error) {
    console.error('Error publishing text post:', error)
    alert(error.response?.data?.message || 'No se pudo publicar la crónica.')
  } finally {
    publishing.value = false
  }
}

async function publishSelectedScreenshot() {
  if (!selectedScreenshotId.value || publishing.value) return

  const screenshot = screenshots.value.find((entry) => entry.id === selectedScreenshotId.value)
  if (!screenshot) return

  publishing.value = true
  try {
    const { data } = await communityApi.publishScreenshot(screenshot.id, {
      caption: publishCaption.value.trim() || null,
      faction: resolveFaction(screenshot.character_name),
    })

    screenshot.is_published = true
    posts.value = [data.post, ...posts.value]
    closePublishModal()
  } catch (error) {
    console.error('Error publishing screenshot to community:', error)
    alert(error.response?.data?.message || 'No se pudo publicar la captura.')
  } finally {
    publishing.value = false
  }
}

async function removePost(postId) {
  if (!confirm('¿Quieres retirar esta publicación del tablón?')) return

  try {
    await communityApi.remove(postId)
    posts.value = posts.value.filter((post) => post.id !== postId)
    delete expandedComments[postId]
    delete commentsState[postId]
    delete commentDrafts[postId]
  } catch (error) {
    console.error('Error removing community post:', error)
    alert('No se pudo retirar la publicación.')
  }
}

async function toggleLike(post) {
  if (!authStore.token) {
    router.push('/login')
    return
  }
  if (likePendingId.value === post.id) return

  likePendingId.value = post.id
  try {
    const { data } = await communityApi.toggleLike(post.id)
    post.viewer_has_liked = data.liked
    post.likes_count = data.likes_count
  } catch (error) {
    console.error('Error toggling like:', error)
    alert(error.response?.data?.message || 'No se pudo actualizar el me gusta.')
  } finally {
    likePendingId.value = null
  }
}

async function toggleComments(postId) {
  expandedComments[postId] = !expandedComments[postId]
  if (!expandedComments[postId]) return
  if (!commentsState[postId]) {
    await loadComments(postId)
  }
}

async function loadComments(postId) {
  commentsState[postId] = {
    loading: true,
    items: commentsState[postId]?.items || [],
  }

  try {
    const { data } = await communityApi.getComments(postId)
    commentsState[postId] = {
      loading: false,
      items: data.data,
    }
  } catch (error) {
    console.error('Error loading comments:', error)
    commentsState[postId] = {
      loading: false,
      items: commentsState[postId]?.items || [],
    }
  }
}

async function submitComment(postId) {
  const body = commentDrafts[postId]?.trim()
  if (!body || commentSubmittingId.value === postId) return

  if (!authStore.token) {
    router.push('/login')
    return
  }

  commentSubmittingId.value = postId
  try {
    const { data } = await communityApi.addComment(postId, body)
    if (!commentsState[postId]) {
      commentsState[postId] = { loading: false, items: [] }
    }
    commentsState[postId].items = [...commentsState[postId].items, data.comment]
    commentDrafts[postId] = ''

    const post = posts.value.find((entry) => entry.id === postId)
    if (post) {
      post.comments_count = (post.comments_count || 0) + 1
    }
  } catch (error) {
    console.error('Error posting comment:', error)
    alert(error.response?.data?.message || 'No se pudo publicar el comentario.')
  } finally {
    commentSubmittingId.value = null
  }
}

async function removeComment(postId, commentId) {
  if (!confirm('¿Quieres borrar este comentario?')) return

  try {
    await communityApi.removeComment(commentId)
    if (commentsState[postId]) {
      commentsState[postId].items = commentsState[postId].items.filter((comment) => comment.id !== commentId)
    }

    const post = posts.value.find((entry) => entry.id === postId)
    if (post && post.comments_count > 0) {
      post.comments_count -= 1
    }
  } catch (error) {
    console.error('Error removing comment:', error)
    alert('No se pudo borrar el comentario.')
  }
}

function formatDate(dateString) {
  if (!dateString) return 'HACE UN MOMENTO'

  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'HACE UN MOMENTO'
  if (diffMinutes < 60) return `HACE ${diffMinutes}M`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `HACE ${diffHours}H`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `HACE ${diffDays}D`

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

onMounted(loadInitialPosts)
</script>

<style scoped>
.post-card {
  opacity: 0;
  transform: translateY(20px);
  animation: cardEntry 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes cardEntry {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.publish-tabs {
  display: flex;
  gap: 8px;
}

.publish-tab {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid rgba(250, 204, 21, 0.15);
  background: rgba(11, 13, 23, 0.8);
  color: rgba(250, 204, 21, 0.55);
  font-size: 8px;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.publish-tab.active,
.publish-tab:hover {
  border-color: #facc15;
  color: #facc15;
  box-shadow: 0 0 20px rgba(250, 204, 21, 0.12);
}

.publish-option {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border: 2px solid rgba(250, 204, 21, 0.15);
  background: rgba(11, 13, 23, 0.8);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.publish-option.active,
.publish-option:hover {
  border-color: #facc15;
  box-shadow: 0 0 20px rgba(250, 204, 21, 0.15);
}

.publish-option__image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.publish-option__meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: rgba(250, 204, 21, 0.6);
  font-size: 7px;
  letter-spacing: 0.08em;
}

.publish-caption {
  width: 100%;
  background: rgba(11, 13, 23, 0.9);
  border: 2px solid rgba(250, 204, 21, 0.2);
  color: #fef9c3;
  padding: 12px;
  font-family: inherit;
  font-size: 8px;
  line-height: 1.7;
  resize: vertical;
}

.publish-caption:focus {
  outline: none;
  border-color: #facc15;
}

.engagement-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(250, 204, 21, 0.55);
  font-size: 7px;
  letter-spacing: 0.08em;
  transition: color 0.2s ease;
}

.engagement-button:hover,
.engagement-button.active {
  color: #facc15;
}

.comments-panel {
  border-top: 2px solid rgba(250, 204, 21, 0.08);
  padding-top: 12px;
}

.comment-item {
  padding: 10px;
  background: rgba(11, 13, 23, 0.65);
  border: 1px solid rgba(250, 204, 21, 0.08);
}
</style>
