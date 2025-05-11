<template>
  <div class="qr-code-container">
    <h1>Générateur de QR Code</h1>
    
    <div class="qr-form">
      <div class="form-group">
        <label for="qrInput">Texte ou URL</label>
        <textarea 
          id="qrInput"
          v-model="text"
          placeholder="Entrez le texte à convertir en QR Code"
          @input="generateQRCode"
          class="text-input"
        ></textarea>
      </div>
      
      <div class="form-group color-inputs">
        <div>
          <label for="fgColor">Couleur</label>
          <input type="color" id="fgColor" v-model="fgColor" @change="generateQRCode">
        </div>
        <div>
          <label for="bgColor">Fond</label>
          <input type="color" id="bgColor" v-model="bgColor" @change="generateQRCode">
        </div>
      </div>
      
      <div class="form-group">
        <label for="sizeRange">Taille: {{ size }}px</label>
        <input 
          type="range" 
          id="sizeRange" 
          v-model.number="size"
          min="100" 
          max="300" 
          step="10"
          @change="generateQRCode"
        >
      </div>
    </div>
    
    <div class="qr-preview" :style="{ backgroundColor: bgColor }">
      <canvas ref="qrCanvas"></canvas>
      <div v-if="!text" class="empty-state">
        <i class="fas fa-qrcode"></i>
        <p>Entrez du texte pour générer un QR code</p>
      </div>
    </div>
    
    <div class="qr-actions">
      <button @click="downloadQRCode" class="btn download-btn" :disabled="!text">
        <i class="fas fa-download"></i> Télécharger
      </button>
      <button @click="copyToClipboard" class="btn copy-btn" :disabled="!text">
        <i class="fas fa-copy"></i> Copier
      </button>
      <button @click="shareQRCode" class="btn share-btn" :disabled="!text || !canShare">
        <i class="fas fa-share-alt"></i> Partager
      </button>
    </div>
    
    <div v-if="showToast" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import { ref, onMounted } from 'vue'

export default {
  name: 'QrCodeGenerator',
  setup() {
    const text = ref('')
    const fgColor = ref('#000000')
    const bgColor = ref('#FFFFFF')
    const size = ref(200)
    const qrCanvas = ref(null)
    const showToast = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success')
    const canShare = ref(false)
    
    const showToastNotification = (message, type = 'success') => {
      toastMessage.value = message
      toastType.value = type
      showToast.value = true
      
      setTimeout(() => {
        showToast.value = false
      }, 3000)
    }
    
    const generateQRCode = () => {
      if (!text.value) return
      
      const canvas = qrCanvas.value
      const options = {
        width: size.value,
        margin: 1,
        color: {
          dark: fgColor.value,
          light: bgColor.value
        }
      }
      
      QRCode.toCanvas(canvas, text.value, options, (error) => {
        if (error) {
          console.error('Erreur lors de la génération du QR code:', error)
          showToastNotification('Erreur lors de la génération du QR Code', 'error')
        }
      })
      
      // Sauvegarde des paramètres
      localStorage.setItem('qrcode-text', text.value)
      localStorage.setItem('qrcode-fg-color', fgColor.value)
      localStorage.setItem('qrcode-bg-color', bgColor.value)
      localStorage.setItem('qrcode-size', size.value)
    }
    
    const downloadQRCode = () => {
      if (!text.value) return
      
      try {
        const canvas = qrCanvas.value
        const link = document.createElement('a')
        
        // Créer un nom de fichier basé sur le contenu
        let filename = 'qrcode'
        if (text.value.length <= 20) {
          filename = `qrcode-${text.value.replace(/[^a-z0-9]/gi, '-')}`
        } else {
          filename = `qrcode-${new Date().getTime()}`
        }
        
        link.download = `${filename}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        
        showToastNotification('QR Code téléchargé avec succès')
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error)
        showToastNotification('Erreur lors du téléchargement', 'error')
      }
    }
    
    const copyToClipboard = async () => {
      if (!text.value) return
      
      try {
        const canvas = qrCanvas.value
        canvas.toBlob(async (blob) => {
          try {
            if (navigator.clipboard && navigator.clipboard.write) {
              const clipboardItem = new ClipboardItem({ 'image/png': blob })
              await navigator.clipboard.write([clipboardItem])
              showToastNotification('QR Code copié dans le presse-papier')
            } else {
              // Fallback pour navigateurs plus anciens
              const dataURL = canvas.toDataURL('image/png')
              
              // Créer un élément textuel pour copier le lien data URL
              const textArea = document.createElement('textarea')
              textArea.value = dataURL
              document.body.appendChild(textArea)
              textArea.select()
              document.execCommand('copy')
              document.body.removeChild(textArea)
              
              showToastNotification('Lien du QR Code copié dans le presse-papier')
            }
          } catch (err) {
            console.error('Erreur lors de la copie:', err)
            showToastNotification('Impossible de copier le QR Code', 'error')
          }
        })
      } catch (err) {
        console.error('Erreur lors de la création du blob:', err)
        showToastNotification('Impossible de copier le QR Code', 'error')
      }
    }
    
    const shareQRCode = async () => {
      if (!text.value || !canShare.value) return
      
      try {
        const canvas = qrCanvas.value
        canvas.toBlob(async (blob) => {
          try {
            const file = new File([blob], 'qrcode.png', { type: 'image/png' })
            const shareData = {
              title: 'Partager QR Code',
              text: `QR Code pour: ${text.value.substring(0, 50)}${text.value.length > 50 ? '...' : ''}`,
              files: [file]
            }
            
            if (navigator.canShare && navigator.canShare(shareData)) {
              await navigator.share(shareData)
              showToastNotification('QR Code partagé avec succès')
            } else {
              // Fallback si Web Share API ne supporte pas les fichiers
              await navigator.share({
                title: 'Partager QR Code',
                text: `Voici mon QR Code pour: ${text.value.substring(0, 50)}${text.value.length > 50 ? '...' : ''}`
              })
              showToastNotification('Lien de partage envoyé')
            }
          } catch (err) {
            if (err.name !== 'AbortError') {  // Ignorer si l'utilisateur annule le partage
              console.error('Erreur lors du partage:', err)
              showToastNotification('Impossible de partager le QR Code', 'error')
            }
          }
        })
      } catch (err) {
        console.error('Erreur lors de la création du blob:', err)
        showToastNotification('Impossible de partager le QR Code', 'error')
      }
    }
    
    onMounted(() => {
      // Charger les paramètres sauvegardés
      text.value = localStorage.getItem('qrcode-text') || ''
      fgColor.value = localStorage.getItem('qrcode-fg-color') || '#000000'
      bgColor.value = localStorage.getItem('qrcode-bg-color') || '#FFFFFF'
      size.value = parseInt(localStorage.getItem('qrcode-size')) || 200
      
      // Vérifier si le navigateur supporte l'API Web Share
      canShare.value = !!navigator.share
      
      // Générer le QR code si du texte est déjà présent
      if (text.value) {
        setTimeout(() => {
          generateQRCode()
        }, 100)
      }
    })
    
    return {
      text,
      fgColor,
      bgColor,
      size,
      qrCanvas,
      showToast,
      toastMessage,
      toastType,
      canShare,
      generateQRCode,
      downloadQRCode,
      copyToClipboard,
      shareQRCode
    }
  }
}
</script>

<style scoped>
.qr-code-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--primary-color);
}

.qr-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--light-text);
}

.dark-mode label {
  color: var(--dark-text);
}

.text-input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--light-border);
  border-radius: 4px;
  min-height: 100px;
  font-family: inherit;
  resize: vertical;
  background-color: var(--light-surface);
  color: var(--light-text);
}

.dark-mode .text-input {
  background-color: var(--dark-surface);
  border-color: var(--dark-border);
  color: var(--dark-text);
}

.color-inputs {
  display: flex;
  gap: 20px;
}

.color-inputs > div {
  flex: 1;
}

input[type="color"] {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.qr-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  min-height: 300px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #94a3b8;
  text-align: center;
}

.empty-state i {
  font-size: 50px;
  margin-bottom: 10px;
}

.qr-actions {
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  color: white;
}

.download-btn {
  background-color: var(--primary-color);
}

.download-btn:hover:not(:disabled) {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

.copy-btn {
  background-color: #4b5563;
}

.copy-btn:hover:not(:disabled) {
  background-color: #374151;
  transform: translateY(-2px);
}

.share-btn {
  background-color: #10b981;
}

.share-btn:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 9999px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

@media (max-width: 768px) {
  .qr-actions {
    flex-direction: column;
  }
  
  .color-inputs {
    flex-direction: column;
    gap: 10px;
  }
}

.dark-mode .qr-preview {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}
</style>