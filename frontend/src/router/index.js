import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../MainView.vue'
import SecondView from '../SecondView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/game' },
    { path: '/game', name: 'Game', component: MainView },
    { path: '/game/second', name: 'SecondGame', component: SecondView },
  ],
})

export default router
