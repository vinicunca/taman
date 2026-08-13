import type { Component, CSSProperties } from 'vue';

/** Responsive breakpoints; aligned with antdv-next */
export type DescriptionsBreakpoint
  = | 'lg'
    | 'md'
    | 'sm'
    | 'xl'
    | 'xs'
    | 'xxl'
    | 'xxxl';

/** Currently matched breakpoint flags */
export type ScreenMap = Partial<Record<DescriptionsBreakpoint, boolean>>;

export type DescriptionsLayout = 'horizontal' | 'vertical';

export type DescriptionsSize = 'large' | 'middle' | 'small';

/** Column count: fixed number or per-breakpoint config */
export type DescriptionsColumn
  = | number
    | Partial<Record<DescriptionsBreakpoint, number>>;

/** Item column span: fixed number, 'filled' (fill remaining row), or per-breakpoint config */
export type DescriptionsItemSpan
  = | 'filled'
    | number
    | Partial<Record<DescriptionsBreakpoint, number>>;

/** Renderable content: string/number/render function/component */
export type DescriptionsRenderNode = (() => any) | Component | number | string;

export interface DescriptionsItemType {
  /** Content */
  content?: DescriptionsRenderNode;
  /** Content style */
  contentStyle?: CSSProperties;
  /** Unique key */
  key?: number | string;
  /** Label */
  label?: DescriptionsRenderNode;
  /** Label style */
  labelStyle?: CSSProperties;
  /** Column span */
  span?: DescriptionsItemSpan;
}

export interface DescriptionsProps {
  /** Whether to show borders */
  bordered?: boolean;
  class?: any;
  /** Whether to show colon (non-bordered horizontal layout only) */
  colon?: boolean;
  /** Columns per row */
  column?: DescriptionsColumn;
  /** Shared content style */
  contentStyle?: CSSProperties;
  /** Extra slot area to the right of the title */
  extra?: string;
  /** Data-driven items; when omitted, reads VbenDescriptionsItem from default slot */
  items?: Array<DescriptionsItemType>;
  /** Shared label style */
  labelStyle?: CSSProperties;
  /** Layout mode */
  layout?: DescriptionsLayout;
  /** Size */
  size?: DescriptionsSize;
  /** Title */
  title?: string;
}

export interface DescriptionsItemProps {
  content?: DescriptionsRenderNode;
  contentStyle?: CSSProperties;
  label?: DescriptionsRenderNode;
  labelStyle?: CSSProperties;
  span?: DescriptionsItemSpan;
}

/** Normalized internal item with span resolved to a number */
export interface InternalDescriptionsItem {
  _index?: number;
  class?: string;
  content?: DescriptionsRenderNode;
  contentStyle?: CSSProperties;
  filled?: boolean;
  key?: number | string;
  label?: DescriptionsRenderNode;
  labelStyle?: CSSProperties;
  span?: number;
  style?: CSSProperties;
}
