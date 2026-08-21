import type {
  TamanContentCompactType,
  TamanLayoutHeaderModeType,
  TamanLayoutType,
  TamanThemeModeType,
} from '@taman-core/typings';

interface TamanLayoutProps {
  /**
   * Content width mode
   * @default 'wide'
   */
  contentCompact?: TamanContentCompactType;
  /**
   * Fixed content layout width
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
   * Whether the footer is visible
   * @default false
   */
  footerEnable?: boolean;
  /**
   * Whether the footer is fixed
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
   * Whether the top bar is hidden
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
   * Whether to show the header sidebar toggle button
   * @default
   */
  headerToggleSidebarButton?: boolean;
  /**
   * Whether the header is visible
   * @default true
   */
  headerVisible?: boolean;
  /**
   * Whether to use mobile layout
   * @default false
   */
  isMobile?: boolean;
  /**
   * Layout mode
   * sidebar-nav: sidebar menu layout
   * header-nav: top menu layout
   * mixed-nav: sidebar and top menu layout
   * sidebar-mixed-nav: mixed sidebar menu layout
   * full-content: full-screen content layout
   * @default sidebar-nav
   */
  layout?: TamanLayoutType;
  /**
   * Sidebar menu collapsed state
   * @default false
   */
  sidebarCollapse?: boolean;
  /**
   * Sidebar collapse button
   * @default true
   */
  sidebarCollapsedButton?: boolean;
  /**
   * Show title when sidebar is collapsed
   * @default true
   */
  sidebarCollapseShowTitle?: boolean;
  /**
   * Whether the sidebar is visible
   * @default true
   */
  sidebarEnable?: boolean;
  /**
   * Extra width when sidebar is collapsed
   * @default 48
   */
  sidebarExtraCollapsedWidth?: number;
  /**
   * Extra title height
   */
  sidebarExtraTitleHeight?: number;
  /**
   * Whether the sidebar collapse button is fixed
   * @default true
   */
  sidebarFixedButton?: boolean;
  /**
   * Whether the sidebar is hidden
   * @default false
   */
  sidebarHidden?: boolean;
  /**
   * Whether the sidebar logo is visible
   */
  sidebarLogoVisible: boolean;
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
   * Sidebar sub-panel theme
   * @default dark
   */
  sidebarThemeSub?: TamanThemeModeType;
  /**
   * Sidebar width
   * @default 210
   */
  sidebarWidth?: number;
  /**
   * Sidebar width when collapsed
   * @default 48
   */
  sideCollapseWidth?: number;
  /**
   * Whether the tab bar is visible
   * @default true
   */
  tabbarEnable?: boolean;
  /**
   * Tab bar height
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
