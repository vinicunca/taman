import type { Sortable } from '@taman-core/composables';
import type { EmitType } from '@taman-core/typings';

import type { TabsProps } from './tabs.types';

import { useIsMobile, useSortable } from '@taman-core/composables';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

// Drag may target a child node; ensure the dragged DOM is the tab element
function findParentElement(element: HTMLElement) {
  const parentCls = 'group';
  return element.classList.contains(parentCls)
    ? element
    : element.closest(`.${parentCls}`);
}

export function useTabsDrag(props: TabsProps, emit: EmitType) {
  const sortableInstance = ref<null | Sortable>(null);

  async function initTabsSortable() {
    await nextTick();

    const el = document.querySelectorAll(
      `.${props.contentClass}`,
    )?.[0] as HTMLElement;

    if (!el) {
      console.warn('Element not found for sortable initialization');
      return;
    }

    const resetElState = async () => {
      el.style.cursor = 'default';
      // el.classList.remove('dragging');
      el.querySelector('.draggable')?.classList.remove('dragging');
    };

    const { initializeSortable } = useSortable(el, {
      filter: (_evt, target: HTMLElement) => {
        const parent = findParentElement(target);
        const draggable = parent?.classList.contains('draggable');
        return !draggable || !props.draggable;
      },
      onEnd(evt) {
        const { newIndex, oldIndex } = evt;
        // const fromElement = evt.item;
        const { srcElement } = (evt as any).originalEvent;

        if (!srcElement) {
          resetElState();
          return;
        }

        const srcParent = findParentElement(srcElement);

        if (!srcParent) {
          resetElState();
          return;
        }

        if (!srcParent.classList.contains('draggable')) {
          resetElState();

          return;
        }

        if (
          oldIndex !== undefined
          && newIndex !== undefined
          && !Number.isNaN(oldIndex)
          && !Number.isNaN(newIndex)
          && oldIndex !== newIndex
        ) {
          emit('sortTabs', oldIndex, newIndex);
        }
        resetElState();
      },
      onMove(evt) {
        const parent = findParentElement(evt.related);
        if (parent?.classList.contains('draggable') && props.draggable) {
          const isCurrentAffix = evt.dragged.classList.contains('affix-tab');
          const isRelatedAffix = evt.related.classList.contains('affix-tab');
          // Disallow dragging between pinned and unpinned tabs
          return isCurrentAffix === isRelatedAffix;
        } else {
          return false;
        }
      },
      onStart: () => {
        el.style.cursor = 'grabbing';
        el.querySelector('.draggable')?.classList.add('dragging');
      },
    });

    sortableInstance.value = await initializeSortable();
  }

  async function init() {
    const { isMobile } = useIsMobile();

    // Tabs are not draggable on mobile
    if (isMobile.value) {
      return;
    }
    await nextTick();
    initTabsSortable();
  }

  onMounted(() => {
    init();
  });

  watch(
    () => props.styleType,
    () => {
      sortableInstance.value?.destroy();
      init();
    },
  );

  onUnmounted(() => {
    sortableInstance.value?.destroy();
  });
}
