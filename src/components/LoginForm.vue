<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { reactive } from 'vue'

const auth = useAuthStore()

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  try {
    const { error } = await auth.signIn(form.email, form.password)
    router.push('/app/home')
    if (error) {
      alert(error.message)
    }
  } catch (error) {
    alert(error.message)
  }
  console.log(auth.user)
}

const handleRegister = async () => {
  try {
    const { error } = await auth.signUp(form.email, form.password)
    router.push('/app/home')
    if (error) {
      alert(error.message)
    }
  } catch (error) {
    alert(error.message)
  }
  console.log(auth.user)
}
</script>

<template>
  <div class="w-full max-w-xs m-auto">
    <form @submit.prevent class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email"> Email </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="email"
          placeholder="Email"
          v-model="form.email"
        />
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="Lösenord"> Lösenord </label>
        <input
          class="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          id="password"
          type="password"
          placeholder="******************"
          v-model="form.password"
        />
        <p class="text-red-500 text-xs italic">Lösenordet måste vara minst 8 tecken långt.</p>
      </div>
      <a
        class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
        href="#"
      >
        Forgot Password?
      </a>
      <div class="flex items-center justify-between">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          @click="handleLogin"
        >
          Sign In
        </button>
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          @click="handleRegister"
        >
          Sign Up
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
