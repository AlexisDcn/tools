<template>
  <div class="tool-container">
    <div class="tool-header">
      <h2>Générateur de QR Code</h2>
      <p class="tool-description">
        Créez facilement des QR codes personnalisés pour partager des liens, des coordonnées ou d'autres informations.
      </p>
    </div>

    <div class="qr-form">
      <InputField
        v-model="text"
        label="Texte ou URL"
        placeholder="Entrez le texte ou l'URL à encoder"
        clearable
      />

      <div class="options-grid">
        <div class="option-group">
          <label class="field-label">Couleur</label>
          <div class="color-pickers">
            <div class="color-picker">
              <span>Fond:</span>
              <input type="color" v-model="bgColor" />
            </div>
            <div class="color-picker">
              <span>QR:</span>
              <input type="color" v-model="fgColor" />
            </div>
          </div>
        </div>

        <div class="option-group">
          <label class="field-label">Taille</label>
          <div class="size-slider">
            <input 
              type="range" 
              v-model="size" 
              min="100" 
              max="400" 
              step="10"
            />
            <span>{{ size }}px</span>
          </div>
        </div>

        <div class="option-group">
          <label class="field-label">Style</label>
          <select v-model="style">
            <option value="squares">Carrés</option>
            <option value="dots">Points</option>
          </select>
        </div>

        <div class="option-group">
          <label class="field-label">Qualité</label>
          <select v-model="errorCorrectionLevel">
            <option value="L">Basse (7%)</option>
            <option value="M">Moyenne (15%)</option>
            <option value="Q">Haute (25%)</option>
            <option value="H">Maximale (30%)</option>
          </select>
        </div>
      </div>

      <div class="tool-actions">
        <Button @click="generateQRCode" :loading="isGenerating">Générer</Button>
        <Button variant="secondary" @click="resetOptions">Réinitialiser</Button>
      </div>

      <div v-if="qrCode" class="qr-result">
        <img :src="qrCode" alt="QR Code généré" :width="size" :height="size" />
        
        <div class="result-actions">
          <Button variant="primary" @click="downloadQR">
            Télécharger
          </Button>
          <Button variant="secondary" @click="copyQRImage" :disabled="!canCopyImage">
            {{ copied ? 'Copié !' : 'Copier' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import QRCode from 'qrcode'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useClipboard } from '../composables/useClipboard'
import Button from '../components/common/Button.vue'
import InputField from '../components/common/InputField.vue'

// État local avec persistance
const { value: text } = useLocalStorage('qrcode-text', '')
const { value: bgColor } = useLocalStorage('qrcode-bg-color', '#FFFFFF')
const { value: fgColor } = useLocalStorage('qrcode-fg-color', '#000000')
const { value: size } = useLocalStorage('qrcode-size', 200)
const { value: style } = useLocalStorage('qrcode-style', 'squares')
const { value: errorCorrectionLevel } = useLocalStorage('qrcode-error-level', 'M')

const qrCode = ref(null)
const isGenerating = ref(false)
const canCopyImage = ref(false)

// Utilisation du composable de presse-papiers
const { copy, copied } = useClipboard()

// Vérifier la prise en charge du presse-papiers avancé
onMounted(() => {
  canCopyImage.value = 'ClipboardItem' in window && 
                       navigator.clipboard && 
                       typeof navigator.clipboard.write === 'function'
})

// Options QR code
const qrOptions = computed(() => {
  return {
    errorCorrectionLevel: errorCorrectionLevel.value,
    margin: 4,
    color: {
      dark: fgColor.value,
      light: bgColor.value
    },
    width: size.value,
    type: 'image/png'
  }
})

// Générer le QR code
const generateQRCode = async () => {
  if (!text.value) return
  
  isGenerating.value = true
  
  try {
    // Déterminer la forme des points en fonction du style
    let rendererOpts = {}
    if (style.value === 'dots') {
      rendererOpts = {
        type: 'svg',
        rendererOpts: {
          quality: 1,
          ...qrOptions.value,
          shape: 'circle'
        }
      }
    }
    
    qrCode.value = await QRCode.toDataURL(text.value, {
      ...qrOptions.value,
      ...rendererOpts
    })
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error)
    alert('Erreur lors de la génération du QR code. Veuillez réessayer.')
  } finally {
    isGenerating.value = false
  }
}

// Télécharger le QR code
const downloadQR = () => {
  if (!qrCode.value) return
  
  const link = document.createElement('a')
  const filename = `qrcode-${Date.now()}.png`
  
  link.href = qrCode.value
  link.download = filename
  link.click()
}

// Copier le QR code dans le presse-papiers
const copyQRImage = async () => {
  if (!qrCode.value || !canCopyImage.value) return
  
  try {
    // Convertir la base64 en blob
    const response = await fetch(qrCode.value)
    const blob = await response.blob()
    
    // Copier l'image dans le presse-papiers
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ])
    
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (error) {
    console.error('Erreur lors de la copie du QR code:', error)
    alert('Impossible de copier l'image. Veuillez télécharger le QR code.')
  }
}

// Réinitialiser les options
const resetOptions = () => {
  text.value = ''
  bgColor.value = '#FFFFFF'
  fgColor.value = '#000000'
  size.value = 200
  style.value = 'squares'
  errorCorrectionLevel.value = 'M'
  qrCode.value = null
}

// Générer automatiquement si du texte est déjà présent
onMounted(() => {
  if (text.value) {
    generateQRCode()
  }
})
</script>

<style scoped>
.qr-form {
  max-width: 700px;
  margin: 0 auto;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.option-group {
  margin-bottom: 1rem;
}

.color-pickers {
  display: flex;
  gap: 1rem;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-picker input[type="color"] {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.size-slider {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.size-slider input[type="range"] {
  flex: 1;
}

select {
  width: 100%;
  padding: 0.5rem;
  border-radius: var(--border-radius-md);
  border: var(--border-width) solid var(--bg-tertiary);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.qr-result {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.result-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
}
</style>