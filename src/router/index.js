import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'
import store from '../store'

// Importer les vues
import Dashboard from '@/views/Dashboard.vue'
import MarkdownPreviewer from '@/views/MarkdownPreviewer.vue'
import QrCodeGenerator from '@/views/QrCodeGenerator.vue'
import Converter from '@/views/Converter.vue'
import Calculator from '@/views/Calculator.vue'
import Settings from '@/views/Settings.vue'
import LinkBoard from '@/views/LinkBoard.vue'  // Nouvelle importation
import NotFound from '@/views/NotFound.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

const routes = [
  // Routes publiques
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  
  // Routes protégées
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/markdown',
    name: 'MarkdownPreviewer',
    component: MarkdownPreviewer,
    meta: { requiresAuth: true }
  },
  {
    path: '/qrcode',
    name: 'QrCodeGenerator',
    component: QrCodeGenerator,
    meta: { requiresAuth: true }
  },
  {
    path: '/converter',
    name: 'Converter',
    component: Converter,
    meta: { requiresAuth: true }
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: Calculator,
    meta: { requiresAuth: true }
  },
  {
    path: '/links',  // Nouvelle route
    name: 'LinkBoard',
    component: LinkBoard,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  
  // Route 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const isLoggedIn = store.getters.isLoggedIn

  // Attendre que l'état d'authentification soit prêt
  if (!store.state.authIsReady) {
    const unsubscribe = auth.onAuthStateChanged(user => {
      store.commit('setUser', user)
      store.commit('setAuthIsReady', true)
      unsubscribe()
      
      checkAuth()
    })
  } else {
    checkAuth()
  }

  function checkAuth() {
    if (requiresAuth && !isLoggedIn) {
      next('/login')
    } else if (requiresGuest && isLoggedIn) {
      next('/')
    } else {
      next()
    }
  }
})

export default router