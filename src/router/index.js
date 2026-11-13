import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AppView from '@/views/AppView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import ProgramsView from '../views/ProgramsView.vue'
import TrainingView from '../views/TrainingView.vue'
import AdminView from '../views/AdminView.vue'
import { useAuthStore } from '@/stores/auth'
import OnboardingView from '@/views/OnboardingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'login', component: LoginView },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingView,
      meta: { requiresAuth: true, requiresOnboarding: false },
    },
    {
      path: '/app',
      name: 'app',
      component: AppView,
      children: [
        { path: 'admin', name: 'admin', component: AdminView, meta: { requiresAdmin: true } },
        { path: 'home', name: 'home', component: HomeView, meta: { requiresOnboarding: true } },
        {
          path: 'profile',
          name: 'profile',
          component: ProfileView,
          meta: { requiresOnboarding: true },
        },
        {
          path: 'programs',
          name: 'programs',
          component: ProgramsView,
          meta: { requiresOnboarding: true },
        },
        {
          path: 'workout',
          name: 'workout',
          component: TrainingView,
          meta: { requiresOnboarding: true },
        },
      ],
    },
    { path: '/admin', redirect: { name: 'admin' } },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init

  if (to.name === 'login') {
    return auth.user ? { name: 'home' } : true
  }
  if (!auth.user) return { name: 'login' }
  if (to.matched.some((r) => r.meta.requiresAdmin) && !auth.isAdmin) {
    return { name: 'home' }
  }

  if (!auth.onboardingComplete) await auth.refreshOnboarding()

  if (to.meta.requiresOnboarding && !auth.onboardingComplete) {
    return { name: 'onboarding', query: { redirect: to.fullPath } }
  }
})

export default router
