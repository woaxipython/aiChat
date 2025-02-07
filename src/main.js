import { createApp } from "vue"; 
import App from "./App.vue"; 
import "./main.css"; 
import "../style/css/tabler.min.css";
import tooltip  from '../app/tooltipDirective.js'


const app = createApp(App);
app.directive('tooltip', tooltip);
app.mount('#app');