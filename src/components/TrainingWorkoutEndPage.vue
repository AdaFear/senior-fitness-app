<script setup>
import { useRouter } from 'vue-router'

function onSubmit(action) {
  console.log('clicked:', action)
  exitWorkout()
}

const router = useRouter()

function exitWorkout() {
  router.replace({ name: 'home' })
}
</script>

<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-linear-to-t from-orange-200 to-white sm:p-5"
  >
    <div class="w-full max-w-2xl rounded-2xl bg-gray-100 p-8 shadow-xl">
      <h1 class="mb-8 text-center text-4xl font-bold text-gray-900">Hur kändes träningspasset?</h1>

      <form class="flex flex-col gap-10" @submit.prevent>
        <button
          type="button"
          class="rounded-xl bg-green-600 px-4 py-6 text-3xl font-semibold text-white shadow-md transition hover:bg-green-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300"
          @click="onSubmit('lätt')"
        >
          Lätt
        </button>

        <button
          type="button"
          class="rounded-xl bg-yellow-400 px-4 py-6 text-3xl font-semibold text-gray-900 shadow-md transition hover:bg-yellow-500 active:scale-95 focus:outline-none focus:ring-4 focus:ring-yellow-200"
          @click="onSubmit('lagom')"
        >
          Lagom
        </button>

        <button
          type="button"
          class="rounded-xl bg-red-700 px-4 py-6 text-3xl font-semibold text-white shadow-md transition hover:bg-red-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300"
          @click="onSubmit('ansträngande')"
        >
          Ansträngande
        </button>
      </form>
    </div>
  </div>
</template>
