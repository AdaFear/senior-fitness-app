<script setup>
const model = defineModel()

const props = defineProps({
  options: {
    type: Array,
    default: () => [{ title: 'option xx', value: 'something' }],
  },
  title: {
    type: String,
    default: 'This is a title',
  },
  is_multichoice: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <div class="onboarding-item w-full h-dvh flex flex-col p-5">
    <form @submit.prevent class="w-full flex gap-2 flex-col overflow-y-auto min-h-0">
      <label
        v-for="(option, ind) in props.options"
        :key="ind"
        :class="{ 'border-gray-400': 3 === 1 }"
        class="item w-full flex justify-between p-5 border-2 rounded-2xl cursor-pointer"
      >
        <span :class="{ 'text-gray-400': 3 === 1 }" class="text-xl text-left">{{
          option.title
        }}</span>
        <input
          class="scale-150 -z-1"
          :type="props.is_multichoice ? 'checkbox' : 'radio'"
          :name="title"
          v-model="model"
          :value="option.value"
        />
      </label>
    </form>
  </div>
</template>

<style scoped></style>
