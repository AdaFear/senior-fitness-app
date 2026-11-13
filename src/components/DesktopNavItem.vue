<script setup>
defineProps({
  icon: String,
  title: String,
  name: String,
})
</script>
<template>
  <RouterLink
    :to="{ name }"
    class="w-full flex rounded-4xl justify-start gap-2 text-center flex-1 h-full text-xl p-4 transition duration-300 text-slate-800 hover:bg-teal-100"
    active-class="bg-teal-800 hover:bg-teal-800 text-white"
  >
    <font-awesome-icon :icon="'fa-solid ' + icon" size="xl" fixed-width />
    <span class="">{{ title }}</span>
  </RouterLink>
</template>

<style scoped></style>
