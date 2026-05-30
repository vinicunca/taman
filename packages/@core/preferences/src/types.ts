import type {
  TamanAccessModeType,
  TamanAuthPageLayoutType,
  TamanBreadcrumbStyleType,
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
} from '@taman-core/typings';
import type { DeepPartial } from '@vinicunca/perkakas';

type TamanSupportedLanguagesType = 'en-US' | 'id-ID';

type CustomPreferencesValue = boolean | number | string;

type CustomPreferencesRecord = Record<string, CustomPreferencesValue>;

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
  /** Access mode */
  accessMode: TamanAccessModeType;
  /** Login registration page layout */
  authPageLayout: TamanAuthPageLayoutType;
  /** Check update polling time */
  checkUpdatesInterval: number;
  /** Whether to enable gray mode */
  colorGrayMode: boolean;
  /** Whether to enable color weak mode */
  colorWeakMode: boolean;
  /** Whether to enable compact mode */
  compact: boolean;
  /** Whether to enable content compact mode */
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
  /** Application default avatar */
  defaultAvatar: string;
  /** Default home address */
  defaultHomePath: string;
  /** Enable dynamic title */
  dynamicTitle: boolean;
  /** Whether to enable check updates */
  enableCheckUpdates: boolean;
  /** Whether to display copy preferences button */
  enableCopyPreferences: boolean;
  /** Whether to display preferences */
  enablePreferences: boolean;
  /** Whether to enable refreshToken */
  enableRefreshToken: boolean;
  /** Whether to enable sticky preferences navigation bar */
  enableStickyPreferencesNavigationBar: boolean;
  /** Whether to enable mobile */
  isMobile: boolean;
  /** Layout mode */
  layout: TamanLayoutType;
  /** Supported languages */
  locale: TamanSupportedLanguagesType;
  /** Login expired mode */
  loginExpiredMode: TamanLoginExpiredModeType;
  /** Application name */
  name: string;
  /** Preferences button position */
  preferencesButtonPosition: TamanPreferencesButtonPositionType;
  /** Application timezone */
  timezone: string;
  /** Whether to enable watermark */
  watermark: boolean;
  /** Watermark content */
  watermarkContent: string;
  /** z-index */
  zIndex: number;
}

interface BreadcrumbPreferences {
  /** Whether to enable breadcrumb */
  enable: boolean;
  /** Whether to hide breadcrumb when there is only one */
  hideOnlyOne: boolean;
  /** Whether to show home icon */
  showHome: boolean;
  /** Whether to show icon */
  showIcon: boolean;
  /** Breadcrumb style */
  styleType: TamanBreadcrumbStyleType;
}

interface CopyrightPreferences {
  /** Copyright company name */
  companyName: string;
  /** Copyright company name link */
  companySiteLink: string;
  /** Copyright date */
  date: string;
  /** Whether to show copyright */
  enable: boolean;
  /** ICP number */
  icp: string;
  /** ICP number link */
  icpLink: string;
  /** Whether to show setting panel */
  settingShow?: boolean;
}

interface FooterPreferences {
  /** Whether to show footer */
  enable: boolean;
  /** Whether to fix footer */
  fixed: boolean;
  /** Footer height */
  height: number;
}

interface HeaderPreferences {
  /** Whether to enable header */
  enable: boolean;
  /** Header height */
  height: number;
  /** Whether to hide header, css-hidden */
  hidden: boolean;
  /** Header menu position */
  menuAlign: TamanLayoutHeaderMenuAlignType;
  /** Header display mode */
  mode: TamanLayoutHeaderModeType;
}

interface LogoPreferences {
  /** Whether to show logo */
  enable: boolean;
  /** Logo image fit mode */
  fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Logo source */
  source: string;
  /** Dark theme logo source (optional, if not set, use source) */
  sourceDark?: string;
}

interface NavigationPreferences {
  /** Navigation menu accordion mode */
  accordion: boolean;
  /** Whether to split navigation menu, only effective when layout=mixed-nav */
  split: boolean;
  /** Navigation menu style */
  styleType: TamanNavigationStyleType;
}

interface SidebarPreferences {
  /** Whether to automatically activate child menu when clicking on the directory */
  autoActivateChild: boolean;
  /** Whether to collapse sidebar */
  collapsed: boolean;
  /** Whether to show collapsed button */
  collapsedButton: boolean;
  /** Whether to show title when collapsed */
  collapsedShowTitle: boolean;
  /** Sidebar collapsed width */
  collapseWidth: number;
  /** Whether to drag sidebar menu */
  draggable: boolean;
  /** Whether to show sidebar */
  enable: boolean;
  /** Whether to expand menu automatically */
  expandOnHover: boolean;
  /** Whether to collapse sidebar extended area */
  extraCollapse: boolean;
  /** Sidebar extended area collapsed width */
  extraCollapsedWidth: number;
  /** Whether to show fixed button */
  fixedButton: boolean;
  /** Whether to hide sidebar - css */
  hidden: boolean;
  /** Mixed sidebar width */
  mixedWidth: number;
  /** Sidebar width */
  width: number;
}

interface ShortcutKeyPreferences {
  /** Whether to enable shortcut key - global */
  enable: boolean;
  /** Whether to enable global close window shortcut key */
  globalEscape: boolean;
  /** Whether to enable global lock screen shortcut key */
  globalLockScreen: boolean;
  /** Whether to enable global logout shortcut key */
  globalLogout: boolean;
  /** Whether to enable global preferences shortcut key */
  globalPreferences: boolean;
  /** Whether to enable global search shortcut key */
  globalSearch: boolean;
}

interface TabbarPreferences {
  /** Whether to enable draggable tabs */
  draggable: boolean;
  /** Whether to enable tabs */
  enable: boolean;
  /** Tab height */
  height: number;
  /** Whether to enable tab cache */
  keepAlive: boolean;
  /** Maximum number of tabs */
  maxCount: number;
  /** Whether to close tab when clicking middle key */
  middleClickToClose: boolean;
  /** Whether to persist tab */
  persist: boolean;
  /** Whether to enable tab icons */
  showIcon: boolean;
  /** Whether to show maximize button */
  showMaximize: boolean;
  /** Whether to show more button */
  showMore: boolean;
  /** Whether to show refresh button */
  showRefresh: boolean;
  /** Tab style */
  styleType: TamanTabsStyleType;
  /** Whether to enable visit history */
  visitHistory: boolean;
  /** Whether to enable mouse wheel response */
  wheelable: boolean;
}

interface ThemePreferences {
  /** Builtin theme name */
  builtinType: TamanBuiltinThemeType;
  /** Destructive color */
  colorDestructive: string;
  /** Primary color */
  colorPrimary: string;
  /** Success color */
  colorSuccess: string;
  /** Warning color */
  colorWarning: string;
  /** Font size (unit: px) */
  fontSize: number;
  /** Current theme */
  mode: TamanThemeModeType;
  /** Corner radius */
  radius: string;
  /** Whether to enable semi-dark header (only effective when theme='light') */
  semiDarkHeader: boolean;
  /** Whether to enable semi-dark menu (only effective when theme='light') */
  semiDarkSidebar: boolean;
  /** Whether to enable semi-dark submenu (only effective when theme='light') */
  semiDarkSidebarSub: boolean;
}

interface TransitionPreferences {
  /** Whether to enable page transition animation */
  enable: boolean;
  /** Whether to enable page loading */
  loading: boolean;
  /** Page transition animation */
  name: TamanPageTransitionType | string;
  /** Whether to enable page loading progress animation */
  progress: boolean;
}

interface WidgetPreferences {
  /** Whether to enable full screen widget */
  fullscreen: boolean;
  /** Whether to enable global search widget */
  globalSearch: boolean;
  /** Whether to enable language switch widget */
  languageToggle: boolean;
  /** Whether to enable lock screen */
  lockScreen: boolean;
  /** Whether to show notification widget */
  notification: boolean;
  /** Whether to show refresh button */
  refresh: boolean;
  /** Whether to show sidebar toggle widget */
  sidebarToggle: boolean;
  /** Whether to show theme toggle widget */
  themeToggle: boolean;
  /** Whether to show timezone widget */
  timezone: boolean;
}

interface Preferences {
  /** Global configuration */
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
  /** Shortcut keys configuration */
  shortcutKeys: ShortcutKeyPreferences;
  /** Sidebar configuration */
  sidebar: SidebarPreferences;
  /** Tabbar configuration */
  tabbar: TabbarPreferences;
  /** Theme configuration */
  theme: ThemePreferences;
  /** Transition configuration */
  transition: TransitionPreferences;
  /** Widget configuration */
  widget: WidgetPreferences;
}

interface InitialOptions<
  TCustomPreferences extends object = CustomPreferencesRecord,
> {
  extension?: PreferencesExtension<TCustomPreferences>;
  namespace: string;
  overrides?: DeepPartial<Preferences>;
}

export type {
  AnyCustomPreferencesField,
  BaseCustomPreferencesField,
  CustomPreferencesField,
  CustomPreferencesInputField,
  CustomPreferencesNumberField,
  CustomPreferencesOption,
  CustomPreferencesRecord,
  CustomPreferencesSelectField,
  CustomPreferencesSwitchField,
  CustomPreferencesValue,
  InitialOptions,
  Preferences,
  PreferencesExtension,
};
