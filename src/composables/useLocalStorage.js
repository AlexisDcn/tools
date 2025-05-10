// useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(key, initialValue) {
  // Créer une référence réactive
  const value = ref(initialValue)
  
  // Essayer de récupérer une valeur existante
  try {
    const item = window.localStorage.getItem(key)
    
    // Vérifier si la valeur existe
    if (item !== null) {
      value.value = JSON.parse(item)
    } else {
      // Si aucune valeur n'existe, définir la valeur initiale dans localStorage
      window.localStorage.setItem(key, JSON.stringify(initialValue))
    }
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${key} depuis localStorage:`, error)
  }
  
  // Observer les changements et mettre à jour localStorage
  watch(
    value,
    (newValue) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.error(`Erreur lors de l'écriture de ${key} dans localStorage:`, error)
      }
    },
    { deep: true }
  )
  
  // Fonction pour réinitialiser à la valeur initiale
  const reset = () => {
    value.value = initialValue
  }
  
  return { value, reset }
}