import { createApp } from 'vue';
import App from './App.vue';
// import './registerServiceWorker'
import router from './router';
import JsonViewer from 'vue3-json-viewer';
import "vue3-json-viewer/dist/index.css";

createApp(App).use(router).use(JsonViewer).mount('#app');
