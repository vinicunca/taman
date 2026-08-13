import { expect, test } from '@playwright/test';

import { authLogin } from './common/auth';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Auth Login Page Tests', () => {
  test('check title and page elements', async ({ page }) => {
    // Get page title and assert it contains 'Vben Admin'
    const title = await page.title();
    expect(title).toContain('Vben Admin');
  });

  // Test case: successful login
  test('should successfully login with valid credentials', async ({ page }) => {
    await authLogin(page);
  });
});
