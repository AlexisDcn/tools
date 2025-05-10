<!-- Button.vue -->
<template>
  <button 
    :class="['button', variant, size, { 'is-loading': loading }]" 
    :disabled="loading || disabled"
    @click="$emit('click', $event)">
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: var(--border-radius-md);
}

.primary {
  background-color: var(--primary-color);
  color: var(--text-light);
}

.primary:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.secondary {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.secondary:hover:not(:disabled) {
  background-color: var(--bg-secondary);
}

.success {
  background-color: var(--success);
  color: var(--text-light);
}

.success:hover:not(:disabled) {
  background-color: #218838;
}

.danger {
  background-color: var(--danger);
  color: var(--text-light);
}

.danger:hover:not(:disabled) {
  background-color: #c82333;
}

.text {
  background-color: transparent;
  color: var(--primary-color);
  padding: 0;
}

.text:hover:not(:disabled) {
  color: var(--primary-dark);
  text-decoration: underline;
}

.small {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}

.medium {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.large {
  font-size: 1.125rem;
  padding: 0.75rem 1.5rem;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.is-loading {
  position: relative;
  color: transparent !important;
}

.is-loading::after {
  content: "";
  position: absolute;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-right-color: transparent;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
