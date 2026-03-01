<script setup lang="ts">
import { onMounted, ref } from "vue";
import { serializeProject } from "../../domain/project-save-load";
import { appStateService } from "../../services/app-state/app-state-service";
import { showNewProjectDialog } from "../../services/dialog/dialog-helpers";
import { getPersistenceService } from "../../services/persistence/persistence-service";
import { projectSaveService } from "../../services/project-save/project-save-service";
import { undoRedoService } from "../../services/undo-redo/undo-redo-service";

type WelcomeStatus = "checking" | "restoring" | "ready";

const status = ref<WelcomeStatus>("checking");

onMounted(async () => {
  const saved = await getPersistenceService().loadProject();
  if (saved === "none") {
    status.value = "ready";
    return;
  }
  status.value = "restoring";
  appStateService.setEditing(saved, saved.lastOpenStem);
  undoRedoService.clear();
  const json = serializeProject(saved, saved.lastOpenStem);
  projectSaveService.markSaved(json);
});

async function onNewProject(): Promise<void> {
  const result = await showNewProjectDialog();
  if (result === "cancelled") {
    return;
  }
  appStateService.setEditing(result, result.lastOpenStem);
  undoRedoService.clear();
  const json = serializeProject(result, result.lastOpenStem);
  projectSaveService.markSaved(json);
  await getPersistenceService().saveProject(result);
}

function onLoadProject(): void {
  void projectSaveService.load();
}
</script>

<template>
  <div class="flex flex-1 flex-col items-center justify-center gap-6">
    <h1 class="text-lg font-semibold text-gray-700">
      アクセント可視化・修正ツール
    </h1>
    <p v-if="status === 'checking'" class="text-sm text-gray-400">
      読み込み中…
    </p>
    <p v-else-if="status === 'restoring'" class="text-sm text-gray-500">
      プロジェクトを復元中…
    </p>
    <div v-else class="flex flex-col gap-3">
      <button
        type="button"
        class="rounded bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        @click="onNewProject"
      >
        新規プロジェクト作成
      </button>
      <button
        type="button"
        class="rounded bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        @click="onLoadProject"
      >
        プロジェクトを読み込む
      </button>
    </div>
  </div>
</template>
