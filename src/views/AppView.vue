<script setup>
import MobileNav from '../components/MobileNav.vue'
import DesktopNav from '../components/DesktopNav.vue'

import { RouterView } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div
    class="hidden md:flex desktop-view box-border items-start bg-orange-50 px-5 lg:px-30 py-10 gap-2"
  >
    <DesktopNav class="sticky top-10 self-start"></DesktopNav>
    <main class="w-full rounded-4xl min-h-screen flex justify-center">
      <RouterView></RouterView>
    </main>
  </div>
  <div class="mobile-view md:hidden">
    <MobileNav></MobileNav>
    <main class="bg-orange-50 min-h-screen w-full py-10 px-10 mb-[80px]">
      <RouterView></RouterView>
    </main>
  </div>
  <p v-if="!auth.ready">Waiting</p>
</template>

<style scoped></style>
