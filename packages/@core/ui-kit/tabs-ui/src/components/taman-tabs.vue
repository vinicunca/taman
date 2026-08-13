<script lang="ts" setup>
import type { TamanTabDefinition } from '@taman-core/typings';
import type { TabConfig, TabsProps } from '../tabs.types';
import { TamanIcon } from '@taman-core/taman-ui';
import { computed } from 'vue';

interface Props extends TabsProps {}

defineOptions({
  name: 'TamanTabs',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<Props>(),
  {
    contentClass: 'taman-tabs-content',
    contextMenus: () => [],
    tabs: () => [],
  },
);

const emits = defineEmits<{
  close: [string];
  unpin: [TamanTabDefinition];
}>();

const active = defineModel<string>('active');

const tabItems = computed(() => {
  return props.tabs.map((tab) => {
    const { fullPath, meta, name, path, key } = tab ?? {};
    const { affixTab, icon, newTabTitle, tabClosable, title } = meta || {};

    return {
      affixTab: !!affixTab,
      closable: Reflect.has(meta, 'tabClosable') ? !!tabClosable : true,
      fullPath,
      icon: icon as string,
      key,
      meta,
      name,
      path,
      title: (newTabTitle || title || name) as string,
    } as TabConfig;
  });
});

function onMouseDown(event: MouseEvent, tab: TabConfig) {
  if (
    event.button === 1
    && tab.closable
    && !tab.affixTab
    && tabItems.value.length > 1
    && props.middleClickToClose
  ) {
    event.preventDefault();
    event.stopPropagation();
    emits('close', tab.key);
  }
}

const styleTypeClasses = computed(() => {
  const typeClasses: Record<NonNullable<TabsProps['styleType']>, string> = {
    brisk: 'h-full after:(content-empty absolute bottom-0 left-0 w-full h-[1.5px] bg-primary scale-x-0 transition-[transform]-300 ease-out origin-left) hover:after:scale-x-100 [&.is-active]:after:scale-x-100 [&:not(:first-child)]:border-l last:border-r last:border-r border-border',
    card: 'h-[calc(100%-6px)] rounded-md ml-2 border border-border transition-all',
    plain: 'h-full [&:not(:first-child)]:border-l last:border-r border-border',
    chrome: '',
  };

  return typeClasses[props.styleType || 'plain'] ?? '';
});
</script>

<template>
  <div
    :class="props.contentClass"
    class="pr-6 h-full w-max items-center relative overflow-hidden flex!"
  >
    <TransitionGroup name="slide-left">
      <div
        v-for="(tab, idx) in tabItems"
        :key="tab.key"
        class="group flex select-none items-center relative [&:not(.is-active)]:hover:bg-background-accented"
        :class="[
          {
            'is-active bg-primary/15 dark:bg-background-accented': tab.key === active,
            'draggable': !tab.affixTab,
            'affix-tab': tab.affixTab,
          },
          styleTypeClasses,
        ]"
        :data-index="idx"
        data-tab-item="true"
        role="button"
        @click="active = tab.key"
        @mousedown="onMouseDown($event, tab)"
      >
        <PContextMenu>
          <div class="flex size-full items-center relative">
            <!-- extra -->
            <div
              class="translate-y-[-50%] right-1.5 top-1/2 absolute z-3 overflow-hidden"
            >
              <!-- close-icon -->
              <button
                v-show="!tab.affixTab && tabItems.length > 1 && tab.closable"
                class="mt-1px rounded-full flex-center size-4 transition-colors group-[.is-active]:text-primary hover:bg-overlay/30 group-[.is-active]:dark:text-accent-foreground"
                @click.stop="() => emits('close', tab.key)"
              >
                <TamanIcon
                  icon="lucide:x"
                  class="size-3"
                />
              </button>

              <button
                v-show="tab.affixTab && tabItems.length > 1 && tab.closable"
                class="mt-1px rounded-full flex-center size-4.5 transition-colors group-[.is-active]:text-primary hover:bg-overlay/30 group-[.is-active]:dark:text-accent-foreground"
                @click.stop="() => emits('unpin', tab)"
              >
                <TamanIcon
                  bicon="lucide:pin"
                  class="size-3.5"
                />
              </button>
            </div>

            <!-- tab-item-main -->
            <div
              class="color-accent-foreground font-500 mx-3 mr-4 pr-3 rounded-tl-[5px] rounded-tr-[5px] flex h-full transition-all-300 items-center overflow-hidden group-[.is-active]:color-primary group-[.is-active]:dark:color-accent-foreground"
            >
              <TamanIcon
                v-if="showIcon"
                :icon="tab.icon"
                class="mr-2 flex size-4 items-center overflow-hidden group-hover:animate-[shrink_0.3s_ease-in-out]"
              />

              <span class="text-sm font-medium flex-1 whitespace-nowrap overflow-hidden">
                {{ tab.title }}
              </span>
            </div>
          </div>
        </PContextMenu>
      </div>
    </TransitionGroup>
  </div>
</template>
