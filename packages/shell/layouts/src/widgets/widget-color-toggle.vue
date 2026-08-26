<script lang="ts" setup>
import { TamanButtonIcon } from '@taman-core/taman-ui';
import { COLOR_PRESETS } from '@taman/preferences';
import PButton from 'pohon-ui/components/Button.vue';
import PCollapsible from 'pohon-ui/components/Collapsible.vue';
</script>

<template>
  <PCollapsible
    :ui="{
      root: 'flex flex-row-reverse',
      content: 'pohon:(data-[state=open]:animate-collapsible-left data-[state=closed]:animate-collapsible-right) flex',
    }"
  >
    <TamanButtonIcon
      icon="lucide:palette"
      :ui="{
        leadingIcon: 'color-primary',
      }"
    />

    <template #content>
      <div class="px-1.5 flex gap-2 items-center">
        <PButton
          v-for="preset in COLOR_PRESETS"
          :key="preset.color"
          class="pohon:(px-0.5 py-0.5 rounded-full)"
          variant="link"
          color="neutral"
          size="xs"
        >
          <div
            :style="{ backgroundColor: preset.color }"
            class="rounded-full flex-center size-5 transition-transform-280 relative hover:scale-110"
          />
        </PButton>
      </div>
    </template>
  </PCollapsible>
</template>
