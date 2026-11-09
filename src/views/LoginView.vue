<script setup>
import LoginForm from '../components/LoginForm.vue'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

onMounted(() => {
  const router = useRouter()
  const auth = useAuthStore()

  if (auth.user) {
    router.push('/app/home')
  }
})
</script>

<template>
  <div class="login-view min-h-screen flex justify-center align-middle">
    <LoginForm></LoginForm>
  </div>
</template>

<style scoped></style>
