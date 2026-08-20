import type { ApplicationPluginOptions } from '../typing';

import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { fs } from '@taman/node-utils';
import dotenv from 'dotenv';

const getBoolean = (value: string | undefined) => value === 'true';
const getString = (value: string | undefined, fallback: string) => value ?? fallback;
const getNumber = (value: string | undefined, fallback: number) => Number(value) || fallback;

/**
 * Get the environment variables starting with the specified prefix
 * @param match prefix
 * @param mode Vite mode
 */
async function loadEnv<T = Record<string, string>>(
  match = 'VITE_GLOB_',
  mode: string,
) {
  const confFiles = [
    '.env',
    '.env.local',
    `.env.${mode}`,
    `.env.${mode}.local`,
  ];
  let envConfig = {};

  for (const confFile of confFiles) {
    try {
      const confFilePath = join(process.cwd(), confFile);
      if (existsSync(confFilePath)) {
        // eslint-disable-next-line no-await-in-loop
        const envPath = await fs.readFile(confFilePath, {
          encoding: 'utf8',
        });
        const env = dotenv.parse(envPath);
        envConfig = { ...envConfig, ...env };
      }
    } catch (error) {
      console.error(`Error while parsing ${confFile}`, error);
    }
  }
  const reg = new RegExp(`^(${match})`);
  Object.keys(envConfig).forEach((key) => {
    if (!reg.test(key)) {
      Reflect.deleteProperty(envConfig, key);
    }
  });
  return envConfig as T;
}

async function loadAndConvertEnv(
  mode: string,
  match = 'VITE_',
): Promise<
  Partial<ApplicationPluginOptions> & {
    appTitle: string;
    base: string;
    port: number;
  }
> {
  const envConfig = await loadEnv(match, mode);

  const {
    VITE_APP_TITLE,
    VITE_ARCHIVER,
    VITE_BASE,
    VITE_COMPRESS,
    VITE_DEVTOOLS,
    VITE_INJECT_APP_LOADING,
    VITE_NITRO_MOCK,
    VITE_PORT,
    VITE_PWA,
    VITE_VISUALIZER,
  } = envConfig;

  const compressTypes = (VITE_COMPRESS ?? '')
    .split(',')
    .filter((item) => item === 'brotli' || item === 'gzip');

  return {
    appTitle: getString(VITE_APP_TITLE, 'Taman Admin'),
    archiver: getBoolean(VITE_ARCHIVER),
    base: getString(VITE_BASE, '/'),
    compress: compressTypes.length > 0,
    compressTypes,
    devtools: getBoolean(VITE_DEVTOOLS),
    injectAppLoading: getBoolean(VITE_INJECT_APP_LOADING),
    nitroMock: getBoolean(VITE_NITRO_MOCK),
    port: getNumber(VITE_PORT, 5173),
    pwa: getBoolean(VITE_PWA),
    visualizer: getBoolean(VITE_VISUALIZER),
  };
}

export { loadAndConvertEnv, loadEnv };
