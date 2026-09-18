import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

// Tailwind v4 entry + Brutalist design tokens + Lenis styles.
import './assets/css/main.css'

createApp(App).use(router).mount('#app')
