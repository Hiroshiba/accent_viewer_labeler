import { createApp } from "vue";
import "@accent-viewer/shared/style.css";
import App from "@accent-viewer/shared/App.vue";
import { mockConfig } from "@accent-viewer/shared/services/mock-config";
import { setFsAdapter } from "@accent-viewer/shared/services/fs-adapter/interface";
import { MockFsAdapter } from "@accent-viewer/shared/services/fs-adapter/mock";
import { BrowserFsAdapter } from "@accent-viewer/shared/services/fs-adapter/browser";
import {
  setPersistenceService,
  persistenceService,
} from "@accent-viewer/shared/services/persistence/persistence-service";
import { MockPersistenceService } from "@accent-viewer/shared/services/persistence/mock";
import { setAudioService } from "@accent-viewer/shared/services/audio/interface";
import { audioService } from "@accent-viewer/shared/services/audio/audio-service";
import { MockAudioService } from "@accent-viewer/shared/services/audio/mock";
import { actionService } from "@accent-viewer/shared/services/action/action-service";
import { appStateService } from "@accent-viewer/shared/services/app-state/app-state-service";
import { settingsService } from "@accent-viewer/shared/services/settings/settings-service";
import { projectSaveService } from "@accent-viewer/shared/services/project-save/project-save-service";

if (mockConfig.isMockEnabled("fs")) {
  setFsAdapter(new MockFsAdapter());
} else {
  setFsAdapter(new BrowserFsAdapter());
}

if (mockConfig.isMockEnabled("persistence")) {
  setPersistenceService(new MockPersistenceService());
} else {
  setPersistenceService(persistenceService);
}

if (mockConfig.isMockEnabled("audio")) {
  setAudioService(new MockAudioService());
} else {
  setAudioService(audioService);
}

void settingsService.load();

actionService.register({
  id: "save-project",
  label: "プロジェクトを保存",
  shortcut: "Ctrl+S",
  handler: () => {
    void projectSaveService.save();
  },
  enabled: () => appStateService.state.phase === "editing",
});

actionService.register({
  id: "load-project",
  label: "プロジェクトを読み込む",
  shortcut: "Ctrl+O",
  handler: () => {
    void projectSaveService.load();
  },
  enabled: () => appStateService.state.phase !== "loading",
});

actionService.register({
  id: "unmark-checked",
  label: "現在のサンプルを未確認に戻す",
  shortcut: "Ctrl+U",
  handler: () => {
    const state = appStateService.state;
    if (state.phase === "editing") {
      appStateService.unmarkChecked(state.currentStem);
    }
  },
  enabled: () => appStateService.state.phase === "editing",
});

actionService.startListening();

const app = createApp(App);
app.mount("#app");
