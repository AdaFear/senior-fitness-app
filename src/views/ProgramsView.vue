<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import ProgramCard from '@/components/ProgramCard.vue'

const fetchReady = ref(false)
const fetchedData = ref([])

const fetchPrograms = async () => {
  const { data, error: fetchError } = await supabase.from('program_william').select()
  fetchReady.value = true
  if (fetchError) {
    alert(fetchError.value)
  }
  fetchedData.value = data
}

onMounted(async () => {
  await fetchPrograms()
  console.log(fetchedData.value)
})
</script>
<template>
  <div class="home-view w-full">
    <div
      class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] gap-4"
      v-if="fetchReady"
    >
      <ProgramCard v-for="object in fetchedData" :key="object.id" :obj="object"></ProgramCard>
    </div>
  </div>
</template>

<style scoped></style>
