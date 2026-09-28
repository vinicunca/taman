import { expect, it } from 'vitest';

import { applyCssVariables } from '../update-css-variables';

it('applyCssVariables should update CSS variables in :root selector', () => {
  // Mock initial inline stylesheet content
  const initialStyleContent = ':root { --primaryColor: red; }';
  document.head.innerHTML = `<style id="custom-styles">${initialStyleContent}</style>`;

  // CSS variables to update and their new values
  const updatedVariables = {
    fontSize: '16px',
    primaryColor: 'blue',
    secondaryColor: 'green',
  };

  // Update CSS variables
  applyCssVariables(updatedVariables, 'custom-styles');

  // Read updated stylesheet content
  const styleElement = document.querySelector('#custom-styles');
  const updatedStyleContent = styleElement ? styleElement.textContent : '';

  // Verify updated values are present
  expect(
    updatedStyleContent?.includes('primaryColor: blue;')
    && updatedStyleContent?.includes('secondaryColor: green;')
    && updatedStyleContent?.includes('fontSize: 16px;'),
  ).toBe(true);
});
