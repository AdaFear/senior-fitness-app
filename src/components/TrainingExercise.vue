<script setup>
import { renderContent, toEmbedUrl } from '@/lib/courseUtils'

defineProps({
  exercise: { type: Object, required: true },
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-3xl font-bold text-gray-900">{{ exercise.title }}</h1>

    <iframe
      v-if="toEmbedUrl(exercise.video_url)"
      :key="exercise.id"
      :src="toEmbedUrl(exercise.video_url)"
      class="w-full rounded-xl"
      style="aspect-ratio: 16/9; border: 0"
      allowfullscreen
    />

    <div class="content text-lg text-gray-800" v-html="renderContent(exercise.content)" />
  </div>
</template>

<style scoped>
/* Tailwind resets headings and lists, so give the markdown output basic styling */
.content :deep(h1) { font-size: 1.75rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.content :deep(h2) { font-size: 1.4rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.content :deep(h3) { font-size: 1.15rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
.content :deep(p) { margin: 0.5rem 0; }
.content :deep(ul) { list-style: disc; padding-left: 1.5rem; }
.content :deep(ol) { list-style: decimal; padding-left: 1.5rem; }
.content :deep(img) { max-width: 100%; border-radius: 0.75rem; }
</style>