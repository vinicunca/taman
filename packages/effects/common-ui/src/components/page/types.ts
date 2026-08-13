export interface PageProps {
  title?: string;
  description?: string;
  contentClass?: string;
  /**
   * Adapt height to visible content area
   */
  autoContentHeight?: boolean;
  headerClass?: string;
  footerClass?: string;
  /**
   * Custom height offset value (in pixels) to adjust content area sizing
   * when used with autoContentHeight
   * @default 0
   */
  heightOffset?: number;
  /**
   * Whether the footer is position: fixed.
   * When true, footer height is excluded from content height calculation.
   * @default false
   */
  footerFixed?: boolean;
}
