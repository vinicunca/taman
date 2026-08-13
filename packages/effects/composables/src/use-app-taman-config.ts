import type {
  ApplicationConfig,
  TamanAdminDevConfigRaw,
} from '@taman/types/global';

/**
 * Global config injected by vite-inject-app-config
 */
export function useAppTamanConfig(
  env: Record<string, any>,
  isProduction: boolean,
): ApplicationConfig {
  // in production, read window._TAMAN_ADMIN_DEV_CONFIG_ directly
  const config = isProduction
    ? window._TAMAN_ADMIN_DEV_CONFIG_
    : (env as TamanAdminDevConfigRaw);

  const {
    VITE_DIRECTOR_URL,
  } = config;

  const applicationConfig: ApplicationConfig = {
    directorUrl: VITE_DIRECTOR_URL,
  };

  return applicationConfig;
}
