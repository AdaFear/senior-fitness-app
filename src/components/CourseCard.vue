<script setup>
defineProps({
  course: { type: Object, required: true },
})
</script>

<template>
  <article class="overflow-hidden rounded-2xl bg-white shadow-md">
    <img
      v-if="course.thumbnail_url"
      :src="course.thumbnail_url"
      :alt="course.title"
      class="h-40 w-full object-cover"
    />
    <div v-else class="h-40 w-full bg-linear-to-t from-orange-200 to-stone-100" />

    <div class="p-4">
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-xl font-bold text-gray-900">{{ course.title }}</h3>
        <span
          class="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-sm font-semibold text-orange-700"
        >
          Nivå {{ course.level }}
        </span>
      </div>

      <p v-if="course.description" class="mt-2 text-gray-600">{{ course.description }}</p>
      <p class="mt-2 text-sm text-gray-500">{{ course.exercises.length }} övningar</p>

      <RouterLink
        v-if="course.exercises.length"
        :to="{ name: 'workout', params: { courseId: course.id } }"
        class="mt-4 block rounded-xl bg-green-700 py-3 text-center font-semibold text-white transition hover:bg-green-800"
      >
        Starta pass
      </RouterLink>
    </div>
  </article>
</template>
