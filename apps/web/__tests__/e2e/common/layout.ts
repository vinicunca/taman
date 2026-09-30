/* eslint-disable sonar/no-nested-functions */
import type { Page } from '@playwright/test';

type PreferenceUpdates = Parameters<
  NonNullable<Window['__TAMAN_LAYOUT_TEST__']>['updatePreferences']
>[0];

export async function updateLayoutPreferences(page: Page, updates: PreferenceUpdates) {
  await page.evaluate((preferenceUpdates) => {
    const api = window.__TAMAN_LAYOUT_TEST__;
    if (!api) {
      throw new Error('Layout test API is not installed');
    }
    api.updatePreferences(preferenceUpdates);
  }, updates);
  await waitForLayoutSettled(page);
}

export async function waitForLayoutSettled(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      }),
  );
  await page.waitForFunction(
    () => {
      const layout = document.querySelector('[data-layout-region="layout"]');
      if (!layout) {
        return false;
      }

      return document.getAnimations().every((animation) => {
        const effect = animation.effect as KeyframeEffect | null;
        const target = effect?.target;
        if (!(target instanceof Element) || !layout.contains(target)) {
          return true;
        }

        if (!Number.isFinite(effect?.getComputedTiming().endTime)) {
          return true;
        }

        return animation.playState !== 'running';
      });
    },
    undefined,
    { timeout: 2000 },
  );
}
