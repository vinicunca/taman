import type { Locator, Page } from '@playwright/test';

export function sidebarMenu(page: Page): Locator {
  return page.locator('aside ul.taman-menu.is-vertical').first();
}

export function headerMenu(page: Page): Locator {
  return page.locator('header ul.taman-menu.is-horizontal').first();
}

export function mixedRail(page: Page): Locator {
  return page.locator('aside ul.taman-normal-menu').first();
}

export function extraPanelMenu(page: Page): Locator {
  return page.locator('aside ul.taman-menu.is-vertical').first();
}

export function menuLeaf(root: Locator, name: string): Locator {
  return root.getByRole('menuitem', { name, exact: true });
}

export function submenuTitle(root: Locator, name: string): Locator {
  return root.locator('.taman-sub-menu-content').filter({ hasText: name }).first();
}

export function submenuItem(root: Locator, name: string): Locator {
  return root.locator('li.taman-sub-menu').filter({ hasText: name }).first();
}

export async function waitForMenuShell(page: Page): Promise<void> {
  await page.locator('ul.taman-menu, ul.taman-normal-menu').first().waitFor({
    state: 'visible',
    timeout: 15_000,
  });
}
