<script setup lang="ts">
import { ArrowDownTrayIcon, PlayIcon, StopIcon } from "@heroicons/vue/20/solid";
import { computed } from "vue";
import { UnreachableError } from "../../errors";
import { actionService } from "../../services/action/action-service";
import { appStateService } from "../../services/app-state/app-state-service";
import { exportService } from "../../services/export/export-service";
import { playbackController } from "../../services/playback/playback-controller";
import { settingsService } from "../../services/settings/settings-service";
import type { PlaybackSpeed } from "../../types/settings";
import { playbackSpeedValues } from "../../types/settings";

const editingState = computed(() => {
  const state = appStateService.state;
  if (state.phase !== "editing") {
    throw new UnreachableError(state as never);
  }
  return state;
});

const hasAudio = computed(() => {
  const { project, currentStem } = editingState.value;
  return project.audioFiles[currentStem] != null;
});

const isPlaying = computed(() => playbackController.isPlaying);

const currentSpeed = computed(() => settingsService.current.playbackSpeed);

function togglePlayStop(): void {
  if (!hasAudio.value) {
    return;
  }
  if (isPlaying.value) {
    playbackController.stop();
    return;
  }
  actionService.execute("editor:space");
}

function setSpeed(speed: PlaybackSpeed): void {
  settingsService.setPlaybackSpeed(speed);
}

function onExportCurrent(): void {
  void exportService.exportCurrent();
}
</script>

<template>
  <div
    class="flex h-12 shrink-0 items-center gap-3 border-b border-gray-200 px-4"
  >
    <button
      type="button"
      :disabled="!hasAudio"
      class="flex items-center justify-center rounded p-1 disabled:cursor-not-allowed disabled:opacity-40"
      :class="hasAudio ? 'hover:bg-gray-100' : ''"
      @click="togglePlayStop"
    >
      <StopIcon v-if="isPlaying" class="h-5 w-5 text-gray-700" />
      <PlayIcon v-else class="h-5 w-5 text-gray-700" />
    </button>
    <div class="flex gap-1">
      <button
        v-for="speed in playbackSpeedValues"
        :key="speed"
        type="button"
        :disabled="!hasAudio"
        :class="
          currentSpeed === speed
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40'
        "
        class="rounded border border-gray-300 px-2 py-0.5 text-xs disabled:cursor-not-allowed"
        @click="setSpeed(speed)"
      >
        {{ speed }}x
      </button>
    </div>
    <div class="ml-auto">
      <button
        type="button"
        title="書き出し"
        class="flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
        @click="onExportCurrent"
      >
        <ArrowDownTrayIcon class="h-3.5 w-3.5" />
        書き出し
      </button>
    </div>
  </div>
</template>
