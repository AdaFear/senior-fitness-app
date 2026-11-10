<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function enterWorkout() {
  router.replace({ name: 'workout' })
}
</script>

<template>
  <div>
    <h2>Programs</h2>
    <button class="bg-green-700 p-4 rounded-2xl" @click="enterWorkout()">Workout</button>
  </div>
</template>

<style scoped></style>
