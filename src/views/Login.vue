<template>
  <div class="login-container">
    <div class="auth-card">
      <div class="auth-header">
        <i class="fas fa-tools logo-icon"></i>
        <h1>Tools</h1>
      </div>
      
      <h2>Connexion</h2>
      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-icon-wrapper">
            <i class="fas fa-envelope input-icon"></i>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              required
              autocomplete="email"
              placeholder="Entrez votre email"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <div class="input-icon-wrapper">
            <i class="fas fa-lock input-icon"></i>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              required
              autocomplete="current-password"
              placeholder="Entrez votre mot de passe"
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        
        <div class="form-options">
          <label class="remember-label">
            <input type="checkbox" v-model="remember" />
            <span>Se souvenir de moi</span>
          </label>
          <a href="#" @click.prevent="forgotPassword" class="forgot-password">Mot de passe oublié ?</a>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">
              <i class="fas fa-circle-notch fa-spin"></i> Connexion en cours...
            </span>
            <span v-else>
              <i class="fas fa-sign-in-alt"></i> Se connecter
            </span>
          </button>
        </div>
        
        <div class="auth-links">
          <router-link to="/register">
            <i class="fas fa-user-plus"></i> Créer un compte
          </router-link>
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
    const remember = ref(false)
    const error = ref('')
    const loading = ref(false)
    const showPassword = ref(false)
    
    const store = useStore()
    const router = useRouter()
    
    // Rétablir l'email si enregistré dans le localStorage
    if (localStorage.getItem('savedEmail')) {
      email.value = localStorage.getItem('savedEmail')
      remember.value = true
    }
    
    const handleLogin = async () => {
      error.value = ''
      loading.value = true
      
      try {
        // Sauvegarder l'email si "Se souvenir de moi" est coché
        if (remember.value) {
          localStorage.setItem('savedEmail', email.value)
        } else {
          localStorage.removeItem('savedEmail')
        }
        
        await store.dispatch('login', { 
          email: email.value, 
          password: password.value 
        })
        router.push('/')
      } catch (err) {
        error.value = err.message || "Identifiants incorrects. Veuillez réessayer."
      } finally {
        loading.value = false
      }
    }
    
    const forgotPassword = async () => {
      if (!email.value) {
        error.value = "Veuillez saisir votre adresse email pour réinitialiser votre mot de passe"
        return
      }
      
      try {
        loading.value = true
        await store.dispatch('resetPassword', email.value)
        error.value = ''
        alert(`Un email de réinitialisation a été envoyé à ${email.value}`)
      } catch (err) {
        error.value = err.message || "Impossible d'envoyer l'email de réinitialisation"
      } finally {
        loading.value = false
      }
    }
    
    return {
      email,
      password,
      remember,
      error,
      loading,
      showPassword,
      handleLogin,
      forgotPassword
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--light-bg);
  padding: 2rem;
}

.dark-mode .login-container {
  background-color: var(--dark-bg);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  background-color: var(--light-surface);
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.dark-mode .auth-card {
  background-color: var(--dark-surface);
}

.auth-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  justify-content: center;
}

.logo-icon {
  font-size: 2rem;
  color: var(--primary-color);
  margin-right: 1rem;
}

.auth-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
}

h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
  color: var(--light-text);
}

.dark-mode h2 {
  color: var(--dark-text);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--light-text);
}

.dark-mode label {
  color: var(--dark-text);
}

.input-icon-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--light-text-secondary);
}

.dark-mode .input-icon {
  color: var(--dark-text-secondary);
}

input[type="email"],
input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--light-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: var(--light-surface);
  color: var(--light-text);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.dark-mode input[type="email"],
.dark-mode input[type="password"],
.dark-mode input[type="text"] {
  background-color: var(--dark-surface);
  border-color: var(--dark-border);
  color: var(--dark-text);
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--light-text-secondary);
  cursor: pointer;
}

.dark-mode .toggle-password {
  color: var(--dark-text-secondary);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.remember-label input {
  margin-right: 0.5rem;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn {
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  transition: background-color 0.2s, transform 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--secondary-color);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-links {
  margin-top: 1.5rem;
  text-align: center;
}

.auth-links a {
  color: var(--primary-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-links a:hover {
  text-decoration: underline;
}

.error-message {
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message i {
  font-size: 1.25rem;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>