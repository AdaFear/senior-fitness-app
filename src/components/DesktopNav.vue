<script setup>
import DesktopNavItem from './DesktopNavItem.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

const handleLogOut = async () => {
  await auth.signOut()
  router.push('/')
}
</script>

<template>
  <nav
    class="mobile-nav justify-around items-center flex flex-col fixed box-border top-1/12 left-2/12 rounded-4xl gap-3 p-2 border-gray-300 border-2"
  >
    <DesktopNavItem :icon="'fa-home'" :title="'Hem'" :name="'home'"></DesktopNavItem>
    <DesktopNavItem :icon="'fa-dumbbell'" :title="'Program'" :name="'programs'"></DesktopNavItem>
    <DesktopNavItem :icon="'fa-user'" :title="'Profil'" :name="'profile'"></DesktopNavItem>
    <button
      class="mobile-nav-item bg-blue-500 w-full flex rounded-4xl justify-start gap-2 text-center flex-1 h-full text-xl p-4 transition duration-300 hover:bg-blue-600 cursor-pointer"
      @click="handleLogOut"
    >
      <font-awesome-icon icon="fa-solid fa-right-from-bracket" size="xl" fixed-width />
      <span class="mobile-nav-item-label">Logga ut</span>
    </button>
  </nav>
</template>

<style scoped></style>
