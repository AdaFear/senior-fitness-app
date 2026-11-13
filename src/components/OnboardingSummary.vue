<script setup>
const model = defineModel()
</script>
<template>
  <div class="onboarding-item w-full h-dvh flex flex-col p-5">
    <div class="choice" v-for="(val, key) in model" :key="val">{{ key }}:{{ val }}</div>
  </div>
</template>

<style scoped></style>
