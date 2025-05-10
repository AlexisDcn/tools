<template>
  <div class="markdown-preview">
    <h2>Markdown Previewer</h2>
    <textarea v-model="markdown" placeholder="Write Markdown here" rows="10" cols="60"></textarea>
    <div class="preview" v-html="compiledMarkdown"></div>
  </div>
</template>

<script>
import { marked } from 'marked'

export default {
  data() {
    return {
      markdown: ''
    };
  },
  computed: {
    compiledMarkdown() {
      return marked(this.markdown);
    }
  }
};
</script>

<style scoped>
.markdown-preview {
  padding: 20px;
  text-align: center;
}
textarea {
  width: 80%;
  padding: 10px;
  font-family: monospace;
}
.preview {
  margin-top: 20px;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 8px;
  text-align: left;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}
</style>
