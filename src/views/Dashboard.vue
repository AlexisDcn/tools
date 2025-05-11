<template>
  <div class="dashboard">
    <h1>Tableau de bord</h1>
    
    <div class="dashboard-grid">
      <div class="dashboard-card favorites">
        <h2>Outils favoris</h2>
        <div class="tools-grid">
          <router-link v-for="tool in favoriteTools" :key="tool.name" :to="tool.path" class="tool-card">
            <div class="tool-icon">
              <i :class="tool.icon"></i>
            </div>
            <span class="tool-name">{{ tool.name }}</span>
          </router-link>
        </div>
      </div>
      
      <div class="dashboard-card recent">
        <h2>Récemment utilisés</h2>
        <div class="recent-list">
          <div v-if="recentTools.length === 0" class="empty-list">
            Aucun outil utilisé récemment
          </div>
          <router-link 
            v-for="(tool, index) in recentTools" 
            :key="index" 
            :to="tool.path" 
            class="recent-item"
          >
            <div class="recent-icon">
              <i :class="tool.icon || 'fas fa-circle'"></i>
            </div>
            <div class="recent-info">
              <span class="recent-name">{{ tool.name }}</span>
              <span class="recent-date">{{ tool.date }}</span>
            </div>
            <i class="fas fa-chevron-right recent-arrow"></i>
          </router-link>
        </div>
      </div>
      
      <div class="dashboard-card tips">
        <h2>Astuces</h2>
        <div class="tip-content">
          <div class="tip-icon">
            <i class="fas fa-lightbulb"></i>
          </div>
          <p class="tip-text">{{ currentTip }}</p>
        </div>
        <button class="next-tip" @click="nextTip">
          Astuce suivante <i class="fas fa-arrow-right"></i>
        </button>
      </div>
      
      <div class="dashboard-card updates">
        <div class="update-header">
          <h2>Mises à jour</h2>
          <span class="update-badge">Nouveau</span>
        </div>
        <div class="update-list">
          <div class="update-item">
            <div class="update-info">
              <span class="update-title">Version 1.0.0 disponible</span>
              <span class="update-date">10 mai 2023</span>
            </div>
            <p class="update-description">
              Première version de l'application avec les outils Markdown, QR Code, Convertisseur et Calculatrice.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      favoriteTools: [
        { name: 'Markdown', path: '/markdown', icon: 'fas fa-file-alt' },
        { name: 'QR Code', path: '/qrcode', icon: 'fas fa-qrcode' },
        { name: 'Convertisseur', path: '/converter', icon: 'fas fa-exchange-alt' },
        { name: 'Calculatrice', path: '/calculator', icon: 'fas fa-calculator' }
      ],
      recentTools: [],
      tips: [
        "Vous pouvez utiliser le convertisseur pour transformer rapidement des unités de mesure.",
        "Le prévisualisateur Markdown vous permet de rédiger des documents formatés facilement.",
        "Générez des QR codes personnalisés pour partager des informations rapidement.",
        "La calculatrice garde un historique de vos calculs précédents.",
        "Utilisez le mode sombre pour réduire la fatigue oculaire la nuit."
      ],
      currentTipIndex: 0
    }
  },
  computed: {
    currentTip() {
      return this.tips[this.currentTipIndex];
    }
  },
  methods: {
    nextTip() {
      this.currentTipIndex = (this.currentTipIndex + 1) % this.tips.length;
      localStorage.setItem('currentTipIndex', this.currentTipIndex);
    },
    loadRecentTools() {
      try {
        const recentPaths = JSON.parse(localStorage.getItem('recentPaths') || '[]');
        // Filtrer pour exclure le dashboard lui-même
        this.recentTools = recentPaths.filter(item => item.path !== '/');
        
        // Si on n'a pas d'historique mais qu'on a visité des pages, initialisons-en un
        if (this.recentTools.length === 0) {
          // Ajouter quelques outils pour démonstration
          this.recentTools = [
            { 
              name: 'MarkdownPreviewer',
              path: '/markdown',
              icon: 'fas fa-file-alt',
              date: new Date().toLocaleString()
            }
          ];
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'historique:', err);
        this.recentTools = [];
        // Réinitialiser en cas d'erreur
        localStorage.setItem('recentPaths', '[]');
      }
    }
  },
  mounted() {
    this.loadRecentTools();
    
    // Charger l'astuce sauvegardée ou une aléatoire
    const savedTipIndex = localStorage.getItem('currentTipIndex');
    if (savedTipIndex !== null) {
      this.currentTipIndex = parseInt(savedTipIndex);
    } else {
      this.currentTipIndex = Math.floor(Math.random() * this.tips.length);
    }
    
    // Écouter les changements de route pour actualiser l'historique
    this.$watch(
      () => this.$route.path,
      () => {
        this.loadRecentTools();
      }
    );
  }
}
</script>

<style scoped>
/* Les styles restent identiques */
.dashboard {
  padding: 1.5rem;
}

h1 {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 1.5rem;
}

.dashboard-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.tool-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #f8fafc;
  text-decoration: none;
  color: var(--text-dark);
  transition: all 0.2s ease;
}

.tool-card:hover {
  background-color: rgba(67, 97, 238, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.tool-icon i {
  font-size: 1.5rem;
}

.tool-name {
  font-weight: 500;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #f8fafc;
  text-decoration: none;
  color: var(--text-dark);
  transition: all 0.2s ease;
}

.recent-item:hover {
  background-color: #f1f5f9;
}

.recent-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recent-info {
  flex: 1;
}

.recent-name {
  display: block;
  font-weight: 500;
}

.recent-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.recent-arrow {
  color: #cbd5e1;
}

.empty-list {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.tip-icon {
  font-size: 2rem;
  color: #f59e0b;
}

.tip-text {
  flex: 1;
  line-height: 1.5;
}

.next-tip {
  background: none;
  border: none;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-left: auto;
  cursor: pointer;
  transition: all 0.2s ease;
}

.next-tip:hover {
  transform: translateX(3px);
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.update-badge {
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.update-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.update-title {
  font-weight: 500;
}

.update-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.update-description {
  color: var(--text-muted);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .dashboard-card {
    background-color: var(--dark-surface);
  }
  
  h2 {
    color: var(--text-light);
  }
  
  .tool-card {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--text-light);
  }
  
  .tool-card:hover {
    background-color: rgba(67, 97, 238, 0.2);
  }
  
  .recent-item {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--text-light);
  }
  
  .recent-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .tip-content {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .empty-list {
    color: var(--dark-text-secondary);
  }
}
</style>