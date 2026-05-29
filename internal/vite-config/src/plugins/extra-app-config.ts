import type { PluginOption } from 'vite';

import {
  colors,
  generatorContentHash,
  readPackageJSON,
} from '@taman/node-utils';

import { loadEnv } from '../utils/env';

interface PluginOptions {
  isBuild: boolean;
  root: string;
}

const GLOBAL_CONFIG_FILE_NAME = '_app-config';
const TAMAN_ADMIN_PROD_APP_CONF = '_TAMAN_ADMIN_PROD_APP_CONF_';

/**
 * Used to extract the configuration file and inject it into the project
 * @returns
 */

async function viteExtraAppConfigPlugin({
  isBuild,
  root,
}: PluginOptions): Promise<PluginOption | undefined> {
  let publicPath: string;
  let source: string;
  let hash: string;

  if (!isBuild) {
    return;
  }

  const { version = '' } = await readPackageJSON(root);

  return {
    async configResolved(config) {
      publicPath = ensureTrailingSlash(config.base);
      source = await getConfigSource();
      hash = generatorContentHash(source, 8);
    },
    async generateBundle() {
      try {
        this.emitFile({
          fileName: `${GLOBAL_CONFIG_FILE_NAME}-${version}-${hash}.js`,
          source,
          type: 'asset',
        });

        console.log(colors.cyan('✨configuration file is build successfully!'));
      } catch (error) {
        console.log(
          colors.red(
            `configuration file configuration file failed to package:\n${error}`,
          ),
        );
      }
    },
    name: 'vite:extra-app-config',
    async transformIndexHtml(html) {
      const appConfigSrc = `${publicPath}${GLOBAL_CONFIG_FILE_NAME}-${version}-${hash}.js`;

      return {
        html,
        tags: [{ attrs: { src: appConfigSrc }, tag: 'script' }],
      };
    },
  };
}

async function getConfigSource() {
  const config = await loadEnv();
  const windowVariable = `window.${TAMAN_ADMIN_PROD_APP_CONF}`;
  // Ensure the variable is not modified
  let source = `${windowVariable}=${JSON.stringify(config)};`;
  source += `
    Object.freeze(${windowVariable});
    Object.defineProperty(window, "${TAMAN_ADMIN_PROD_APP_CONF}", {
      configurable: false,
      writable: false,
    });
  `.replaceAll(/\s/g, '');
  return source;
}

function ensureTrailingSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

export { viteExtraAppConfigPlugin };
