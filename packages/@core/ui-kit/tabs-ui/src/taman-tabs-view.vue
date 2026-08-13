<script setup lang="ts">
import type { TabsEmits, TabsProps } from './tabs.types';

import { useForwardPropsEmits } from '@taman-core/composables';
import { TamanScrollbar } from '@taman-core/taman-ui';
import { TamanTabs, TamanTabsChrome } from './components';
import { useTabsDrag } from './use-tabs-drag';
import { useTabsViewScroll } from './use-tabs-view-scroll';

interface Props extends TabsProps {}

defineOptions({
  name: 'TamanTabsView',
});

const props = withDefaults(
  defineProps<Props>(),
  {
    contentClass: 'taman-tabs-content',
    draggable: true,
    styleType: 'chrome',
    wheelable: true,
  },
);

const emit = defineEmits<TabsEmits>();

const forward = useForwardPropsEmits(props, emit);

const {
  handleScrollAt,
  handleWheel,
  // @ts-expect-error unused
  scrollbarRef,
  scrollDirection,
  scrollIsAtLeft,
  scrollIsAtRight,
  showScrollButton,
} = useTabsViewScroll(props);

function onWheel(e: WheelEvent) {
  if (props.wheelable) {
    handleWheel(e);
    e.stopPropagation();
    e.preventDefault();
  }
}

useTabsDrag(props, emit);
</script>

<template>
  <div class="flex flex-1 h-full overflow-hidden">
    <!-- Left scroll button -->
    <PButton
      v-show="showScrollButton"
      icon="lucide:chevrons-left"
      size="sm"
      variant="ghost"
      color="neutral"
      class="pohon:(p-2 border-r rounded-none)"
      :disabled="scrollIsAtLeft"
      @click="scrollDirection('left')"
    />

    <div
      :class="{
        'pt-0.75': styleType === 'chrome',
      }"
      class="flex-1 size-full overflow-hidden"
    >
      <TamanScrollbar
        ref="scrollbarRef"
        :shadow-bottom="false"
        :shadow-top="false"
        class="h-full"
        horizontal
        scroll-bar-class="z-10 hidden "
        shadow
        shadow-left
        shadow-right
        @scroll-at="handleScrollAt"
        @wheel="onWheel"
      >
        <TamanTabsChrome
          v-if="styleType === 'chrome'"
          v-bind="{ ...forward, ...$attrs, ...$props }"
        />

        <TamanTabs
          v-else
          v-bind="{ ...forward, ...$attrs, ...$props }"
        />
      </TamanScrollbar>
    </div>

    <!-- Right scroll button -->
    <PButton
      v-show="showScrollButton"
      icon="lucide:chevrons-right"
      size="sm"
      variant="ghost"
      color="neutral"
      class="pohon:(p-2 border-l rounded-none)"
      :disabled="scrollIsAtRight"
      @click="scrollDirection('right')"
    />
  </div>
</template>
