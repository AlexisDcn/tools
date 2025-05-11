import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

class SyncService {
  constructor() {
    this.listeners = new Map()
    this.userId = null
  }

  /**
   * Initialise le service avec l'ID utilisateur
   */
  init(userId) {
    if (userId) {
      this.userId = userId
      return true
    }
    return false
  }

  /**
   * Nettoie les écouteurs et réinitialise l'état
   */
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
    this.userId = null
  }

  /**
   * Récupère les données d'un certain type
   */
  async getData(dataType) {
    if (!this.userId) return null

    try {
      const docRef = doc(db, 'users', this.userId, 'data', dataType)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      } else {
        console.log(`Aucune donnée ${dataType} trouvée pour l'utilisateur`)
        return null
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des données ${dataType}:`, error)
      return null
    }
  }

  /**
   * Sauvegarde des données d'un certain type
   */
  async saveData(dataType, data) {
    if (!this.userId) return false

    try {
      const docRef = doc(db, 'users', this.userId, 'data', dataType)
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true })
      return true
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde des données ${dataType}:`, error)
      return false
    }
  }

  /**
   * Écoute les changements d'un certain type de données
   */
  listenForChanges(dataType, callback) {
    if (!this.userId) return () => {}

    // Nettoyage du précédent écouteur s'il existe
    if (this.listeners.has(dataType)) {
      this.listeners.get(dataType)()
      this.listeners.delete(dataType)
    }

    const docRef = doc(db, 'users', this.userId, 'data', dataType)
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback(docSnapshot.data())
      } else {
        callback(null)
      }
    }, (error) => {
      console.error(`Erreur lors de l'écoute des changements ${dataType}:`, error)
    })

    this.listeners.set(dataType, unsubscribe)
    return unsubscribe
  }

  /**
   * Ajoute un élément à un tableau
   */
  async addToArray(dataType, arrayName, item) {
    if (!this.userId) return false

    try {
      const docRef = doc(db, 'users', this.userId, 'data', dataType)
      await updateDoc(docRef, {
        [arrayName]: arrayUnion(item),
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error(`Erreur lors de l'ajout à ${arrayName}:`, error)
      return false
    }
  }

  /**
   * Supprime un élément d'un tableau
   */
  async removeFromArray(dataType, arrayName, item) {
    if (!this.userId) return false

    try {
      const docRef = doc(db, 'users', this.userId, 'data', dataType)
      await updateDoc(docRef, {
        [arrayName]: arrayRemove(item),
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${arrayName}:`, error)
      return false
    }
  }

  /**
   * Met à jour un élément spécifique dans un tableau
   * Note: il faut supprimer l'ancien et ajouter le nouveau
   */
  async updateInArray(dataType, arrayName, oldItem, newItem) {
    if (!this.userId) return false

    try {
      const docRef = doc(db, 'users', this.userId, 'data', dataType)
      await updateDoc(docRef, {
        [arrayName]: arrayRemove(oldItem)
      })
      await updateDoc(docRef, {
        [arrayName]: arrayUnion(newItem),
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error(`Erreur lors de la mise à jour dans ${arrayName}:`, error)
      return false
    }
  }
}

export const syncService = new SyncService()
export default syncService