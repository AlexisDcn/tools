<template>
  <div class="json-formatter">
    <h2>JSON Formatter</h2>
    <textarea v-model="jsonInput" placeholder="Paste JSON here" rows="10" cols="50"></textarea>
    <button @click="formatJSON">Format JSON</button>
    <pre v-if="formattedJson">{{ formattedJson }}</pre>
  </div>
</template>

<script>
export default {
  data() {
    return {
      jsonInput: '',
      formattedJson: null,
    };
  },
  methods: {
    formatJSON() {
      try {
        this.formattedJson = JSON.stringify(JSON.parse(this.jsonInput), null, 2);
      } catch (e) {
        this.formattedJson = 'Invalid JSON';
      }
    },
  },
};
</script>

<style scoped>
.json-formatter {
  text-align: center;
  padding: 20px;
}

textarea {
  width: 80%;
  padding: 10px;
  font-family: monospace;
  margin-top: 10px;
}

button {
  padding: 10px 20px;
  margin-top: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #369c75;
}

pre {
  text-align: left;
  margin-top: 20px;
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 8px;
  width: 80%;
}
</style>
