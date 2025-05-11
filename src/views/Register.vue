<template>
  <div class="register-container">
    <div class="auth-card">
      <h2>Créer un compte</h2>
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            autocomplete="email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
            autocomplete="new-password"
          />
        </div>
        
        <div class="form-group">
          <label for="confirm-password">Confirmer le mot de passe</label>
          <input 
            type="password" 
            id="confirm-password" 
            v-model="confirmPassword" 
            required
            autocomplete="new-password"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">Inscription en cours...</span>
            <span v-else>S'inscrire</span>
          </button>
        </div>
        
        <div class="auth-links">
          <router-link to="/login">Déjà un compte ? Se connecter</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const error = ref('')
    const loading = ref(false)
    
    const store = useStore()
    const router = useRouter()
    
    const handleRegister = async () => {
      error.value = ''
      
      if (password.value !== confirmPassword.value) {
        error.value = "Les mots de passe ne correspondent pas"
        return
      }
      
      if (password.value.length < 6) {
        error.value = "Le mot de passe doit contenir au moins 6 caractères"
        return
      }
      
      loading.value = true
      
      try {
        await store.dispatch('register', { 
          email: email.value, 
          password: password.value 
        })
        router.push('/')
      } catch (err) {
        if (err.message.includes('email-already-in-use')) {
          error.value = "Cette adresse email est déjà utilisée"
        } else {
          error.value = "Une erreur s'est produite lors de l'inscription"
        }
        console.error(err)
      } finally {
        loading.value = false
      }
    }
    
    return {
      email,
      password,
      confirmPassword,
      error,
      loading,
      handleRegister
    }
  }
}
</script>

<style scoped>
/* Même style que Login.vue */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--secondary-color);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-links {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.auth-links a {
  color: var(--primary-color);
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}

.error-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #fee2e2;
  color: #b91c1c;
  border-radius: 0.375rem;
  text-align: center;
}
</style>