<template>
  <div class="settings-page">
    <h1>Paramètres</h1>
    
    <div class="settings-section">
      <h2>Apparence</h2>
      <div class="setting-item">
        <div class="setting-label">
          <span class="setting-title">Mode sombre</span>
          <span class="setting-description">Activer le mode sombre pour l'interface</span>
        </div>
        <div class="setting-control">
          <label class="toggle">
            <input type="checkbox" v-model="isDarkMode" @change="toggleDarkMode">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <span class="setting-title">Thème de couleur</span>
          <span class="setting-description">Choisir le thème principal de l'application</span>
        </div>
        <div class="setting-control">
          <div class="color-themes">
            <button 
              v-for="theme in colorThemes" 
              :key="theme.name"
              class="color-theme-btn"
              :class="{ active: activeTheme === theme.name }"
              :style="{ backgroundColor: theme.color }"
              @click="setColorTheme(theme.name)"
            ></button>
          </div>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <span class="setting-title">Taille de la police</span>
          <span class="setting-description">Ajuster la taille du texte dans l'application</span>
        </div>
        <div class="setting-control">
          <div class="font-size-control">
            <button class="font-size-btn" @click="decreaseFontSize">A-</button>
            <span class="font-size-value">{{ fontSize }}%</span>
            <button class="font-size-btn" @click="increaseFontSize">A+</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="settings-section">
      <h2>Général</h2>
      <div class="setting-item">
        <div class="setting-label">
          <span class="setting-title">Langue</span>
          <span class="setting-description">Choisir la langue de l'interface</span>
        </div>
        <div class="setting-control">
          <select v-model="language" class="select-control" @change="saveLanguageSettings">
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <span class="setting-title">Notifications</span>
          <span class="setting-description">Activer les notifications de l'application</span>
        </div>
        <div class="setting-control">
          <label class="toggle">
            <input type="checkbox" v-model="notificationsEnabled" @change="saveNotificationSettings">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-label">
          <span class="setting-title">Sauvegarde automatique</span>
          <span class="setting-description">Sauvegarder automatiquement les données</span>
        </div>
        <div class="setting-control">
          <label class="toggle">
            <input type="checkbox" v-model="autoSave" @change="saveAutoSaveSettings">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
    
    <div class="settings-section">
      <h2>Compte</h2>
      <div class="user-profile-settings">
        <div class="user-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="user-details">
          <h3>{{ userEmail }}</h3>
          <p>Utilisateur</p>
          <p class="user-email">{{ userEmail }}</p>
        </div>
      </div>
      
      <div class="setting-actions">
        <button class="action-btn" @click="changePassword">
          <i class="fas fa-key"></i> Changer le mot de passe
        </button>
        <button class="action-btn" @click="editProfile">
          <i class="fas fa-edit"></i> Modifier le profil
        </button>
        <button class="action-btn danger" @click="logout">
          <i class="fas fa-sign-out-alt"></i> Déconnexion
        </button>
      </div>
    </div>
    
    <div class="settings-section">
      <h2>À propos</h2>
      <div class="about-info">
        <p class="app-info"><strong>Tools</strong> v1.0.0</p>
        <p class="app-description">Une collection d'outils utiles pour vos tâches quotidiennes</p>
        <p class="copyright">© 2024 Alexis - Tous droits réservés</p>
      </div>
    </div>
    
    <!-- Toast pour les notifications -->
    <div v-if="showToast" class="toast" :class="{ 'success': toastType === 'success', 'error': toastType === 'error' }">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'

export default {
  name: 'Settings',
  setup() {
    const store = useStore()
    const router = useRouter()
    const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')
    const activeTheme = ref(localStorage.getItem('colorTheme') || 'blue')
    const fontSize = ref(parseInt(localStorage.getItem('fontSize')) || 100)
    const language = ref(localStorage.getItem('language') || 'fr')
    const notificationsEnabled = ref(localStorage.getItem('notifications') !== 'false')
    const autoSave = ref(localStorage.getItem('autoSave') !== 'false')
    const showToast = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success')
    const toastTimeout = ref(null)
    
    const userEmail = computed(() => {
      return store.state.user?.email || 'utilisateur@example.com'
    })
    
    const colorThemes = [
      { name: 'blue', color: '#4361ee' },
      { name: 'purple', color: '#8b5cf6' },
      { name: 'green', color: '#10b981' },
      { name: 'red', color: '#ef4444' },
      { name: 'orange', color: '#f59e0b' }
    ]
    
    // Fonction pour afficher un toast
    const showToastMessage = (message, type = 'success') => {
      if (toastTimeout.value) clearTimeout(toastTimeout.value)
      
      toastMessage.value = message
      toastType.value = type
      showToast.value = true
      
      toastTimeout.value = setTimeout(() => {
        showToast.value = false
      }, 3000)
    }
    
    const toggleDarkMode = () => {
      localStorage.setItem('darkMode', isDarkMode.value)
      
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
      
      // Émettre un événement personnalisé pour synchroniser avec App.vue
      window.dispatchEvent(new CustomEvent('theme-changed', {
        detail: { isDarkMode: isDarkMode.value }
      }))
      
      showToastMessage('Mode d\'affichage mis à jour')
    }
    
    const setColorTheme = (theme) => {
      activeTheme.value = theme
      localStorage.setItem('colorTheme', theme)
      
      const themeColor = colorThemes.find(t => t.name === theme).color
      document.documentElement.style.setProperty('--primary-color', themeColor)
      
      let secondaryColor
      switch(theme) {
        case 'blue': secondaryColor = '#3f37c9'; break;
        case 'purple': secondaryColor = '#7c3aed'; break;
        case 'green': secondaryColor = '#059669'; break;
        case 'red': secondaryColor = '#dc2626'; break;
        case 'orange': secondaryColor = '#d97706'; break;
        default: secondaryColor = '#3f37c9';
      }
      document.documentElement.style.setProperty('--secondary-color', secondaryColor)
      
      showToastMessage('Thème de couleur mis à jour')
    }
    
    const increaseFontSize = () => {
      if (fontSize.value < 150) {
        fontSize.value += 10
        applyFontSize()
        showToastMessage('Taille de police augmentée')
      }
    }
    
    const decreaseFontSize = () => {
      if (fontSize.value > 80) {
        fontSize.value -= 10
        applyFontSize()
        showToastMessage('Taille de police diminuée')
      }
    }
    
    const applyFontSize = () => {
      localStorage.setItem('fontSize', fontSize.value)
      document.documentElement.style.fontSize = `${fontSize.value}%`
    }
    
    const saveNotificationSettings = () => {
      localStorage.setItem('notifications', notificationsEnabled.value)
      showToastMessage('Préférences de notification mises à jour')
    }
    
    const saveAutoSaveSettings = () => {
      localStorage.setItem('autoSave', autoSave.value)
      showToastMessage('Préférences de sauvegarde mises à jour')
    }
    
    const saveLanguageSettings = () => {
      localStorage.setItem('language', language.value)
      showToastMessage('Langue mise à jour')
      // Ici on pourrait implémenter un changement de langue plus complet
    }
    
    const changePassword = async () => {
      try {
        if (store.state.user && store.state.user.email) {
          await sendPasswordResetEmail(auth, store.state.user.email)
          showToastMessage('Email de réinitialisation de mot de passe envoyé', 'success')
        } else {
          showToastMessage('Aucun utilisateur connecté', 'error')
        }
      } catch (error) {
        showToastMessage('Erreur lors de l\'envoi de l\'email', 'error')
        console.error(error)
      }
    }
    
    const editProfile = async () => {
      try {
        // Pour un exemple simple, on pourrait juste montrer une boîte de dialogue
        const newDisplayName = prompt('Entrez votre nom d\'affichage:')
        if (newDisplayName && store.state.user) {
          await updateProfile(store.state.user, {
            displayName: newDisplayName
          })
          showToastMessage('Profil mis à jour avec succès', 'success')
        }
      } catch (error) {
        showToastMessage('Erreur lors de la mise à jour du profil', 'error')
        console.error(error)
      }
    }
    
    const logout = async () => {
      try {
        await store.dispatch('logout')
        router.push('/login')
        showToastMessage('Déconnexion réussie', 'success')
      } catch (error) {
        showToastMessage('Erreur lors de la déconnexion', 'error')
        console.error(error)
      }
    }
    
    onMounted(() => {
      // Appliquer les réglages au chargement
      applyFontSize()
      if (activeTheme.value) {
        setColorTheme(activeTheme.value)
      }
    })
    
    return {
      isDarkMode,
      activeTheme,
      fontSize,
      language,
      notificationsEnabled,
      autoSave,
      colorThemes,
      userEmail,
      showToast,
      toastMessage,
      toastType,
      toggleDarkMode,
      setColorTheme,
      increaseFontSize,
      decreaseFontSize,
      saveNotificationSettings,
      saveAutoSaveSettings,
      saveLanguageSettings,
      changePassword,
      editProfile,
      logout
    }
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
}

h1 {
  margin-bottom: 2rem;
  color: var(--primary-color);
}

.settings-section {
  background-color: var(--light-surface);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark-mode .settings-section {
  background-color: var(--dark-surface);
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--light-text);
  border-bottom: 1px solid var(--light-border);
  padding-bottom: 0.75rem;
}

.dark-mode h2 {
  color: var(--dark-text);
  border-bottom-color: var(--dark-border);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--light-border);
}

.dark-mode .setting-item {
  border-bottom-color: var(--dark-border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  flex: 1;
}

.setting-title {
  display: block;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.setting-description {
  font-size: 0.875rem;
  color: var(--light-text-secondary);
}

.dark-mode .setting-description {
  color: var(--dark-text-secondary);
}

.setting-control {
  margin-left: 1.5rem;
  min-width: 120px;
  display: flex;
  justify-content: flex-end;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.color-themes {
  display: flex;
  gap: 0.5rem;
}

.color-theme-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-theme-btn.active {
  border-color: #64748b;
  transform: scale(1.1);
}

.dark-mode .color-theme-btn.active {
  border-color: #e2e8f0;
}

.color-theme-btn:hover {
  transform: scale(1.1);
}

.select-control {
  padding: 0.5rem;
  border: 1px solid var(--light-border);
  border-radius: 0.375rem;
  width: 100%;
  cursor: pointer;
  background-color: var(--light-surface);
  color: var(--light-text);
}

.dark-mode .select-control {
  background-color: var(--dark-surface);
  border-color: var(--dark-border);
  color: var(--dark-text);
}

.font-size-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.font-size-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: #f1f5f9;
  color: var(--light-text);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark-mode .font-size-btn {
  background-color: #334155;
  color: var(--dark-text);
}

.font-size-btn:hover {
  background-color: #e2e8f0;
}

.dark-mode .font-size-btn:hover {
  background-color: #475569;
}

.font-size-value {
  min-width: 40px;
  text-align: center;
  font-weight: 500;
}

.user-profile-settings {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.user-avatar {
  font-size: 4rem;
  color: var(--primary-color);
}

.user-details h3 {
  margin-bottom: 0.25rem;
}

.user-email {
  color: var(--light-text-secondary);
  font-size: 0.875rem;
}

.dark-mode .user-email {
  color: var(--dark-text-secondary);
}

.setting-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.75rem;
  border: 1px solid var(--light-border);
  border-radius: 0.375rem;
  background: none;
  text-align: left;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--light-text);
}

.dark-mode .action-btn {
  border-color: var(--dark-border);
  color: var(--dark-text);
}

.action-btn:hover {
  background-color: #f8fafc;
}

.dark-mode .action-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.action-btn.danger {
  color: #ef4444;
}

.action-btn.danger:hover {
  background-color: #fee2e2;
  border-color: #fecaca;
}

.dark-mode .action-btn.danger:hover {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

.action-btn i {
  width: 20px;
  text-align: center;
}

.about-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  padding: 1rem;
}

.app-info {
  font-size: 1.25rem;
}

.app-description {
  color: var(--light-text-secondary);
  margin-bottom: 1rem;
}

.dark-mode .app-description {
  color: var(--dark-text-secondary);
}

.copyright {
  font-size: 0.75rem;
  color: var(--light-text-secondary);
}

.dark-mode .copyright {
  color: var(--dark-text-secondary);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 100;
  animation: fadeInOut 3s forwards;
}

.toast.success {
  background-color: var(--success-color);
}

.toast.error {
  background-color: var(--danger-color);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, 20px); }
  15% { opacity: 1; transform: translate(-50%, 0); }
  85% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}

@media (max-width: 768px) {
  .settings-page {
    padding: 1.5rem;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .setting-control {
    margin-left: 0;
    width: 100%;
  }
  
  .user-profile-settings {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>