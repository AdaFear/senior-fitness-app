<script setup>
import MobileNav from '../components/MobileNav.vue'
import DesktopNav from '../components/DesktopNav.vue'

import { RouterView } from 'vue-router'
import { ref } from 'vue'

const deviceType = ref(2)
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

const handleLogOut = async () => {
  await auth.signOut()
  router.push('/')
}
</script>

<template>
  <DesktopNav v-if="deviceType == 2"></DesktopNav>
  <div class="mobile-view" v-else>
    <MobileNav></MobileNav>
    <button
      class="top-1.5 right-1.5 fixed bg-blue-500 rounded-4xl p-4 transition duration-300 hover:bg-blue-600 cursor-pointer"
      @click="handleLogOut"
    >
      <font-awesome-icon icon="fa-solid fa-right-from-bracket" size="xl" fixed-width />
      <span class="mobile-nav-item-label">Logga ut</span>
    </button>
  </div>
  <RouterView></RouterView>
</template>

<style scoped></style>
