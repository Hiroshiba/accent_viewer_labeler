<script setup lang="ts">
import { ref } from "vue";

defineProps<{ msg: string }>();

const count = ref(0);
</script>

<template>
  <h1 class="text-3xl font-bold text-gray-900">{{ msg }}</h1>
  <div class="mt-4">
    <button
      type="button"
      class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      @click="count++"
    >
      count is {{ count }}
    </button>
  </div>
</template>
