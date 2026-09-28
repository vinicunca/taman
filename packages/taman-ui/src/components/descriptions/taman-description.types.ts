import type { Component, CSSProperties, HTMLAttributes } from 'vue';

export type TamanDescriptionsBreakpoint
  = | 'lg'
    | 'md'
    | 'sm'
    | 'xl'
    | 'xs'
    | 'xxl'
    | 'xxxl';

export type TamanScreenMap = Partial<Record<TamanDescriptionsBreakpoint, boolean>>;

export type TamanDescriptionsLayout = 'horizontal' | 'vertical';
export type TamanDescriptionsSize = 'large' | 'middle' | 'small';

/** Number of columns; can be a fixed number or configured based on breakpoints. */
export type TamanDescriptionsColumn
  = | number
    | Partial<Record<TamanDescriptionsBreakpoint, number>>;

/** Single item span; supports fixed number, 'filled' (fills remaining space on current row) or configured based on breakpoints. */
export type TamanDescriptionsItemSpan
  = | 'filled'
    | number
    | Partial<Record<TamanDescriptionsBreakpoint, number>>;

/** Renderable content: string/number/render function/component. */
export type TamanDescriptionsRenderNode = (() => any) | Component | number | string;

export interface TamanDescriptionsItemType {
  /** Content */
  content?: TamanDescriptionsRenderNode;
  /** Content style */
  contentStyle?: CSSProperties;
  /** Unique key */
  key?: number | string;
  /** Label */
  label?: TamanDescriptionsRenderNode;
  /** Label style */
  labelStyle?: CSSProperties;
  /** Span */
  span?: TamanDescriptionsItemSpan;
}

export interface TamanDescriptionsProps {
  /** Whether to show border */
  bordered?: boolean;
  class?: HTMLAttributes['class'];
  /** Whether to show colon (only works for horizontal layout with non-bordered) */
  colon?: boolean;
  /** Number of columns in a row */
  column?: TamanDescriptionsColumn;
  /** Unified content style */
  contentStyle?: CSSProperties;
  /** Extra area, located on the right side of the title */
  extra?: string;
  /** Data-driven list items; if not provided, read from default slot of TamanDescriptionsItem */
  items?: Array<TamanDescriptionsItemType>;
  /** Unified label style */
  labelStyle?: CSSProperties;
  /** Layout type */
  layout?: TamanDescriptionsLayout;
  /** Size */
  size?: TamanDescriptionsSize;
  /** Title */
  title?: string;
}

export interface TamanDescriptionsItemProps {
  content?: TamanDescriptionsRenderNode;
  contentStyle?: CSSProperties;
  label?: TamanDescriptionsRenderNode;
  labelStyle?: CSSProperties;
  span?: TamanDescriptionsItemSpan;
}

/** Normalized internal item, span has been parsed to number */
export interface TamanInternalDescriptionsItem {
  _index?: number;
  class?: HTMLAttributes['class'];
  content?: TamanDescriptionsRenderNode;
  contentStyle?: CSSProperties;
  filled?: boolean;
  key?: number | string;
  label?: TamanDescriptionsRenderNode;
  labelStyle?: CSSProperties;
  span?: number;
  style?: CSSProperties;
}
