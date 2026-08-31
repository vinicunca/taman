<script lang="ts" setup>
import type { StyleValue, VNode } from 'vue';
import type { AppPageProps } from './app-page.types';
import { computed } from 'vue';

defineOptions({
  name: 'AppPage',
});

const props = withDefaults(
  defineProps<AppPageProps>(),
  {
    autoContentHeight: false,
    heightOffset: 0,
    footerFixed: false,
  },
);

const slots = defineSlots<{
  default?: () => Array<VNode>;
  title?: () => Array<VNode>;
  description?: () => Array<VNode>;
  trailingHeader?: () => Array<VNode>;
  footer?: () => Array<VNode>;
}>();

const contentStyle = computed<StyleValue>(() => {
  if (!props.autoContentHeight) {
    return {};
  }

  return {
    '--page-content-height-offset': `${props.heightOffset}px`,
    // In auto-content-height mode the content region manages its own scrolling.
    // Size containment prevents the inner content's min-content height from
    // feeding back into the outer flex layout, which would clamp the content
    // region taller than the available space and push the layout footer below
    // the viewport.
    'contain': 'size',
    'marginBlockEnd': 'var(--page-content-height-offset)',
  };
});
</script>

<template>
  <div
    class="flex flex-col h-full min-h-0 relative"
    :class="{
      'overflow-hidden': props.autoContentHeight,
    }"
  >
    <div
      v-if="props.description || props.title || slots.description || slots.title || slots.trailingHeader"
      class="px-6 py-4 border-b border-border bg-background flex gap-4 items-end relative"
      :class="[
        headerClass,
      ]"
    >
      <div class="flex-auto min-w-0">
        <slot name="title">
          <div
            v-if="props.title"
            class="text-lg font-600 mb-2"
          >
            {{ props.title }}
          </div>
        </slot>

        <slot name="description">
          <p
            v-if="props.description"
            class="text-sm color-text-muted"
          >
            {{ props.description }}
          </p>
        </slot>
      </div>

      <div
        v-if="slots.trailingHeader"
        class="flex shrink-0 items-center"
      >
        <slot name="trailingHeader" />
      </div>
    </div>

    <div
      class="p-4 flex-1"
      :class="[
        {
          'min-h-0 overflow-y-auto': props.autoContentHeight,
        },
        props.contentClass,
      ]"
      :style="contentStyle"
    >
      <slot />
    </div>

    <div
      v-if="slots.footer"
      class="px-6 py-4 bg-background flex shrink-0 items-center"
      :class="[
        {
          'mt-auto': props.footerFixed,
        },
        footerClass,
      ]"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
