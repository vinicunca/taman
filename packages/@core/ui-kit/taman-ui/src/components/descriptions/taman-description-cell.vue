<script lang="ts" setup>
import type { CSSProperties, HTMLAttributes } from 'vue';
import type { TamanDescriptionsRenderNode, TamanDescriptionsSize } from './taman-description.types';
import { isNumber } from '@taman-core/shared/utils';
import { computed } from 'vue';
import { TamanRenderContent } from '../render-content';

interface Props {
  /** Whether to show border */
  bordered?: boolean;
  /** Whether to show colon (only works for non-bordered mode) */
  colon?: boolean;
  /** Content */
  content?: TamanDescriptionsRenderNode | null;
  /** Content style */
  contentStyle?: CSSProperties;
  /** Single item custom class name */
  itemClass?: HTMLAttributes['class'];
  /** Label */
  label?: TamanDescriptionsRenderNode | null;
  /** Label style */
  labelStyle?: CSSProperties;
  /** Size */
  size?: TamanDescriptionsSize;
  /** Number of columns */
  span?: number;
  /** Render label th or td */
  tag: 'td' | 'th';
  /** Cell type */
  type: 'content' | 'item' | 'label';
}

const props = withDefaults(
  defineProps<Props>(),
  {
    bordered: false,
    colon: true,
    content: null,
    contentStyle: undefined,
    itemClass: undefined,
    label: null,
    labelStyle: undefined,
    size: 'middle',
    span: 1,
  },
);

const BORDERED_PADDING: Record<TamanDescriptionsSize, string> = {
  large: 'px-6 py-4',
  middle: 'px-4 py-2.5',
  small: 'px-3 py-2',
};

const PLAIN_PADDING: Record<TamanDescriptionsSize, string> = {
  large: 'pb-6',
  middle: 'pb-4',
  small: 'pb-2',
};

// Colon is added via a pseudo-element to avoid concatenation issues when the label is a render function
const COLON_CLASS = 'after:content-[\':\']';

const hasLabel = computed(
  () => props.label !== null && props.label !== undefined,
);
const hasContent = computed(
  () => props.content !== null && props.content !== undefined,
);

// Numbers 0 are treated as falsy by VbenRenderContent and hidden; convert to string to ensure display;
// Also convert null to undefined to match the content type of VbenRenderContent
const displayLabel = computed(() => {
  if (props.label === null || props.label === undefined) {
    return undefined;
  }

  return isNumber(props.label) ? String(props.label) : props.label;
});

const displayContent = computed(() => {
  if (props.content === null || props.content === undefined) {
    return undefined;
  }
  return isNumber(props.content)
    ? String(props.content)
    : props.content;
});

const cellClass = computed(() => {
  if (props.bordered) {
    return [
      'border border-border align-top break-words',
      BORDERED_PADDING[props.size],
      props.type === 'label'
        ? 'bg-background-muted/50 text-start font-normal color-text'
        : 'color-text',
      props.itemClass,
    ];
  }

  return [
    'align-top',
    PLAIN_PADDING[props.size],
    props.itemClass,
  ];
});

const labelClass = computed(() =>
  [
    'mr-2 shrink-0 color-text-muted',
    props.colon && COLON_CLASS,
  ],
);
</script>

<template>
  <component
    :is="props.tag"
    :class="cellClass"
    :colspan="props.span"
  >
    <!-- Border mode: Each cell holds only a label or content -->
    <template v-if="props.bordered">
      <span
        v-if="hasLabel"
        :style="props.labelStyle"
      >
        <TamanRenderContent :content="displayLabel" />
      </span>
      <span
        v-if="hasContent"
        :style="props.contentStyle"
      >
        <TamanRenderContent :content="displayContent" />
      </span>
    </template>

    <!-- Non-bordered mode: label + content container -->
    <div
      v-else
      class="flex"
    >
      <span
        v-if="hasLabel"
        :class="labelClass"
        :style="props.labelStyle"
      >
        <TamanRenderContent :content="displayLabel" />
      </span>
      <span
        v-if="hasContent"
        class="color-text break-words"
        :style="props.contentStyle"
      >
        <TamanRenderContent :content="displayContent" />
      </span>
    </div>
  </component>
</template>
