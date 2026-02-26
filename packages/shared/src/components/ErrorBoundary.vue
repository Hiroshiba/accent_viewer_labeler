<script setup lang="ts">
import { onErrorCaptured, ref } from "vue";

const error = ref<Error | "none">("none");

onErrorCaptured((err: unknown) => {
  if (err instanceof Error) {
    error.value = err;
  } else {
    error.value = new Error(String(err));
  }
  console.error(err);
  return false;
});
</script>

<template>
  <div
    v-if="error !== 'none'"
    class="flex h-screen items-center justify-center bg-red-50 p-8"
  >
    <div class="max-w-lg text-center">
      <h1 class="text-xl font-bold text-red-800">エラーが発生しました</h1>
      <p class="mt-4 text-sm text-red-600">{{ error.message }}</p>
    </div>
  </div>
  <slot v-else />
</template>
