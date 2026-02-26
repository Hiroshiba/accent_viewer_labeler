<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";

const props = defineProps<{
  open: boolean;
  title: string;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <Dialog :open="props.open" @close="emit('close')">
    <div class="fixed inset-0 bg-black/40" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <DialogTitle class="text-base font-semibold text-gray-900">
          {{ props.title }}
        </DialogTitle>
        <div class="mt-4">
          <slot name="body" />
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <slot name="footer" />
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
