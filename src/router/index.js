import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import QrCodeGenerator from '../views/QrCodeGenerator.vue'
import JsonFormatter from '../views/JsonFormatter.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/qr-code', name: 'QR Code Generator', component: QrCodeGenerator },
  { path: '/json-formatter', name: 'JSON Formatter', component: JsonFormatter }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router