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

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Landing', component: LandingView },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/personajes', name: 'CharacterMenu', component: CharacterMenuView },
    { path: '/game', name: 'Game', component: MainView },
    { path: '/game/second', name: 'SecondGame', component: SecondView },
    { path: '/comunidad', name: 'Community', component: CommunityView },
    { path: '/register', name: 'Register', component: RegisterView },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.name !== 'Login' && to.name !== 'Landing' && to.name !== 'Community' && to.name !== 'Register' && !auth.token) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'Game' && activeCharacterId.value == null) {
    return { name: 'CharacterMenu' }
  }
  return true
})

export default router
