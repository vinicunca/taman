import type { Page } from '@playwright/test';

import { expect } from '@playwright/test';

export async function authLogin(page: Page) {
  // Ensure the login form is visible and ready
  const usernameInput = await page.locator(`input[name='username']`);
  await expect(usernameInput).toBeVisible();

  const passwordInput = await page.locator(`input[name='password']`);
  await expect(passwordInput).toBeVisible();

  const sliderCaptcha = await page.locator(`div[name='captcha']`);
  const sliderCaptchaAction = await page.locator(`div[name='captcha-action']`);
  await expect(sliderCaptcha).toBeVisible();
  await expect(sliderCaptchaAction).toBeVisible();

  // Drag the captcha slider
  // Get the drag handle position
  const sliderCaptchaBox = await sliderCaptcha.boundingBox();
  if (!sliderCaptchaBox) throw new Error('滑块未找到');

  const actionBoundingBox = await sliderCaptchaAction.boundingBox();
  if (!actionBoundingBox) throw new Error('要拖动的按钮未找到');

  // Compute start and target positions
  const startX = actionBoundingBox.x + actionBoundingBox.width / 2; // x coordinate at center of the element
  const startY = actionBoundingBox.y + actionBoundingBox.height / 2; // y coordinate at center of the element

  const targetX = startX + sliderCaptchaBox.width + actionBoundingBox.width; // drag right by the container width
  const targetY = startY; // y coordinate unchanged

  // Simulate mouse drag
  await page.mouse.move(startX, startY); // move to center of the action handle
  await page.mouse.down(); // press mouse button down
  await page.mouse.move(targetX, targetY, { steps: 20 }); // drag to target position
  await page.mouse.up(); // release mouse button

  // Assert after drag: action handle moved to the expected position
  const newActionBoundingBox = await sliderCaptchaAction.boundingBox();
  expect(newActionBoundingBox?.x).toBeGreaterThan(actionBoundingBox.x);

  // Captcha verified; click login
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'login' }).click();
}
