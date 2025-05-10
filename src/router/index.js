// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  { 
    path: '/', 
    name: 'Accueil', 
    component: Home,
    meta: {
      title: 'Accueil'
    }
  },
  { 
    path: '/qr-code', 
    name: 'QR Code', 
    component: () => import('../views/QrCodeGenerator.vue'),
    meta: {
      title: 'Générateur de QR Code'
    }
  },
  { 
    path: '/json-formatter', 
    name: 'JSON', 
    component: () => import('../views/JsonFormatter.vue'),
    meta: {
      title: 'Formateur JSON'
    }
  },
  { 
    path: '/text-case', 
    name: 'Texte', 
    component: () => import('../views/TextCaseConverter.vue'),
    meta: {
      title: 'Convertisseur de casse'
    }
  },
  { 
    path: '/markdown', 
    name: 'Markdown', 
    component: () => import('../views/MarkdownPreviewer.vue'),
    meta: {
      title: 'Prévisualiseur Markdown'
    }
  },
  { 
    path: '/image-base64', 
    name: 'Image', 
    component: () => import('../views/ImageToBase64.vue'),
    meta: {
      title: 'Image en Base64'
    }
  },
  // Route pour les pages non trouvées
  { 
    path: '/:pathMatch(.*)*', 
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: 'Page non trouvée',
      hideInNav: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Mise à jour du titre de la page
router.beforeEach((to, from, next) => {
  document.title = to.meta.title 
    ? `${to.meta.title} | Boîte à Outils` 
    : 'Boîte à Outils'
  next()
})

export default router