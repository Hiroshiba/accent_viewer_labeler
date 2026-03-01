<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AccentEditor from "../editor/AccentEditor.vue";
import { playbackController } from "../../services/playback/playback-controller";
import { settingsService } from "../../services/settings/settings-service";
import type { AutoScrollMode } from "../../types/settings";

const containerRef = ref<HTMLElement | null>(null);

const autoScrollMode = computed(() => settingsService.current.autoScrollMode);

function scrollToMora(
  container: HTMLElement,
  moraIndex: number,
  mode: AutoScrollMode,
): void {
  const moraEl = container.querySelector(
    `[data-mora-index="${String(moraIndex)}"]`,
  );
  if (moraEl == null) {
    return;
  }
  if (mode === "follow-offscreen") {
    moraEl.scrollIntoView({ block: "nearest", inline: "nearest" });
    return;
  }
  if (mode === "always-center") {
    moraEl.scrollIntoView({ block: "center", inline: "center" });
    return;
  }
}

watch(
  () => playbackController.highlightedMora,
  (moraIndex) => {
    if (moraIndex === "none") {
      return;
    }
    if (autoScrollMode.value === "none") {
      return;
    }
    const container = containerRef.value;
    if (container == null) {
      return;
    }
    scrollToMora(container, moraIndex, autoScrollMode.value);
  },
);
</script>

<template>
  <div ref="containerRef" class="flex-1 overflow-auto">
    <AccentEditor />
  </div>
</template>
