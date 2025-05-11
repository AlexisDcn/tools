<template>
  <div v-if="store.state.authIsReady">
    <!-- Interface authentifiée -->
    <div v-if="isLoggedIn" class="app-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <aside class="sidebar">
        <div class="sidebar-header">
          <i class="fas fa-tools logo-icon"></i>
          <h1 class="app-title">Tools</h1>
          <button class="toggle-sidebar" @click="toggleSidebar" aria-label="Toggle Sidebar">
            <i :class="sidebarCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left'"></i>
          </button>
        </div>
        
        <nav class="sidebar-nav">
          <router-link v-for="tool in tools" :key="tool.path" :to="tool.path" class="nav-link">
            <i :class="tool.icon"></i>
            <span class="nav-text">{{ tool.name }}</span>
          </router-link>
        </nav>
        
        <div class="sidebar-footer">
          <button class="theme-toggle" @click="toggleTheme">
            <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
            <span class="nav-text">{{ isDarkMode ? 'Mode clair' : 'Mode sombre' }}</span>
          </button>
          
          <div class="user-profile">
            <i class="fas fa-user-circle avatar-icon"></i>
            <div class="user-info">
              <span class="username">{{ userEmail }}</span>
              <button class="logout-btn" @click="logout">
                <i class="fas fa-sign-out-alt"></i> Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      <main class="main-content">
        <header class="top-bar">
          <div class="page-title">
            <h2>{{ currentPageTitle }}</h2>
          </div>
          
          <div class="top-actions">
            <router-link to="/settings" class="action-btn" title="Paramètres">
              <i class="fas fa-cog"></i>
            </router-link>
            <button class="action-btn notification-btn" @click="toggleNotifications" title="Notifications">
              <i class="fas fa-bell"></i>
              <span class="notification-badge" v-if="notificationCount">{{ notificationCount }}</span>
            </button>
          </div>
        </header>
        
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
      
      <!-- Menu de notifications -->
      <div v-if="notificationsOpen" class="notifications-menu">
        <div class="notifications-header">
          <h3>Notifications</h3>
          <button @click="toggleNotifications" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="notifications-list">
          <div v-if="notifications.length === 0" class="empty-notification">
            <i class="fas fa-bell-slash"></i>
            <p>Aucune notification</p>
          </div>
          <div v-else v-for="(notification, index) in notifications" :key="index" class="notification-item">
            <div class="notification-icon" :class="notification.type">
              <i :class="getNotificationIcon(notification.type)"></i>
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ notification.time }}</div>
            </div>
            <button @click="dismissNotification(index)" class="notification-dismiss">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="notifications-footer">
          <button @click="clearAllNotifications" class="clear-all-btn">
            Effacer tout
          </button>
        </div>
      </div>
      
      <!-- Overlay pour fermer le menu des notifications en cliquant à l'extérieur -->
      <div v-if="notificationsOpen" class="overlay" @click="toggleNotifications"></div>
    </div>
    
    <!-- Interface non authentifiée -->
    <div v-else class="auth-layout">
      <router-view />
    </div>
  </div>
  
  <!-- Écran de chargement -->
  <div v-else class="loading-screen">
    <div class="loader"></div>
    <p>Chargement...</p>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const sidebarCollapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true')
    const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')
    const notificationsOpen = ref(false)
    const notifications = ref([
      {
        type: 'info',
        title: 'Bienvenue',
        message: 'Bienvenue sur Tools, votre boîte à outils en ligne !',
        time: 'Aujourd\'hui'
      },
      {
        type: 'success',
        title: 'Connexion réussie',
        message: 'Vous êtes maintenant connecté à votre compte.',
        time: 'Aujourd\'hui'
      }
    ])
    
// Seule la partie script change, où on modifie la liste des outils :

const tools = [
  { name: 'Dashboard', path: '/', icon: 'fas fa-home' },
  { name: 'Liens', path: '/links', icon: 'fas fa-link' }, // Nouveau lien
  { name: 'Markdown', path: '/markdown', icon: 'fas fa-file-alt' },
  { name: 'QR Code', path: '/qrcode', icon: 'fas fa-qrcode' },
  { name: 'Convertisseur', path: '/converter', icon: 'fas fa-exchange-alt' },
  { name: 'Calculatrice', path: '/calculator', icon: 'fas fa-calculator' },
  { name: 'Paramètres', path: '/settings', icon: 'fas fa-cogs' }
]
    
    const currentPageTitle = computed(() => {
      const currentTool = tools.find(tool => tool.path === route.path)
      return currentTool ? currentTool.name : 'Dashboard'
    })
    
    const isLoggedIn = computed(() => store.getters.isLoggedIn)
    const userEmail = computed(() => store.state.user?.email || 'Utilisateur')
    const notificationCount = computed(() => notifications.value.length)
    
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
      localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
    }
    
    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      localStorage.setItem('darkMode', isDarkMode.value.toString())
      applyTheme()
      
      // Émettre un événement personnalisé pour synchroniser avec Settings.vue
      window.dispatchEvent(new CustomEvent('theme-changed', {
        detail: { isDarkMode: isDarkMode.value }
      }))
    }
    
    const applyTheme = () => {
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
    }
    
    const toggleNotifications = () => {
      notificationsOpen.value = !notificationsOpen.value
    }
    
    const dismissNotification = (index) => {
      notifications.value.splice(index, 1)
    }
    
    const clearAllNotifications = () => {
      notifications.value = []
      notificationsOpen.value = false
    }
    
    const getNotificationIcon = (type) => {
      switch (type) {
        case 'info': return 'fas fa-info-circle'
        case 'success': return 'fas fa-check-circle'
        case 'warning': return 'fas fa-exclamation-triangle'
        case 'error': return 'fas fa-times-circle'
        default: return 'fas fa-bell'
      }
    }
    
    const logout = async () => {
      try {
        await store.dispatch('logout')
        router.push('/login')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    }
    
    onMounted(() => {
      applyTheme()
      
      if (localStorage.getItem('darkMode') === null) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        isDarkMode.value = prefersDark
        localStorage.setItem('darkMode', prefersDark.toString())
        applyTheme()
      }
      
      // Appliquer le thème de couleur sauvegardé
      const colorTheme = localStorage.getItem('colorTheme')
      if (colorTheme) {
        const themeColors = {
          'blue': { primary: '#4361ee', secondary: '#3f37c9' },
          'purple': { primary: '#8b5cf6', secondary: '#7c3aed' },
          'green': { primary: '#10b981', secondary: '#059669' },
          'red': { primary: '#ef4444', secondary: '#dc2626' },
          'orange': { primary: '#f59e0b', secondary: '#d97706' }
        }
        
        if (themeColors[colorTheme]) {
          document.documentElement.style.setProperty('--primary-color', themeColors[colorTheme].primary)
          document.documentElement.style.setProperty('--secondary-color', themeColors[colorTheme].secondary)
        }
      }
      
      // Appliquer la taille de police
      const fontSize = localStorage.getItem('fontSize')
      if (fontSize) {
        document.documentElement.style.fontSize = `${fontSize}%`
      }
      
      // Écouter les changements de thème depuis Settings.vue
      window.addEventListener('theme-changed', (event) => {
        if (event.detail && typeof event.detail.isDarkMode === 'boolean') {
          isDarkMode.value = event.detail.isDarkMode
        }
      })
    })
    
    watch(isDarkMode, () => {
      applyTheme()
    })
    
    return {
      store,
      sidebarCollapsed,
      isDarkMode,
      tools,
      userEmail,
      currentPageTitle,
      isLoggedIn,
      notifications,
      notificationCount,
      notificationsOpen,
      toggleSidebar,
      toggleTheme,
      logout,
      toggleNotifications,
      dismissNotification,
      clearAllNotifications,
      getNotificationIcon
    }
  }
}
</script>

<style>
:root {
  /* Palette de couleurs */
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --accent-color: #4cc9f0;
  --success-color: #4ade80;
  --warning-color: #fbbf24;
  --danger-color: #f87171;
  --light-bg: #f8fafc;
  --light-surface: #ffffff;
  --light-border: #e2e8f0;
  --light-text: #334155;
  --light-text-secondary: #64748b;
  --dark-bg: #0f172a;
  --dark-surface: #1e293b;
  --dark-border: #334155;
  --dark-text: #f1f5f9;
  --dark-text-secondary: #94a3b8;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  background-color: var(--light-bg);
  color: var(--light-text);
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.dark-mode body {
  background-color: var(--dark-bg);
  color: var(--dark-text);
}

.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.sidebar {
  width: 260px;
  height: 100%;
  background-color: var(--light-surface);
  border-right: 1px solid var(--light-border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.dark-mode .sidebar {
  background-color: var(--dark-surface);
  border-right-color: var(--dark-border);
}

.sidebar-collapsed .sidebar {
  width: 80px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--light-border);
}

.dark-mode .sidebar-header {
  border-bottom-color: var(--dark-border);
}

/* Style pour l'icône de logo */
.logo-icon {
  font-size: 24px;
  width: 32px;
  height: 32px;
  margin-right: 12px;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  transition: opacity 0.3s ease;
}

.sidebar-collapsed .app-title {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.toggle-sidebar {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--light-text-secondary);
  transition: background-color 0.2s ease;
}

.dark-mode .toggle-sidebar {
  color: var(--dark-text-secondary);
}

.toggle-sidebar:hover {
  background-color: var(--light-border);
}

.dark-mode .toggle-sidebar:hover {
  background-color: var(--dark-border);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: var(--light-text);
  text-decoration: none;
  transition: background-color 0.2s ease;
  border-radius: 6px;
  margin: 4px 10px;
}

.dark-mode .nav-link {
  color: var(--dark-text);
}

.nav-link i {
  font-size: 18px;
  width: 24px;
  margin-right: 12px;
  text-align: center;
  color: var(--light-text-secondary);
  transition: color 0.2s ease;
}

.dark-mode .nav-link i {
  color: var(--dark-text-secondary);
}

.nav-link.router-link-active {
  background-color: rgba(67, 97, 238, 0.1);
  color: var(--primary-color);
}

.nav-link.router-link-active i {
  color: var(--primary-color);
}

.nav-link:hover {
  background-color: var(--light-border);
}

.dark-mode .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-collapsed .nav-text {
  display: none;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--light-border);
}

.dark-mode .sidebar-footer {
  border-top-color: var(--dark-border);
}

.theme-toggle {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--light-text);
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 20px;
}

.dark-mode .theme-toggle {
  color: var(--dark-text);
}

.theme-toggle:hover {
  background-color: var(--light-border);
}

.dark-mode .theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.theme-toggle i {
  font-size: 18px;
  width: 24px;
  margin-right: 12px;
  text-align: center;
}

.sidebar-collapsed .theme-toggle .nav-text {
  display: none;
}

.user-profile {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.user-profile:hover {
  background-color: var(--light-border);
}

.dark-mode .user-profile:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Style pour l'icône d'avatar */
.avatar-icon {
  font-size: 28px;
  width: 36px;
  height: 36px;
  margin-right: 12px;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  flex: 1;
  transition: opacity 0.3s ease;
}

.sidebar-collapsed .user-info {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.username {
  display: block;
  font-weight: 600;
  font-size: 14px;
}

.user-role {
  display: block;
  font-size: 12px;
  color: var(--light-text-secondary);
}

.dark-mode .user-role {
  color: var(--dark-text-secondary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--light-bg);
}

.dark-mode .main-content {
  background-color: var(--dark-bg);
}

.top-bar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: var(--light-surface);
  border-bottom: 1px solid var(--light-border);
}

.dark-mode .top-bar {
  background-color: var(--dark-surface);
  border-bottom-color: var(--dark-border);
}

.page-title h2 {
  font-size: 18px;
  font-weight: 600;
}

.top-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--light-text-secondary);
  position: relative;
  transition: background-color 0.2s ease;
}

.dark-mode .action-btn {
  color: var(--dark-text-secondary);
}

.action-btn:hover {
  background-color: var(--light-border);
}

.dark-mode .action-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: var(--danger-color);
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Styles pour l'authentification */
.auth-layout {
  min-height: 100vh;
  background-color: var(--light-bg);
}

.dark-mode .auth-layout {
  background-color: var(--dark-bg);
}

.loading-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--light-bg);
}

.dark-mode .loading-screen {
  background-color: var(--dark-bg);
  color: var(--dark-text);
}

.loader {
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 5px solid var(--primary-color);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.logout-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--light-text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dark-mode .logout-btn {
  color: var(--dark-text-secondary);
}

.logout-btn:hover {
  color: var(--primary-color);
}

/* Styles pour le menu de notifications */
.notifications-menu {
  position: fixed;
  top: 64px;
  right: 0;
  width: 320px;
  max-height: calc(100vh - 64px);
  background-color: var(--light-surface);
  border-left: 1px solid var(--light-border);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

.dark-mode .notifications-menu {
  background-color: var(--dark-surface);
  border-left-color: var(--dark-border);
}

.notifications-header {
  padding: 1rem;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark-mode .notifications-header {
  border-bottom-color: var(--dark-border);
}

.notifications-header h3 {
  margin: 0;
  font-size: 1rem;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--light-text-secondary);
}

.dark-mode .close-btn {
  color: var(--dark-text-secondary);
}

.notifications-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.notification-item {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid var(--light-border);
  position: relative;
}

.dark-mode .notification-item {
  border-bottom-color: var(--dark-border);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.notification-icon.info {
  background-color: #3b82f6;
  color: white;
}

.notification-icon.success {
  background-color: #10b981;
  color: white;
}

.notification-icon.warning {
  background-color: #f59e0b;
  color: white;
}

.notification-icon.error {
  background-color: #ef4444;
  color: white;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.875rem;
  color: var(--light-text-secondary);
  margin-bottom: 0.5rem;
}

.dark-mode .notification-message {
  color: var(--dark-text-secondary);
}

.notification-time {
  font-size: 0.75rem;
  color: var(--light-text-secondary);
}

.dark-mode .notification-time {
  color: var(--dark-text-secondary);
}

.notification-dismiss {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 0.75rem;
  color: var(--light-text-secondary);
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

.dark-mode .notification-dismiss {
  color: var(--dark-text-secondary);
}

.notification-item:hover .notification-dismiss {
  opacity: 1;
}

.empty-notification {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--light-text-secondary);
  text-align: center;
}

.dark-mode .empty-notification {
  color: var(--dark-text-secondary);
}

.empty-notification i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.notifications-footer {
  padding: 1rem;
  border-top: 1px solid var(--light-border);
  display: flex;
  justify-content: center;
}

.dark-mode .notifications-footer {
  border-top-color: var(--dark-border);
}

.clear-all-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-weight: 500;
}

.clear-all-btn:hover {
  text-decoration: underline;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 100;
    transform: translateX(-100%);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar-collapsed .sidebar {
    transform: translateX(0);
    width: 260px;
  }
  
  .sidebar-collapsed .app-title,
  .sidebar-collapsed .nav-text,
  .sidebar-collapsed .user-info {
    opacity: 1;
    width: auto;
    display: block;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .notifications-menu {
    width: 100%;
    top: 0;
    height: 100vh;
    max-height: 100vh;
  }
}
</style>