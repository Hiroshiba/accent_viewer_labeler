<script setup lang="ts">
import { ref, watch } from "vue";
import AccentEditor from "../editor/AccentEditor.vue";
import { playbackController } from "../../services/playback/playback-controller";

const containerRef = ref<HTMLElement | null>(null);

watch(
  () => playbackController.highlightedMora,
  (moraIndex) => {
    if (moraIndex === "none") {
      return;
    }
    // 自動スクロールモードは設定UIが整うまで "none"（無効）
    // ステップ17でグローバル設定と統合する
    void moraIndex;
    void containerRef.value;
  },
);
</script>

<template>
  <div ref="containerRef" class="flex-1 overflow-auto">
    <AccentEditor />
  </div>
</template>
