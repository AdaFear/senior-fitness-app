<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

async function logout() {
  await auth.signOut()
  router.push('/')
}
</script>

<template>
  <button
    type="button"
    class="w-full rounded-xl border border-gray-400 py-3 font-semibold text-gray-700 hover:bg-gray-100"
    @click="logout"
  >
    Logga ut
  </button>
</template>