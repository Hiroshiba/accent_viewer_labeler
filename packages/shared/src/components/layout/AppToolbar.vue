<script setup lang="ts">
import {
  ArchiveBoxArrowDownIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  FolderOpenIcon,
  SpeakerWaveIcon,
} from "@heroicons/vue/20/solid";
import { computed } from "vue";
import { actionService } from "../../services/action/action-service";
import { appStateService } from "../../services/app-state/app-state-service";
import {
  showAudioGlobDialog,
  showSettingsDialog,
} from "../../services/dialog/dialog-helpers";
import { exportService } from "../../services/export/export-service";
import { projectSaveService } from "../../services/project-save/project-save-service";
import { toastService } from "../../services/toast/toast-service";

const title = computed(() =>
  projectSaveService.isDirty
    ? "アクセント可視化・修正ツール *"
    : "アクセント可視化・修正ツール",
);

const isEditing = computed(() => appStateService.state.phase === "editing");

function onSave(): void {
  actionService.execute("save-project");
}

function onLoad(): void {
  actionService.execute("load-project");
}

function onExportBulk(): void {
  void exportService.exportBulk();
}

function onSettings(): void {
  void showSettingsDialog();
}

async function onAudioGlob(): Promise<void> {
  const result = await showAudioGlobDialog();
  if (result === "cancelled") {
    return;
  }
  appStateService.setAudioFiles(result.globAudio, result.audioFiles);
  if (result.unmatchedCount > 0) {
    toastService.show(
      `音声なし: ${String(result.unmatchedCount)} 件`,
      "info",
      3000,
    );
  }
}
</script>

<template>
  <header
    class="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4"
  >
    <span class="text-sm font-semibold text-gray-800">{{ title }}</span>
    <div class="flex items-center gap-1">
      <button
        type="button"
        :disabled="!isEditing"
        title="保存 (Ctrl+S)"
        class="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        @click="onSave"
      >
        <ArrowDownTrayIcon class="h-4 w-4" />
        保存
      </button>
      <button
        type="button"
        :disabled="!isEditing"
        title="読み込む (Ctrl+O)"
        class="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        @click="onLoad"
      >
        <FolderOpenIcon class="h-4 w-4" />
        読み込む
      </button>
      <button
        type="button"
        :disabled="!isEditing"
        title="一括書き出し"
        class="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        @click="onExportBulk"
      >
        <ArchiveBoxArrowDownIcon class="h-4 w-4" />
        一括書き出し
      </button>
      <button
        type="button"
        :disabled="!isEditing"
        title="音声ファイルの設定"
        class="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        @click="onAudioGlob"
      >
        <SpeakerWaveIcon class="h-4 w-4" />
        音声
      </button>
      <button
        type="button"
        title="設定"
        class="flex items-center rounded p-1.5 text-gray-600 hover:bg-gray-200"
        @click="onSettings"
      >
        <Cog6ToothIcon class="h-4 w-4" />
      </button>
    </div>
  </header>
</template>
