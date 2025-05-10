<template>
  <div class="home">
    <h1>Welcome to My Tools Collection</h1>
    <p>Here are some handy tools to make life easier.</p>
    <div class="tools-list">
      <div class="tool-card">
        <h2>QR Code Generator</h2>
        <QrCodeGenerator />
      </div>
      <div class="tool-card">
        <h2>JSON Formatter</h2>
        <JsonFormatter />
      </div>
    </div>
  </div>
</template>

<script>
import QrCodeGenerator from './components/QrCodeGenerator.vue';
import JsonFormatter from './components/JsonFormatter.vue';

export default {
  components: {
    QrCodeGenerator,
    JsonFormatter,
  },
};
</script>


<style scoped>
.home {
  text-align: center;
  padding: 20px;
}

.tools-list {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
}

.tool-card {
  width: 45%;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2.5rem;
  color: #333;
}

h2 {
  color: #42b983;
}
</style>
