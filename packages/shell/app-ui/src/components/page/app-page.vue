<script lang="ts" setup>
import type { StyleValue, VNode } from 'vue';
import { CSS_VARIABLE_LAYOUT_CONTENT_HEIGHT } from '@taman-core/shared/constants';
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';

defineOptions({
  name: 'AppPage',
});

const {
  title,
  description,
  contentClass,
  autoContentHeight = false,
  headerClass,
  footerClass,
  heightOffset = 0,
  footerFixed = false,
} = defineProps<AppPageProps>();

const slots = defineSlots<{
  default?: () => Array<VNode>;
  title?: () => Array<VNode>;
  description?: () => Array<VNode>;
  trailingHeader?: () => Array<VNode>;
  footer?: () => Array<VNode>;
}>();

interface AppPageProps {
  title?: string;
  description?: string;
  contentClass?: string;
  /**
   * Adapt height to visible content area
   */
  autoContentHeight?: boolean;
  headerClass?: string;
  footerClass?: string;
  /**
   * Custom height offset value (in pixels) to adjust content area sizing
   * when used with autoContentHeight
   * @default 0
   */
  heightOffset?: number;
  /**
   * Whether the footer is position: fixed.
   * When true, footer height is excluded from content height calculation.
   * @default false
   */
  footerFixed?: boolean;
}

const headerHeight = ref(0);
const footerHeight = ref(0);
const shouldAutoHeight = ref(false);

const contentStyle = computed<StyleValue>(() => {
  if (autoContentHeight) {
    return {
      height: `calc(var(${CSS_VARIABLE_LAYOUT_CONTENT_HEIGHT}) - ${headerHeight.value}px - ${footerHeight.value}px - ${typeof heightOffset === 'number' ? `${heightOffset}px` : heightOffset})`,
      overflowY: shouldAutoHeight.value ? 'auto' : 'unset',
    };
  }

  return {};
});

const headerRef = useTemplateRef('headerRef');
const footerRef = useTemplateRef('footerRef');

async function calcContentHeight() {
  if (!autoContentHeight) {
    return;
  }
  shouldAutoHeight.value = false;
  await nextTick();
  headerHeight.value = headerRef.value?.offsetHeight || 0;

  footerHeight.value = footerFixed ? 0 : footerRef.value?.offsetHeight || 0;

  setTimeout(() => {
    shouldAutoHeight.value = true;
  }, 30);
}

onMounted(() => {
  calcContentHeight();
});
</script>

<template>
  <div class="flex flex-col min-h-full relative">
    <div
      v-if="description || title || slots.description || slots.title || slots.trailingHeader"
      ref="headerRef"
      class="px-6 py-4 border-b border-border bg-background flex items-end relative"
      :class="[
        headerClass,
      ]"
    >
      <div class="flex-auto">
        <slot name="title">
          <div
            v-if="title"
            class="text-lg font-600 mb-2 flex"
          >
            {{ title }}
          </div>
        </slot>

        <slot name="description">
          <p
            v-if="description"
            class="text-sm color-text-muted"
          >
            {{ description }}
          </p>
        </slot>
      </div>

      <div v-if="slots.trailingHeader">
        <slot name="trailingHeader" />
      </div>
    </div>

    <div
      class="p-4 h-full"
      :class="[
        contentClass,
      ]"
      :style="contentStyle"
    >
      <slot />
    </div>

    <div
      v-if="slots.footer"
      ref="footerRef"
      class="px-6 py-4 bg-background flex items-center"
      :class="[
        footerClass,
      ]"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
