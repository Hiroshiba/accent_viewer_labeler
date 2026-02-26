<script setup lang="ts">
import DialogHost from "./components/dialog/DialogHost.vue";
import ErrorBoundary from "./components/ErrorBoundary.vue";
import AppToolbar from "./components/layout/AppToolbar.vue";
import EditorPane from "./components/layout/EditorPane.vue";
import SampleListPane from "./components/layout/SampleListPane.vue";
import ToastHost from "./components/toast/ToastHost.vue";
</script>

<template>
  <ErrorBoundary>
    <div class="flex h-screen flex-col bg-white text-gray-900">
      <AppToolbar />
      <div class="flex min-h-0 flex-1">
        <SampleListPane />
        <EditorPane />
      </div>
    </div>
    <DialogHost />
    <ToastHost />
  </ErrorBoundary>
</template>
