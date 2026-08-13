import type { PluginOption } from 'vite';

import type {
  ApplicationPluginOptions,
  CommonPluginOptions,
  ConditionPlugin,
  LibraryPluginOptions,
} from '../typing';

import viteVueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import viteVue from '@vitejs/plugin-vue';
import viteVueJsx from '@vitejs/plugin-vue-jsx';
import { visualizer as viteVisualizerPlugin } from 'rollup-plugin-visualizer';
import viteUnoCss from 'unocss/vite';
import viteDtsPlugin from 'unplugin-dts/vite';
import viteCompressPlugin from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import viteVueDevTools from 'vite-plugin-vue-devtools';

import { viteArchiverPlugin } from './archiver';
import { viteDayjsPlugin } from './dayjs';
import { viteExtraAppConfigPlugin } from './extra-app-config';
import { viteHtmlPlugin } from './html';
import { viteImportMapPlugin } from './importmap';
import { viteInjectAppLoadingPlugin } from './inject-app-loading';
import { viteMetadataPlugin } from './inject-metadata';
import { viteLicensePlugin } from './license';
import { vitePrintPlugin } from './print';
import { viteVxeTableImportsPlugin } from './vxe-table';

/**
 * Load Vite plugins whose conditions are satisfied
 * @param conditionPlugins
 */
async function loadConditionPlugins(conditionPlugins: Array<ConditionPlugin>) {
  const plugins: Array<PluginOption> = [];
  for (const conditionPlugin of conditionPlugins) {
    if (conditionPlugin.condition) {
      // eslint-disable-next-line no-await-in-loop
      const realPlugins = await conditionPlugin.plugins();
      plugins.push(...realPlugins);
    }
  }
  return plugins.flat();
}

/**
 * Load common Vite plugins based on options
 */
async function loadCommonPlugins(
  options: CommonPluginOptions,
): Promise<Array<ConditionPlugin>> {
  const {
    devtools,
    injectMetadata,
    isBuild,
    visualizer,
  } = options;

  return [
    {
      condition: true,
      plugins: () => [
        viteVue({
          script: {
            defineModel: true,
          },
        }),
        viteVueJsx(),
        viteUnoCss(),
      ],
    },

    {
      condition: !isBuild && devtools,
      plugins: () => [viteVueDevTools()],
    },
    {
      condition: injectMetadata,
      plugins: async () => [await viteMetadataPlugin()],
    },
    {
      condition: isBuild && !!visualizer,
      plugins: () => [
        viteVisualizerPlugin({
          filename: './node_modules/.cache/visualizer/stats.html',
          gzipSize: true,
          open: true,
        }) as PluginOption,
      ],
    },
  ];
}

/**
 * Load application Vite plugins based on options
 */
async function loadApplicationPlugins(
  options: ApplicationPluginOptions,
): Promise<Array<PluginOption>> {
  // Destructure separately so these are not passed into commonOptions
  const isBuild = options.isBuild;
  const env = options.env;

  const {
    archiver,
    archiverPluginOptions,
    compress,
    compressTypes,
    extraAppConfig,
    html,
    dayjs,
    i18n,
    importmap,
    importmapOptions,
    injectAppLoading,
    license,
    nitroMock,
    print,
    printInfoMap,
    pwa,
    pwaOptions,
    vxeTableLazyImport,
    ...commonOptions
  } = options;

  const commonPlugins = await loadCommonPlugins(commonOptions);

  return await loadConditionPlugins([
    ...commonPlugins,
    {
      condition: i18n,
      plugins: async () => {
        return [
          viteVueI18nPlugin({
            compositionOnly: true,
            fullInstall: true,
            runtimeOnly: true,
          }),
        ];
      },
    },

    {
      condition: print,
      plugins: async () => {
        return [await vitePrintPlugin({ infoMap: printInfoMap })];
      },
    },

    {
      condition: vxeTableLazyImport,
      plugins: async () => {
        return [await viteVxeTableImportsPlugin()];
      },
    },

    {
      condition: injectAppLoading,
      plugins: async () => [await viteInjectAppLoadingPlugin(!!isBuild, env)],
    },

    {
      condition: license,
      plugins: async () => [await viteLicensePlugin()],
    },

    {
      condition: pwa,
      plugins: () =>
        VitePWA({
          injectRegister: false,
          workbox: {
            globPatterns: [],
          },
          ...pwaOptions,
          manifest: {
            display: 'standalone',
            start_url: '/',
            theme_color: '#ffffff',
            ...pwaOptions?.manifest,
          },
        }),
    },

    {
      condition: isBuild && !!compress,
      plugins: () => {
        const compressPlugins: Array<PluginOption> = [];
        if (compressTypes?.includes('brotli')) {
          compressPlugins.push(
            viteCompressPlugin({ deleteOriginFile: false, ext: '.br' }),
          );
        }
        if (compressTypes?.includes('gzip')) {
          compressPlugins.push(
            viteCompressPlugin({ deleteOriginFile: false, ext: '.gz' }),
          );
        }
        return compressPlugins;
      },
    },

    {
      condition: !!html,
      plugins: () => [viteHtmlPlugin(typeof html === 'object' ? html : {})],
    },

    {
      condition: isBuild && importmap,
      plugins: () => {
        return [viteImportMapPlugin(importmapOptions)];
      },
    },

    {
      condition: isBuild && extraAppConfig,
      plugins: async () => [
        await viteExtraAppConfigPlugin({ isBuild: true, root: process.cwd() }),
      ],
    },

    {
      condition: archiver,
      plugins: async () => {
        return [await viteArchiverPlugin(archiverPluginOptions)];
      },
    },

    {
      condition: dayjs,
      plugins: () => [viteDayjsPlugin()],
    },
  ]);
}

/**
 * Load library Vite plugins based on options
 */
async function loadLibraryPlugins(
  options: LibraryPluginOptions,
): Promise<Array<PluginOption>> {
  // Destructure separately so these are not passed into commonOptions
  const isBuild = options.isBuild;
  const { dts, ...commonOptions } = options;
  const dtsOptions = typeof dts === 'object' ? dts : undefined;
  const commonPlugins = await loadCommonPlugins(commonOptions);
  return await loadConditionPlugins([
    ...commonPlugins,
    {
      condition: isBuild && !!dts,
      plugins: () => [viteDtsPlugin(dtsOptions)],
    },
  ]);
}

export {
  loadApplicationPlugins,
  loadLibraryPlugins,
  viteArchiverPlugin,
  viteCompressPlugin,
  viteDayjsPlugin,
  viteDtsPlugin,
  viteHtmlPlugin,
  viteVisualizerPlugin,
  viteVxeTableImportsPlugin,
};
