<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchCourse } from '@/lib/courses'
import { renderContent, toEmbedUrl } from '@/lib/courseUtils'

import TrainingWorkoutAmountPill from '@/components/TrainingWorkoutAmountPill.vue'
import TrainingWorkoutEndPage from '@/components/TrainingWorkoutEndPage.vue'

const route = useRoute()
const router = useRouter()

// ---------- Data ----------
const course = ref(null)
const loading = ref(true)
const error = ref('')

const exercises = computed(() => course.value?.exercises ?? [])
const numberOfWorkouts = computed(() => exercises.value.length)
const completedWorkouts = ref(0)
const isFinished = ref(false)

const current = computed(() => exercises.value[completedWorkouts.value])
const isTimed = computed(() => !!current.value?.seconds)
const isLast = computed(() => completedWorkouts.value + 1 >= numberOfWorkouts.value)
const repsLabel = computed(() => (current.value?.per_side ? 'gånger per sida' : 'gånger'))

const videoUrl = computed(() => current.value?.video_url ?? '')
const embedUrl = computed(() => toEmbedUrl(videoUrl.value))
const isDirectVideo = computed(
  () => !embedUrl.value && /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl.value),
)
const hasVideo = computed(() => !!embedUrl.value || isDirectVideo.value)

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  try {
    course.value = await fetchCourse(route.params.courseId)
    if (!course.value) error.value = 'Programmet hittades inte.'
    else if (!course.value.exercises.length) error.value = 'Programmet har inga övningar än.'
    else resetTimer()
  } catch (e) {
    error.value = 'Kunde inte hämta programmet: ' + e.message
  } finally {
    loading.value = false
  }
})

const increase = () => {
  if (isLast.value) {
    stopInterval()
    isFinished.value = true
  } else {
    completedWorkouts.value++
    resetTimer()
    scrollToTop()
  }
}

const decrease = () => {
  if (completedWorkouts.value > 0) {
    completedWorkouts.value--
    resetTimer()
    scrollToTop()
  }
}

// ---------- Timer ----------
const exerciseSeconds = computed(() => current.value?.seconds ?? 30)
const timeLeft = ref(30)
const timerState = ref('idle') // 'idle' | 'running' | 'paused' | 'done'
let intervalId = null

const timeText = computed(() => {
  const t = Math.max(timeLeft.value, 0)
  const m = Math.floor(t / 60)
  const s = String(t % 60).padStart(2, '0')
  return `${m}:${s}`
})

const timerButtonText = computed(() => {
  if (timerState.value === 'running') return 'Ta en paus'
  if (timerState.value === 'paused') return 'Fortsätt med Passet'
  if (timerState.value === 'done') return 'Gå till nästa övning'
  return 'Starta Passet!'
})

const timerButtonClass = computed(() => {
  if (timerState.value === 'running')
    return 'bg-amber-300 text-amber-950 shadow-amber-300/50 hover:bg-amber-200'
  return 'bg-orange-600 text-white shadow-orange-600/40 hover:bg-orange-500'
})

function stopInterval() {
  clearInterval(intervalId)
  intervalId = null
}

function startTimer() {
  if (timerState.value === 'done') timeLeft.value = exerciseSeconds.value
  timerState.value = 'running'
  stopInterval()
  intervalId = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= -1) {
      // extra second at 0:00
      timeLeft.value = 0
      stopInterval()
      timerState.value = 'done'
      navigator.vibrate?.(300)

      const wasLast = isLast.value
      increase()
      // FIXED: don't restart the timer behind the end page after the last exercise
      if (!wasLast && isTimed.value) startTimer()
    }
  }, 1000)
}

function resetTimer() {
  stopInterval()
  timeLeft.value = exerciseSeconds.value
  timerState.value = 'idle'
}

function pauseTimer() {
  stopInterval()
  timerState.value = 'paused'
}

function toggleTimer() {
  if (timerState.value === 'running') pauseTimer()
  else startTimer()
}

// ---------- Video pop-up ----------
const videoOpen = ref(false)
const modalVideoEl = ref(null)

async function openVideo() {
  videoOpen.value = true
  await nextTick()
  modalVideoEl.value?.play?.().catch(() => {})
}

function closeVideo() {
  modalVideoEl.value?.pause?.()
  videoOpen.value = false // removing the iframe also stops YouTube/Vimeo playback
}

function onKeydown(e) {
  if (e.key === 'Escape' && videoOpen.value) closeVideo()
}

onBeforeUnmount(() => {
  stopInterval()
  window.removeEventListener('keydown', onKeydown)
})

const scrollArea = ref(null)

async function scrollToTop() {
  await nextTick()
  scrollArea.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

function exitWorkout() {
  stopInterval()
  router.replace({ name: 'home' })
}
</script>

<template>
  <TrainingWorkoutEndPage v-if="isFinished" class="z-50" />

  <!-- Loading / error -->
  <div
    v-else-if="loading || error"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-linear-to-t from-orange-200 to-white p-6"
  >
    <p v-if="loading" class="text-xl text-stone-800">Laddar...</p>
    <template v-else>
      <p class="text-xl text-red-600">{{ error }}</p>
      <button
        type="button"
        class="rounded-full bg-white px-5 py-2 text-lg font-bold text-stone-800 shadow-md"
        @click="exitWorkout"
      >
        Tillbaka
      </button>
    </template>
  </div>

  <div
    v-else-if="current"
    class="fixed inset-0 z-50 flex flex-col bg-linear-to-t from-orange-200 to-white text-white px-5 pt-5 pb-5 sm:px-8 md:px-[5vw] lg:px-[5vw]"
  >
    <header class="shrink-0">
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-bold uppercase tracking-[0.15em] text-orange-900">
          Övning {{ completedWorkouts + 1 }} av {{ numberOfWorkouts }}
        </p>

        <button
          type="button"
          class="shrink-0 rounded-full bg-red-500 px-4 py-2 text-base font-semibold text-white shadow-sm transition hover:bg-red-600 active:scale-95"
          @click="exitWorkout"
        >
          Avsluta Träning
        </button>
      </div>

      <TrainingWorkoutAmountPill
        class="mt-3"
        :completed="completedWorkouts"
        :total="numberOfWorkouts"
      />

      <div class="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1
          class="min-w-0 flex-1 text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl"
        >
          {{ current.title }}
        </h1>
      </div>
    </header>

    <div ref="scrollArea" class="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
      <!-- Video card, opens the pop-up (only if the exercise has a video) -->
      <button
        v-if="hasVideo"
        type="button"
        class="mt-4 flex w-full items-center gap-4 rounded-3xl bg-white p-2.5 text-left shadow-sm transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
        aria-label="Öppna video"
        @click="openVideo"
      >
        <span
          class="relative flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-stone-800"
        >
          <span class="flex size-9 items-center justify-center rounded-full bg-white/95 shadow">
            <svg
              class="size-4 translate-x-0.5 text-orange-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
        <span class="text-xl font-bold text-stone-900">Se hur du ska göra</span>
      </button>

      <!-- Steps + goal -->
      <div class="mt-6 flex w-full items-center justify-between gap-3 p-1.5 sm:mt-8">
        <h2 class="text-sm font-bold uppercase tracking-[0.15em] text-stone-500">Steg:</h2>

        <!-- Time -->
        <div
          v-if="isTimed"
          class="flex shrink-0 items-baseline gap-2 rounded-full bg-white px-5 py-2 shadow-md ring-1 ring-stone-900/5"
        >
          <span
            class="text-2xl font-bold tabular-nums leading-none"
            :class="timerState === 'done' ? 'text-green-700' : 'text-stone-900'"
          >
            {{ timeText }}
          </span>
          <p class="text-sm font-bold uppercase tracking-wide text-stone-500">Sek..</p>

          <button
            v-if="timerState === 'paused'"
            type="button"
            class="text-sm font-semibold text-orange-800 underline underline-offset-4"
            @click="resetTimer"
          >
            Nollställ
          </button>
        </div>
        <!-- Reps -->
        <div
          v-else-if="current.reps"
          class="flex shrink-0 items-baseline gap-2 rounded-full bg-white px-6 py-2 shadow-md"
        >
          <p class="text-2xl font-bold tabular-nums leading-none text-stone-900">
            {{ current.reps }}
          </p>
          <p class="text-sm font-bold uppercase tracking-wide text-stone-500">{{ repsLabel }}</p>
        </div>
      </div>

      <ol class="space-y-2.5">
        <li
          v-for="(todo, i) in current.steps"
          :key="i"
          class="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-900/5"
        >
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full text-xl font-bold text-black sm:size-12 sm:text-2xl"
          >
            {{ i + 1 }}
          </span>
          <span class="pt-1 text-xl leading-snug text-stone-800 sm:text-3xl">{{ todo }}</span>
        </li>
      </ol>

      <!-- Extra markdown text from the admin panel (optional) -->
      <div
        v-if="current.content"
        class="content mt-4 rounded-2xl bg-white p-4 text-lg text-stone-800 shadow-sm"
        v-html="renderContent(current.content)"
      />
    </div>

    <!-- Training buttons -->
    <footer class="shrink-0 pt-3">
      <div class="flex items-center gap-2 rounded-[2rem] bg-white p-2.5 shadow-xl">
        <button
          type="button"
          aria-label="Föregående övning"
          class="flex size-18 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-800 transition enabled:hover:bg-stone-200 enabled:active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
          @click="decrease"
          :disabled="completedWorkouts <= 0"
        >
          <svg
            class="size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <button
          v-if="isTimed"
          type="button"
          class="size-18 flex-1 rounded-full text-xl font-bold shadow-lg transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
          :class="timerButtonClass"
          @click="toggleTimer"
        >
          {{ timerButtonText }}
        </button>
        <button
          v-else
          type="button"
          class="size-18 flex-1 rounded-full bg-green-700 text-3xl font-bold text-white shadow-lg shadow-green-700/40 transition hover:bg-green-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
          @click="increase"
        >
          {{ isLast ? 'Klart!' : 'Klar' }}
        </button>

        <button
          type="button"
          aria-label="Nästa övning"
          class="flex size-18 shrink-0 items-center justify-center rounded-full bg-green-700 text-white transition enabled:hover:bg-green-600 enabled:active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
          @click="increase"
          :disabled="isLast"
        >
          <svg
            class="size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </footer>

    <!-- Video fullscreen -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="videoOpen"
        class="fixed inset-0 z-50 flex flex-col bg-black"
        role="dialog"
        aria-modal="true"
        aria-label="Video"
      >
        <div class="shrink-0 bg-orange-50 px-4 py-3">
          <div class="flex items-center justify-between gap-3">
            <p class="truncate text-xl font-bold text-stone-900">{{ current.title }}</p>
            <button
              type="button"
              class="shrink-0 rounded-full bg-white px-5 py-2 text-lg font-bold text-stone-800 shadow-md ring-1 ring-stone-900/10 transition hover:bg-orange-100 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
              @click="closeVideo"
            >
              Stäng ✕
            </button>
          </div>

          <!-- Goal above the video -->
          <div class="mt-3 flex w-full items-center justify-between gap-3">
            <div
              v-if="isTimed"
              class="flex shrink-0 items-baseline gap-2 rounded-full bg-white px-5 py-2 shadow-md ring-1 ring-stone-900/5"
            >
              <span
                class="text-2xl font-bold tabular-nums leading-none"
                :class="timerState === 'done' ? 'text-green-700' : 'text-stone-900'"
              >
                {{ timeText }}
              </span>
              <p class="text-sm font-bold uppercase tracking-wide text-stone-500">Sek..</p>

              <button
                v-if="timerState === 'paused'"
                type="button"
                class="text-sm font-semibold text-orange-800 underline underline-offset-4"
                @click="resetTimer"
              >
                Nollställ
              </button>
            </div>

            <div
              v-else-if="current.reps"
              class="flex shrink-0 items-baseline gap-2 rounded-full bg-white px-6 py-2 shadow-md ring-1 ring-stone-900/5"
            >
              <p class="text-2xl font-bold tabular-nums leading-none text-stone-900">
                {{ current.reps }}
              </p>
              <p class="text-sm font-bold uppercase tracking-wide text-stone-500">
                {{ repsLabel }}
              </p>
            </div>
            <div v-else />

            <button
              v-if="isTimed"
              type="button"
              class="h-12 min-w-0 shrink-0 rounded-full px-5 text-lg font-bold shadow-md transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
              :class="timerButtonClass"
              @click="toggleTimer"
            >
              {{ timerButtonText }}
            </button>
            <button
              v-else
              type="button"
              class="h-12 shrink-0 rounded-full bg-green-700 px-5 text-lg font-bold text-white shadow-md transition hover:bg-green-600 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
              @click="(closeVideo(), increase())"
            >
              {{ isLast ? 'Klart!' : 'Klar' }}
            </button>
          </div>
        </div>

        <!-- YouTube / Vimeo -->
        <iframe
          v-if="embedUrl"
          :src="embedUrl"
          class="min-h-0 w-full flex-1 border-0 bg-black"
          allow="autoplay; encrypted-media; fullscreen"
          allowfullscreen
        />
        <!-- Direct video file -->
        <video
          v-else
          ref="modalVideoEl"
          :src="videoUrl"
          playsinline
          muted
          loop
          controls
          class="min-h-0 w-full flex-1 bg-black object-contain"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.content :deep(h1) { font-size: 1.75rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.content :deep(h2) { font-size: 1.4rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.content :deep(h3) { font-size: 1.15rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
.content :deep(p) { margin: 0.5rem 0; }
.content :deep(ul) { list-style: disc; padding-left: 1.5rem; }
.content :deep(ol) { list-style: decimal; padding-left: 1.5rem; }
.content :deep(img) { max-width: 100%; border-radius: 0.75rem; }
</style>