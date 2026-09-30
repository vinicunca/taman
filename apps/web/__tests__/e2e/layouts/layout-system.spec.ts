import type { Page } from '@playwright/test';
import { updateLayoutPreferences } from '../common/layout';
import { expect, test } from '../fixtures/layout';

test('keeps the layout background continuous while content scrolls', async ({
  layoutPage,
}) => {
  await configureDesktopRolePage(layoutPage);
  const result = await layoutPage.evaluate(() => {
    const scroll = document.querySelector('#__taman_layout_scroll');
    const main = document.querySelector('#__taman_main_content');
    if (!(scroll instanceof HTMLElement) || !(main instanceof HTMLElement)) {
      throw new TypeError('Layout scroll regions are missing');
    }

    const spacer = document.createElement('div');
    spacer.dataset.layoutTestSpacer = 'background';
    spacer.style.flex = '0 0 1600px';
    scroll.append(spacer);
    scroll.scrollTo({ top: scroll.scrollHeight });

    const mainRect = main.getBoundingClientRect();
    const scrollStyle = getComputedStyle(scroll);
    const mainStyle = getComputedStyle(main);
    const scrollBottom = scroll.scrollHeight - scroll.clientHeight;
    const mainBottomAtScrollEnd = mainRect.bottom - scrollBottom;
    spacer.remove();
    scroll.scrollTo({ top: 0 });

    return {
      mainBackground: mainStyle.backgroundColor,
      mainBottom: mainRect.bottom,
      mainBottomAtScrollEnd,
      scrollBackground: scrollStyle.backgroundColor,
      scrollBottom,
    };
  });

  expect(result.scrollBackground).not.toBe('rgba(0, 0, 0, 0)');
  expect(result.mainBackground).toBe('rgba(0, 0, 0, 0)');
  expect(result.mainBottomAtScrollEnd).toBeLessThanOrEqual(1);
  expect(result.scrollBottom).toBeGreaterThan(0);
});

async function configureDesktopRolePage(page: Page) {
  await page.setViewportSize({ height: 900, width: 1440 });
  await updateLayoutPreferences(page, {
    app: { layout: 'sidebar-nav' },
    footer: { enable: false },
    header: { enable: true, hidden: false, mode: 'fixed' },
    sidebar: {
      collapsed: false,
      enable: true,
      expandOnHover: true,
      hidden: false,
    },
    tabbar: { enable: true },
    widget: { sidebarToggle: true },
  });
}
