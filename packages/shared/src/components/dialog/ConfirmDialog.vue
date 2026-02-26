<script setup lang="ts">
import AppDialog from "./AppDialog.vue";

const props = defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}>();

const emit = defineEmits<{
  resolve: [value: boolean];
}>();
</script>

<template>
  <AppDialog
    :open="props.open"
    :title="props.title"
    @close="emit('resolve', false)"
  >
    <template #body>
      <p class="text-sm text-gray-600">{{ props.message }}</p>
    </template>
    <template #footer>
      <button
        type="button"
        class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        @click="emit('resolve', true)"
      >
        {{ props.confirmLabel }}
      </button>
      <button
        type="button"
        class="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        @click="emit('resolve', false)"
      >
        {{ props.cancelLabel }}
      </button>
    </template>
  </AppDialog>
</template>
