<!-- TextArea.vue -->
<template>
  <div class="textarea-wrapper">
    <label v-if="label" :for="id" class="field-label">{{ label }}</label>
    <div class="textarea-container">
      <textarea
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :rows="rows"
        :disabled="disabled"
        :class="{ 'error': error }"
      ></textarea>
      <div v-if="showActions" class="textarea-actions">
        <slot name="actions"></slot>
        <button v-if="clearable && modelValue" class="clear-button" @click="$emit('update:modelValue', '')">
          ✕
        </button>
      </div>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="helper" class="helper-text">{{ helper }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
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
  rows: {
    type: Number,
    default: 5
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
  clearable: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: () => `textarea-${Math.random().toString(36).substring(2, 9)}`
  }
})

defineEmits(['update:modelValue'])

const showActions = computed(() => {
  return props.clearable || !!slots.actions
})

// Pour accéder aux slots dans le template
const slots = useSlots()
</script>

<style scoped>
.textarea-wrapper {
  width: 100%;
  margin-bottom: var(--space-md);
}

.textarea-container {
  position: relative;
}

textarea {
  width: 100%;
  resize: vertical;
  padding: var(--space-sm) var(--space-md);
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: var(--border-width) solid var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

textarea:focus {
  border-color: var(--primary-light);
  outline: 0;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.25);
}

textarea:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
  opacity: 0.7;
}

textarea.error {
  border-color: var(--danger);
}

textarea.error:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
}

.textarea-actions {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  display: flex;
  gap: var(--space-xs);
}

.clear-button {
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