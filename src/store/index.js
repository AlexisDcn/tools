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
    }
  },
  actions: {
    async register({ commit }, { email, password, displayName }) {
      try {
        commit('clearAuthError')
        const res = await createUserWithEmailAndPassword(auth, email, password)
        if (res) {
          // Mettre à jour le profil si un nom d'affichage est fourni
          if (displayName) {
            await updateProfile(res.user, { displayName })
          }
          commit('setUser', res.user)
          return true
        }
      } catch (error) {
        let errorMessage = 'Erreur lors de l\'inscription';
        
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Cette adresse email est déjà utilisée';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Adresse email invalide';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Mot de passe trop faible';
        }
        
        commit('setAuthError', errorMessage)
        throw new Error(errorMessage)
      }
    },
    
    async login({ commit }, { email, password }) {
      try {
        commit('clearAuthError')
        const res = await signInWithEmailAndPassword(auth, email, password)
        if (res) {
          commit('setUser', res.user)
          return true
        }
      } catch (error) {
        let errorMessage = 'Erreur lors de la connexion';
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = 'Identifiants incorrects';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Trop de tentatives échouées. Veuillez réessayer plus tard.';
        }
        
        commit('setAuthError', errorMessage)
        throw new Error(errorMessage)
      }
    },
    
    async logout({ commit }) {
      try {
        await signOut(auth)
        commit('setUser', null)
        return true
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
        throw error
      }
    },
    
    async resetPassword({ commit }, email) {
      try {
        commit('clearAuthError')
        await sendPasswordResetEmail(auth, email)
        return true
      } catch (error) {
        let errorMessage = 'Erreur lors de la réinitialisation du mot de passe';
        
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Aucun compte associé à cette adresse email';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Adresse email invalide';
        }
        
        commit('setAuthError', errorMessage)
        throw new Error(errorMessage)
      }
    },
    
    async updateUserProfile({ commit }, profileData) {
      try {
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, profileData)
          // Rafraîchir l'utilisateur pour obtenir les données mises à jour
          commit('setUser', { ...auth.currentUser })
          return true
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error)
        throw error
      }
    },
    
    setUserPreference({ commit }, payload) {
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
    }
  },
  plugins: [
    createPersistedState({
      paths: ['user', 'userPreferences'],
      storage: window.localStorage
    })
  ]
})