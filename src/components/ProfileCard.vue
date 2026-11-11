<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="rounded-2xl bg-white p-4 shadow-md">
    <p class="text-sm text-gray-500">Email</p>
    <p class="font-semibold text-gray-900">{{ auth.user?.email ?? 'Gäst' }}</p>
    <p
      v-if="auth.isAdmin"
      class="mt-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-sm font-semibold text-blue-700"
    >
      Admin
    </p>
  </div>
</template>