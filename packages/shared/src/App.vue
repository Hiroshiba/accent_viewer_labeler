<script setup lang="ts">
import { computed } from "vue";
import DialogHost from "./components/dialog/DialogHost.vue";
import ErrorBoundary from "./components/ErrorBoundary.vue";
import AppToolbar from "./components/layout/AppToolbar.vue";
import EditorPane from "./components/layout/EditorPane.vue";
import SampleListPane from "./components/layout/SampleListPane.vue";
import ToastHost from "./components/toast/ToastHost.vue";
import { appStateService } from "./services/app-state/app-state-service";

const phase = computed(() => appStateService.state.phase);
const loadingMessage = computed(() =>
  appStateService.state.phase === "loading"
    ? appStateService.state.message
    : "",
);
</script>

<template>
  <ErrorBoundary>
    <div class="flex h-screen flex-col bg-white text-gray-900">
      <template v-if="phase === 'editing'">
        <AppToolbar />
        <div class="flex min-h-0 flex-1">
          <SampleListPane />
          <EditorPane />
        </div>
      </template>
      <template v-else-if="phase === 'loading'">
        <div class="flex flex-1 items-center justify-center text-gray-500">
          {{ loadingMessage }}
        </div>
      </template>
      <template v-else>
        <div class="flex flex-1 items-center justify-center text-gray-500">
          プロジェクトを開いてください
        </div>
      </template>
    </div>
    <DialogHost />
    <ToastHost />
  </ErrorBoundary>
</template>
