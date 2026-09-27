import type { UserConfig } from 'vite';

import type { DefineApplicationOptions } from '../typing';

import { readPackageJSON } from '@vinicunca/node-utils';
import { defineConfig, loadEnv, mergeConfig } from 'vite';

import { defaultImportmapOptions, getDefaultPwaOptions } from '../options';
import { loadApplicationPlugins } from '../plugins';
import { loadAndConvertEnv } from '../utils/env';
import { getCommonConfig } from './common';

function defineApplicationConfig(userConfigPromise?: DefineApplicationOptions) {
  return defineConfig(async (config) => {
    const options = await userConfigPromise?.(config);

    const { command, mode } = config;
    const { appTitle: envAppTitle, base, port, ...envConfig } = await loadAndConvertEnv(mode);
    const { application = {}, vite = {} } = options || {};
    const root = process.cwd();
    const isBuild = command === 'build';
    const env = loadEnv(mode, root);
    // VITE_APP_TITLE wins; otherwise fall back to the consumer's package name
    const appTitle = envAppTitle || (await readPackageJSON(root)).name || '';
    const defaultPwaOptions = getDefaultPwaOptions(appTitle);

    const plugins = await loadApplicationPlugins({
      archiver: true,
      archiverPluginOptions: {},
      compress: false,
      compressTypes: ['brotli', 'gzip'],
      devtools: true,
      env,
      extraAppConfig: true,
      html: true,
      i18n: true,
      importmapOptions: defaultImportmapOptions,
      injectAppLoading: true,
      injectMetadata: true,
      isBuild,
      license: true,
      mode,
      nitroMock: !isBuild,
      print: !isBuild,
      pwa: true,
      ...envConfig,
      ...application,
      // Merge instead of replace so a consumer setting e.g. only `description`
      // keeps the manifest name derived from the app title
      pwaOptions: {
        ...defaultPwaOptions,
        ...application.pwaOptions,
        manifest: {
          ...defaultPwaOptions.manifest,
          ...application.pwaOptions?.manifest,
        },
      },
    });

    const applicationConfig: UserConfig = {
      base,
      build: {
        cssMinify: 'esbuild',
        rolldownOptions: {
          output: {
            assetFileNames: '[ext]/[name]-[hash].[ext]',
            chunkFileNames: 'js/[name]-[hash].js',
            entryFileNames: 'jse/index-[name]-[hash].js',
            minify: isBuild
              ? {
                  compress: {
                    dropDebugger: true,
                  },
                }
              : false,
          },
        },
        target: 'es2015',
      },
      plugins,
      server: {
        host: true,
        port,
        warmup: {
          // Consumers add app-specific entries via `vite.server.warmup`;
          // mergeConfig appends them to this list
          clientFiles: ['./index.html'],
        },
      },
    };

    const mergedCommonConfig = mergeConfig(
      await getCommonConfig(),
      applicationConfig,
    );

    return mergeConfig(mergedCommonConfig, vite);
  });
}

export { defineApplicationConfig };
