// useClipboard.js
import { ref } from 'vue'

export function useClipboard(timeout = 1500) {
  const copied = ref(false)
  const supported = navigator && 'clipboard' in navigator
  
  const copy = async (text) => {
    if (!supported) {
      console.warn('Clipboard API non prise en charge')
      return false
    }
    
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      
      setTimeout(() => {
        copied.value = false
      }, timeout)
      
      return true
    } catch (error) {
      console.error('Erreur lors de la copie :', error)
      return false
    }
  }
  
  return { copy, copied, supported }
}