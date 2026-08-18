<script setup lang="ts">
import type { CSSProperties } from 'vue';

import { TamanScrollbar } from '@taman-core/taman-ui';
import { useScrollLock } from '@vueuse/core';
import { computed, onUnmounted, shallowRef, useSlots, watchEffect } from 'vue';

import { useSidebarDrag } from '../composables/use-sidebar-drag';
import { SidebarCollapseButton, SidebarFixedButton } from './widgets';

interface Props {
  /**
   * Collapsed region height
   * @default 42
   */
  collapseHeight?: number;
  /**
   * Collapsed width
   * @default 48
   */
  collapseWidth?: number;
  /**
   * Whether hidden DOM is visible
   * @default true
   */
  domVisible?: boolean;
  /**
   * Extra panel width
   */
  extraWidth: number;
  /**
   * Pin the extra panel
   * @default false
   */
  fixedExtra?: boolean;
  /**
   * Header height
   */
  headerHeight: number;
  /**
   * Whether mixed sidebar mode is active
   * @default false
   */
  isSidebarMixed?: boolean;
  /**
   * Top margin
   * @default 60
   */
  marginTop?: number;
  /**
   * Mixed menu width
   * @default 80
   */
  mixedWidth?: number;
  /**
   * Top padding
   * @default 60
   */
  paddingTop?: number;
  /**
   * Whether the sidebar is visible
   * @default true
   */
  show?: boolean;
  /**
   * Show collapse button
   * @default true
   */
  showCollapseButton?: boolean;
  /**
   * Show pin button
   * @default true
   */
  showFixedButton?: boolean;
  /**
   * Theme
   */
  theme: string;
  /**
   * Sub-panel theme
   */
  themeSub: string;
  /**
   * Width
   */
  width: number;
  /**
   * zIndex
   * @default 0
   */
  zIndex?: number;
}

const props = withDefaults(
  defineProps<Props>(),
  {
    collapseHeight: 42,
    collapseWidth: 48,
    domVisible: true,
    fixedExtra: false,
    isSidebarMixed: false,
    marginTop: 0,
    mixedWidth: 70,
    paddingTop: 0,
    show: true,
    showCollapseButton: true,
    showFixedButton: true,
    zIndex: 0,
  },
);

const emits = defineEmits<{
  'leave': [];
  'update:width': [value: number];
}>();
const draggable = defineModel<boolean>('draggable');
const collapse = defineModel<boolean>('collapse');
const extraCollapse = defineModel<boolean>('extraCollapse');
const expandOnHovering = defineModel<boolean>('expandOnHovering');
const expandOnHover = defineModel<boolean>('expandOnHover');
const extraVisible = defineModel<boolean>('extraVisible');

const isLocked = useScrollLock(document.body);
const slots = useSlots();

const asideRef = shallowRef<HTMLElement | null>(null);
const dragBarRef = shallowRef<HTMLElement | null>(null);

const hiddenSideStyle = computed((): CSSProperties => calcMenuWidthStyle(true));

const style = computed((): CSSProperties => {
  const { isSidebarMixed, marginTop, paddingTop, zIndex } = props;

  return {
    '--scroll-shadow': 'var(--taman-color-sidebar)',
    ...calcMenuWidthStyle(false),
    'height': `calc(100% - ${marginTop}px)`,
    'marginTop': `${marginTop}px`,
    'paddingTop': `${paddingTop}px`,
    zIndex,
    ...(isSidebarMixed && extraVisible.value ? { transition: 'none' } : {}),
  };
});

const extraStyle = computed((): CSSProperties => {
  const { extraWidth, show, width, zIndex } = props;

  return {
    left: `${width}px`,
    width: extraVisible.value && show ? `${extraWidth}px` : 0,
    zIndex,
  };
});

const extraTitleStyle = computed((): CSSProperties => {
  const { headerHeight } = props;

  return {
    height: `${headerHeight - 1}px`,
  };
});

const contentWidthStyle = computed((): CSSProperties => {
  const { fixedExtra, isSidebarMixed, mixedWidth } = props;
  if (isSidebarMixed && fixedExtra) {
    return { width: `${mixedWidth}px` };
  }
  return {};
});

const contentStyle = computed((): CSSProperties => {
  const { collapseHeight, headerHeight } = props;

  return {
    height: `calc(100% - ${headerHeight + collapseHeight}px)`,
    paddingTop: '8px',
    ...contentWidthStyle.value,
  };
});

const headerStyle = computed((): CSSProperties => {
  const { headerHeight, isSidebarMixed } = props;

  return {
    ...(isSidebarMixed ? { display: 'flex', justifyContent: 'center' } : {}),
    height: `${headerHeight - 1}px`,
    ...contentWidthStyle.value,
  };
});

const extraContentStyle = computed((): CSSProperties => {
  const { collapseHeight, headerHeight } = props;
  return {
    height: `calc(100% - ${headerHeight + collapseHeight}px)`,
  };
});

const collapseStyle = computed((): CSSProperties => {
  return {
    height: `${props.collapseHeight}px`,
  };
});

watchEffect(() => {
  extraVisible.value = props.fixedExtra ? true : extraVisible.value;
});

function calcMenuWidthStyle(isHiddenDom: boolean): CSSProperties {
  const {
    collapseWidth,
    extraWidth,
    mixedWidth,
    fixedExtra,
    isSidebarMixed,
    show,
    width,
  } = props;

  let widthValue
    = width === 0
      ? '0px'
      : `${width + (isSidebarMixed && fixedExtra && extraVisible.value ? extraWidth : 0)}px`;

  if (isHiddenDom && expandOnHovering.value && !expandOnHover.value) {
    widthValue = isSidebarMixed ? `${mixedWidth}px` : `${collapseWidth}px`;
  }
  return {
    ...(widthValue === '0px' ? { overflow: 'hidden' } : {}),
    flex: `0 0 ${widthValue}`,
    marginLeft: show ? 0 : `-${widthValue}`,
    maxWidth: widthValue,
    minWidth: widthValue,
    width: widthValue,
  };
}

function handleMouseenter(e: MouseEvent) {
  if (e?.offsetX < 10) {
    return;
  }

  // No effect when not enabled or not collapsed
  if (expandOnHover.value) {
    return;
  }
  if (!expandOnHovering.value) {
    collapse.value = false;
  }
  if (props.isSidebarMixed) {
    isLocked.value = true;
  }
  expandOnHovering.value = true;
}

function handleMouseleave() {
  emits('leave');
  if (props.isSidebarMixed) {
    isLocked.value = false;
  }
  if (expandOnHover.value) {
    return;
  }

  expandOnHovering.value = false;
  collapse.value = true;
  extraVisible.value = false;
}

const { startDrag, endDrag } = useSidebarDrag();

function handleDragSidebar(e: MouseEvent) {
  const { isSidebarMixed, collapseWidth, width } = props;
  const minLimit = isSidebarMixed ? width + collapseWidth : collapseWidth;
  const maxLimit = isSidebarMixed ? width + 320 : 320;

  startDrag(
    e,
    {
      min: minLimit,
      max: maxLimit,
    },
    {
      target: asideRef.value,
      dragBar: dragBarRef.value,
    },
    (newWidth) => {
      if (isSidebarMixed) {
        emits('update:width', newWidth - width);
        extraCollapse.value = collapse.value
          = newWidth - width <= collapseWidth;
      } else {
        emits('update:width', newWidth);
        collapse.value = extraCollapse.value = newWidth <= collapseWidth;
      }
    },
  );
}

onUnmounted(() => {
  endDrag();
});
</script>

<template>
  <div
    v-if="domVisible"
    :class="theme"
    :style="hiddenSideStyle"
    class="h-full transition-all-150"
  />

  <aside
    ref="asideRef"
    :style="style"
    class="h-full transition-all-150 left-0 top-0 fixed"
    :class="theme"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
  >
    <div
      class="h-full"
      :class="[
        {
          'bg-background-sidebar-deep': isSidebarMixed,
          'border-r border-border bg-background-sidebar': !isSidebarMixed,
        },
      ]"
      :style="{ width: `${width}px` }"
    >
      <SidebarFixedButton
        v-if="!collapse && !isSidebarMixed && showFixedButton"
        v-model:expand-on-hover="expandOnHover"
      />

      <div
        v-if="slots.logo"
        :style="headerStyle"
      >
        <slot name="logo" />
      </div>

      <TamanScrollbar
        :style="contentStyle"
        shadow
        shadow-border
      >
        <slot />
      </TamanScrollbar>

      <div :style="collapseStyle" />

      <SidebarCollapseButton
        v-if="showCollapseButton && !isSidebarMixed"
        v-model:collapsed="collapse"
      />
    </div>

    <div
      v-if="isSidebarMixed"
      :class="[
        themeSub,
        {
          'border-l': extraVisible,
        },
      ]"
      :style="extraStyle"
      class="border-r border-border bg-background-sidebar h-full transition-all-200 top-0 fixed overflow-hidden"
    >
      <SidebarCollapseButton
        v-if="isSidebarMixed && expandOnHover"
        v-model:collapsed="extraCollapse"
      />

      <SidebarFixedButton
        v-if="!extraCollapse"
        v-model:expand-on-hover="expandOnHover"
      />

      <div
        v-if="!extraCollapse"
        :style="extraTitleStyle"
        class="pl-2"
      >
        <slot name="extra-title" />
      </div>

      <TamanScrollbar
        :style="extraContentStyle"
        class="py-2 border-border"
        shadow
        shadow-border
      >
        <slot name="extra" />
      </TamanScrollbar>
    </div>

    <div
      v-if="draggable"
      ref="dragBarRef"
      class="w-0.5 cursor-col-resize inset-y-0 absolute z-1000 hover:bg-primary -right-px"
      @mousedown="handleDragSidebar"
    />
  </aside>
</template>
