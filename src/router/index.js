import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AppView from '@/views/AppView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import ProgramsView from '../views/ProgramsView.vue'
import TrainingView from '../views/TrainingView.vue'

import { useAuthStore } from '@/stores/auth'
import { supabase } from '../lib/supabaseClient.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'login', component: LoginView },
    {
      path: '/app',
      name: 'app',
      component: AppView,
      meta: {
        requiresAuth: true,
      },
      children: [
        { path: 'home', name: 'home', component: HomeView },
        { path: 'profile', name: 'profile', component: ProfileView },
        { path: 'programs', name: 'programs', component: ProgramsView },
        { path: 'workout', name: 'workout', component: TrainingView },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.ready) {
    await supabase.auth.getSession()
  }

  if (to.meta.requiresAuth && !auth.user) {
    return { path: '/', query: { redirect: to.fullPath } }
  }
})

export default router
