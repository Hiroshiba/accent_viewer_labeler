<script setup lang="ts">
import { computed } from "vue";
import { dialogService } from "../../services/dialog/dialog-service";

const stack = computed(() => dialogService.stack);
</script>

<template>
  <component
    :is="descriptor.component"
    v-for="descriptor in stack"
    :key="descriptor.id"
    v-bind="descriptor.props"
    :open="true"
    @resolve="(value: unknown) => dialogService.close(descriptor.id, value)"
  />
</template>
