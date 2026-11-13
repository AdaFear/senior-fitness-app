import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
  faUser,
  faHouse,
  faDumbbell,
  faRightFromBracket,
  faGear,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

const pinia = createPinia()
const app = createApp(App)

library.add(faUser, faHouse, faGithub, faDumbbell, faRightFromBracket, faGear)
app.use(router).use(pinia).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
