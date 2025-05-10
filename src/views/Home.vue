<template>
  <div class="home-container">
    <div class="hero">
      <img src="../assets/logo.svg" alt="Logo" class="hero-logo" />
      <h1>Boîte à Outils Web</h1>
      <p class="hero-subtitle">Une collection d'outils pratiques pour vos tâches quotidiennes</p>
    </div>

    <div class="tools-grid">
      <router-link v-for="tool in tools" :key="tool.path" :to="tool.path" class="tool-card">
        <div class="tool-icon">{{ tool.icon }}</div>
        <h3>{{ tool.name }}</h3>
        <p>{{ tool.description }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Préparation des données des outils
const tools = ref([
  {
    name: 'Générateur de QR Code',
    path: '/qr-code',
    icon: '📱',
    description: 'Créez facilement des QR codes personnalisés'
  },
  {
    name: 'Formateur JSON',
    path: '/json-formatter',
    icon: '📋',
    description: 'Formatez et validez votre code JSON'
  },
  {
    name: 'Convertisseur de casse',
    path: '/text-case',
    icon: 'Aa',
    description: 'Transformez votre texte en majuscules, minuscules et autres formats'
  },
  {
    name: 'Prévisualiseur Markdown',
    path: '/markdown',
    icon: '📝',
    description: 'Rédigez et prévisualisez votre contenu Markdown'
  },
  {
    name: 'Image en Base64',
    path: '/image-base64',
    icon: '🖼️',
    description: 'Convertissez vos images en code Base64'
  }
])
</script>

<style scoped>
.home-container {
  padding: 2rem 1rem;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-logo {
  width: 100px;
  height: auto;
  margin-bottom: 1rem;
  animation: pulse 2s infinite alternate;
}

.hero-subtitle {
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  font-size: 1.25rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.tool-card {
  display: block;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  background-color: var(--bg-tertiary);
}

.tool-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.tool-card h3 {
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.tool-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@keyframes pulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);
  }
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>