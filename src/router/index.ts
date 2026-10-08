import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Главная' },
    },
    {
      path: '/workspace/:id',
      name: 'workspace',
      component: () => import('@/views/WorkspaceView.vue'),
    },
    {
      path: '/finance',
      name: 'finance',
      component: () => import('@/views/FinanceView.vue'),
      meta: { title: 'Финансы' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: 'Настройки' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' },
    },
  ],
})

export default router
