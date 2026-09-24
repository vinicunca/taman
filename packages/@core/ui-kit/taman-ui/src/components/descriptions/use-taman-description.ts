import type { VNode } from 'vue';
import type { TamanDescriptionsBreakpoint, TamanDescriptionsColumn, TamanDescriptionsItemType, TamanInternalDescriptionsItem, TamanScreenMap } from './taman-description.types';
import { isNumber } from '@taman-core/shared/utils';
import { useBreakpoints } from '@vueuse/core';
import { computed, Fragment } from 'vue';

/** Default column count mapping */
export const DEFAULT_COLUMN_MAP: Record<TamanDescriptionsBreakpoint, number> = {
  lg: 3,
  md: 3,
  sm: 2,
  xl: 3,
  xs: 1,
  xxl: 3,
  xxxl: 4,
};

/** Breakpoints largest-first; matchScreen uses first match in this order */
const RESPONSIVE_ARRAY: Array<TamanDescriptionsBreakpoint> = [
  'xxxl',
  'xxl',
  'xl',
  'lg',
  'md',
  'sm',
  'xs',
];

/** Breakpoint pixel widths */
const BREAKPOINT_PX = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
  xxxl: 2000,
};

/**
 * From breakpoint config, return the first matched value (largest breakpoint first)
 */
export function matchScreen(
  screens: TamanScreenMap,
  screenSizes?: Partial<Record<TamanDescriptionsBreakpoint, number>>,
): number | undefined {
  if (!screenSizes) {
    return undefined;
  }
  for (const breakpoint of RESPONSIVE_ARRAY) {
    if (screens[breakpoint] && screenSizes[breakpoint] !== undefined) {
      return screenSizes[breakpoint];
    }
  }
  return undefined;
}

/**
 * Watch viewport width, return the current matched breakpoint set
 */
export function useScreens() {
  const breakpoints = useBreakpoints(BREAKPOINT_PX);
  return computed<TamanScreenMap>(() => ({
    lg: breakpoints.lg.value,
    md: breakpoints.md.value,
    sm: breakpoints.sm.value,
    xl: breakpoints.xl.value,
    xs: !breakpoints.sm.value,
    xxl: breakpoints.xxl.value,
    xxxl: breakpoints.xxxl.value,
  }));
}

/**
 * Calculate final column count: return fixed number directly, otherwise parse based on breakpoints
 */
export function resolveColumn(
  column: TamanDescriptionsColumn | undefined,
  screens: TamanScreenMap,
): number {
  if (isNumber(column)) {
    return column;
  }

  return matchScreen(screens, { ...DEFAULT_COLUMN_MAP, ...column }) ?? 3;
}

/**
 * Normalize items: parse span to number, 'filled' mark as filled
 */
export function normalizeItems(
  items: Array<TamanDescriptionsItemType>,
  screens: TamanScreenMap,
): Array<TamanInternalDescriptionsItem> {
  return items.map((item, index) => {
    const { span, ...rest } = item;
    if (span === 'filled') {
      return { ...rest, _index: index, filled: true };
    }

    return {
      ...rest,
      _index: index,
      span: isNumber(span) ? span : matchScreen(screens, span),
    };
  });
}

/**
 * Row packing algorithm: split list items into multiple rows based on column count and span,
 * and fill the last item of each row to fill the column count.
 * Fill the last item of each row to fill the column count.
 */
export function calcRows(
  items: Array<TamanInternalDescriptionsItem>,
  column: number,
): Array<Array<TamanInternalDescriptionsItem>> {
  let rows: Array<Array<TamanInternalDescriptionsItem>> = [];
  let tmpRow: Array<TamanInternalDescriptionsItem> = [];
  let count = 0;

  items.filter(Boolean).forEach((item) => {
    const { filled, ...rest } = item;
    // filled: fill the remaining of the current row and immediately switch to the next row
    if (filled) {
      tmpRow.push(rest);
      rows.push(tmpRow);
      tmpRow = [];
      count = 0;
      return;
    }

    const restSpan = column - count;
    count += item.span || 1;

    if (count >= column) {
      // When the count exceeds the column number, the span of the current item is converged to the remaining column number to avoid overflow
      tmpRow.push(count > column ? { ...rest, span: restSpan } : rest);
      rows.push(tmpRow);
      tmpRow = [];
      count = 0;
    } else {
      tmpRow.push(rest);
    }
  });

  if (tmpRow.length > 0) {
    rows.push(tmpRow);
  }

  // Fill: if the total span of a row is less than the column number, expand the last item
  rows = rows.map((row) => {
    const total = row.reduce((acc, item) => acc + (item.span || 1), 0);
    if (total < column) {
      const last = row[row.length - 1];
      if (last) {
        last.span = column - (total - (last.span || 1));
      }
    }
    return row;
  });

  return rows;
}

/** Mark the component type as TamanDescriptionsItem, Makes it easy to identify from the slot vnode. */
export const TAMAN_DESCRIPTIONS_ITEM_NAME = 'TamanDescriptionsItem';

function isItemVNode(node: VNode): boolean {
  const type = node.type as any;
  return (
    !!type
    && (type.__isDescriptionsItem === true || type.name === TAMAN_DESCRIPTIONS_ITEM_NAME)
  );
}

function flattenVNodes(nodes: Array<VNode>): Array<VNode> {
  const result: Array<VNode> = [];
  for (const node of nodes) {
    if (node.type === Fragment && Array.isArray(node.children)) {
      result.push(...flattenVNodes(node.children as Array<VNode>));
    } else if (node.type !== Comment) {
      result.push(node);
    }
  }
  return result;
}

/**
 * Parse items from the default slot vnode, support
 * <TamanDescriptionsItem label="..." :span="2">content</TamanDescriptionsItem> syntax
 */
export function parseItemsFromSlot(nodes: Array<VNode>): Array<TamanDescriptionsItemType> {
  return flattenVNodes(nodes)
    .filter((node) => isItemVNode(node))
    .map((node) => {
      const props = (node.props ?? {}) as Record<string, any>;
      const children = (node.children ?? {}) as Record<string, any>;
      const labelSlot
        = typeof children.label === 'function' ? children.label : undefined;
      const contentDefaultSlot
        = typeof children.default === 'function' ? children.default : undefined;
      const contentSlot
        = typeof children.content === 'function'
          ? children.content
          : contentDefaultSlot;
      return {
        class: props.class,
        content: contentSlot ?? props.content,
        contentStyle: props.contentStyle ?? props['content-style'],
        key: node.key ?? undefined,
        label: labelSlot ?? props.label,
        labelStyle: props.labelStyle ?? props['label-style'],
        span: props.span,
        style: props.style,
      } as TamanDescriptionsItemType;
    });
}
