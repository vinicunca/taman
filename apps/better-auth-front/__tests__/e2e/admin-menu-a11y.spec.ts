import { expect, test } from '@playwright/test';

import { authLogin, hasE2eCredentials } from './common/auth';
import { sidebarMenu, submenuTitle, waitForMenuShell } from './common/menu';
import { setLayout } from './common/preferences';

/**
 * Documents current TamanMenu a11y — not a WAI-ARIA menu keyboard contract.
 * Arrow-key / roving tabindex assertions belong to a later a11y pass.
 */
test.describe.skip('Admin menu a11y baseline', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }, testInfo) => {
    if (!hasE2eCredentials()) {
      testInfo.skip(true, 'Set E2E_EMAIL and E2E_PASSWORD to run menu a11y baseline e2e.');
    }

    await authLogin(page);
    await setLayout(page, 'sidebar-nav');
    await waitForMenuShell(page);
  });

  test('root list is a menu; leaves are menuitems; submenu titles are not', async ({
    page,
  }) => {
    const menu = sidebarMenu(page);

    await expect(menu).toHaveAttribute('role', 'menu');

    const analytics = menu.getByRole('menuitem', { name: 'Analytics', exact: true });
    await expect(analytics).toBeVisible();
    await expect(analytics).toHaveAttribute('role', 'menuitem');

    const demosTitle = submenuTitle(menu, 'Demos');
    await expect(demosTitle).toBeVisible();
    await expect(demosTitle).not.toHaveAttribute('role', 'menuitem');
    await expect(demosTitle).not.toHaveAttribute('aria-expanded');
    await expect(demosTitle).not.toHaveAttribute('aria-haspopup');

    const nestedPopup = menu.locator('ul.taman-menu').nth(1);
    if (await nestedPopup.count()) {
      await expect(nestedPopup.first()).not.toHaveAttribute('role', 'menu');
    }
  });
});
