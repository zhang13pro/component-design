import { createApp } from "vue";
import App from "./App.vue";
import ElContainer from "./components/container";
import ElButton from "./components/button";

const app = createApp(App);
app.use(ElContainer).use(ElButton).mount("#app");
