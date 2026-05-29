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
 * @description Used to configure module import mapping, supports custom import paths and ranges
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
  /** Module import mapping */
  imports?: Record<string, string>;
  /** Scope-specific import mapping */
  scopes?: {
    [scope: string]: Record<string, string>;
  };
}

/**
 * Print plugin configuration options
 * @description Used to configure console printing information
 */
interface PrintPluginOptions {
  /**
   * Data mapping for printing
   * @description Key-value data, will be printed in the console
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
 * Nitro Mock plugin configuration options
 * @description Used to configure the behavior of Nitro Mock server
 */
interface NitroMockPluginOptions {
  /**
   * Mock server package name
   * @default '@taman/nitro-mock'
   */
  mockServerPackage?: string;

  /**
   * Mock server port
   * @default 3000
   */
  port?: number;

  /**
   * Whether to print Mock logs
   * @default false
   */
  verbose?: boolean;
}

/**
 * Archiver plugin configuration options
 * @description Used to configure compression archive of build artifacts
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
 * HTML plugin configuration
 * @description Used to configure HTML compression behavior based on transformIndexHtml
 */
type HtmlPluginOptions = HtmlMinifierOptions;

/**
 * ImportMap plugin configuration
 * @description Used to configure CDN import of modules
 */
interface ImportmapPluginOptions {
  /**
   * CDN provider
   * @default 'jspm.io'
   * @description Support esm.sh and jspm.io two CDN providers
   */
  defaultProvider?: 'esm.sh' | 'jspm.io';
  /**
   * ImportMap configuration array
   * @description Configure packages to import from CDN
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
   * Manually configure ImportMap
   * @description Custom ImportMap configuration
   */
  inputMap?: IImportMap;
}

/**
 * Condition plugin configuration
 * @description Used to dynamically load plugins based on conditions
 */
interface ConditionPlugin {
  /**
   * Condition
   * @description Load plugins when the condition is true
   */
  condition?: boolean;
  /**
   * Plugin object
   * @description Return plugin array or Promise
   */
  plugins: () => Array<PluginOption> | PromiseLike<Array<PluginOption>>;
}

/**
 * Common plugin configuration options
 * @description Used to configure base options for all plugins
 */
interface CommonPluginOptions {
  /**
   * Whether to enable development tools
   * @default false
   */
  devtools?: boolean;
  /**
   * Environment variables
   * @description Custom environment variables
   */
  env?: Record<string, any>;
  /**
   * Whether to inject metadata
   * @default true
   */
  injectMetadata?: boolean;
  /**
   * Whether to enable build mode
   * @default false
   */
  isBuild?: boolean;
  /**
   * Build mode
   * @default 'development'
   */
  mode?: string;
  /**
   * Whether to enable dependency analysis
   * @default false
   * @description Use rollup-plugin-visualizer to analyze dependencies
   */
  visualizer?: boolean | PluginVisualizerOptions;
}

/**
 * Application plugin configuration options
 * @description Used to configure plugin options for application build
 */
interface ApplicationPluginOptions extends CommonPluginOptions {
  /**
   * Whether to enable compression archive
   * @default false
   * @description Enable compression archive will generate zip file in the build directory
   */
  archiver?: boolean;
  /**
   * Compression archive plugin configuration
   * @description Configure the behavior of compression archive
   */
  archiverPluginOptions?: ArchiverPluginOptions;
  /**
   * Whether to enable compression
   * @default false
   * @description Support gzip and brotli compression
   */
  compress?: boolean;
  /**
   * Compression type
   * @default ['gzip']
   * @description Optional compression types
   */
  compressTypes?: Array<'brotli' | 'gzip'>;
  /**
   * Whether to extract configuration file
   * @default false
   * @description Extract configuration file during build
   */
  extraAppConfig?: boolean;
  /**
   * Whether to enable HTML plugin
   * @default true
   */
  html?: boolean | HtmlPluginOptions;
  /**
   * Whether to enable internationalization
   * @default false
   */
  i18n?: boolean;
  /**
   * Whether to enable ImportMap CDN
   * @default false
   */
  importmap?: boolean;
  /**
   * ImportMap plugin configuration
   */
  importmapOptions?: ImportmapPluginOptions;
  /**
   * Whether to inject application loading animation
   * @default true
   */
  injectAppLoading?: boolean;
  /**
   * Whether to inject copyright information
   * @default true
   */
  license?: boolean;
  /**
   * Whether to enable Nitro Mock
   * @default false
   */
  nitroMock?: boolean;
  /**
   * Nitro Mock plugin configuration
   */
  nitroMockOptions?: NitroMockPluginOptions;
  /**
   * Whether to enable console printing
   * @default false
   */
  print?: boolean;
  /**
   * Print plugin configuration
   */
  printInfoMap?: PrintPluginOptions['infoMap'];
  /**
   * Whether to enable PWA
   * @default false
   */
  pwa?: boolean;
  /**
   * PWA plugin configuration
   */
  pwaOptions?: Partial<PwaPluginOptions>;
}

/**
 * Library plugin configuration options
 * @description Used to configure plugin options for library build
 */
interface LibraryPluginOptions extends CommonPluginOptions {
  /**
   * Whether to enable DTS output
   * @default true
   * @description Generate TypeScript type declaration files
   */
  dts?: boolean | PluginOptions;
}

/**
 * Application configuration definition function type
 * @description Used to define application build configuration
 */
type DefineApplicationOptions = (config?: ConfigEnv) => Promise<{
  /** Application plugin configuration */
  application?: ApplicationPluginOptions;
  /** Vite configuration */
  vite?: UserConfig;
}>;

/**
 * Library configuration definition function type
 * @description Used to define library build configuration
 */
type DefineLibraryOptions = (config?: ConfigEnv) => Promise<{
  /** Library plugin configuration */
  library?: LibraryPluginOptions;
  /** Vite configuration */
  vite?: UserConfig;
}>;

/**
 * Configuration definition type
 * @description Application or library configuration definition
 */
type DefineConfig = DefineApplicationOptions | DefineLibraryOptions;

type TamanViteConfig = Promise<UserConfig> | UserConfig | UserConfigFnPromise;

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
  NitroMockPluginOptions,
  PrintPluginOptions,
  TamanViteConfig,
};
