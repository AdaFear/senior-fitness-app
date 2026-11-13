<script setup>
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
  <button
    class="mobile-nav-item bg-blue-500 flex rounded-4xl justify-start gap-2 text-center flex-1 h-full text-xl p-4 transition duration-300 hover:bg-blue-600 cursor-pointer"
    @click="handleLogOut"
  >
    <font-awesome-icon icon="fa-solid fa-right-from-bracket" size="xl" fixed-width />
    <span class="mobile-nav-item-label">Logga ut</span>
  </button>
</template>

<style scoped></style>
