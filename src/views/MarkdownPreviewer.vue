<template>
  <div class="markdown-container">
    <div class="toolbar">
      <button class="tool-btn" @click="clearText">
        <i class="fas fa-trash-alt"></i> Effacer
      </button>
      <button class="tool-btn" @click="copyHTML">
        <i class="fas fa-copy"></i> Copier HTML
      </button>
      <button class="tool-btn" @click="toggleFullscreen">
        <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
      </button>
    </div>
    
    <div class="editor-preview-container" :class="{ 'fullscreen': isFullscreen }">
      <div class="editor-container">
        <textarea
          v-model="markdownText"
          class="markdown-editor"
          placeholder="Écrivez du Markdown ici..."
          @input="updatePreview"
        ></textarea>
        <div class="resize-handle"></div>
      </div>
      
      <div class="preview-container" v-html="htmlPreview"></div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked'
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const markdownText = ref(localStorage.getItem('markdownText') || '# Bienvenue dans le prévisualisateur Markdown\n\nÉcrivez du Markdown à gauche et voyez l\'aperçu à droite.\n\n## Fonctionnalités\n\n- Prévisualisation en temps réel\n- Sauvegarde automatique\n- Mode plein écran\n- Copie du HTML généré');
    const htmlPreview = ref('');
    const isFullscreen = ref(false);

    const updatePreview = () => {
      htmlPreview.value = marked(markdownText.value);
      localStorage.setItem('markdownText', markdownText.value);
    };

    const clearText = () => {
      if (confirm('Êtes-vous sûr de vouloir effacer tout le texte?')) {
        markdownText.value = '';
        updatePreview();
      }
    };

    const copyHTML = () => {
      navigator.clipboard.writeText(htmlPreview.value)
        .then(() => alert('HTML copié dans le presse-papier!'))
        .catch(err => alert('Erreur lors de la copie: ' + err));
    };

    const toggleFullscreen = () => {
      isFullscreen.value = !isFullscreen.value;
    };

    onMounted(() => {
      updatePreview();

      // Implémentation du redimensionnement
      const resizeHandle = document.querySelector('.resize-handle');
      const editorContainer = document.querySelector('.editor-container');
      
      if (resizeHandle && editorContainer) {
        let startX;
        let startWidth;
        
        const startResize = (e) => {
          startX = e.clientX;
          startWidth = parseInt(document.defaultView.getComputedStyle(editorContainer).width, 10);
          document.addEventListener('mousemove', resize);
          document.addEventListener('mouseup', stopResize);
        };
        
        const resize = (e) => {
          const width = startWidth + (e.clientX - startX);
          const parentWidth = editorContainer.parentNode.offsetWidth;
          const newWidth = Math.max(200, Math.min(parentWidth - 200, width));
          editorContainer.style.width = `${newWidth}px`;
        };
        
        const stopResize = () => {
          document.removeEventListener('mousemove', resize);
          document.removeEventListener('mouseup', stopResize);
        };
        
        resizeHandle.addEventListener('mousedown', startResize);
      }
    });

    return {
      markdownText,
      htmlPreview,
      isFullscreen,
      updatePreview,
      clearText,
      copyHTML,
      toggleFullscreen
    };
  }
}
</script>

<style scoped>
.markdown-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--light-bg);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.toolbar {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary-color);
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.tool-btn {
  background-color: rgba(255,255,255,0.1);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: 5px;
}

.tool-btn:hover {
  background-color: rgba(255,255,255,0.2);
}

.editor-preview-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.editor-preview-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: white;
}

.editor-container {
  width: 50%;
  position: relative;
  border-right: 1px solid rgba(0,0,0,0.1);
}

.markdown-editor {
  width: 100%;
  height: 100%;
  padding: var(--spacing-md);
  background-color: #1e1e2e;
  color: #f8f8f2;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Fira Code', monospace;
  font-size: var(--font-size-base);
  line-height: 1.6;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -5px;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
}

.preview-container {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
  background-color: white;
  color: var(--text-dark);
  line-height: 1.6;
}

/* Styling for the rendered markdown */
.preview-container :deep(h1),
.preview-container :deep(h2),
.preview-container :deep(h3),
.preview-container :deep(h4),
.preview-container :deep(h5),
.preview-container :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
  color: var(--primary-color);
}

.preview-container :deep(h1) { font-size: 2em; border-bottom: 2px solid var(--primary-color); padding-bottom: 0.3em; }
.preview-container :deep(h2) { font-size: 1.5em; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 0.2em; }

.preview-container :deep(pre) {
  background-color: #f6f8fa;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  overflow-x: auto;
}

.preview-container :deep(code) {
  font-family: 'Fira Code', monospace;
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: var(--border-radius-sm);
  font-size: 0.9em;
}

.preview-container :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
}

.preview-container :deep(a:hover) {
  text-decoration: underline;
}

.preview-container :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  margin-left: 0;
  padding-left: var(--spacing-md);
  color: var(--text-muted);
}

.preview-container :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: var(--spacing-md);
}

.preview-container :deep(table th),
.preview-container :deep(table td) {
  border: 1px solid #ddd;
  padding: var(--spacing-sm) var(--spacing-md);
}

.preview-container :deep(table th) {
  background-color: #f2f2f2;
  font-weight: 600;
}

.preview-container :deep(table tr:nth-child(even)) {
  background-color: #f9f9f9;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .preview-container {
    background-color: #2d3748;
    color: var(--text-light);
  }
  
  .preview-container :deep(code),
  .preview-container :deep(pre) {
    background-color: #1a202c;
  }
  
  .preview-container :deep(table th) {
    background-color: #4a5568;
  }
  
  .preview-container :deep(table tr:nth-child(even)) {
    background-color: #2d3748;
  }
}

@media (max-width: 768px) {
  .editor-preview-container {
    flex-direction: column;
  }
  
  .editor-container {
    width: 100%;
    height: 50%;
    border-right: none;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }
  
  .resize-handle {
    top: auto;
    right: 0;
    bottom: -5px;
    width: 100%;
    height: 10px;
    cursor: row-resize;
  }
}
</style>