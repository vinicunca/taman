import { expect, test } from '@playwright/test';

import { authLogin, hasE2eCredentials } from './common/auth';
import {
  extraPanelMenu,
  headerMenu,
  menuLeaf,
  mixedRail,
  sidebarMenu,
  submenuItem,
  submenuTitle,
  waitForMenuShell,
} from './common/menu';
import { setLayout } from './common/preferences';

/**
 * Characterization tests for TamanMenu across admin layout modes.
 *
 * Pohon NavigationMenu / raw Akar rewrite is parked until these stay green
 * and other in-flight features settle. Keep TamanMenu's public API.
 */
test.describe.skip('Admin menu layout characterization', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }, testInfo) => {
    if (!hasE2eCredentials()) {
      testInfo.skip(true, 'Set E2E_EMAIL and E2E_PASSWORD to run menu characterization e2e.');
    }

    await authLogin(page);
  });

  test('sidebar-nav: nested leaf navigates and accordion closes siblings', async ({
    page,
  }) => {
    await setLayout(page, 'sidebar-nav');
    await waitForMenuShell(page);

    const menu = sidebarMenu(page);
    await submenuTitle(menu, 'Demos').click();
    await expect(submenuTitle(menu, 'Nested Menu')).toBeVisible();

    await submenuTitle(menu, 'Nested Menu').click();
    await menuLeaf(menu, 'Menu 1').click();
    await expect(page).toHaveURL(/\/demos\/nested\/menu1/);
    await expect(submenuItem(menu, 'Demos')).toHaveClass(/is-opened/);

    await submenuTitle(menu, 'System Management').click();
    await expect(menuLeaf(menu, 'User Management')).toBeVisible();
    await expect(submenuItem(menu, 'Demos')).not.toHaveClass(/is-opened/);
  });

  test('header-nav: horizontal submenu reaches a child route', async ({
    page,
  }) => {
    await setLayout(page, 'header-nav');
    await waitForMenuShell(page);

    const menu = headerMenu(page);
    await expect(menu).toBeVisible();

    await submenuItem(menu, 'Dashboard').hover();
    await menuLeaf(menu, 'Workspace').click({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/dashboard\/workspace/);
  });

  test('mixed-nav with split: header roots fill the sidebar with children', async ({
    page,
  }) => {
    await setLayout(page, 'mixed-nav', { navigationSplit: true });
    await waitForMenuShell(page);

    const header = headerMenu(page);
    await expect(header).toBeVisible();
    await expect(menuLeaf(header, 'Analytics')).toHaveCount(0);

    await menuLeaf(header, 'Demos').click();

    const side = sidebarMenu(page);
    await expect(submenuTitle(side, 'Nested Menu')).toBeVisible();
    await submenuTitle(side, 'Nested Menu').click();
    await menuLeaf(side, 'Menu 1').click();
    await expect(page).toHaveURL(/\/demos\/nested\/menu1/);
  });

  test('sidebar-mixed-nav: rail plus extra panel children', async ({ page }) => {
    await setLayout(page, 'sidebar-mixed-nav');
    await waitForMenuShell(page);

    const rail = mixedRail(page);
    await expect(rail).toBeVisible();
    await rail.locator('li.taman-normal-menu__item').filter({ hasText: 'Demos' }).click();

    const extra = extraPanelMenu(page);
    await expect(submenuTitle(extra, 'Nested Menu')).toBeVisible();
    await submenuTitle(extra, 'Nested Menu').click();
    await menuLeaf(extra, 'Menu 1').click();
    await expect(page).toHaveURL(/\/demos\/nested\/menu1/);
  });

  test('collapsed sidebar: hover flyout still reaches a child', async ({
    page,
  }) => {
    await setLayout(page, 'sidebar-nav', { sidebarCollapsed: true });
    await waitForMenuShell(page);

    const menu = sidebarMenu(page);
    await expect(menu).toHaveClass(/is-collapse/);

    await submenuItem(menu, 'Dashboard').hover();
    const popup = page.locator('.taman-menu__popup').filter({ hasText: 'Analytics' });
    await expect(popup).toBeVisible({ timeout: 10_000 });
    await menuLeaf(popup, 'Analytics').click();
    await expect(page).toHaveURL(/\/dashboard\/analytics/);
  });

  test('narrow header-nav exposes leftover items under More', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 900 });
    await setLayout(page, 'header-nav');
    await waitForMenuShell(page);

    const more = page.locator('header .taman-sub-menu-content.is-more');
    await expect(more).toBeVisible({ timeout: 10_000 });
    await more.hover();

    const popup = page.locator('.taman-menu__popup');
    await expect(popup.locator('[role="menuitem"]').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('mobile overlay sidebar opens, closes, and a leaf navigates', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setLayout(page, 'sidebar-nav');
    await waitForMenuShell(page);

    const overlayMask = page.locator('.bg-overlay.size-full.fixed');
    const toggle = page.locator('header button').first();

    if (await overlayMask.isVisible()) {
      await overlayMask.click();
      await expect(overlayMask).toBeHidden();
    }

    await toggle.click();
    await expect(overlayMask).toBeVisible();

    const menu = sidebarMenu(page);
    await submenuTitle(menu, 'Dashboard').click();
    await menuLeaf(menu, 'Analytics').click();
    await expect(page).toHaveURL(/\/dashboard\/analytics/);
  });
});
