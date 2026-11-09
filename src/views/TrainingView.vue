<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import TrainingWorkoutAmountPill from '@/components/TrainingWorkoutAmountPill.vue'

// [name, steps, goal, extra]
// goal: { type: 'time', seconds, autostart? } or { type: 'reps', reps, perSide? }
const Trainings = [
  [
    'Sittande knästräck',
    ['Sträck ett knä och sänk långsamt.', 'Håll låret mot sitsen och ryggen upprätt.'],
    { type: 'reps', reps: '8–12', perSide: true },
    {
      id: 'SI01',
      category: 'Sittande styrka',
      easier: 'Kortare rörelse',
      harder: 'Lätt fotledsvikt',
    },
  ],

  [
    'Sittande hällyft',
    ['Lyft hälarna medan tårna är kvar i golvet.', 'Pressa jämnt genom framfoten.'],
    { type: 'reps', reps: '10–15' },
    {
      id: 'SI02',
      category: 'Sittande styrka',
      easier: 'En fot i taget',
      harder: 'Fler repetitioner',
    },
  ],

  [
    'Sittande tålyft',
    ['Lyft framfötterna med hälarna i golvet.', 'Låt inte knäna falla in.'],
    { type: 'reps', reps: '10–15' },
    { id: 'SI03', category: 'Sittande styrka', easier: 'Mindre lyft', harder: 'Långsammare tempo' },
  ],

  [
    'Sittande marsch',
    ['Lyft växelvis ett knä.', 'Sitt stabilt utan att gunga bakåt.'],
    { type: 'time', seconds: 30 },
    {
      id: 'SI04',
      category: 'Sittande styrka',
      easier: 'Lägre knälyft',
      harder: 'Längre arbetsintervall',
    },
  ],

  [
    'Sittande ben ut åt sidan',
    ['För knät lätt utåt och tillbaka.', 'Bäcken och överkropp är stilla.'],
    { type: 'reps', reps: '8–12', perSide: true },
    {
      id: 'SI05',
      category: 'Sittande styrka',
      easier: 'Mindre rörelse',
      harder: 'Lätt band ovanför knäna',
    },
  ],

  [
    'Sittande bicepscurl',
    ['Böj armbågarna och sänk kontrollerat.', 'Håll armbågarna nära kroppen.'],
    { type: 'reps', reps: '8–12' },
    { id: 'SI06', category: 'Sittande styrka', easier: 'Utan vikt', harder: 'Lätta hantlar' },
  ],

  [
    'Sittande skulderbladsdrag',
    ['För skulderbladen lätt bakåt och släpp.', 'Höj inte axlarna mot öronen.'],
    { type: 'reps', reps: '8–12' },
    {
      id: 'SI07',
      category: 'Sittande styrka',
      easier: 'Mindre rörelse',
      harder: 'Lätt träningsband',
    },
  ],

  [
    'Sittande bröstpress med band',
    ['Pressa händerna framåt och återgå.', 'Arbeta i smärtfri axelbana.'],
    { type: 'reps', reps: '8–12' },
    { id: 'SI08', category: 'Sittande styrka', easier: 'Utan band', harder: 'Något fastare band' },
  ],

  [
    'Uppresning från stol',
    [
      'Res dig upp från stabil stol och sätt dig kontrollerat.',
      'Fötter i golvet, stå stadigt före nästa repetition.',
    ],
    { type: 'reps', reps: '6–12' },
    {
      id: 'ST01',
      category: 'Stående styrka',
      easier: 'Använd armstöd/högre sits',
      harder: 'Lägre stol eller lätt vikt',
    },
  ],

  [
    'Knäböj till stol',
    ['Böj höft och knän mot stolen; res dig igen.', 'Ha stolen bakom som säkerhetsstopp.'],
    { type: 'reps', reps: '6–12' },
    {
      id: 'ST02',
      category: 'Stående styrka',
      easier: 'Liten böjning med stöd',
      harder: 'Större rörelse inom kontroll',
    },
  ],

  [
    'Armhävning mot vägg',
    ['Böj armbågar mot väggen och pressa tillbaka.', 'Håll kroppen rak och händer i axelhöjd.'],
    { type: 'reps', reps: '8–12' },
    {
      id: 'ST03',
      category: 'Stående styrka',
      easier: 'Stå närmare väggen',
      harder: 'Stå längre bort',
    },
  ],

  [
    'Stående rodd med band',
    ['Dra armbågar bakåt och återgå långsamt.', 'Förankra bandet säkert; axlar sänkta.'],
    { type: 'reps', reps: '8–12' },
    { id: 'ST04', category: 'Stående styrka', easier: 'Lättare band', harder: 'Hårdare band' },
  ],
]

const goal = computed(() => Trainings[completedWorkouts.value][2])
// const extra = computed(() => Trainings[completedWorkouts.value][3])
const isTimed = computed(() => goal.value.type === 'time')
const isLast = computed(() => completedWorkouts.value + 1 >= numberOfWorkouts)
const repsLabel = computed(() => (goal.value.perSide ? 'gånger per sida' : 'gånger'))

const numberOfWorkouts = Trainings.length
const completedWorkouts = ref(0)

const increase = () => {
  if (completedWorkouts.value + 1 < numberOfWorkouts) {
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
const exerciseSeconds = computed(() => goal.value.seconds ?? 30)
const timeLeft = ref(exerciseSeconds.value)
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

      if (isLast.value) {
        // showEndScreen()
      } else {
        increase()
        if (isTimed.value) startTimer()
      }
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

const videoLink = 'https://www.w3schools.com/tags/mov_bbb.mp4'

async function openVideo() {
  videoOpen.value = true
  await nextTick()
  modalVideoEl.value?.play().catch(() => {})
}

function closeVideo() {
  modalVideoEl.value?.pause()
  videoOpen.value = false
}

function onKeydown(e) {
  if (e.key === 'Escape' && videoOpen.value) closeVideo()
}

onMounted(() => window.addEventListener('keydown', onKeydown))

onBeforeUnmount(() => {
  stopInterval()
  window.removeEventListener('keydown', onKeydown)
})

const scrollArea = ref(null)

async function scrollToTop() {
  await nextTick()
  scrollArea.value?.scrollTo({ top: 0, behavior: 'smooth' })
}
const router = useRouter()

// function finishWorkout() {
//   stopInterval()
//   router.replace({ name: 'home' })
// }

function exitWorkout() {
  stopInterval()
  router.replace({ name: 'home' })
}
</script>

<template>
  <div
    class="fixed inset-0 flex flex-col bg-linear-to-t from-orange-200 to-white text-white px-5 pt-5 pb-5 sm:px-8 md:px-[5vw] lg:px-[5vw]"
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
          {{ Trainings[completedWorkouts][0] }}
        </h1>
      </div>
    </header>

    <div ref="scrollArea" class="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
      <!-- Video preview card, opens the pop-up -->
      <button
        type="button"
        class="mt-4 flex w-full items-center gap-4 rounded-3xl bg-white p-2.5 text-left shadow-sm transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
        aria-label="Öppna video"
        @click="openVideo"
      >
        <span class="relative block h-16 w-28 shrink-0 overflow-hidden rounded-2xl bg-stone-800">
          <video
            playsinline
            muted
            preload="metadata"
            class="h-full w-full object-cover"
            :src="videoLink + '#t=0.1'"
          ></video>
          <span class="absolute inset-0 flex items-center justify-center bg-stone-900/30">
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
        </span>
        <span class="text-xl font-bold text-stone-900">Se hur du ska göra</span>
      </button>

      <!-- Steps -->
      <div class="mt-6 flex w-full items-center justify-between gap-3 p-1.5 sm:mt-8">
        <h2 class="text-sm font-bold uppercase tracking-[0.15em] text-stone-500">Steg:</h2>

        <!-- Time -->
        <div
          v-if="isTimed"
          class="flex shrink-0 items-baseline gap-2 rounded-full bg-white px-5 py-2 shadow-md ring-1 ring-stone-900/5"
        >
          <span
            class="text-2xl font-bold tabular-nums leading-none text-stone-900"
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
        <!-- Reps: big number + label -->
        <div
          v-else
          class="flex shrink-0 items-baseline gap-2 rounded-full bg-white px-6 py-2 shadow-md"
        >
          <p class="text-2xl font-bold tabular-nums leading-none text-stone-900">{{ goal.reps }}</p>
          <p class="text-sm font-bold uppercase tracking-wide text-stone-500">{{ repsLabel }}</p>
        </div>
      </div>
      <ol class="space-y-2.5">
        <li
          v-for="(todo, i) in Trainings[completedWorkouts][1]"
          :key="todo"
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
    </div>

    <!-- Training buttons -->
    <footer class="shrink-0 pt-3">
      <div
        class="flex items-center gap-3 rounded-[2rem] bg-white p-2.5 shadow-xl ring-1 ring-stone-900/5"
      >
        <button
          type="button"
          aria-label="Föregående övning"
          class="flex size-14 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-800 transition enabled:hover:bg-stone-200 enabled:active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
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
          class="h-14 flex-1 rounded-full text-xl font-bold shadow-lg transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
          :class="timerButtonClass"
          @click="toggleTimer"
        >
          {{ timerButtonText }}
        </button>
        <button
          v-else
          type="button"
          class="h-14 flex-1 rounded-full bg-green-700 text-xl font-bold text-white shadow-lg shadow-green-700/40 transition hover:bg-green-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
          @click="increase"
        >
          {{ isLast ? 'Klart!' : 'Klar' }}
        </button>

        <button
          type="button"
          aria-label="Nästa övning"
          class="flex size-14 shrink-0 items-center justify-center rounded-full bg-green-700 text-white transition enabled:hover:bg-green-600 enabled:active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
          @click="increase"
          :disabled="completedWorkouts + 1 >= numberOfWorkouts"
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
            <p class="truncate text-xl font-bold text-stone-900">
              {{ Trainings[completedWorkouts][0] }}
            </p>
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
              v-else
              class="flex shrink-0 items-baseline gap-2 rounded-full bg-white px-6 py-2 shadow-md ring-1 ring-stone-900/5"
            >
              <p class="text-2xl font-bold tabular-nums leading-none text-stone-900">
                {{ goal.reps }}
              </p>
              <p class="text-sm font-bold uppercase tracking-wide text-stone-500">
                {{ repsLabel }}
              </p>
            </div>

            <!-- Action button -->
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

        <video
          ref="modalVideoEl"
          playsinline
          muted
          loop
          controls
          class="min-h-0 w-full flex-1 bg-black object-contain"
        >
          <source :src="videoLink" type="video/mp4" />
        </video>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
html,
body {
  min-height: 100dvh;
}
</style>
