<script setup>
const emit = defineEmits(['close'])

defineProps({
  obj: Object,
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex bg-black/50 p-4">
    <!-- Outer wrapper: relative, does NOT scroll -->
    <div
      class="w-250 max-w-full max-h-full min-h-5/12 m-auto rounded-3xl bg-white shadow-xl relative flex flex-col overflow-hidden"
    >
      <!-- Close button: stays put because it's outside the scrolling area -->
      <button
        @click="emit('close')"
        class="absolute top-3 right-3 z-10 border rounded-full w-10 h-10 flex items-center justify-center bg-red-400 text-white"
      >
        &times;
      </button>

      <!-- Scrolling area -->
      <div class="overflow-y-auto min-h-0">
        <div class="w-full h-60 bg-gray-300"></div>

        <div class="p-5 flex flex-col gap-5">
          <h2 class="text-3xl">{{ obj.title }}</h2>

          <div>
            <h3 class="text-xl">Målet med programmet</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit aspernatur consectetur
              magni expedita eum quae, tempora quasi molestiae ipsum recusandae error laborum
              debitis doloremque, non voluptatem fuga numquam, explicabo minima.
            </p>
          </div>

          <h3 class="text-xl"></h3>

          <div>
            <h3 class="text-xl">Progression</h3>
            <ol class="list-decimal p-5">
              <li>Vecka 1-3</li>
              <li>Vecka 4-6</li>
              <li>Vecka 7-8</li>
            </ol>
          </div>

          <div>
            <h3 class="text-xl">Passen</h3>
            <div class="flex w-full justify-start gap-8">
              <div class="p-5 bg-green-300 w-full rounded-2xl">
                <h4>Pass A</h4>
                <ul class="list-disc px-5">
                  <li>Knäböj</li>
                  <li>Knäböj</li>
                  <li>Knäböj</li>
                  <li>Knäböj</li>
                  <li>Knäböj</li>
                </ul>
              </div>
              <div class="p-5 bg-orange-300 w-full rounded-2xl">
                <h4>Pass B</h4>
                <ul class="list-disc px-5">
                  <li>Knäböj</li>
                  <li>Knäböj</li>
                  <li>Knäböj</li>
                  <li>Knäböj</li>
                  <li>Knäböj</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
