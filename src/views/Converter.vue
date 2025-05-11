<template>
  <div class="converter">
    <h1>Convertisseur universel</h1>
    
    <div class="converter-card">
      <div class="converter-header">
        <div class="converter-tabs">
          <button 
            v-for="(tab, index) in tabs" 
            :key="index"
            :class="['tab-button', { active: activeTab === index }]"
            @click="activeTab = index"
          >
            <i :class="tab.icon"></i>
            {{ tab.name }}
          </button>
        </div>
      </div>
      
      <div class="converter-body">
        <!-- Longueur -->
        <div v-if="activeTab === 0" class="converter-content">
          <div class="converter-inputs">
            <div class="input-group">
              <label for="length-from">De</label>
              <input 
                type="number" 
                id="length-from" 
                v-model="lengthFrom" 
                @input="convert('length')"
                placeholder="Entrez une valeur"
              />
              <select v-model="lengthFromUnit" @change="convert('length')">
                <option value="m">Mètres</option>
                <option value="km">Kilomètres</option>
                <option value="cm">Centimètres</option>
                <option value="mm">Millimètres</option>
                <option value="ft">Pieds</option>
                <option value="in">Pouces</option>
              </select>
            </div>
            <div class="swap-button" @click="swap('length')">
              <i class="fas fa-exchange-alt"></i>
            </div>
            <div class="input-group">
              <label for="length-to">Vers</label>
              <input 
                type="number" 
                id="length-to" 
                v-model="lengthTo" 
                @input="convertReverse('length')"
                placeholder="Résultat"
              />
              <select v-model="lengthToUnit" @change="convert('length')">
                <option value="m">Mètres</option>
                <option value="km">Kilomètres</option>
                <option value="cm">Centimètres</option>
                <option value="mm">Millimètres</option>
                <option value="ft">Pieds</option>
                <option value="in">Pouces</option>
              </select>
            </div>
          </div>
          <div class="conversion-formula">
            <p>{{ lengthFormula }}</p>
          </div>
        </div>
        
        <!-- Poids -->
        <div v-if="activeTab === 1" class="converter-content">
          <div class="converter-inputs">
            <div class="input-group">
              <label for="weight-from">De</label>
              <input 
                type="number" 
                id="weight-from" 
                v-model="weightFrom" 
                @input="convert('weight')"
                placeholder="Entrez une valeur"
              />
              <select v-model="weightFromUnit" @change="convert('weight')">
                <option value="kg">Kilogrammes</option>
                <option value="g">Grammes</option>
                <option value="lb">Livres</option>
                <option value="oz">Onces</option>
              </select>
            </div>
            <div class="swap-button" @click="swap('weight')">
              <i class="fas fa-exchange-alt"></i>
            </div>
            <div class="input-group">
              <label for="weight-to">Vers</label>
              <input 
                type="number" 
                id="weight-to" 
                v-model="weightTo" 
                @input="convertReverse('weight')"
                placeholder="Résultat"
              />
              <select v-model="weightToUnit" @change="convert('weight')">
                <option value="kg">Kilogrammes</option>
                <option value="g">Grammes</option>
                <option value="lb">Livres</option>
                <option value="oz">Onces</option>
              </select>
            </div>
          </div>
          <div class="conversion-formula">
            <p>{{ weightFormula }}</p>
          </div>
        </div>
        
        <!-- Température -->
        <div v-if="activeTab === 2" class="converter-content">
          <div class="converter-inputs">
            <div class="input-group">
              <label for="temp-from">De</label>
              <input 
                type="number" 
                id="temp-from" 
                v-model="tempFrom" 
                @input="convert('temp')"
                placeholder="Entrez une valeur"
              />
              <select v-model="tempFromUnit" @change="convert('temp')">
                <option value="C">Celsius</option>
                <option value="F">Fahrenheit</option>
                <option value="K">Kelvin</option>
              </select>
            </div>
            <div class="swap-button" @click="swap('temp')">
              <i class="fas fa-exchange-alt"></i>
            </div>
            <div class="input-group">
              <label for="temp-to">Vers</label>
              <input 
                type="number" 
                id="temp-to" 
                v-model="tempTo" 
                @input="convertReverse('temp')"
                placeholder="Résultat"
              />
              <select v-model="tempToUnit" @change="convert('temp')">
                <option value="C">Celsius</option>
                <option value="F">Fahrenheit</option>
                <option value="K">Kelvin</option>
              </select>
            </div>
          </div>
          <div class="conversion-formula">
            <p>{{ tempFormula }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Converter',
  data() {
    return {
      activeTab: 0,
      tabs: [
        { name: 'Longueur', icon: 'fas fa-ruler' },
        { name: 'Poids', icon: 'fas fa-weight-hanging' },
        { name: 'Température', icon: 'fas fa-thermometer-half' }
      ],
      
      // Longueur
      lengthFrom: '',
      lengthTo: '',
      lengthFromUnit: 'm',
      lengthToUnit: 'cm',
      lengthFormula: '',
      
      // Poids
      weightFrom: '',
      weightTo: '',
      weightFromUnit: 'kg',
      weightToUnit: 'g',
      weightFormula: '',
      
      // Température
      tempFrom: '',
      tempTo: '',
      tempFromUnit: 'C',
      tempToUnit: 'F',
      tempFormula: ''
    }
  },
  methods: {
    convert(type) {
      if (type === 'length') {
        if (!this.lengthFrom) {
          this.lengthTo = '';
          this.lengthFormula = '';
          return;
        }
        
        // Conversion vers mètres (unité de base)
        let valueInMeters;
        switch(this.lengthFromUnit) {
          case 'm': valueInMeters = parseFloat(this.lengthFrom); break;
          case 'km': valueInMeters = parseFloat(this.lengthFrom) * 1000; break;
          case 'cm': valueInMeters = parseFloat(this.lengthFrom) / 100; break;
          case 'mm': valueInMeters = parseFloat(this.lengthFrom) / 1000; break;
          case 'ft': valueInMeters = parseFloat(this.lengthFrom) * 0.3048; break;
          case 'in': valueInMeters = parseFloat(this.lengthFrom) * 0.0254; break;
        }
        
        // Conversion de mètres vers l'unité cible
        switch(this.lengthToUnit) {
          case 'm': this.lengthTo = valueInMeters; break;
          case 'km': this.lengthTo = valueInMeters / 1000; break;
          case 'cm': this.lengthTo = valueInMeters * 100; break;
          case 'mm': this.lengthTo = valueInMeters * 1000; break;
          case 'ft': this.lengthTo = valueInMeters / 0.3048; break;
          case 'in': this.lengthTo = valueInMeters / 0.0254; break;
        }
        
        this.lengthTo = parseFloat(this.lengthTo).toFixed(4);
        this.lengthFormula = `${this.lengthFrom} ${this.lengthFromUnit} = ${this.lengthTo} ${this.lengthToUnit}`;
      }
      
      else if (type === 'weight') {
        if (!this.weightFrom) {
          this.weightTo = '';
          this.weightFormula = '';
          return;
        }
        
        // Conversion vers kg (unité de base)
        let valueInKg;
        switch(this.weightFromUnit) {
          case 'kg': valueInKg = parseFloat(this.weightFrom); break;
          case 'g': valueInKg = parseFloat(this.weightFrom) / 1000; break;
          case 'lb': valueInKg = parseFloat(this.weightFrom) * 0.453592; break;
          case 'oz': valueInKg = parseFloat(this.weightFrom) * 0.0283495; break;
        }
        
        // Conversion de kg vers l'unité cible
        switch(this.weightToUnit) {
          case 'kg': this.weightTo = valueInKg; break;
          case 'g': this.weightTo = valueInKg * 1000; break;
          case 'lb': this.weightTo = valueInKg / 0.453592; break;
          case 'oz': this.weightTo = valueInKg / 0.0283495; break;
        }
        
        this.weightTo = parseFloat(this.weightTo).toFixed(4);
        this.weightFormula = `${this.weightFrom} ${this.weightFromUnit} = ${this.weightTo} ${this.weightToUnit}`;
      }
      
      else if (type === 'temp') {
        if (!this.tempFrom) {
          this.tempTo = '';
          this.tempFormula = '';
          return;
        }
        
        // Conversion vers Celsius (unité de base)
        let valueInCelsius;
        switch(this.tempFromUnit) {
          case 'C': valueInCelsius = parseFloat(this.tempFrom); break;
          case 'F': valueInCelsius = (parseFloat(this.tempFrom) - 32) * 5/9; break;
          case 'K': valueInCelsius = parseFloat(this.tempFrom) - 273.15; break;
        }
        
        // Conversion de Celsius vers l'unité cible
        switch(this.tempToUnit) {
          case 'C': this.tempTo = valueInCelsius; break;
          case 'F': this.tempTo = (valueInCelsius * 9/5) + 32; break;
          case 'K': this.tempTo = valueInCelsius + 273.15; break;
        }
        
        this.tempTo = parseFloat(this.tempTo).toFixed(2);
        this.tempFormula = `${this.tempFrom} ${this.tempFromUnit} = ${this.tempTo} ${this.tempToUnit}`;
      }
    },
    
    convertReverse(type) {
      if (type === 'length') {
        // Inverser la direction de la conversion
        const temp = this.lengthFrom;
        this.lengthFrom = this.lengthTo;
        this.lengthTo = temp;
        this.convert(type);
        // Rétablir les valeurs initiales
        const tempVal = this.lengthTo;
        this.lengthTo = this.lengthFrom;
        this.lengthFrom = tempVal;
      }
      else if (type === 'weight') {
        const temp = this.weightFrom;
        this.weightFrom = this.weightTo;
        this.weightTo = temp;
        this.convert(type);
        const tempVal = this.weightTo;
        this.weightTo = this.weightFrom;
        this.weightFrom = tempVal;
      }
      else if (type === 'temp') {
        const temp = this.tempFrom;
        this.tempFrom = this.tempTo;
        this.tempTo = temp;
        this.convert(type);
        const tempVal = this.tempTo;
        this.tempTo = this.tempFrom;
        this.tempFrom = tempVal;
      }
    },
    
    swap(type) {
      if (type === 'length') {
        const tempUnit = this.lengthFromUnit;
        this.lengthFromUnit = this.lengthToUnit;
        this.lengthToUnit = tempUnit;
        this.convert('length');
      }
      else if (type === 'weight') {
        const tempUnit = this.weightFromUnit;
        this.weightFromUnit = this.weightToUnit;
        this.weightToUnit = tempUnit;
        this.convert('weight');
      }
      else if (type === 'temp') {
        const tempUnit = this.tempFromUnit;
        this.tempFromUnit = this.tempToUnit;
        this.tempToUnit = tempUnit;
        this.convert('temp');
      }
    }
  }
}
</script>

<style scoped>
.converter {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  color: var(--primary-color);
  text-align: center;
}

.converter-card {
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.converter-header {
  background-color: #f8fafc;
  padding: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.converter-tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-button {
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-button i {
  font-size: 0.9em;
}

.tab-button:hover {
  background-color: rgba(67, 97, 238, 0.05);
}

.tab-button.active {
  background-color: rgba(67, 97, 238, 0.1);
  color: var(--primary-color);
}

.converter-body {
  padding: 2rem;
}

.converter-inputs {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 500;
}

.input-group input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  width: 100%;
}

.input-group select {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  background-color: #f8fafc;
}

.swap-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1.5rem;
}

.swap-button:hover {
  transform: scale(1.1);
  background-color: var(--secondary-color);
}

.conversion-formula {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 0.375rem;
  font-family: monospace;
  text-align: center;
  color: var(--primary-color);
  font-weight: 500;
}

@media (max-width: 768px) {
  .converter-inputs {
    flex-direction: column;
    gap: 1rem;
  }
  
  .swap-button {
    transform: rotate(90deg);
    margin: 0;
  }
}
</style>