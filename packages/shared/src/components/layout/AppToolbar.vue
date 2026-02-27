<script setup lang="ts">
import { computed } from "vue";
import { projectSaveService } from "../../services/project-save/project-save-service";

const title = computed(() =>
  projectSaveService.isDirty
    ? "アクセント可視化・修正ツール *"
    : "アクセント可視化・修正ツール",
);
</script>

<template>
  <header
    class="flex h-12 shrink-0 items-center border-b border-gray-200 bg-gray-50 px-4"
  >
    <span class="text-sm font-semibold text-gray-800">{{ title }}</span>
  </header>
</template>
