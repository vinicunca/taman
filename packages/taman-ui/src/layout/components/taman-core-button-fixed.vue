<script setup lang="ts">
import PButton from 'pohon-ui/components/Button.vue';

const expandOnHover = defineModel<boolean>('expandOnHover');
const expandOnHovering = defineModel<boolean>('expandOnHovering');
const collapse = defineModel<boolean>('collapse');
const extraVisible = defineModel<boolean>('extraVisible');

function toggleFixed() {
  expandOnHover.value = !expandOnHover.value;
  collapse.value = false;
  extraVisible.value = true;
  if (!expandOnHover.value) {
    expandOnHovering.value = true;
  }
}
</script>

<template>
  <PButton
    class="bottom-2 right-3 absolute z-10"
    :icon="expandOnHover ? 'lucide-pin' : 'lucide-pin-off'"
    color="neutral"
    size="sm"
    variant="soft"
    @click.stop="toggleFixed"
  />
</template>
