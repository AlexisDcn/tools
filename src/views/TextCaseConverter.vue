<template>
  <div class="text-case">
    <h2>Text Case Converter</h2>
    <textarea v-model="text" placeholder="Enter text here" rows="6" cols="60"></textarea>
    <div class="buttons">
      <button @click="toUpperCase">UPPERCASE</button>
      <button @click="toLowerCase">lowercase</button>
      <button @click="toCamelCase">camelCase</button>
    </div>
    <p><strong>Result:</strong> {{ result }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: '',
      result: '',
    };
  },
  methods: {
    toUpperCase() {
      this.result = this.text.toUpperCase();
    },
    toLowerCase() {
      this.result = this.text.toLowerCase();
    },
    toCamelCase() {
      this.result = this.text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    },
  },
};
</script>

<style scoped>
.text-case {
  text-align: center;
  padding: 20px;
}
textarea {
  width: 80%;
  padding: 10px;
  font-family: monospace;
}
.buttons {
  margin: 10px 0;
}
button {
  margin: 0 5px;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #369c75;
}
</style>