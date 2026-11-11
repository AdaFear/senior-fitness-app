<script setup>
import { useAuthStore } from '@/stores/auth'
import CourseList from '@/components/CourseList.vue'

const auth = useAuthStore()
</script>

<template>
  <div class="mx-auto max-w-3xl p-4">
    <h2 class="text-2xl font-bold text-gray-900">
      Hej{{ auth.user?.email ? ', ' + auth.user.email : '' }}!
    </h2>
    <p class="mb-4 text-gray-600">Redo för ett pass?</p>

    <CourseList :limit="3" />

    <RouterLink
      :to="{ name: 'programs' }"
      class="mt-4 inline-block font-semibold text-blue-600 hover:text-blue-800"
    >
      Visa alla program →
    </RouterLink>
  </div>
</template>