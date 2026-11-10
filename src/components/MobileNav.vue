<script setup>
import MobileNavItem from './MobileNavItem.vue'
</script>

<template>
  <nav
    class="mobile-nav w-full justify-around bg-white items-center flex fixed box-border bottom-0 gap-8 p-2 border-gray-300 border-t-2"
  >
    <MobileNavItem :icon="'fa-home'" :title="'Hem'" :name="'home'"></MobileNavItem>
    <MobileNavItem :icon="'fa-dumbbell'" :title="'Program'" :name="'programs'"></MobileNavItem>
    <MobileNavItem :icon="'fa-user'" :title="'Profil'" :name="'profile'"></MobileNavItem>
  </nav>
</template>

<style scoped></style>
