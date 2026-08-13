<script setup lang="ts">
import type { CSSProperties } from 'vue';

import type { DescriptionsRenderNode, DescriptionsSize } from './types';

import { computed } from 'vue';

import { cn } from '@taman-core/shared/utils';

import { VbenRenderContent } from '../render-content';

interface Props {
  /** Whether bordered mode */
  bordered?: boolean;
  /** Whether to show colon (plain mode only) */
  colon?: boolean;
  /** Content */
  content?: DescriptionsRenderNode | null;
  /** Content style */
  contentStyle?: CSSProperties;
  /** Per-item custom class */
  itemClass?: string;
  /** Label */
  label?: DescriptionsRenderNode | null;
  /** Label style */
  labelStyle?: CSSProperties;
  /** Size */
  size?: DescriptionsSize;
  /** Column span */
  span?: number;
  /** Render as th or td */
  tag: 'td' | 'th';
  /** Cell type */
  type: 'content' | 'item' | 'label';
}

const props = withDefaults(defineProps<Props>(), {
  bordered: false,
  colon: true,
  content: null,
  contentStyle: undefined,
  itemClass: undefined,
  label: null,
  labelStyle: undefined,
  size: 'middle',
  span: 1,
});

const BORDERED_PADDING: Record<DescriptionsSize, string> = {
  large: 'px-6 py-4',
  middle: 'px-4 py-2.5',
  small: 'px-3 py-2',
};

const PLAIN_PADDING: Record<DescriptionsSize, string> = {
  large: 'pb-6',
  middle: 'pb-4',
  small: 'pb-2',
};

// Append colon via pseudo-element so render-function labels can still work
const COLON_CLASS = "after:content-[':']";

const hasLabel = computed(
  () => props.label !== null && props.label !== undefined,
);
const hasContent = computed(
  () => props.content !== null && props.content !== undefined,
);

// VbenRenderContent treats 0 as falsy; stringify so 0 still displays.
// Normalize null to undefined to match VbenRenderContent content type.
const displayLabel = computed(() => {
  if (props.label === null || props.label === undefined) return undefined;
  return typeof props.label === 'number' ? String(props.label) : props.label;
});
const displayContent = computed(() => {
  if (props.content === null || props.content === undefined) return undefined;
  return typeof props.content === 'number'
    ? String(props.content)
    : props.content;
});

const cellClass = computed(() => {
  if (props.bordered) {
    return cn(
      'border border-border align-top break-words',
      BORDERED_PADDING[props.size],
      props.type === 'label'
        ? 'bg-muted/50 text-start font-normal color-text'
        : 'color-text',
      props.itemClass,
    );
  }
  return cn('align-top', PLAIN_PADDING[props.size], props.itemClass);
});

const labelClass = computed(() =>
  cn('mr-2 shrink-0 text-muted-foreground', props.colon && COLON_CLASS),
);
</script>

<template>
  <component :is="tag" :class="cellClass" :colspan="span">
    <!-- Bordered mode: each cell holds label or content only -->
    <template v-if="bordered">
      <span v-if="hasLabel" :style="labelStyle">
        <VbenRenderContent :content="displayLabel" />
      </span>
      <span v-if="hasContent" :style="contentStyle">
        <VbenRenderContent :content="displayContent" />
      </span>
    </template>

    <!-- Plain mode: label + content container -->
    <div v-else class="flex">
      <span v-if="hasLabel" :class="labelClass" :style="labelStyle">
        <VbenRenderContent :content="displayLabel" />
      </span>
      <span
        v-if="hasContent"
        class="break-words color-text"
        :style="contentStyle"
      >
        <VbenRenderContent :content="displayContent" />
      </span>
    </div>
  </component>
</template>
