import type { VNode } from 'vue';

import type {
  DescriptionsBreakpoint,
  DescriptionsColumn,
  DescriptionsItemType,
  InternalDescriptionsItem,
  ScreenMap,
} from './types';

import { Comment, computed, Fragment } from 'vue';

import { useBreakpoints } from '@vueuse/core';

/** Default column count per breakpoint */
export const DEFAULT_COLUMN_MAP: Record<DescriptionsBreakpoint, number> = {
  lg: 3,
  md: 3,
  sm: 2,
  xl: 3,
  xs: 1,
  xxl: 3,
  xxxl: 4,
};

/** Breakpoints largest-first; matchScreen uses first match in this order */
const RESPONSIVE_ARRAY: DescriptionsBreakpoint[] = [
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
  screens: ScreenMap,
  screenSizes?: Partial<Record<DescriptionsBreakpoint, number>>,
): number | undefined {
  if (!screenSizes) return undefined;
  for (const breakpoint of RESPONSIVE_ARRAY) {
    if (screens[breakpoint] && screenSizes[breakpoint] !== undefined) {
      return screenSizes[breakpoint];
    }
  }
  return undefined;
}

/**
 * Watch viewport width and return currently matched breakpoint flags
 */
export function useScreens() {
  const breakpoints = useBreakpoints(BREAKPOINT_PX);
  return computed<ScreenMap>(() => ({
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
 * Resolve final column count: return number as-is, otherwise resolve from breakpoints
 */
export function resolveColumn(
  column: DescriptionsColumn | undefined,
  screens: ScreenMap,
): number {
  if (typeof column === 'number') return column;
  return matchScreen(screens, { ...DEFAULT_COLUMN_MAP, ...column }) ?? 3;
}

/**
 * Normalize list items: resolve span to number; mark 'filled' as filled
 */
export function normalizeItems(
  items: DescriptionsItemType[],
  screens: ScreenMap,
): InternalDescriptionsItem[] {
  return items.map((item, index) => {
    const { span, ...rest } = item;
    if (span === 'filled') {
      return { ...rest, _index: index, filled: true };
    }
    return {
      ...rest,
      _index: index,
      span: typeof span === 'number' ? span : matchScreen(screens, span),
    };
  });
}

/**
 * Row packing: split items into rows by column count and span,
 * and pad the last item in each row to fill the row. Ported from antdv-next useRow.
 */
export function calcRows(
  items: InternalDescriptionsItem[],
  column: number,
): InternalDescriptionsItem[][] {
  let rows: InternalDescriptionsItem[][] = [];
  let tmpRow: InternalDescriptionsItem[] = [];
  let count = 0;

  items.filter(Boolean).forEach((item) => {
    const { filled, ...rest } = item;
    // filled: occupy remaining columns in current row, then wrap
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
      // When span exceeds columns, clamp to remaining columns to avoid overflow
      tmpRow.push(count > column ? { ...rest, span: restSpan } : rest);
      rows.push(tmpRow);
      tmpRow = [];
      count = 0;
    } else {
      tmpRow.push(rest);
    }
  });

  if (tmpRow.length > 0) rows.push(tmpRow);

  // Pad: if row total span is less than column count, extend the last item
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

/** Marker for DescriptionsItem component type; used to recognize slot vnodes */
export const DESCRIPTIONS_ITEM_NAME = 'VbenDescriptionsItem';

function isItemVNode(node: VNode): boolean {
  const type = node.type as any;
  return (
    !!type &&
    (type.__isDescriptionsItem === true || type.name === DESCRIPTIONS_ITEM_NAME)
  );
}

function flattenVNodes(nodes: VNode[]): VNode[] {
  const result: VNode[] = [];
  for (const node of nodes) {
    if (node.type === Fragment && Array.isArray(node.children)) {
      result.push(...flattenVNodes(node.children as VNode[]));
    } else if (node.type !== Comment) {
      result.push(node);
    }
  }
  return result;
}

/**
 * Parse list items from default slot vnodes; supports
 * <VbenDescriptionsItem label="..." :span="2">content</VbenDescriptionsItem>
 */
export function parseItemsFromSlot(nodes: VNode[]): DescriptionsItemType[] {
  return flattenVNodes(nodes)
    .filter((node) => isItemVNode(node))
    .map((node) => {
      const props = (node.props ?? {}) as Record<string, any>;
      const children = (node.children ?? {}) as Record<string, any>;
      const labelSlot =
        typeof children.label === 'function' ? children.label : undefined;
      const contentDefaultSlot =
        typeof children.default === 'function' ? children.default : undefined;
      const contentSlot =
        typeof children.content === 'function'
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
      } as DescriptionsItemType;
    });
}
