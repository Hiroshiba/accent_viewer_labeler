<script setup lang="ts">
import { computed } from "vue";
import { toastService } from "../../services/toast/toast-service";

const items = computed(() => toastService.items);
</script>

<template>
  <Teleport to="body">
    <div class="fixed right-4 top-4 flex flex-col gap-2">
      <div
        v-for="item in items"
        :key="item.id"
        class="max-w-sm rounded-lg px-4 py-3 text-sm font-medium shadow-lg"
        :class="{
          'bg-green-700 text-white': item.level === 'success',
          'bg-red-700 text-white': item.level === 'error',
          'bg-yellow-600 text-white': item.level === 'warning',
          'bg-gray-800 text-white': item.level === 'info',
        }"
      >
        {{ item.message }}
      </div>
    </div>
  </Teleport>
</template>
