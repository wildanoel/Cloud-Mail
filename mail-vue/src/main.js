import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';
import { init } from '@/init/init.js';
import { createPinia } from 'pinia';
import piniaPersistedState from 'pinia-plugin-persistedstate';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'nprogress/nprogress.css';
import perm from "@/perm/perm.js";
const pinia = createPinia().use(piniaPersistedState)
import i18n from "@/i18n/index.js";
const app = createApp(App).use(pinia)
await init()
// Apply the persisted theme before mounting to avoid a light-mode flash.
const persistedUi = JSON.parse(localStorage.getItem('ui') || '{}')
const initialDark = persistedUi.dark ?? true
document.documentElement.classList.toggle('dark', initialDark)
document.getElementById('theme-color-meta')?.setAttribute('content', initialDark ? '#141414' : '#F1F1F1')
app.use(router).use(i18n).directive('perm',perm)
app.config.devtools = true;

app.mount('#app');
