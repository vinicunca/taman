import type { Page } from '@playwright/test';

import { expect } from '@playwright/test';

const DEFAULT_EMAIL = 'admin@taman.local';
const DEFAULT_PASSWORD = 'Admin123!';

function e2eCredentials(): { email: string; password: string } {
  const email
    = process.env.E2E_EMAIL
      ?? process.env.TAMAN_E2E_EMAIL
      ?? DEFAULT_EMAIL;
  const password
    = process.env.E2E_PASSWORD
      ?? process.env.TAMAN_E2E_PASSWORD
      ?? DEFAULT_PASSWORD;

  return { email, password };
}

export function hasE2eCredentials(): boolean {
  return Boolean(
    process.env.E2E_EMAIL
    ?? process.env.TAMAN_E2E_EMAIL
    ?? DEFAULT_EMAIL,
  );
}

/**
 * Sign in through the email/password AuthForm (no captcha).
 * Waits until the app leaves `/auth/*` so callers can assert on the shell.
 */
export async function authLogin(page: Page) {
  const { email, password } = e2eCredentials();

  const emailInput = page.locator('input[name=\'email\']');
  await expect(emailInput).toBeVisible();
  await emailInput.fill(email);

  const passwordInput = page.locator('input[name=\'password\']');
  await expect(passwordInput).toBeVisible();
  await passwordInput.fill(password);

  const signInResponse = page.waitForResponse((response) => {
    return (
      response.request().method() === 'POST'
      && /\/sign-in\/email\/?$/.test(new URL(response.url()).pathname)
    );
  });

  await page.getByRole('button', { name: 'Continue' }).click();

  const response = await signInResponse;
  if (!response.ok()) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Login API failed (${response.status()}): ${body || response.statusText()}`,
    );
  }

  await page.waitForURL(
    (url) => !url.pathname.startsWith('/auth/'),
    { timeout: 20_000 },
  );
}
