<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <header>
      <div class="logo">
        <img src="../assets/logo.svg" alt="Logo" />
        <h1>Boîte à Outils</h1>
      </div>
      <nav>
        <router-link v-for="route in mainRoutes" :key="route.path" :to="route.path">
          {{ route.name }}
        </router-link>
      </nav>
      <button class="theme-toggle" @click="toggleDarkMode" :aria-label="isDarkMode ? 'Mode clair' : 'Mode sombre'">
        {{ isDarkMode ? '☀️' : '🌙' }}
      </button>
    </header>
    
    <main>
      <slot></slot>
    </main>

    <footer>
      <p>© {{ currentYear }} - Outils utiles</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDarkMode = inject('isDarkMode')

// Obtenir l'année actuelle pour le footer
const currentYear = new Date().getFullYear()

// Extraire les routes principales pour la navigation
const mainRoutes = computed(() => {
  return router.options.routes.filter(route => !route.meta?.hideInNav)
})

// Basculer entre mode clair et sombre
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
}
</script>

<style scoped>
header {
  background-color: var(--primary-color);
  color: var(--text-light);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo img {
  height: 2.5rem;
}

nav {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
  flex-grow: 1;
  padding: 0.5rem 2rem;
}

nav a {
  color: var(--text-light);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s, transform 0.2s;
}

nav a:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

nav a.router-link-active {
  font-weight: bold;
  background-color: var(--primary-dark);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.theme-toggle:hover {
  background-color: var(--primary-dark);
}

main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 12rem);
}

footer {
  text-align: center;
  padding: 1rem;
  background-color: var(--bg-secondary);
  color: var(--text-muted);
  margin-top: 2rem;
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    gap: 1rem;
  }
  
  nav {
    width: 100%;
    justify-content: center;
    padding: 0.5rem 0;
  }
  
  .theme-toggle {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
}
</style>