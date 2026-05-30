type ValueOf<T> = T[keyof T];

const TAMAN_LAYOUT_TYPE = {
  FULL_CONTENT: 'full-content',
  HEADER_MIXED_NAV: 'header-mixed-nav',
  HEADER_NAV: 'header-nav',
  HEADER_SIDEBAR_NAV: 'header-sidebar-nav',
  MIXED_NAV: 'mixed-nav',
  SIDEBAR_MIXED_NAV: 'sidebar-mixed-nav',
  SIDEBAR_NAV: 'sidebar-nav',
} as const;

type TamanLayoutType = ValueOf<typeof TAMAN_LAYOUT_TYPE>;

const TAMAN_THEME_MODE_TYPE = {
  AUTO: 'auto',
  DARK: 'dark',
  LIGHT: 'light',
} as const;

type TamanThemeModeType = ValueOf<typeof TAMAN_THEME_MODE_TYPE>;

const TAMAN_PREFERENCES_BUTTON_POSITION_TYPE = {
  AUTO: 'auto',
  FIXED: 'fixed',
  HEADER: 'header',
  USER_DROPDOWN: 'user-dropdown',
} as const;

type TamanPreferencesButtonPositionType = ValueOf<typeof TAMAN_PREFERENCES_BUTTON_POSITION_TYPE>;

const TAMAN_CONTENT_COMPACT_TYPE = {
  COMPACT: 'compact',
  WIDE: 'wide',
} as const;

type TamanContentCompactType = ValueOf<typeof TAMAN_CONTENT_COMPACT_TYPE>;

const TAMAN_LAYOUT_HEADER_MODE_TYPE = {
  AUTO: 'auto',
  AUTO_SCROLL: 'auto-scroll',
  FIXED: 'fixed',
  STATIC: 'static',
} as const;

type TamanLayoutHeaderModeType = ValueOf<typeof TAMAN_LAYOUT_HEADER_MODE_TYPE>;

const TAMAN_LAYOUT_HEADER_MENU_ALIGN_TYPE = {
  CENTER: 'center',
  END: 'end',
  START: 'start',
} as const;

type TamanLayoutHeaderMenuAlignType = ValueOf<typeof TAMAN_LAYOUT_HEADER_MENU_ALIGN_TYPE>;

const TAMAN_LOGIN_EXPIRED_MODE_TYPE = {
  MODAL: 'modal',
  PAGE: 'page',
} as const;

type TamanLoginExpiredModeType = ValueOf<typeof TAMAN_LOGIN_EXPIRED_MODE_TYPE>;

const TAMAN_BREADCRUMB_STYLE_TYPE = {
  BACKGROUND: 'background',
  NORMAL: 'normal',
} as const;

type TamanBreadcrumbStyleType = ValueOf<typeof TAMAN_BREADCRUMB_STYLE_TYPE>;

const TAMAN_ACCESS_MODE_TYPE = {
  BACKEND: 'backend',
  FRONTEND: 'frontend',
  MIXED: 'mixed',
} as const;

type TamanAccessModeType = ValueOf<typeof TAMAN_ACCESS_MODE_TYPE>;

const TAMAN_NAVIGATION_STYLE_TYPE = {
  PLAIN: 'plain',
  ROUNDED: 'rounded',
} as const;

type TamanNavigationStyleType = ValueOf<typeof TAMAN_NAVIGATION_STYLE_TYPE>;

const TAMAN_TABS_STYLE_TYPE = {
  BRISK: 'brisk',
  CARD: 'card',
  CHROME: 'chrome',
  PLAIN: 'plain',
} as const;

type TamanTabsStyleType = ValueOf<typeof TAMAN_TABS_STYLE_TYPE>;

const TAMAN_PAGE_TRANSITION_TYPE = {
  FADE: 'fade',
  FADE_DOWN: 'fade-down',
  FADE_SLIDE: 'fade-slide',
  FADE_UP: 'fade-up',
} as const;

type TamanPageTransitionType = ValueOf<typeof TAMAN_PAGE_TRANSITION_TYPE>;

const TAMAN_AUTH_PAGE_LAYOUT_TYPE = {
  PANEL_CENTER: 'panel-center',
  PANEL_LEFT: 'panel-left',
  PANEL_RIGHT: 'panel-right',
} as const;

type TamanAuthPageLayoutType = ValueOf<typeof TAMAN_AUTH_PAGE_LAYOUT_TYPE>;

interface TamanTimezoneOption {
  label: string;
  offset: number;
  timezone: string;
}

type TamanBuiltinThemeType
  = | 'custom'
    | 'deep-blue'
    | 'deep-green'
    | 'default'
    | 'gray'
    | 'green'
    | 'neutral'
    | 'orange'
    | 'pink'
    | 'red'
    | 'rose'
    | 'sky-blue'
    | 'slate'
    | 'stone'
    | 'violet'
    | 'yellow'
    | 'zinc'
    | (Record<never, never> & string);

export {
  TAMAN_ACCESS_MODE_TYPE,
  TAMAN_AUTH_PAGE_LAYOUT_TYPE,
  TAMAN_BREADCRUMB_STYLE_TYPE,
  TAMAN_CONTENT_COMPACT_TYPE,
  TAMAN_LAYOUT_HEADER_MENU_ALIGN_TYPE,
  TAMAN_LAYOUT_HEADER_MODE_TYPE,
  TAMAN_LAYOUT_TYPE,
  TAMAN_LOGIN_EXPIRED_MODE_TYPE,
  TAMAN_NAVIGATION_STYLE_TYPE,
  TAMAN_PAGE_TRANSITION_TYPE,
  TAMAN_PREFERENCES_BUTTON_POSITION_TYPE,
  TAMAN_TABS_STYLE_TYPE,
  TAMAN_THEME_MODE_TYPE,
  type TamanAccessModeType,
  type TamanAuthPageLayoutType,
  type TamanBreadcrumbStyleType,
  type TamanBuiltinThemeType,
  type TamanContentCompactType,
  type TamanLayoutHeaderMenuAlignType,
  type TamanLayoutHeaderModeType,
  type TamanLayoutType,
  type TamanLoginExpiredModeType,
  type TamanNavigationStyleType,
  type TamanPageTransitionType,
  type TamanPreferencesButtonPositionType,
  type TamanTabsStyleType,
  type TamanThemeModeType,
  type TamanTimezoneOption,
};
