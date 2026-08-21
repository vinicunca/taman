import type { SortableOptions } from 'sortablejs';
import type Sortable from 'sortablejs';

export function useSortable<T extends HTMLElement>(
  sortableContainer: T,
  options: SortableOptions = {},
) {
  async function initializeSortable() {
    const Sortable = await import(
      // @ts-expect-error - This is a dynamic import
      'sortablejs/modular/sortable.complete.esm.js',
    );

    const sortable = Sortable?.default?.create?.(sortableContainer, {
      animation: 300,
      delay: 400,
      delayOnTouchOnly: true,
      ...options,
    });

    return sortable as Sortable;
  }

  return {
    initializeSortable,
  };
}

export type { Sortable };
