type TamanLayoutType
  = | 'full-content'
    | 'header-mixed-nav'
    | 'header-nav'
    | 'header-sidebar-nav'
    | 'mixed-nav'
    | 'sidebar-mixed-nav'
    | 'sidebar-nav';

type TamanThemeModeType = 'auto' | 'dark' | 'light';

/**
 * Button placement
 * user-dropdown - inside the user dropdown
 * fixed - fixed on the right side
 * header - top bar
 * auto - automatic
 */
type TamanPreferencesButtonPositionType
  = | 'auto'
    | 'fixed'
    | 'header'
    | 'user-dropdown';

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

type TamanContentCompactType = 'compact' | 'wide';

type TamanLayoutHeaderModeType = 'auto' | 'auto-scroll' | 'fixed' | 'static';
type TamanLayoutHeaderMenuAlignType = 'center' | 'end' | 'start';

/**
 * Login expired mode
 * modal - modal dialog
 * page - full page
 */
type TamanLoginExpiredModeType = 'modal' | 'page';

/**
 * Access mode
 * backend - backend-driven permissions
 * frontend - frontend-driven permissions
 * mixed - mixed permissions
 */
type TamanAccessModeType = 'backend' | 'frontend' | 'mixed';

/**
 * Navigation style
 * plain - flat
 * rounded - rounded
 */
type TamanNavigationStyleType = 'plain' | 'rounded';

/**
 * Tab bar style
 * brisk - light
 * card - card
 * chrome - Chrome-style
 * plain - flat
 */
type TamanTabsStyleType = 'brisk' | 'card' | 'chrome' | 'plain';

/**
 * Page transition animation
 */
type TamanPageTransitionType = 'fade' | 'fade-down' | 'fade-slide' | 'fade-up';

/**
 * Auth page layout
 * panel-center - centered layout
 * panel-left - left-aligned layout
 * panel-right - right-aligned layout
 */
type TamanAuthPageLayoutType = 'panel-center' | 'panel-left' | 'panel-right';

/**
 * Timezone option
 */
interface TamanTimezoneOption {
  label: string;
  offset: number;
  timezone: string;
}

export type {
  TamanAccessModeType,
  TamanAuthPageLayoutType,
  TamanBuiltinThemeType,
  TamanContentCompactType,
  TamanLayoutHeaderMenuAlignType,
  TamanLayoutHeaderModeType,
  TamanLayoutType,
  TamanLoginExpiredModeType,
  TamanNavigationStyleType,
  TamanPageTransitionType,
  TamanPreferencesButtonPositionType,
  TamanTabsStyleType,
  TamanThemeModeType,
  TamanTimezoneOption,
};
