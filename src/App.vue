<template>
  <div id="app">
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/qr-code">QR Code</RouterLink>
      <RouterLink to="/json-formatter">JSON Formatter</RouterLink>
      <RouterLink to="/text-case">Text Case</RouterLink>
      <RouterLink to="/markdown">Markdown</RouterLink>
      <RouterLink to="/image-base64">Image to Base64</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style>
nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #42b983;
  flex-wrap: wrap;
}
a {
  color: white;
  text-decoration: none;
}
a.router-link-exact-active {
  font-weight: bold;
}
</style>