import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth } from '../firebase'
import { syncService } from '../services/syncService'

export default createStore({
  state: {
    user: null,
    authIsReady: false,
    authError: null,
    userPreferences: {
      darkMode: null,
      theme: 'blue',
      fontSize: 100,
      language: 'fr'
    },
    syncStatus: {
      isEnabled: true,
      lastSynced: null,
      hasPendingChanges: false
    }
  },
  
  getters: {
    isLoggedIn(state) {
      return !!state.user
    },
    userName(state) {
      return state.user?.displayName || state.user?.email || 'Utilisateur'
    },
    userEmail(state) {
      return state.user?.email
    },
    authError(state) {
      return state.authError
    },
    isSyncEnabled(state) {
      return state.syncStatus.isEnabled
    }
  },
  
  mutations: {
    setUser(state, payload) {
      state.user = payload
    },
    setAuthIsReady(state, payload) {
      state.authIsReady = payload
    },
    setAuthError(state, payload) {
      state.authError = payload
    },
    clearAuthError(state) {
      state.authError = null
    },
    setUserPreference(state, { key, value }) {
      state.userPreferences[key] = value
    },
    setSyncEnabled(state, isEnabled) {
      state.syncStatus.isEnabled = isEnabled
    },
    setLastSynced(state, timestamp) {
      state.syncStatus.lastSynced = timestamp
    },
    setHasPendingChanges(state, hasPending) {
      state.syncStatus.hasPendingChanges = hasPending
    },
    // Pour gérer les données synchronisées
    updateSyncedData(state, { dataType, data }) {
      // En fonction du type de données à synchroniser
      switch(dataType) {
        case 'links':
          // Si nous avons un composant LinkBoard avec des données liens
          if (data && data.items) {
            localStorage.setItem('pinned-links', JSON.stringify(data.items))
          }
          break;
        case 'preferences':
          if (data) {
            // Mise à jour des préférences
            for (const [key, value] of Object.entries(data)) {
              if (state.userPreferences.hasOwnProperty(key)) {
                state.userPreferences[key] = value
              }
            }
            // Sauvegarde dans localStorage pour la compatibilité avec le code existant
            Object.entries(data).forEach(([key, value]) => {
              if (key === 'darkMode') localStorage.setItem('darkMode', value)
              else if (key === 'theme') localStorage.setItem('colorTheme', value)
              else if (key === 'fontSize') localStorage.setItem('fontSize', value)
              else if (key === 'language') localStorage.setItem('language', value)
            })
          }
          break;
        // Ajoutez d'autres types de données selon les besoins
      }
    }
  },
  
  actions: {
    async register({ commit, dispatch }, { email, password, displayName }) {
      try {
        commit('clearAuthError')
        const res = await createUserWithEmailAndPassword(auth, email, password)
        if (res) {
          if (displayName) {
            await updateProfile(res.user, { displayName })
          }
          commit('setUser', res.user)
          
          // Initialisation du service de synchronisation pour le nouvel utilisateur
          syncService.init(res.user.uid)
          
          // Configurer les préférences par défaut pour le nouvel utilisateur
          await dispatch('syncUserData', 'preferences')
          
          return true
        }
      } catch (error) {
        let errorMessage = "Erreur lors de l'inscription"
        
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Cette adresse email est déjà utilisée'
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Adresse email invalide'
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Mot de passe trop faible'
        }
        
        commit('setAuthError', errorMessage)
        throw new Error(errorMessage)
      }
    },
    
    async login({ commit, dispatch, state }, { email, password }) {
      try {
        commit('clearAuthError')
        const res = await signInWithEmailAndPassword(auth, email, password)
        if (res) {
          commit('setUser', res.user)
          
          // Initialisation du service de synchronisation
          syncService.init(res.user.uid)
          
          // Récupérer les préférences de l'utilisateur depuis Firebase
          if (state.syncStatus.isEnabled) {
            await dispatch('fetchUserData')
          }
          
          return true
        }
      } catch (error) {
        let errorMessage = 'Erreur lors de la connexion'
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = 'Identifiants incorrects'
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Trop de tentatives échouées. Veuillez réessayer plus tard.'
        }
        
        commit('setAuthError', errorMessage)
        throw new Error(errorMessage)
      }
    },
    
    async logout({ commit }) {
      try {
        // Nettoyage du service de synchronisation
        syncService.cleanup()
        
        await signOut(auth)
        commit('setUser', null)
        return true
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
        throw error
      }
    },
    
    async resetPassword({ commit }, email) {
      // (inchangé)
    },
    
    async updateUserProfile({ commit }, profileData) {
      // (inchangé) 
    },
    
    async setUserPreference({ commit, dispatch, state }, payload) {
      commit('setUserPreference', payload)
      
      // Sauvegarder également dans localStorage pour une persistance système
      if (payload.key === 'darkMode') {
        localStorage.setItem('darkMode', payload.value)
      } else if (payload.key === 'theme') {
        localStorage.setItem('colorTheme', payload.value)
      } else if (payload.key === 'fontSize') {
        localStorage.setItem('fontSize', payload.value)
      } else if (payload.key === 'language') {
        localStorage.setItem('language', payload.value)
      }
      
      // Synchroniser si activé
      if (state.syncStatus.isEnabled && state.user) {
        dispatch('syncUserData', 'preferences')
      }
    },
    
    toggleSync({ commit, dispatch, state }, isEnabled) {
      commit('setSyncEnabled', isEnabled)
      
      if (isEnabled && state.user) {
        // Si on active la synchro, on synchronise tout de suite
        dispatch('syncAllData')
      }
    },
    
    // Récupérer toutes les données utilisateur depuis Firebase
    async fetchUserData({ commit, dispatch }) {
      if (!auth.currentUser) return
      
      try {
        // Récupérer les préférences
        const preferencesData = await syncService.getData('preferences')
        if (preferencesData) {
          commit('updateSyncedData', { 
            dataType: 'preferences', 
            data: preferencesData 
          })
        } else {
          // Si pas encore de préférences, on pousse les actuelles
          dispatch('syncUserData', 'preferences')
        }
        
        // Récupérer les liens épinglés
        const linksData = await syncService.getData('links')
        if (linksData) {
          commit('updateSyncedData', { 
            dataType: 'links', 
            data: linksData 
          })
        } else {
          // Si pas encore de liens, on pousse les actuels
          dispatch('syncUserData', 'links')
        }
        
        // Ajouter d'autres types de données selon besoin
        
        commit('setLastSynced', new Date().toISOString())
        commit('setHasPendingChanges', false)
        
        return true
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error)
        return false
      }
    },
    
    // Synchroniser un type de données spécifique
    async syncUserData({ commit, state }, dataType) {
      if (!auth.currentUser || !state.syncStatus.isEnabled) return false
      
      try {
        let dataToSync = null
        
        switch(dataType) {
          case 'preferences':
            dataToSync = state.userPreferences
            break;
            
          case 'links':
            // Récupérer les liens depuis localStorage
            const linksStr = localStorage.getItem('pinned-links')
            if (linksStr) {
              dataToSync = { items: JSON.parse(linksStr) }
            } else {
              dataToSync = { items: [] }
            }
            break;
            
          // Ajouter d'autres types au besoin
        }
        
        if (dataToSync) {
          await syncService.saveData(dataType, dataToSync)
          commit('setLastSynced', new Date().toISOString())
          commit('setHasPendingChanges', false)
          return true
        }
        
        return false
      } catch (error) {
        console.error(`Erreur lors de la synchronisation des données ${dataType}:`, error)
        commit('setHasPendingChanges', true)
        return false
      }
    },
    
    // Synchroniser toutes les données
    async syncAllData({ dispatch }) {
      await Promise.all([
        dispatch('syncUserData', 'preferences'),
        dispatch('syncUserData', 'links'),
        // Ajouter d'autres types au besoin
      ])
    },
    
    // Configurer les écouteurs de synchronisation
    setupSyncListeners({ commit }) {
      if (!auth.currentUser) return
      
      // Écouter les changements de préférences
      syncService.listenForChanges('preferences', (data) => {
        if (data) {
          commit('updateSyncedData', { dataType: 'preferences', data })
        }
      })
      
      // Écouter les changements de liens
      syncService.listenForChanges('links', (data) => {
        if (data) {
          commit('updateSyncedData', { dataType: 'links', data })
        }
      })
      
      // Ajouter d'autres écouteurs au besoin
    }
  },
  
  plugins: [
    createPersistedState({
      paths: ['user', 'userPreferences', 'syncStatus'],
      storage: window.localStorage
    })
  ]
})