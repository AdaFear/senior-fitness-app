<script setup>
defineProps({
  completed: { type: Number, required: true },
  total: { type: Number, required: true },
})
</script>

<template>
  <div
    class="flex gap-1.5"
    role="progressbar"
    aria-valuemin="1"
    :aria-valuenow="completed + 1"
    :aria-valuemax="total"
  >
    <div
      v-for="n in total"
      :key="n"
      class="h-2 flex-1 rounded-full transition-colors duration-300"
      :class="
        n <= completed ? 'bg-green-600' : n === completed + 1 ? 'bg-orange-500' : 'bg-stone-300/70'
      "
    />
  </div>
</template>
