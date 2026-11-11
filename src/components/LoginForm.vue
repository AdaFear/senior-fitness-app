<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const info = ref('')

const passwordTooShort = computed(() => password.value.length > 0 && password.value.length < 8)

async function signIn() {
  error.value = ''
  info.value = ''
  loading.value = true
  const { error: err } = await auth.signIn(email.value, password.value)
  loading.value = false
  if (err) {
    error.value = 'Fel email eller lösenord.'
    return
  }
  router.push('/app/home')
}

async function signUp() {
  error.value = ''
  info.value = ''
  if (passwordTooShort.value || !email.value) {
    error.value = 'Fyll i email och ett lösenord på minst 8 tecken.'
    return
  }
  loading.value = true
  const { data, error: err } = await auth.signUp(email.value, password.value)
  loading.value = false
  if (err) {
    error.value = err.message
    return
  }
  if (data.session) {
    router.push('/app/home')
  } else {
    info.value = 'Konto skapat! Kolla din email och bekräfta den innan du loggar in.'
  }
}

// GUEST: remove this function
async function guestLogin() {
  loading.value = true
  const { error: err } = await auth.signInGuest()
  loading.value = false
  if (err) {
    error.value = 'Gästinloggning misslyckades: ' + err.message
    return
  }
  router.push('/app/home')
}
</script>

<template>
  <div class="w-full max-w-xs m-auto">
    <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" @submit.prevent="signIn">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          placeholder="Email"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Lösenord</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          placeholder="******************"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          :class="{ 'border-red-500': passwordTooShort }"
        />
        <p v-if="passwordTooShort" class="text-red-500 text-xs italic">
          Lösenordet måste vara minst 8 tecken långt.
        </p>
      </div>

      <p v-if="error" class="text-red-500 text-sm mb-3">{{ error }}</p>
      <p v-if="info" class="text-green-600 text-sm mb-3">{{ info }}</p>

      <div class="flex items-center justify-between">
        <button
          type="submit"
          :disabled="loading"
          class="bg-blue-500 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
        >
          Sign In
        </button>
        <button
          type="button"
          :disabled="loading"
          @click="signUp"
          class="bg-blue-500 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
        >
          Sign Up
        </button>
      </div>

      <!-- GUEST: remove this button -->
      <button
        type="button"
        :disabled="loading"
        @click="guestLogin"
        class="mt-4 w-full border border-gray-400 text-gray-700 py-2 rounded hover:bg-gray-100"
      >
        Fortsätt som gäst
      </button>
    </form>
  </div>
</template>