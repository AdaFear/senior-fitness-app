<script setup>
import TrainingWorkoutAmountPill from './TrainingWorkoutAmountPill.vue'

defineProps({
  completed: { type: Number, required: true },
  total: { type: Number, required: true },
})
defineEmits(['exit'])
</script>

<template>
  <header class="flex items-center gap-3">
    <button
      type="button"
      class="rounded-full bg-white px-3 py-1 text-xl shadow"
      aria-label="Avsluta pass"
      @click="$emit('exit')"
    >
      ✕
    </button>
    <TrainingWorkoutAmountPill v-if="total" class="flex-1" :completed="completed" :total="total" />
  </header>
</template>