import { createApp } from 'vue'
import App from './app.vue'
import { router } from './router'

import 'vant/es/dialog/style'
import 'vant/es/notify/style'
import 'vant/es/toast/style'
import './global-style.css'

createApp(App).use(router).mount('#app')
