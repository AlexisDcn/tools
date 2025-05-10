<template>
  <div class="image-base64">
    <h2>Image to Base64 Converter</h2>
    <input type="file" @change="convertImage" />
    <textarea v-if="base64" readonly rows="10" cols="60">{{ base64 }}</textarea>
  </div>
</template>

<script>
export default {
  data() {
    return {
      base64: ''
    };
  },
  methods: {
    convertImage(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.base64 = reader.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }
};
</script>

<style scoped>
.image-base64 {
  text-align: center;
  padding: 20px;
}
textarea {
  width: 80%;
  padding: 10px;
  font-family: monospace;
  margin-top: 10px;
}
</style>