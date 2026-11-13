<script setup>
import knabojImage from '../assets/images/knaboj.jpg'
</script>

<template>
  <div class="min-h-screen bg-[#fffdf1] p-4">
    <div
      class="max-w-md mx-auto rounded-3xl border-2 border-[#ff9644] overflow-hidden bg-gradient-to-b from-[#fffdf1] via-[#fffdf1] to-[#ffce99]"
    >
      <div class="min-h-screen bg-gradient-to-b from-[#fffdf1] via-[#fffdf1] to-[#ffce99]">
        <div class="relative">
          <img :src="knabojImage" alt="Start workout" class="mx-auto block w-[90%] h-auto" />
          <button
            class="absolute left-5 top-5 rounded-full bg-[#fffdf1]/80 px-4 py-2 text-sm font-medium text-[#562f00] shadow-sm"
          >
            Tillbaka
          </button>
        </div>

        <main class="px-5 pt-6 pb-28 space-y-6">
          <p class="text-lg font-semibold text-[#562f00]">Måndagspass</p>
          <h1 class="text-4xl font-bold text-[#562f00]">Rörlighet</h1>
          <p class="text-lg text-[#562f00]">Fokus på rörlighet i axlar, höfter och bröstrygg</p>

          <div class="flex flex-wrap gap-2">
            <span class="bg-[#ffce99] text-[#562f00] text-sm font-medium px-2.5 py-0.5 rounded"
              >Rörlighet</span
            >
            <span class="bg-[#ffce99] text-[#562f00] text-sm font-medium px-2.5 py-0.5 rounded"
              >Axlar</span
            >
            <span class="bg-[#ffce99] text-[#562f00] text-sm font-medium px-2.5 py-0.5 rounded"
              >Höfter</span
            >
            <span class="bg-[#ffce99] text-[#562f00] text-sm font-medium px-2.5 py-0.5 rounded"
              >Bröstrygg</span
            >
          </div>
        </main>

        <div class="sticky bottom-6 px-5">
          <button
            class="w-full rounded-full bg-[#ff9644] hover:bg-[#e78336] px-4 py-3 text-lg font-semibold text-[#fffdf1] shadow-lg shadow-[#ff9644]/30"
          >
            Starta träning
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
