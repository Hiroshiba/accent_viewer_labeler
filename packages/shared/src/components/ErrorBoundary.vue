<script setup lang="ts">
import { onErrorCaptured } from "vue";

onErrorCaptured((err: unknown) => {
  console.error(err);
  return false;
});
</script>

<template>
  <slot />
</template>
