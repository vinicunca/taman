<script setup lang="ts">
import { useTamanDrawer } from '../../use-taman-drawer';

interface TypedDrawerData {
  id: number;
  mode: 'edit' | 'view';
}

const [, drawerApi] = useTamanDrawer<TypedDrawerData | null>();

defineExpose({ drawerApi });
</script>

<template>
  <div />
</template>
