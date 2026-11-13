<script setup>
import ProgramOverview from '@/components/ProgramOverview.vue'
import { ref } from 'vue'

defineProps({
  obj: Object,
})

const showModal = ref(false)
</script>

<template>
  <div class="rounded-3xl bg-white">
    <div class="img-placeholder bg-gray-300 h-30 rounded-t-3xl"></div>
    <div class="program-card bg-white p-6 shadow-xl flex flex-col w-full gap-4.5 rounded-b-3xl">
      <span class="text-xs rounded-full bg-gray-200 self-start px-3 py-1">{{ obj.focus }}</span>
      <h3 class="text-xl">{{ obj.title }}</h3>
      <hr class="border-stone-300" />
      <dl class="flex justify-start gap-10">
        <div>
          <dt class="text-gray-400 font-medium">Längd</dt>
          <dd class="">{{ obj.length }}</dd>
        </div>
        <div>
          <dt class="text-gray-400 font-medium">Frekvens</dt>
          <dd class="">{{ obj.frequency }} gånger/vecka</dd>
        </div>
      </dl>
      <button
        @click="showModal = true"
        class="bg-blue-500 w-full text-white rounded-lg py-3 hover:cursor-pointer"
      >
        Läs mer
      </button>
      <ProgramOverview @close="showModal = false" v-if="showModal" :obj="obj"></ProgramOverview>
    </div>
  </div>
</template>

<style scoped></style>
