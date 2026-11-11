<script setup>
import { ref, onMounted } from 'vue'
import { fetchCourses } from '@/lib/courses'
import CourseCard from './CourseCard.vue'

const props = defineProps({
  limit: { type: Number, default: 0 }, // 0 = show all
})

const courses = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const all = await fetchCourses()
    courses.value = props.limit ? all.slice(0, props.limit) : all
  } catch (e) {
    error.value = 'Kunde inte hämta program: ' + e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <p v-if="loading">Laddar...</p>
  <p v-else-if="error" class="text-red-500">{{ error }}</p>
  <p v-else-if="!courses.length">Inga program ännu.</p>
  <div v-else class="grid gap-4 sm:grid-cols-2">
    <CourseCard v-for="c in courses" :key="c.id" :course="c" />
  </div>
</template>