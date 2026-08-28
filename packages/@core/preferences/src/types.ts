import type { DeepPartial } from '@taman-core/shared/utils';
import type {
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
} from '@taman-core/typings';

type SupportedLanguagesType = 'en-US' | 'id-ID';
type CustomPreferencesValue = boolean | number | string;

interface CustomPreferencesOption<TValue extends string = string> {
  label: string;
  value: TValue;
}

interface BaseCustomPreferencesField<
  TKey extends string = string,
  TValue extends CustomPreferencesValue = CustomPreferencesValue,
> {
  componentProps?: Record<string, any>;
  defaultValue: TValue;
  disabled?: boolean;
  key: TKey;
  label: string;
  placeholder?: string;
  tip?: string;
}

interface CustomPreferencesInputField<
  TKey extends string = string,
> extends BaseCustomPreferencesField<TKey, string> {
  component: 'input';
}

interface CustomPreferencesNumberField<
  TKey extends string = string,
> extends BaseCustomPreferencesField<TKey, number> {
  component: 'number';
}

interface CustomPreferencesSelectField<
  TKey extends string = string,
> extends BaseCustomPreferencesField<TKey, string> {
  component: 'select';
  options: Array<CustomPreferencesOption>;
}

interface CustomPreferencesSwitchField<
  TKey extends string = string,
> extends BaseCustomPreferencesField<TKey, boolean> {
  component: 'switch';
}

type CustomPreferencesRecord = Record<string, CustomPreferencesValue>;

type AnyCustomPreferencesField
  = | CustomPreferencesInputField
    | CustomPreferencesNumberField
    | CustomPreferencesSelectField
    | CustomPreferencesSwitchField;

type CustomPreferencesField<
  TCustomPreferences extends object = CustomPreferencesRecord,
>
  = string extends Extract<keyof TCustomPreferences, string>
    ? AnyCustomPreferencesField
    : {
        [K in Extract<
          keyof TCustomPreferences,
          string
        >]: TCustomPreferences[K] extends boolean
          ? CustomPreferencesSwitchField<K>
          : TCustomPreferences[K] extends number
            ? CustomPreferencesNumberField<K>
            : TCustomPreferences[K] extends string
              ? CustomPreferencesInputField<K> | CustomPreferencesSelectField<K>
              : never;
      }[Extract<keyof TCustomPreferences, string>];

interface PreferencesExtension<
  TCustomPreferences extends object = CustomPreferencesRecord,
> {
  fields: Array<CustomPreferencesField<TCustomPreferences>>;
  tabLabel: string;
  title?: string;
}

interface AppPreferences {
  /** Access control mode */
  accessMode: TamanAccessModeType;
  /** Auth page layout */
  authPageLayout: TamanAuthPageLayoutType;
  /** Check-for-updates polling interval */
  checkUpdatesInterval: number;
  /** Whether grayscale mode is enabled */
  colorGrayMode: boolean;
  /** Whether color-weak mode is enabled */
  colorWeakMode: boolean;
  /** Whether compact mode is enabled */
  compact: boolean;
  /** Whether content compact mode is enabled */
  contentCompact: TamanContentCompactType;
  /** Content compact width */
  contentCompactWidth: number;
  /** Content padding */
  contentPadding: number;
  /** Content bottom padding */
  contentPaddingBottom: number;
  /** Content left padding */
  contentPaddingLeft: number;
  /** Content right padding */
  contentPaddingRight: number;
  /** Content top padding */
  contentPaddingTop: number;
  // /** Default app avatar */
  defaultAvatar: string;
  /** Default home page path */
  defaultHomePath: string;
  // /** Whether dynamic title is enabled */
  dynamicTitle: boolean;
  /** Whether check-for-updates is enabled */
  enableCheckUpdates: boolean;
  /** Whether the copy-preferences button is shown */
  enableCopyPreferences: boolean;
  /** Whether the preferences panel is shown */
  enablePreferences: boolean;
  /** Whether refresh token is enabled */
  enableRefreshToken: boolean;
  /** Whether the preferences navigation bar sticky effect is enabled */
  enableStickyPreferencesNavigationBar: boolean;
  /** Whether the app is in mobile layout */
  isMobile: boolean;
  /** Layout type */
  layout: TamanLayoutType;
  /** Supported locales */
  locale: SupportedLanguagesType;
  /** Login expired handling mode */
  loginExpiredMode: TamanLoginExpiredModeType;
  /** Application name */
  name: string;
  /** Preferences button position */
  preferencesButtonPosition: TamanPreferencesButtonPositionType;
  /** Application timezone */
  timezone: string;
  /** Whether watermark is enabled */
  watermark: boolean;
  /** Watermark text */
  watermarkContent: string;
  /** z-index */
  zIndex: number;
}

interface BreadcrumbPreferences {
  /** Whether breadcrumb is enabled */
  enable: boolean;
  /** Hide breadcrumb when there is only one item */
  hideOnlyOne: boolean;
  /** Whether the home icon is shown in breadcrumb */
  showHome: boolean;
  /** Whether breadcrumb icons are shown */
  showIcon: boolean;
}

interface CopyrightPreferences {
  /** Copyright company name */
  companyName: string;
  /** Copyright company site link */
  companySiteLink: string;
  /** Copyright date */
  date: string;
  /** Whether copyright footer is visible */
  enable: boolean;
  /** Whether the settings panel is shown */
  settingShow?: boolean;
}

interface FooterPreferences {
  /** Whether footer is visible */
  enable: boolean;
  /** Whether footer is fixed */
  fixed: boolean;
  /** Footer height */
  height: number;
}

interface HeaderPreferences {
  /** Whether header is enabled */
  enable: boolean;
  /** Header height */
  height: number;
  /** Whether header is hidden (CSS) */
  hidden: boolean;
  /** Header menu alignment */
  menuAlign: TamanLayoutHeaderMenuAlignType;
  /** Header display mode */
  mode: TamanLayoutHeaderModeType;
}

interface LogoPreferences {
  /** Whether logo is visible */
  enable: boolean;
  /** Logo height; takes effect only when logoMode=full. */
  fullLogoHeight?: number | string;
  /** Logo display type: icon mode; "full" fills the entire logo area. */
  logoMode: 'full' | 'icon';
  /** Whether to display the logo text */
  showText: boolean;
  /** Logo image URL */
  source: string;
  /** Dark theme logo URL (optional; falls back to source) */
  sourceDark?: string;
}

interface NavigationPreferences {
  /** Navigation menu accordion mode */
  accordion: boolean;
  /** Whether navigation menu is split (only when layout=mixed-nav) */
  split: boolean;
  /** Navigation menu style */
  styleType: TamanNavigationStyleType;
}

interface SidebarPreferences {
  /** Auto-activate child menu when clicking a directory */
  autoActivateChild: boolean;
  /** Whether sidebar is collapsed */
  collapsed: boolean;
  /** Whether sidebar collapse button is visible */
  collapsedButton: boolean;
  /** Whether title is shown when sidebar is collapsed */
  collapsedShowTitle: boolean;
  /** Sidebar collapsed width */
  collapseWidth: number;
  /** Whether sidebar menu is draggable */
  draggable: boolean;
  /** Whether sidebar is enabled */
  enable: boolean;
  /** Expand menu on hover */
  expandOnHover: boolean;
  /** Whether sidebar extra area is collapsed */
  extraCollapse: boolean;
  /** Sidebar extra area collapsed width */
  extraCollapsedWidth: number;
  /** Whether sidebar pin button is visible */
  fixedButton: boolean;
  /** Whether sidebar is hidden (CSS) */
  hidden: boolean;
  /** Mixed sidebar width */
  mixedWidth: number;
  /** Sidebar width */
  width: number;
}

interface ShortcutKeyPreferences {
  /** Whether global shortcut keys are enabled */
  enable: boolean;
  /** Whether global lock-screen shortcut is enabled */
  globalLockScreen: boolean;
  /** Whether global logout shortcut is enabled */
  globalLogout: boolean;
  /** Whether global preferences shortcut is enabled */
  globalPreferences: boolean;
  /** Whether global search shortcut is enabled */
  globalSearch: boolean;
}

interface TabbarPreferences {
  /** Whether tab bar drag is enabled */
  draggable: boolean;
  /** Whether tab bar is enabled */
  enable: boolean;
  /** Tab bar height */
  height: number;
  /** Whether tab keep-alive is enabled */
  keepAlive: boolean;
  /** Maximum number of tabs */
  maxCount: number;
  /** Close tab on middle mouse click */
  middleClickToClose: boolean;
  /** Whether tabs are persisted */
  persist: boolean;
  /** Whether tab icons are shown */
  showIcon: boolean;
  /** Whether maximize button is shown */
  showMaximize: boolean;
  /** Whether more-actions button is shown */
  showMore: boolean;
  /** Whether refresh button is shown */
  showRefresh: boolean;
  /** Tab bar style */
  styleType: TamanTabsStyleType;
  /** Whether visit history is enabled */
  visitHistory: boolean;
  /** Whether mouse wheel scrolling is enabled */
  wheelable: boolean;
}

interface ThemeBrandColors {
  /** Primary brand color */
  primary: string;
  /** Success brand color */
  success: string;
  /** Warning brand color */
  warning: string;
  /** Error/danger brand color */
  error: string;
  /** Neutral brand color */
  neutral: string;
}

interface ThemePreferences {
  /** Built-in theme name */
  builtinType: TamanBuiltinThemeType;
  /** Custom brand colors */
  brands: ThemeBrandColors;
  /** Font size (px) */
  fontSize: number;
  /** Border radius */
  radius: string;
  /** Semi-dark header (only when theme='light') */
  semiDarkHeader: boolean;
  /** Semi-dark sidebar (only when theme='light') */
  semiDarkSidebar: boolean;
  /** Semi-dark sidebar sub-menu (only when theme='light') */
  semiDarkSidebarSub: boolean;
}

interface TransitionPreferences {
  /** Whether page transition animation is enabled */
  enable: boolean;
  // /** Whether page loading indicator is enabled */
  loading: boolean;
  /** Page transition animation name */
  name: TamanPageTransitionType | string;
  /** Whether page loading progress bar is enabled */
  progress: boolean;
}

type WidgetButtonPositionType = 'header' | 'none' | 'user-dropdown';

interface WidgetPreferences {
  /** Whether fullscreen widget is enabled */
  fullscreen: boolean;
  /** Fullscreen button position */
  fullscreenButtonPosition: WidgetButtonPositionType;
  /** Whether global search widget is enabled */
  globalSearch: boolean;
  /** Global search button position */
  globalSearchButtonPosition: WidgetButtonPositionType;
  /** Whether language toggle widget is enabled */
  languageToggle: boolean;
  /** Language toggle button position */
  languageToggleButtonPosition: WidgetButtonPositionType;
  /** Whether lock screen is enabled */
  lockScreen: boolean;
  /** Lock screen button position */
  lockScreenButtonPosition: WidgetButtonPositionType;
  /** Logout button position */
  logoutButtonPosition: WidgetButtonPositionType;
  /** Whether notification widget is shown */
  notification: boolean;
  /** Notification button position */
  notificationButtonPosition: WidgetButtonPositionType;
  /** Whether refresh widget is shown */
  refresh: boolean;
  /** Refresh button position */
  refreshButtonPosition: WidgetButtonPositionType;
  /** Whether sidebar toggle widget is shown */
  sidebarToggle: boolean;
  /** Whether theme toggle widget is shown */
  themeToggle: boolean;
  /** Theme toggle button position */
  themeToggleButtonPosition: WidgetButtonPositionType;
  /** Whether timezone widget is shown */
  timezone: boolean;
  /** Timezone button position */
  timezoneButtonPosition: WidgetButtonPositionType;
  /** Widget order */
  order: ReadonlyArray<string>;
}

interface Preferences {
  /** App configuration */
  app: AppPreferences;
  /** Breadcrumb configuration */
  breadcrumb: BreadcrumbPreferences;
  /** Copyright configuration */
  copyright: CopyrightPreferences;
  /** Footer configuration */
  footer: FooterPreferences;
  /** Header configuration */
  header: HeaderPreferences;
  /** Logo configuration */
  logo: LogoPreferences;
  /** Navigation configuration */
  navigation: NavigationPreferences;
  /** Shortcut key configuration */
  shortcutKeys: ShortcutKeyPreferences;
  /** Sidebar configuration */
  sidebar: SidebarPreferences;
  /** Tab bar configuration */
  tabbar: TabbarPreferences;
  /** Theme configuration */
  theme: ThemePreferences;
  /** Transition configuration */
  transition: TransitionPreferences;
  /** Widget configuration */
  widget: WidgetPreferences;
}

type PreferencesKeys = keyof Preferences;

interface InitialOptions<
  TCustomPreferences extends object = CustomPreferencesRecord,
> {
  extension?: PreferencesExtension<TCustomPreferences>;
  namespace: string;
  overrides?: DeepPartial<Preferences>;
}
export type {
  AnyCustomPreferencesField,
  AppPreferences,
  BaseCustomPreferencesField,
  BreadcrumbPreferences,
  CustomPreferencesField,
  CustomPreferencesInputField,
  CustomPreferencesNumberField,
  CustomPreferencesOption,
  CustomPreferencesRecord,
  CustomPreferencesSelectField,
  CustomPreferencesSwitchField,
  CustomPreferencesValue,
  FooterPreferences,
  HeaderPreferences,
  InitialOptions,
  LogoPreferences,
  NavigationPreferences,
  Preferences,
  PreferencesExtension,
  PreferencesKeys,
  ShortcutKeyPreferences,
  SidebarPreferences,
  SupportedLanguagesType,
  TabbarPreferences,
  ThemeBrandColors,
  ThemePreferences,
  TransitionPreferences,
  WidgetPreferences,
};
