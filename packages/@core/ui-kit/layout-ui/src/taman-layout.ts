import type {
  TamanContentCompactType,
  TamanLayoutHeaderModeType,
  TamanLayoutType,
  TamanThemeModeType,
} from '@taman-core/typings';

interface TamanLayoutProps {
  /**
   * Content compact type
   * @default 'wide'
   */
  contentCompact?: TamanContentCompactType;
  /**
   * Content compact width
   * @default 1200
   */
  contentCompactWidth?: number;
  /**
   * padding
   * @default 16
   */
  contentPadding?: number;
  /**
   * paddingBottom
   * @default 16
   */
  contentPaddingBottom?: number;
  /**
   * paddingLeft
   * @default 16
   */
  contentPaddingLeft?: number;
  /**
   * paddingRight
   * @default 16
   */
  contentPaddingRight?: number;
  /**
   * paddingTop
   * @default 16
   */
  contentPaddingTop?: number;
  /**
   * Whether to show the footer
   * @default false
   */
  footerEnable?: boolean;
  /**
   * Whether to fix the footer
   * @default true
   */
  footerFixed?: boolean;
  /**
   * Footer height
   * @default 32
   */
  footerHeight?: number;

  /**
   * Header height
   * @default 48
   */
  headerHeight?: number;
  /**
   * Whether to hide the header
   * @default false
   */
  headerHidden?: boolean;
  /**
   * Header display mode
   * @default 'fixed'
   */
  headerMode?: TamanLayoutHeaderModeType;
  /**
   * Header theme
   */
  headerTheme?: TamanThemeModeType;
  /**
   * Whether to show the header toggle sidebar button
   * @default
   */
  headerToggleSidebarButton?: boolean;
  /**
   * Whether to show the header
   * @default true
   */
  headerVisible?: boolean;
  /**
   * Whether to show on mobile
   * @default false
   */
  isMobile?: boolean;
  /**
   * Layout mode
   * @default 'sidebar-nav'
   */
  layout?: TamanLayoutType;
  /**
   * Whether to collapse the sidebar
   * @default false
   */
  sidebarCollapse?: boolean;
  /**
   * Whether to collapse the sidebar button
   * @default true
   */
  sidebarCollapsedButton?: boolean;
  /**
   * Whether to show the title when the sidebar is collapsed
   * @default true
   */
  sidebarCollapseShowTitle?: boolean;
  /**
   * Whether to show the sidebar
   * @default true
   */
  sidebarEnable?: boolean;
  /**
   * Extra collapsed width of the sidebar
   * @default 48
   */
  sidebarExtraCollapsedWidth?: number;
  /**
   * Whether to fix the sidebar collapsed button
   * @default true
   */
  sidebarFixedButton?: boolean;
  /**
   * Whether to hide the sidebar
   * @default false
   */
  sidebarHidden?: boolean;
  /**
   * Mixed sidebar width
   * @default 80
   */
  sidebarMixedWidth?: number;
  /**
   * Sidebar theme
   * @default dark
   */
  sidebarTheme?: TamanThemeModeType;
  /**
   * Sub sidebar theme
   * @default dark
   */
  sidebarThemeSub?: TamanThemeModeType;
  /**
   * Sidebar width
   * @default 210
   */
  sidebarWidth?: number;
  /**
   * Sidebar collapsed width
   * @default 48
   */
  sideCollapseWidth?: number;
  /**
   * Whether to show the tab
   * @default true
   */
  tabbarEnable?: boolean;
  /**
   * Tab height
   * @default 30
   */
  tabbarHeight?: number;
  /**
   * zIndex
   * @default 100
   */
  zIndex?: number;
}
export type { TamanLayoutProps };
