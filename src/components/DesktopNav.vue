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
    class="w-60 justify-around items-center flex flex-col box-border rounded-4xl gap-3 p-2 shadow-xl bg-white"
  >
    <DesktopNavItem :icon="'fa-home'" :title="'Hem'" :name="'home'"></DesktopNavItem>
    <DesktopNavItem :icon="'fa-dumbbell'" :title="'Program'" :name="'programs'"></DesktopNavItem>
    <DesktopNavItem :icon="'fa-user'" :title="'Profil'" :name="'profile'"></DesktopNavItem>
    <hr class="w-full border-t border-stone-300" />
    <button
      class="bg-white w-full flex rounded-4xl justify-start gap-2 text-center flex-1 text-xl p-4 transition duration-300 cursor-pointer text-slate-800 border-2 border-stone-300 hover:border-gray-200"
      @click="handleLogOut"
    >
      <font-awesome-icon icon="fa-solid fa-right-from-bracket" size="xl" fixed-width />
      <span class="-label">Logga ut</span>
    </button>
  </nav>
</template>

<style scoped></style>
