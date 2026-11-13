<script setup>
import { useAuthStore } from '@/stores/auth'
import ProfileCard from '@/components/ProfileCard.vue'
import LogOutButton from '@/components/LogOutButton.vue'

const auth = useAuthStore()
</script>

<template>
  <div class="mx-auto max-w-md p-4">
    <h2 class="mb-4 text-2xl font-bold text-gray-900">Profil</h2>

    <ProfileCard />

    <RouterLink
      v-if="auth.isAdmin"
      :to="{ name: 'admin' }"
      class="mt-4 block rounded-xl bg-blue-500 py-3 text-center font-semibold text-white hover:bg-blue-600"
    >
      Adminpanel
    </RouterLink>

    <div class="mt-4"><LogOutButton class="flex-none h-20" /></div>
  </div>
</template>
