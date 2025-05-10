<!-- InputField.vue -->
<template>
  <div class="input-wrapper">
    <label v-if="label" :for="id" class="field-label">{{ label }}</label>
    <div class="input-container">
      <div v-if="prefix" class="input-addon prefix">{{ prefix }}</div>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="['input', { 'has-prefix': prefix, 'has-suffix': suffix || clearable, 'error': error }]"
      />
      <div v-if="suffix" class="input-addon suffix">{{ suffix }}</div>
      <button v-if="clearable && modelValue" class="clear-button" @click="$emit('update:modelValue', '')">
        ✕
      </button>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="helper" class="helper-text">{{ helper }}</div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  helper: {
    type: String,
    default: ''
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  clearable: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.input-wrapper {
  width: 100%;
  margin-bottom: var(--space-md);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: var(--border-width) solid var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.input:focus {
  border-color: var(--primary-light);
  outline: 0;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.25);
}

.input:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
  opacity: 0.7;
}

.input.error {
  border-color: var(--danger);
}

.input.error:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
}

.input.has-prefix {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: none;
}

.input.has-suffix {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.input-addon {
  display: flex;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
  border: var(--border-width) solid var(--bg-tertiary);
}

.prefix {
  border-top-left-radius: var(--border-radius-md);
  border-bottom-left-radius: var(--border-radius-md);
}

.suffix {
  border-top-right-radius: var(--border-radius-md);
  border-bottom-right-radius: var(--border-radius-md);
}

.clear-button {
  position: absolute;
  right: var(--space-sm);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.875rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
}

.clear-button:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.error-message {
  color: var(--danger);
  font-size: 0.875rem;
  margin-top: var(--space-xs);
}

.helper-text {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: var(--space-xs);
}
</style>