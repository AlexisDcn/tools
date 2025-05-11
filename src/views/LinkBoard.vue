<template>
  <div class="link-board">
    <h1>Mes liens</h1>
    
    <div class="board-controls">
      <button class="btn add-btn" @click="showAddModal = true">
        <i class="fas fa-plus"></i> Ajouter un lien
      </button>
      
      <div class="view-controls">
        <button 
          class="view-btn" 
          :class="{ active: viewMode === 'grid' }" 
          @click="viewMode = 'grid'"
          title="Vue en grille"
        >
          <i class="fas fa-th"></i>
        </button>
        <button 
          class="view-btn" 
          :class="{ active: viewMode === 'list' }" 
          @click="viewMode = 'list'"
          title="Vue en liste"
        >
          <i class="fas fa-list"></i>
        </button>
      </div>
    </div>
    
    <div class="categories-container">
      <div class="categories">
        <button 
          class="category-btn" 
          :class="{ active: currentCategory === 'all' }"
          @click="currentCategory = 'all'"
        >
          Tous
        </button>
        <button 
          v-for="category in uniqueCategories" 
          :key="category" 
          class="category-btn"
          :class="{ active: currentCategory === category }"
          @click="currentCategory = category"
        >
          {{ category }}
        </button>
      </div>
    </div>
    
    <div v-if="filteredLinks.length === 0" class="empty-board">
      <i class="fas fa-link"></i>
      <p v-if="links.length === 0">Vous n'avez pas encore ajouté de liens. Commencez par cliquer sur "Ajouter un lien".</p>
      <p v-else>Aucun lien ne correspond à la catégorie sélectionnée.</p>
    </div>
    
    <div 
      class="links-container"
      :class="{ 'grid-view': viewMode === 'grid', 'list-view': viewMode === 'list' }"
    >
      <div 
        v-for="(link, index) in filteredLinks" 
        :key="index" 
        class="link-card"
      >
        <div class="link-icon" :style="{ backgroundColor: getLinkColor(link) }">
          <i :class="getLinkIcon(link)"></i>
        </div>
        
        <div class="link-content">
          <h3 class="link-title">{{ link.title }}</h3>
          <p v-if="link.description && viewMode === 'grid'" class="link-description">{{ link.description }}</p>
          <span class="link-url">{{ formatUrl(link.url) }}</span>
          <div class="link-category">{{ link.category }}</div>
        </div>
        
        <div class="link-actions">
          <a :href="link.url" target="_blank" rel="noopener noreferrer" class="action-btn open-link">
            <i class="fas fa-external-link-alt"></i>
          </a>
          <button class="action-btn edit-link" @click="editLink(index)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-link" @click="confirmDelete(index)">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal for adding/editing links -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Modifier le lien' : 'Ajouter un lien' }}</h2>
          <button class="close-modal" @click="closeModals">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="link-title">Titre</label>
            <input 
              type="text" 
              id="link-title" 
              v-model="currentLink.title" 
              placeholder="Nom du site web"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="link-url">URL</label>
            <input 
              type="url" 
              id="link-url" 
              v-model="currentLink.url" 
              placeholder="https://exemple.com"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="link-description">Description (optionnelle)</label>
            <textarea 
              id="link-description" 
              v-model="currentLink.description" 
              placeholder="Description brève du site"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="link-category">Catégorie</label>
            <div class="category-input">
              <input 
                type="text" 
                id="link-category" 
                v-model="currentLink.category" 
                placeholder="Développement, Productivité, etc."
                list="categories"
              />
              <datalist id="categories">
                <option v-for="category in uniqueCategories" :key="category" :value="category"></option>
              </datalist>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModals">Annuler</button>
          <button class="btn btn-primary" @click="saveLink">
            {{ showEditModal ? 'Mettre à jour' : 'Ajouter' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Confirmation modal for deleting links -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal delete-modal" @click.stop>
        <div class="modal-header">
          <h2>Supprimer le lien</h2>
          <button class="close-modal" @click="showDeleteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer ce lien ?</p>
          <p class="delete-link-title">{{ links[deleteIndex]?.title }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Annuler</button>
          <button class="btn btn-danger" @click="deleteLink">Supprimer</button>
        </div>
      </div>
    </div>
    
    <!-- Toast notification -->
    <div v-if="showToast" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'LinkBoard',
  setup() {
    const links = ref([])
    const viewMode = ref(localStorage.getItem('link-board-view') || 'grid')
    const currentCategory = ref('all')
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showDeleteModal = ref(false)
    const editIndex = ref(-1)
    const deleteIndex = ref(-1)
    const showToast = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success')
    const currentLink = ref({
      title: '',
      url: '',
      description: '',
      category: '',
    })
    
    // Load links from localStorage
    onMounted(() => {
      const savedLinks = localStorage.getItem('pinned-links')
      if (savedLinks) {
        links.value = JSON.parse(savedLinks)
      }
    })
    
    // Save view mode preference
    watch(viewMode, (newValue) => {
      localStorage.setItem('link-board-view', newValue)
    })
    
    // Save links whenever they change
    watch(links, (newValue) => {
      localStorage.setItem('pinned-links', JSON.stringify(newValue))
    }, { deep: true })
    
    // Get unique categories from links
    const uniqueCategories = computed(() => {
      const categories = links.value.map(link => link.category).filter(Boolean)
      return [...new Set(categories)]
    })
    
    // Filter links based on selected category
    const filteredLinks = computed(() => {
      if (currentCategory.value === 'all') {
        return links.value
      }
      return links.value.filter(link => link.category === currentCategory.value)
    })
    
    // Format URL for display
    const formatUrl = (url) => {
      try {
        const urlObj = new URL(url)
        return urlObj.hostname
      } catch (e) {
        return url
      }
    }
    
    // Determine icon based on URL
    const getLinkIcon = (link) => {
      try {
        const url = new URL(link.url)
        
        // Common domains
        if (url.hostname.includes('github')) return 'fab fa-github'
        if (url.hostname.includes('youtube')) return 'fab fa-youtube'
        if (url.hostname.includes('google')) return 'fab fa-google'
        if (url.hostname.includes('facebook')) return 'fab fa-facebook'
        if (url.hostname.includes('twitter') || url.hostname.includes('x.com')) return 'fab fa-twitter'
        if (url.hostname.includes('instagram')) return 'fab fa-instagram'
        if (url.hostname.includes('linkedin')) return 'fab fa-linkedin'
        if (url.hostname.includes('reddit')) return 'fab fa-reddit'
        if (url.hostname.includes('twitch')) return 'fab fa-twitch'
        if (url.hostname.includes('discord')) return 'fab fa-discord'
        if (url.hostname.includes('slack')) return 'fab fa-slack'
        if (url.hostname.includes('apple')) return 'fab fa-apple'
        if (url.hostname.includes('microsoft')) return 'fab fa-microsoft'
        if (url.hostname.includes('amazon')) return 'fab fa-amazon'
        
        // Default icon
        return 'fas fa-globe'
      } catch (e) {
        return 'fas fa-link'
      }
    }
    
    // Get color based on link category or domain
    const getLinkColor = (link) => {
      const colors = {
        'Développement': '#3b82f6',
        'Productivité': '#10b981',
        'Social': '#8b5cf6',
        'Divertissement': '#f59e0b',
        'Education': '#ef4444',
        'Finance': '#22c55e',
        'Shopping': '#ec4899',
        'Actualité': '#6366f1'
      }
      
      if (link.category && colors[link.category]) {
        return colors[link.category]
      }
      
      try {
        const url = new URL(link.url)
        
        if (url.hostname.includes('github')) return '#24292e'
        if (url.hostname.includes('youtube')) return '#ff0000'
        if (url.hostname.includes('google')) return '#4285F4'
        if (url.hostname.includes('facebook')) return '#1877f2'
        if (url.hostname.includes('twitter') || url.hostname.includes('x.com')) return '#1da1f2'
        if (url.hostname.includes('instagram')) return '#c13584'
        if (url.hostname.includes('linkedin')) return '#0077b5'
        if (url.hostname.includes('reddit')) return '#ff4500'
        
        // Default
        return '#64748b'
      } catch (e) {
        return '#64748b'
      }
    }
    
    // Display toast notification
    const showToastNotification = (message, type = 'success') => {
      toastMessage.value = message
      toastType.value = type
      showToast.value = true
      
      setTimeout(() => {
        showToast.value = false
      }, 3000)
    }
    
    // Close all modals
    const closeModals = () => {
      showAddModal.value = false
      showEditModal.value = false
      showDeleteModal.value = false
      currentLink.value = {
        title: '',
        url: '',
        description: '',
        category: ''
      }
    }
    
    // Edit a link
    const editLink = (index) => {
      editIndex.value = index
      currentLink.value = { ...links.value[index] }
      showEditModal.value = true
    }
    
    // Confirm deletion of a link
    const confirmDelete = (index) => {
      deleteIndex.value = index
      showDeleteModal.value = true
    }
    
    // Delete a link
    const deleteLink = () => {
      if (deleteIndex.value >= 0) {
        links.value.splice(deleteIndex.value, 1)
        showToastNotification('Lien supprimé avec succès')
        showDeleteModal.value = false
        deleteIndex.value = -1
      }
    }
    
    // Save or update a link
    const saveLink = () => {
      // Validate inputs
      if (!currentLink.value.title.trim()) {
        showToastNotification('Veuillez entrer un titre', 'error')
        return
      }
      
      if (!currentLink.value.url.trim()) {
        showToastNotification('Veuillez entrer une URL', 'error')
        return
      }
      
      // Add http:// if missing
      if (!currentLink.value.url.startsWith('http://') && !currentLink.value.url.startsWith('https://')) {
        currentLink.value.url = 'https://' + currentLink.value.url
      }
      
      if (showEditModal.value) {
        // Update existing link
        links.value[editIndex.value] = { ...currentLink.value }
        showToastNotification('Lien mis à jour avec succès')
      } else {
        // Add new link
        links.value.push({ ...currentLink.value })
        showToastNotification('Nouveau lien ajouté')
      }
      
      closeModals()
    }
    
    return {
      links,
      viewMode,
      currentCategory,
      showAddModal,
      showEditModal,
      showDeleteModal,
      currentLink,
      showToast,
      toastMessage,
      toastType,
      uniqueCategories,
      filteredLinks,
      closeModals,
      editLink,
      confirmDelete,
      deleteLink,
      saveLink,
      formatUrl,
      getLinkIcon,
      getLinkColor
    }
  }
}
</script>

<style scoped>
.link-board {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  position: relative;
}

h1 {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.board-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  width: 40px;
  height: 40px;
  border-radius: 0.375rem;
  border: 1px solid var(--light-border);
  background-color: var(--light-surface);
  color: var(--light-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-mode .view-btn {
  background-color: var(--dark-surface);
  border-color: var(--dark-border);
  color: var(--dark-text-secondary);
}

.view-btn.active {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.categories-container {
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.categories {
  display: flex;
  gap: 0.75rem;
  padding: 0.25rem;
}

.category-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--light-border);
  border-radius: 9999px;
  background-color: var(--light-surface);
  color: var(--light-text);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-mode .category-btn {
  background-color: var(--dark-surface);
  border-color: var(--dark-border);
  color: var(--dark-text);
}

.category-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.links-container {
  display: grid;
  gap: 1.5rem;
}

.links-container.grid-view {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.links-container.list-view {
  grid-template-columns: 1fr;
}

.link-card {
  display: flex;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: var(--light-surface);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.dark-mode .link-card {
  background-color: var(--dark-surface);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.link-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.dark-mode .link-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.link-icon {
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  font-size: 1.5rem;
}

.link-content {
  flex: 1;
  padding: 1rem;
  min-width: 0;
  position: relative;
}

.link-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--light-text);
}

.dark-mode .link-title {
  color: var(--dark-text);
}

.link-description {
  margin: 0.25rem 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--light-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.dark-mode .link-description {
  color: var(--dark-text-secondary);
}

.link-url {
  font-size: 0.75rem;
  color: var(--light-text-secondary);
  display: block;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark-mode .link-url {
  color: var(--dark-text-secondary);
}

.link-category {
  display: inline-block;
  font-size: 0.75rem;
  background-color: var(--light-bg);
  color: var(--light-text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.dark-mode .link-category {
  background-color: var(--dark-bg);
  color: var(--dark-text-secondary);
}

.link-actions {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--light-border);
}

.dark-mode .link-actions {
  border-left-color: var(--dark-border);
}

.action-btn {
  height: 33.33%;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--light-text-secondary);
  transition: all 0.2s;
}

.dark-mode .action-btn {
  color: var(--dark-text-secondary);
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark-mode .action-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.action-btn.open-link {
  color: var(--primary-color);
}

.action-btn.edit-link:hover {
  color: #3b82f6;
}

.action-btn.delete-link:hover {
  color: #ef4444;
}

.empty-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--light-text-secondary);
  text-align: center;
  background-color: var(--light-surface);
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dark-mode .empty-board {
  color: var(--dark-text-secondary);
  background-color: var(--dark-surface);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.empty-board i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 500px;
  background-color: var(--light-surface);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.dark-mode .modal {
  background-color: var(--dark-surface);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark-mode .modal-header {
  border-bottom-color: var(--dark-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--light-text);
}

.dark-mode .modal-header h2 {
  color: var(--dark-text);
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--light-text-secondary);
}

.dark-mode .close-modal {
  color: var(--dark-text-secondary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--light-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.dark-mode .modal-footer {
  border-top-color: var(--dark-border);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
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

input[type="text"],
input[type="url"],
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--light-border);
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: inherit;
  background-color: var(--light-surface);
  color: var(--light-text);
}

.dark-mode input[type="text"],
.dark-mode input[type="url"],
.dark-mode textarea {
  background-color: var(--dark-surface);
  border-color: var(--dark-border);
  color: var(--dark-text);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.category-input {
  position: relative;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--secondary-color);
}

.btn-secondary {
  background-color: var(--light-bg);
  color: var(--light-text);
}

.dark-mode .btn-secondary {
  background-color: var(--dark-bg);
  color: var(--dark-text);
}

.btn-secondary:hover {
  background-color: var(--light-border);
}

.dark-mode .btn-secondary:hover {
  background-color: var(--dark-border);
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.delete-link-title {
  font-weight: 500;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: var(--light-bg);
  border-radius: 0.375rem;
}

.dark-mode .delete-link-title {
  background-color: var(--dark-bg);
}

.delete-modal {
  max-width: 400px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1100;
  animation: fadeInOut 3s forwards;
}

.toast.success {
  background-color: var(--success-color);
}

.toast.error {
  background-color: var(--danger-color);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, 20px); }
  15% { opacity: 1; transform: translate(-50%, 0); }
  85% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .link-board {
    padding: 1rem;
  }
  
  .links-container.grid-view {
    grid-template-columns: 1fr;
  }
  
  .link-icon {
    width: 50px;
  }
  
  .modal {
    width: calc(100% - 2rem);
    max-height: calc(100% - 2rem);
    display: flex;
    flex-direction: column;
  }
  
  .modal-body {
    flex: 1;
    overflow-y: auto;
  }
}
</style>