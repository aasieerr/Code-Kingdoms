import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../MainView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/game' },
    { path: '/game/:after(.*)*', name: 'Game', component: MainView },
  ],
})

export default router
