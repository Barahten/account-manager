import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './assets/css/style.css'  // <- импорт Tailwind

document.title = 'Управление учетными записями'

createApp(App).use(createPinia()).mount('#app')
