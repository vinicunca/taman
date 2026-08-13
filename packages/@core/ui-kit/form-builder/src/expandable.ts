import type { Ref } from 'vue';

import { nextTick, ref } from 'vue';

export function computeRowMapping(
  rowHeights: number[],
  itemTops: number[],
  collapsedRows: number,
): Record<number, number> {
  const mapping: Record<number, number> = {};
  for (const top of itemTops) {
    let cumulative = 0;
    let row = 0;
    for (const [index, height] of rowHeights.entries()) {
      cumulative += height;
      if (top < cumulative) {
        row = index + 1;
        break;
      }
    }
    if (row === 0 || row > collapsedRows) {
      continue;
    }
    mapping[row] = (mapping[row] ?? 0) + 1;
  }
  return mapping;
}

export function computeKeepItemIndex(
  mapping: Record<number, number>,
  collapsedRows: number,
): number {
  let total = 0;
  for (let row = 1; row <= collapsedRows; row++) {
    total += mapping[row] ?? 0;
  }
  return total <= 1 ? 1 : total - 1;
}

export interface UseExpandableOptions {
  collapsedRows: () => number;
  enabled: () => boolean;
}

export function useExpandable(opts: UseExpandableOptions): {
  isCalculated: Ref<boolean>;
  keepItemIndex: Ref<number>;
  recalculate: () => Promise<void>;
  wrapperRef: Ref<HTMLElement | null>;
} {
  const wrapperRef = ref<HTMLElement | null>(null);
  const isCalculated = ref(false);
  const keepItemIndex = ref(1);

  async function recalculate(): Promise<void> {
    if (!opts.enabled()) {
      return;
    }
    await nextTick();
    const container = wrapperRef.value;
    if (!container) {
      return;
    }
    const rowHeights = window
      .getComputedStyle(container)
      .getPropertyValue('grid-template-rows')
      .split(' ')
      .map((height) => Number.parseFloat(height))
      .filter((height) => !Number.isNaN(height));
    const containerTop = container.getBoundingClientRect().top;
    const itemTops = [...container.children].map(
      (el) => el.getBoundingClientRect().top - containerTop,
    );
    const mapping = computeRowMapping(rowHeights, itemTops, opts.collapsedRows());
    keepItemIndex.value = computeKeepItemIndex(mapping, opts.collapsedRows());
    isCalculated.value = Object.keys(mapping).length > 0;
  }

  return { isCalculated, keepItemIndex, recalculate, wrapperRef };
}
