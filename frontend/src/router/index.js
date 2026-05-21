import { createRouter, createWebHistory } from 'vue-router'
import { activeCharacterId } from '../gameState'
import { useAuthStore } from '../stores/auth'
import MainView from '../MainView.vue'
import SecondView from '../SecondView.vue'
import CharacterMenuView from '../views/CharacterMenuView.vue'
import LoginView from '../views/LoginView.vue'
import LandingView from '../views/LandingView.vue'
import CommunityView from '../views/CommunityView.vue'
import RegisterView from '../views/RegisterView.vue'
import ScreenshotsView from '../views/ScreenshotsView.vue'
import SupportView from '../views/SupportView.vue'
import PrivacyView from '../views/PrivacyView.vue'
import TermsView from '../views/TermsView.vue'
import ProfileView from '../views/ProfileView.vue'

const PUBLIC_ROUTES = new Set([
  'Login',
  'Landing',
  'Community',
  'Register',
  'Screenshots',
  'Support',
  'Privacy',
  'Terms',
])

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Landing', component: LandingView },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/personajes', name: 'CharacterMenu', component: CharacterMenuView },
    { path: '/perfil', name: 'Profile', component: ProfileView },
    { path: '/game', name: 'Game', component: MainView },
    { path: '/game/second', name: 'SecondGame', component: SecondView },
    { path: '/comunidad', name: 'Community', component: CommunityView },
    { path: '/register', name: 'Register', component: RegisterView },
    { path: '/capturas', name: 'Screenshots', component: ScreenshotsView },
    { path: '/soporte', name: 'Support', component: SupportView },
    { path: '/privacidad', name: 'Privacy', component: PrivacyView },
    { path: '/terminos', name: 'Terms', component: TermsView },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!PUBLIC_ROUTES.has(to.name) && !auth.token) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'Game' && activeCharacterId.value == null) {
    return { name: 'CharacterMenu' }
  }
  return true
})

export default router
