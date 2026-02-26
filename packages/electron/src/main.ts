import { createApp } from "vue";
import "@accent-viewer/shared/style.css";
import App from "@accent-viewer/shared/App.vue";
import { mockConfig } from "@accent-viewer/shared/services/mock-config";
import { setFsAdapter } from "@accent-viewer/shared/services/fs-adapter/interface";
import { MockFsAdapter } from "@accent-viewer/shared/services/fs-adapter/mock";
import { setPersistenceService } from "@accent-viewer/shared/services/persistence/persistence-service";
import { MockPersistenceService } from "@accent-viewer/shared/services/persistence/mock";
import { actionService } from "@accent-viewer/shared/services/action/action-service";

if (mockConfig.isMockEnabled("fs")) {
  setFsAdapter(new MockFsAdapter());
}

if (mockConfig.isMockEnabled("persistence")) {
  setPersistenceService(new MockPersistenceService());
}

actionService.startListening();

createApp(App)
  .mount("#app")
  .$nextTick(() => {
    window.ipcRenderer.on("main-process-message", (_event, message) => {
      console.log(message);
    });
  });
