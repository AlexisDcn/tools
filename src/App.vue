<template>
  <DefaultLayout>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </DefaultLayout>
</template>

<script setup>
import { provide } from 'vue'
import { useLocalStorage } from './composables/useLocalStorage'
import DefaultLayout from './layouts/DefaultLayout.vue'

// Gestion du thème
const { value: isDarkMode } = useLocalStorage('darkMode', 
  window.matchMedia('(prefers-color-scheme: dark)').matches)

provide('isDarkMode', isDarkMode)
</script>

<style>
@import './assets/styles/variables.css';
@import './assets/styles/main.css';

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>