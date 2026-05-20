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
        <CommunityPostCard
          v-for="(post, index) in posts"
          :key="post.id"
          :post="post"
          :index="index"
          :is-logged-in="!!authStore.token"
          :format-date="formatDate"
          @like="toggleLike(post)"
          @open-modal="openPostModal(post)"
        />
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
      <CommunityPublishModal
        v-if="publishModalOpen"
        :has-token="!!authStore.token"
        :publish-mode="publishMode"
        :publish-caption="publishCaption"
        :loading-screenshots="loadingScreenshots"
        :unpublished-screenshots="unpublishedScreenshots"
        :selected-screenshot-id="selectedScreenshotId"
        :publishing="publishing"
        :format-date="formatDate"
        @close="closePublishModal"
        @update:publish-mode="(v) => { publishMode = v }"
        @update:publish-caption="(v) => { publishCaption = v }"
        @update:selected-screenshot-id="(v) => { selectedScreenshotId = v }"
        @publish-text="publishTextPost"
        @publish-screenshot="publishSelectedScreenshot"
      />
    </Transition>

    <Transition name="fade">
      <CommunityPostModal
        v-if="selectedPostForModal"
        :post="selectedPostForModal"
        :comments-loading="commentsState[selectedPostForModal.id]?.loading"
        :comments="commentsState[selectedPostForModal.id]?.items || []"
        :comment-draft="commentDrafts[selectedPostForModal.id] ?? ''"
        :like-pending="likePendingId === selectedPostForModal.id"
        :comment-submitting="commentSubmittingId === selectedPostForModal.id"
        :is-logged-in="!!authStore.token"
        :format-date="formatDate"
        @close="closePostModal"
        @like="toggleLike(selectedPostForModal)"
        @remove-post="removePost(selectedPostForModal.id)"
        @remove-comment="(commentId) => removeComment(selectedPostForModal.id, commentId)"
        @submit-comment="submitComment(selectedPostForModal.id)"
        @update:comment-draft="(v) => { commentDrafts[selectedPostForModal.id] = v }"
      />
    </Transition>

    <AppFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import CommunityPostCard from '../components/community/CommunityPostCard.vue'
import CommunityPostModal from '../components/community/CommunityPostModal.vue'
import CommunityPublishModal from '../components/community/CommunityPublishModal.vue'
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
const selectedPostForModal = ref(null)
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
  try {
    await communityApi.remove(postId)
    posts.value = posts.value.filter((post) => post.id !== postId)
    delete commentsState[postId]
    delete commentDrafts[postId]
    if (selectedPostForModal.value?.id === postId) {
      closePostModal()
    }
  } catch (error) {
    console.error('Error removing community post:', error)
    alert(error.response?.data?.message || 'No se pudo retirar la publicación.')
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

async function openPostModal(post) {
  selectedPostForModal.value = post
  if (!commentsState[post.id]) {
    await loadComments(post.id)
  }
}

function closePostModal() {
  selectedPostForModal.value = null
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
