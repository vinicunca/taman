import type { Preferences } from './types';

import { generatorColorVariables } from '@taman-core/shared/color';
import { updateCSSVariables as executeUpdateCSSVariables } from '@taman-core/shared/utils';

import { BUILT_IN_THEME_PRESETS } from './constants';

/**
 * Update the CSS variables of the theme and other CSS variables
 * @param preferences - The current preference setting object, its theme value will be used to set the theme of the document.
 */
function updateCSSVariables(preferences: Preferences) {
  // When the color variable is modified, update the css variable
  const root = document.documentElement;
  if (!root) {
    return;
  }

  const theme = preferences?.theme ?? {};

  const { builtinType, mode, radius } = theme;

  // Set the dark class on the html element
  if (Reflect.has(theme, 'mode')) {
    const dark = isDarkTheme(mode);
    root.classList.toggle('dark', dark);
  }

  // Set the data-theme=[builtinType] on the html element
  if (Reflect.has(theme, 'builtinType')) {
    const rootTheme = root.dataset.theme;
    if (rootTheme !== builtinType) {
      root.dataset.theme = builtinType;
    }
  }

  // Get the current built-in theme
  const currentBuiltType = [...BUILT_IN_THEME_PRESETS].find(
    (item) => item.type === builtinType,
  );

  let builtinTypeColorPrimary: string | undefined = '';

  if (currentBuiltType) {
    const isDark = isDarkTheme(preferences.theme.mode);
    // Set the main color for different themes
    const color = isDark
      ? currentBuiltType.darkPrimaryColor || currentBuiltType.primaryColor
      : currentBuiltType.primaryColor;
    builtinTypeColorPrimary = color || currentBuiltType.color;
  }

  // If the built-in theme color and custom color do not exist, do not update the theme color
  if (
    builtinTypeColorPrimary
    || Reflect.has(theme, 'colorPrimary')
    || Reflect.has(theme, 'colorDestructive')
    || Reflect.has(theme, 'colorSuccess')
    || Reflect.has(theme, 'colorWarning')
  ) {
    updateMainColorVariables(preferences);
  }

  // Update the corner radius
  if (Reflect.has(theme, 'radius')) {
    document.documentElement.style.setProperty('--radius', `${radius}rem`);
  }

  // Update the font size
  if (Reflect.has(theme, 'fontSize')) {
    const fontSize = theme.fontSize;
    document.documentElement.style.setProperty(
      '--font-size-base',
      `${fontSize}px`,
    );
    document.documentElement.style.setProperty(
      '--menu-font-size',
      `calc(${fontSize}px * 0.875)`,
    );
  }
}

/**
 * Update the main CSS variables
 * @param  preference - The current preference setting object, its color value will be converted to HSL format and set as CSS variables.
 */
function updateMainColorVariables(preference: Preferences) {
  if (!preference.theme) {
    return;
  }
  const { colorDestructive, colorPrimary, colorSuccess, colorWarning }
    = preference.theme;

  const colorVariables = generatorColorVariables([
    { color: colorPrimary, name: 'primary' },
    { alias: 'warning', color: colorWarning, name: 'yellow' },
    { alias: 'success', color: colorSuccess, name: 'green' },
    { alias: 'destructive', color: colorDestructive, name: 'red' },
  ]);

  // The CSS variables to be set mapping
  const colorMappings = {
    '--green-500': '--success',
    '--primary-500': '--primary',
    '--red-500': '--destructive',
    '--yellow-500': '--warning',
  };

  // Update the color variables uniformly
  Object.entries(colorMappings).forEach(([sourceVar, targetVar]) => {
    const colorValue = colorVariables[sourceVar];
    if (colorValue) {
      document.documentElement.style.setProperty(targetVar, colorValue);
    }
  });

  executeUpdateCSSVariables(colorVariables);
}

function isDarkTheme(theme: string) {
  let dark = theme === 'dark';
  if (theme === 'auto') {
    dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return dark;
}

export { isDarkTheme, updateCSSVariables };
