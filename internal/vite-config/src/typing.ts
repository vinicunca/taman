import type { Options as HtmlMinifierOptions } from 'html-minifier-terser';
import type { PluginVisualizerOptions } from 'rollup-plugin-visualizer';
import type { PluginOptions } from 'unplugin-dts';
import type {
  ConfigEnv,
  PluginOption,
  UserConfig,
  UserConfigFnPromise,
} from 'vite';
import type { Options as PwaPluginOptions } from 'vite-plugin-pwa';

/**
 * ImportMap configuration interface
 * @description Configures module import maps with custom import paths and scopes
 * @example
 * ```typescript
 * {
 *   imports: {
 *     'vue': 'https://unpkg.com/vue@3.2.47/dist/vue.esm-browser.js'
 *   },
 *   scopes: {
 *     'https://site.com/': {
 *       'vue': 'https://unpkg.com/vue@3.2.47/dist/vue.esm-browser.js'
 *     }
 *   }
 * }
 * ```
 */
interface IImportMap {
  /** Module import map */
  imports?: Record<string, string>;
  /** Scope-specific import maps */
  scopes?: {
    [scope: string]: Record<string, string>;
  };
}

/**
 * Print plugin options
 * @description Configures console print output
 */
interface PrintPluginOptions {
  /**
   * Data map to print
   * @description Key-value pairs printed to the console
   * @example
   * ```typescript
   * {
   *   'App Version': '1.0.0',
   *   'Build Time': '2024-01-01'
   * }
   * ```
   */
  infoMap?: Record<string, string | undefined>;
}

/**
 * Archiver plugin options
 * @description Configures compression/archiving of build output
 */
interface ArchiverPluginOptions {
  /**
   * Output file name
   * @default 'dist'
   */
  name?: string;
  /**
   * Output directory
   * @default '.'
   */
  outputDir?: string;
}

/**
 * HTML plugin options
 * @description Configures HTML minification via transformIndexHtml
 */
type HtmlPluginOptions = HtmlMinifierOptions;

/**
 * ImportMap plugin options
 * @description Configures CDN imports for modules
 */
interface ImportmapPluginOptions {
  /**
   * CDN provider
   * @default 'jspm.io'
   * @description Supports esm.sh and jspm.io
   */
  defaultProvider?: 'esm.sh' | 'jspm.io';
  /**
   * ImportMap package list
   * @description Packages to load from CDN
   * @example
   * ```typescript
   * [
   *   { name: 'vue' },
   *   { name: 'pinia', range: '^2.0.0' }
   * ]
   * ```
   */
  importmap?: Array<{ name: string; range?: string }>;
  /**
   * Manual ImportMap configuration
   * @description Custom ImportMap config
   */
  inputMap?: IImportMap;
}

/**
 * Conditional plugin configuration
 * @description Loads plugins dynamically based on conditions
 */
interface ConditionPlugin {
  /**
   * Condition predicate
   * @description Plugins load when this is true
   */
  condition?: boolean;
  /**
   * Plugin factory
   * @description Returns plugin array or Promise
   */
  plugins: () => Array<PluginOption> | PromiseLike<Array<PluginOption>>;
}

/**
 * Common plugin options
 * @description Base options shared by all plugins
 */
interface CommonPluginOptions {
  /**
   * Enable devtools
   * @default false
   */
  devtools?: boolean;
  /**
   * Environment variables
   * @description Custom env vars
   */
  env?: Record<string, any>;
  /**
   * Inject metadata
   * @default true
   */
  injectMetadata?: boolean;
  /**
   * Build mode flag
   * @default false
   */
  isBuild?: boolean;
  /**
   * Vite mode
   * @default 'development'
   */
  mode?: string;
  /**
   * Enable dependency analysis
   * @default false
   * @description Uses rollup-plugin-visualizer
   */
  visualizer?: boolean | PluginVisualizerOptions;
}

/**
 * Application plugin options
 * @description Plugin options for application builds
 */
interface ApplicationPluginOptions extends CommonPluginOptions {
  /**
   * Enable archive compression
   * @default false
   * @description Creates a zip file in the output directory when enabled
   */
  archiver?: boolean;
  /**
   * Archiver plugin options
   * @description Configures archive behavior
   */
  archiverPluginOptions?: ArchiverPluginOptions;
  /**
   * Enable compression
   * @default false
   * @description Supports gzip and brotli
   */
  compress?: boolean;
  /**
   * Compression types
   * @default ['gzip']
   * @description Available compression algorithms
   */
  compressTypes?: Array<'brotli' | 'gzip'>;
  /**
   * Enable dayjs plugin
   * @default true
   */
  dayjs?: boolean;
  /**
   * Extract app config file
   * @default false
   * @description Extracts config at build time
   */
  extraAppConfig?: boolean;
  /**
   * Enable HTML plugin
   * @default true
   */
  html?: boolean | HtmlPluginOptions;
  /**
   * Enable i18n
   * @default false
   */
  i18n?: boolean;
  /**
   * Enable ImportMap CDN
   * @default false
   */
  importmap?: boolean;
  /**
   * ImportMap plugin options
   */
  importmapOptions?: ImportmapPluginOptions;
  /**
   * Inject app loading animation
   * @default true
   */
  injectAppLoading?: boolean;
  /**
   * Inject global SCSS
   * @default true
   */
  injectGlobalScss?: boolean;
  /**
   * Inject license banner
   * @default true
   */
  license?: boolean;
  /**
   * Enable Nitro Mock
   * @default false
   */
  nitroMock?: boolean;
  /**
   * Enable console print plugin
   * @default false
   */
  print?: boolean;
  /**
   * Print plugin info map
   */
  printInfoMap?: PrintPluginOptions['infoMap'];
  /**
   * Enable PWA
   * @default false
   */
  pwa?: boolean;
  /**
   * PWA plugin options
   */
  pwaOptions?: Partial<PwaPluginOptions>;
  /**
   * Enable VXE Table lazy import
   * @default false
   */
  vxeTableLazyImport?: boolean;
}

/**
 * Library plugin options
 * @description Plugin options for library builds
 */
interface LibraryPluginOptions extends CommonPluginOptions {
  /**
   * Enable DTS output
   * @default true
   * @description Generates TypeScript declaration files
   */
  dts?: boolean | PluginOptions;
}

/**
 * Application config options type
 */
type ApplicationOptions = ApplicationPluginOptions;

/**
 * Library config options type
 */
type LibraryOptions = LibraryPluginOptions;

/**
 * Application config define function type
 * @description Defines application build configuration
 */
type DefineApplicationOptions = (config?: ConfigEnv) => Promise<{
  /** Application plugin options */
  application?: ApplicationOptions;
  /** Vite config */
  vite?: UserConfig;
}>;

/**
 * Library config define function type
 * @description Defines library build configuration
 */
type DefineLibraryOptions = (config?: ConfigEnv) => Promise<{
  /** Library plugin options */
  library?: LibraryOptions;
  /** Vite config */
  vite?: UserConfig;
}>;

/**
 * Config define type
 * @description Application or library config definition
 */
type DefineConfig = DefineApplicationOptions | DefineLibraryOptions;

type VbenViteConfig = Promise<UserConfig> | UserConfig | UserConfigFnPromise;

export type {
  ApplicationPluginOptions,
  ArchiverPluginOptions,
  CommonPluginOptions,
  ConditionPlugin,
  DefineApplicationOptions,
  DefineConfig,
  DefineLibraryOptions,
  HtmlPluginOptions,
  IImportMap,
  ImportmapPluginOptions,
  LibraryPluginOptions,
  PrintPluginOptions,
  VbenViteConfig,
};
