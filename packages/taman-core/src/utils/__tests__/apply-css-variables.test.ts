import { expect, it } from 'vitest';

import { applyCssVariables } from '../apply-css-variables';

it('applyCssVariables should update CSS variables in :root selector', () => {
  // Mock initial inline stylesheet content
  const initialStyleContent = ':root { --primaryColor: red; }';
  document.head.innerHTML = `<style id="custom-styles">${initialStyleContent}</style>`;

  // CSS variables to update and their new values
  const updatedVariables = {
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
    && updatedStyleContent?.includes('secondaryColor: green;'),
  ).toBe(true);
});

it('updateCSSVariables should reuse and deduplicate same-id style tags', () => {
  document.head.innerHTML
    = '<style id="custom-styles">:root { --primaryColor: red; }</style>'
      + '<style id="custom-styles">:root { --primaryColor: red; }</style>';

  applyCssVariables({ primaryColor: 'blue' }, 'custom-styles');

  const styleElements = document.querySelectorAll('#custom-styles');

  expect(styleElements.length).toBe(1);
  expect(styleElements[0]?.textContent).toContain('primaryColor: blue;');
});

it('applyCssVariables should create only one tag when called repeatedly in the same tick', () => {
  document.head.innerHTML = '';

  applyCssVariables({ primaryColor: 'blue' }, 'custom-styles');
  applyCssVariables({ primaryColor: 'green' }, 'custom-styles');

  const styleElements = document.querySelectorAll('#custom-styles');

  expect(styleElements.length).toBe(1);
  expect(styleElements[0]?.textContent).toContain('primaryColor: green;');
});
