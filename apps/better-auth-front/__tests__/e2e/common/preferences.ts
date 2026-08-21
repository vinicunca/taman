import type { Page } from '@playwright/test';

/**
 * Layout types from `@taman-core/typings` (`TamanLayoutType`).
 * Kept as a local union so Playwright does not import the app graph.
 */
export type E2eLayoutType =
  | 'full-content'
  | 'header-mixed-nav'
  | 'header-nav'
  | 'header-sidebar-nav'
  | 'mixed-nav'
  | 'sidebar-mixed-nav'
  | 'sidebar-nav';

export interface PatchPreferencesInput {
  layout?: E2eLayoutType;
  sidebarCollapsed?: boolean;
  navigationSplit?: boolean;
}

interface CachedPreferences {
  expiry?: number;
  value?: {
    app?: { layout?: string };
    navigation?: { split?: boolean };
    sidebar?: { collapsed?: boolean };
    [key: string]: unknown;
  };
}

/**
 * Patch cached preferences the same way PreferenceManager persists them:
 * `{prefix}-preferences` → JSON `{ value: Preferences }`.
 * Call after the app has initialized (post-login) so the cache key exists.
 */
export async function patchPreferences(
  page: Page,
  patch: PatchPreferencesInput,
): Promise<void> {
  const updated = await page.evaluate(
    ({ layout, navigationSplit, sidebarCollapsed }) => {
      const keys = Object.keys(localStorage).filter((key) => {
        if (!key.endsWith('-preferences')) {
          return false;
        }

        return (
          !key.endsWith('-preferences-theme')
          && !key.endsWith('-preferences-custom')
        );
      });

      let wrote = 0;

      for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (!raw) {
          continue;
        }

        let parsed: CachedPreferences;
        try {
          parsed = JSON.parse(raw) as CachedPreferences;
        } catch {
          continue;
        }

        if (!parsed.value || typeof parsed.value !== 'object') {
          continue;
        }

        if (layout) {
          parsed.value.app = { ...parsed.value.app, layout };
        }

        if (typeof sidebarCollapsed === 'boolean') {
          parsed.value.sidebar = {
            ...parsed.value.sidebar,
            collapsed: sidebarCollapsed,
          };
        }

        if (typeof navigationSplit === 'boolean') {
          parsed.value.navigation = {
            ...parsed.value.navigation,
            split: navigationSplit,
          };
        }

        localStorage.setItem(key, JSON.stringify(parsed));
        wrote += 1;
      }

      return wrote;
    },
    patch,
  );

  if (updated === 0) {
    throw new Error(
      'No PreferenceManager cache key found. Login first so initPreferences can write localStorage.',
    );
  }
}

export async function setLayout(
  page: Page,
  layout: E2eLayoutType,
  extra: Omit<PatchPreferencesInput, 'layout'> = {},
): Promise<void> {
  await patchPreferences(page, { layout, ...extra });
  await page.reload();
}
