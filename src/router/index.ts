import { createRouter, createWebHistory } from 'vue-router'
import ReservationManagement from '../features/branches/views/ReservationManagement.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'reservations',
      component: () => import('../features/branches/views/ReservationManagement.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/'
    }
  ],
})

export default router
