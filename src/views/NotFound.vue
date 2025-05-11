<template>
  <div class="not-found">
    <div class="error-container">
      <div class="error-code">404</div>
      <h1>Page non trouvée</h1>
      <p>Nous ne trouvons pas la page que vous recherchez.</p>
      <div class="actions">
        <router-link to="/" class="btn btn-primary">
          <i class="fas fa-home"></i> Retour à l'accueil
        </router-link>
        <button @click="goBack" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> Page précédente
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goBack() {
      window.history.length > 1 
        ? this.$router.go(-1)
        : this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: var(--spacing-xl);
  text-align: center;
}

.error-container {
  max-width: 500px;
  background-color: var(--light-surface);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  animation: fadeIn 0.5s ease-in-out;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: var(--spacing-md);
  background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0.8;
}

h1 {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
  color: var(--text-dark);
}

p {
  margin-bottom: var(--spacing-xl);
  color: var(--text-muted);
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all 0.3s ease;
}

.btn i {
  font-size: 0.9em;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
}

.btn-primary:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-dark);
  border: 1px solid var(--light-border);
}

.btn-secondary:hover {
  background-color: var(--light-border);
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .error-container {
    background-color: var(--dark-surface);
  }

  h1 {
    color: var(--text-light);
  }

  .btn-secondary {
    color: var(--text-light);
    border-color: var(--dark-border);
  }

  .btn-secondary:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>