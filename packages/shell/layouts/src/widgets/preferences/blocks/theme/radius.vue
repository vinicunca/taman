<script setup lang="ts">
defineOptions({
  name: 'PreferenceColorMode',
});

const modelValue = defineModel<string | undefined>('themeRadius', {
  default: '0.5',
});

const items = [
  { label: '0', value: '0' },
  { label: '0.25', value: '0.25' },
  { label: '0.5', value: '0.5' },
  { label: '0.75', value: '0.75' },
  { label: '1', value: '1' },
];
</script>

<template>
  <ToggleGroup
    v-model="modelValue"
    class="gap-2"
    size="sm"
    type="single"
    variant="outline"
  >
    <template
      v-for="item in items"
      :key="item.value"
    >
      <ToggleGroupItem
        :value="item.value"
        class="rounded-sm h-7 w-16 data-[state=on]:text-primary-foreground data-[state=on]:bg-primary"
      >
        {{ item.label }}
      </ToggleGroupItem>
    </template>
  </ToggleGroup>
</template>
