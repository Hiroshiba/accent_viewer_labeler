import { createApp } from "vue";
import "@accent-viewer/shared/style.css";
import App from "@accent-viewer/shared/App.vue";

createApp(App)
  .mount("#app")
  .$nextTick(() => {
    window.ipcRenderer.on("main-process-message", (_event, message) => {
      console.log(message);
    });
  });
