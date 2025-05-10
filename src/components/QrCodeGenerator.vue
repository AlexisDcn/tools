<template>
  <div class="qr-code-generator">
    <h2>QR Code Generator</h2>
    <input v-model="text" type="text" placeholder="Enter text or URL" />
    <button @click="generateQRCode">Generate QR Code</button>
    <div v-if="qrCode">
      <img :src="qrCode" alt="Generated QR Code" />
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode';

export default {
  data() {
    return {
      text: '',
      qrCode: null,
    };
  },
  methods: {
    generateQRCode() {
      if (this.text) {
        QRCode.toDataURL(this.text, (err, url) => {
          if (err) {
            console.error(err);
            return;
          }
          this.qrCode = url;
        });
      }
    },
  },
};
</script>

<style scoped>
.qr-code-generator {
  text-align: center;
  padding: 20px;
}

input {
  padding: 10px;
  width: 60%;
  margin: 10px 0;
}

button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #369c75;
}

img {
  margin-top: 20px;
  max-width: 200px;
}
</style>
