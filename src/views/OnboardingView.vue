<script setup>
import { useOnboardingStore } from '@/stores/onboarding'
import OnboardingItem from '@/components/OnboardingItem.vue'
import OnboardingSummary from '@/components/OnboardingSummary.vue'
import TrainingWorkoutAmountPill from '@/components/TrainingWorkoutAmountPill.vue'

const onboarding = useOnboardingStore()

const submitOnboarding = async () => {
  // Handle final submission (e.g., save onboarding.data to Supabase and route to dashboard)
}
</script>

<template>
  <div class="onboarding-view text-center w-full">
    <TrainingWorkoutAmountPill
      class="mt-3 mb-3"
      :completed="onboarding.currentStep"
      :total="onboarding.steps.length"
    />

    <div class="onboarding-header grid grid-cols-3 grid-rows-1 items-center">
      <div class="spacer"></div>
      <h1 class="text-3xl mb-4">
        {{ onboarding.isSummary ? 'Sammanfattning' : onboarding.current.title }}
      </h1>
      <div class="onboarding-navigation flex justify-end gap-1 p-5">
        <button
          :disabled="!onboarding.can_go_back"
          class="flex-1 bg-purple-300 py-5 rounded-l-2xl cursor-pointer disabled:cursor-default disabled:bg-purple-100"
          @click="onboarding.back()"
        >
          Föregående
        </button>

        <button
          v-if="!onboarding.isSummary"
          :disabled="!onboarding.can_go_next"
          class="flex-1 bg-purple-300 py-5 rounded-r-2xl cursor-pointer disabled:cursor-default disabled:bg-purple-100"
          @click="onboarding.next()"
        >
          Nästa
        </button>

        <button
          v-else
          class="flex-1 bg-purple-300 py-5 rounded-r-2xl cursor-pointer font-semibold"
          @click="submitOnboarding()"
        >
          Slutför
        </button>
      </div>
    </div>

    <KeepAlive>
      <OnboardingItem
        v-if="!onboarding.isSummary"
        :key="onboarding.current.id"
        :title="onboarding.current.title"
        :options="onboarding.current.options"
        :is_multichoice="onboarding.current.is_multichoice"
        v-model="onboarding.data[onboarding.current.id]"
      />
      <OnboardingSummary
        v-else
        :summary="onboarding.summaryDetails"
        v-model="onboarding.data"
        @edit-step="onboarding.goToStep"
      />
    </KeepAlive>
  </div>
</template>
