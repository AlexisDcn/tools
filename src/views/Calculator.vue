<template>
  <div class="calculator-page">
    <div class="calculator">
      <div class="calculator-display">
        <div class="calculation">{{ calculation }}</div>
        <div class="result">{{ currentValue }}</div>
      </div>
      
      <div class="calculator-keypad">
        <div class="calculator-row">
          <button class="function-key" @click="clear">C</button>
          <button class="function-key" @click="clearEntry">CE</button>
          <button class="function-key" @click="percentage">%</button>
          <button class="operator-key" @click="setOperator('/')">/</button>
        </div>
        
        <div class="calculator-row">
          <button class="number-key" @click="appendNumber(7)">7</button>
          <button class="number-key" @click="appendNumber(8)">8</button>
          <button class="number-key" @click="appendNumber(9)">9</button>
          <button class="operator-key" @click="setOperator('*')">×</button>
        </div>
        
        <div class="calculator-row">
          <button class="number-key" @click="appendNumber(4)">4</button>
          <button class="number-key" @click="appendNumber(5)">5</button>
          <button class="number-key" @click="appendNumber(6)">6</button>
          <button class="operator-key" @click="setOperator('-')">-</button>
        </div>
        
        <div class="calculator-row">
          <button class="number-key" @click="appendNumber(1)">1</button>
          <button class="number-key" @click="appendNumber(2)">2</button>
          <button class="number-key" @click="appendNumber(3)">3</button>
          <button class="operator-key" @click="setOperator('+')">+</button>
        </div>
        
        <div class="calculator-row">
          <button class="number-key" @click="appendNumber(0)">0</button>
          <button class="number-key" @click="appendDecimal">.</button>
          <button class="number-key" @click="invertSign">+/-</button>
          <button class="equal-key" @click="calculate">=</button>
        </div>
      </div>
      
      <div class="calculator-history">
        <h3>Historique</h3>
        <div class="history-list">
          <div v-if="history.length === 0" class="empty-history">
            Pas d'historique
          </div>
          <div v-else 
               v-for="(item, index) in history" 
               :key="index" 
               class="history-item"
               @click="useHistoryItem(item)">
            <div class="history-calculation">{{ item.calculation }}</div>
            <div class="history-result">= {{ item.result }}</div>
          </div>
        </div>
        <button class="clear-history" @click="clearHistory" v-if="history.length > 0">
          <i class="fas fa-trash-alt"></i> Effacer l'historique
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Calculator',
  data() {
    return {
      currentValue: '0',
      previousValue: null,
      calculation: '',
      operator: null,
      waitingForOperand: false,
      history: []
    }
  },
  methods: {
    appendNumber(number) {
      if (this.waitingForOperand) {
        this.currentValue = String(number);
        this.waitingForOperand = false;
      } else {
        this.currentValue = this.currentValue === '0' ? String(number) : this.currentValue + number;
      }
    },
    
    appendDecimal() {
      if (this.waitingForOperand) {
        this.currentValue = '0.';
        this.waitingForOperand = false;
        return;
      }
      
      if (!this.currentValue.includes('.')) {
        this.currentValue += '.';
      }
    },
    
    invertSign() {
      const value = parseFloat(this.currentValue);
      this.currentValue = String(-value);
    },
    
    percentage() {
      const value = parseFloat(this.currentValue) / 100;
      this.currentValue = String(value);
    },
    
    setOperator(nextOperator) {
      const value = parseFloat(this.currentValue);
      
      if (this.operator && this.waitingForOperand) {
        this.operator = nextOperator;
        return;
      }
      
      if (this.previousValue === null) {
        this.previousValue = value;
      } else if (this.operator) {
        const result = this.performCalculation(this.previousValue, value, this.operator);
        this.currentValue = String(result);
        this.previousValue = result;
      }
      
      this.waitingForOperand = true;
      this.operator = nextOperator;
      this.calculation = `${this.previousValue} ${this.operator} `;
    },
    
    calculate() {
      const value = parseFloat(this.currentValue);
      
      if (this.previousValue === null || this.operator === null) {
        return;
      }
      
      const fullCalculation = `${this.previousValue} ${this.operator} ${value}`;
      const result = this.performCalculation(this.previousValue, value, this.operator);
      
      this.history.unshift({
        calculation: fullCalculation,
        result: result
      });
      
      this.currentValue = String(result);
      this.calculation = fullCalculation;
      this.previousValue = null;
      this.operator = null;
      this.waitingForOperand = true;
      
      // Limiter l'historique à 10 éléments
      if (this.history.length > 10) {
        this.history.pop();
      }
    },
    
    performCalculation(a, b, operator) {
      switch (operator) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 ? a / b : 'Error';
        default: return b;
      }
    },
    
    clear() {
      this.currentValue = '0';
      this.previousValue = null;
      this.calculation = '';
      this.operator = null;
      this.waitingForOperand = false;
    },
    
    clearEntry() {
      this.currentValue = '0';
    },
    
    clearHistory() {
      this.history = [];
    },
    
    useHistoryItem(item) {
      this.currentValue = String(item.result);
      this.previousValue = null;
      this.operator = null;
      this.waitingForOperand = false;
      this.calculation = '';
    }
  }
}
</script>

<style scoped>
.calculator-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  min-height: 100%;
}

.calculator {
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "display display"
    "keypad history";
}

.calculator-display {
  grid-area: display;
  background-color: #1e293b;
  color: white;
  padding: 1.5rem;
  text-align: right;
}

.calculation {
  font-size: 1rem;
  color: #94a3b8;
  height: 1.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result {
  font-size: 2.5rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
}

.calculator-keypad {
  grid-area: keypad;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.calculator-row {
  display: flex;
  gap: 0.5rem;
}

.calculator-row button {
  flex: 1;
  border: none;
  height: 60px;
  border-radius: 0.375rem;
  font-size: 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.number-key {
  background-color: #f8fafc;
  color: #334155;
}

.number-key:hover {
  background-color: #e2e8f0;
}

.function-key {
  background-color: #e2e8f0;
  color: #334155;
}

.function-key:hover {
  background-color: #cbd5e1;
}

.operator-key {
  background-color: #4361ee;
  color: white;
}

.operator-key:hover {
  background-color: #3f37c9;
}

.equal-key {
  background-color: #10b981;
  color: white;
}

.equal-key:hover {
  background-color: #059669;
}

.calculator-history {
  grid-area: history;
  background-color: #f8fafc;
  border-left: 1px solid #e2e8f0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.calculator-history h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #334155;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  padding: 0.75rem;
  border-radius: 0.375rem;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  background-color: #f1f5f9;
  transform: translateY(-2px);
}

.history-calculation {
  color: #64748b;
  font-size: 0.875rem;
}

.history-result {
  font-weight: 600;
  color: #334155;
}

.empty-history {
  color: #94a3b8;
  text-align: center;
  padding: 2rem 0;
  font-style: italic;
}

.clear-history {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.clear-history:hover {
  background-color: #dc2626;
}

@media (max-width: 768px) {
  .calculator {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      "display"
      "keypad"
      "history";
  }
  
  .calculator-history {
    border-left: none;
    border-top: 1px solid #e2e8f0;
    max-height: 300px;
  }
}
</style>