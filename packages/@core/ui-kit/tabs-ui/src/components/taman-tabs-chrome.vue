<script setup lang="ts">
import type { TamanTabDefinition } from '@taman-core/typings';
import type { TabConfig, TabsProps } from '../tabs.types';
import { TamanIcon } from '@taman-core/taman-ui';
import { computed } from 'vue';

interface Props extends TabsProps {}

defineOptions({
  name: 'TamanTabsChrome',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<Props>(),
  {
    contentClass: 'taman-tabs-content',
    contextMenus: () => [],
    gap: 7,
    tabs: () => [],
  },
);

const emits = defineEmits<{
  close: [string];
  unpin: [TamanTabDefinition];
}>();
const active = defineModel<string>('active');

const style = computed(() => {
  const { gap } = props;
  return {
    '--gap': `${gap}px`,
  };
});

const tabItems = computed(() => {
  return props.tabs.map((tab) => {
    const { fullPath, meta, name, path, key } = tab || {};
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
</script>

<template>
  <div
    :class="contentClass"
    :style="style"
    class="tabs-chrome pr-6 flex h-full w-max overflow-y-hidden"
  >
    <TransitionGroup name="slide-left">
      <div
        v-for="(tab, idx) in tabItems"
        :key="tab.key"
        :class="[
          {
            'is-active': tab.key === active,
            'affix-tab': tab.affixTab,
          },
        ]"
        :data-active-tab="active"
        :data-index="idx"
        class="draggable group tabs-chrome__item flex h-full select-none items-center relative -mr-3 focus-visible:outline-none"
        data-tab-item="true"
        tabindex="0"
        @click="active = tab.key"
        @mousedown="onMouseDown($event, tab)"
      >
        <PContextMenu
          :items="props.contextMenus(tab)"
          :modal="false"
        >
          <div class="px-1 size-full relative">
            <!-- divider -->
            <div
              v-if="idx !== 0 && tab.key !== active"
              class="tabs-chrome__divider bg-border h-4 w-px translate-y-[-50%] transition-all left-(--gap) top-1/2 absolute z-0"
            />
            <!-- background -->
            <div
              class="tabs-chrome__background px-[calc(var(--gap)-1px)] py-0 size-full transition-opacity duration-150 absolute z-[-1]"
            >
              <div
                class="tabs-chrome__background-content rounded-tl-$gap rounded-tr-$gap h-full duration-150 group-[.is-active]:bg-primary/15 group-[.is-active]:dark:bg-background-accented"
              />
              <svg
                class="tabs-chrome__background-before transition-all-150 bottom-0 absolute fill-transparent -left-px group-[.is-active]:fill-primary/15 group-[.is-active]:dark:fill-accent"
                height="7"
                width="7"
              >
                <path d="M 0 7 A 7 7 0 0 0 7 0 L 7 7 Z" />
              </svg>
              <svg
                class="tabs-chrome__background-after transition-duration-150 bottom-0 absolute fill-transparent -right-px group-[.is-active]:fill-primary/15 group-[.is-active]:dark:fill-accent"
                height="7"
                width="7"
              >
                <path d="M 0 0 A 7 7 0 0 0 7 7 L 0 7 Z" />
              </svg>
            </div>

            <!-- extra -->
            <div
              class="tabs-chrome__extra size-4 translate-y-[-50%] right-[calc(var(--gap)+5px)] top-1/2 absolute z-3"
            >
              <!-- close-icon -->
              <button
                v-show="!tab.affixTab && tabItems.length > 1 && tab.closable"
                class="rounded-full flex-center size-4 transition-colors group-[.is-active]:text-primary hover:bg-overlay/30 group-[.is-active]:dark:text-accent-foreground"
                tabindex="-1"
                @click.stop="() => emits('close', tab.key)"
              >
                <TamanIcon
                  icon="lucide:x"
                  class="size-3"
                />
              </button>

              <button
                v-show="tab.affixTab && tabItems.length > 1 && tab.closable"
                class="rounded-full flex-center size-4.5 transition-colors group-[.is-active]:text-primary hover:bg-overlay/30 group-[.is-active]:dark:text-accent-foreground"
                tabindex="-1"
                @click.stop="() => emits('unpin', tab)"
              >
                <TamanIcon
                  icon="lucide:pin"
                  class="size-3.5"
                />
              </button>
            </div>

            <!-- tab-item-main -->
            <div
              class="tabs-chrome__item-main color-accent-foreground font-500 mx-[calc(var(--gap)*2)] my-0 pl-2 pr-4 rounded-tl-[5px] rounded-tr-[5px] flex h-full duration-150 items-center z-2 overflow-hidden group-[.is-active]:color-primary group-[.is-active]:dark:color-accent-foreground"
            >
              <TamanIcon
                v-if="showIcon"
                :icon="tab.icon"
                class="mr-1 flex size-4 items-center overflow-hidden group-hover:animate-[shrink_0.3s_ease-in-out]"
              />

              <span class="text-sm flex-1 whitespace-nowrap overflow-hidden">
                {{ tab.title }}
              </span>
            </div>
          </div>
        </PContextMenu>
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="postcss" scoped>
.tabs-chrome__item:not(.dragging) {
  @apply cursor-pointer;
}

.tabs-chrome__item:not(.dragging):not(.is-active):hover,
.tabs-chrome__item:not(.dragging):not(.is-active):focus-visible {
  + .tabs-chrome__item .tabs-chrome__divider,
  .tabs-chrome__divider {
    @apply opacity-0;
  }

  .tabs-chrome__background {
    @apply pb-0.5;
  }

  .tabs-chrome__background-content {
    @apply bg-background-accented mx-0.5 rounded-md;
  }
}

.tabs-chrome__item:not(.dragging).is-active {
  @apply z-2;
}

.tabs-chrome__item:not(.dragging).is-active
  + .tabs-chrome__item
  .tabs-chrome__divider {
  @apply pohon:opacity-0;
}
</style>
