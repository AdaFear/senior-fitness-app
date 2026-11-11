<script setup>
defineProps({
  showBack: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
})
defineEmits(['back', 'next'])
</script>

<template>
  <div class="flex gap-3 pt-4">
    <button
      v-if="showBack"
      type="button"
      class="rounded-xl bg-white px-4 py-4 text-xl font-semibold shadow"
      @click="$emit('back')"
    >
      Föregående
    </button>
    <button
      type="button"
      class="flex-1 rounded-xl bg-green-700 px-4 py-4 text-xl font-semibold text-white shadow transition hover:bg-green-800 active:scale-95"
      @click="$emit('next')"
    >
      {{ isLast ? 'Avsluta pass' : 'Nästa övning' }}
    </button>
  </div>
</template>