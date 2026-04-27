import { createRouter, createWebHistory } from 'vue-router'
import { activeCharacterId } from '../gameState'
import { useAuthStore } from '../stores/auth'
import MainView from '../MainView.vue'
import SecondView from '../SecondView.vue'
import CharacterMenuView from '../views/CharacterMenuView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/personajes' },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/personajes', name: 'CharacterMenu', component: CharacterMenuView },
    { path: '/game', name: 'Game', component: MainView },
    { path: '/game/second', name: 'SecondGame', component: SecondView },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.name !== 'Login' && !auth.token) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'Game' && activeCharacterId.value == null) {
    return { name: 'CharacterMenu' }
  }
  return true
})

export default router
