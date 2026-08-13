import type { Preferences } from './types';

import { generatorColorVariables } from '@taman-core/shared/color';
import { updateCSSVariables as executeUpdateCSSVariables } from '@taman-core/shared/utils';

import { BUILT_IN_THEME_PRESETS } from './constants';
import { usePreferences } from './use-preferences';

/**
 * Updates theme and related CSS variables on the document root.
 * @param preferences - Current preferences; theme values drive document theme.
 */
function updateCSSVariables(preferences: Preferences) {
  // Update CSS variables when color-related theme fields change
  const root = document.documentElement;
  if (!root) {
    return;
  }

  const theme = preferences?.theme ?? {};

  const { builtinType, radius } = theme;
  const { isDark } = usePreferences();

  // Set data-theme=[builtinType] on html
  if (Reflect.has(theme, 'builtinType')) {
    const rootTheme = root.dataset.theme;
    if (rootTheme !== builtinType) {
      root.dataset.theme = builtinType;
    }
  }

  // Resolve built-in theme preset
  const currentBuiltType = [...BUILT_IN_THEME_PRESETS].find(
    (item) => item.type === builtinType,
  );

  let builtinTypeColorPrimary: string | undefined = '';

  if (currentBuiltType) {
    // Primary color for the active built-in theme
    const color = isDark.value
      ? currentBuiltType.darkPrimaryColor || currentBuiltType.primaryColor
      : currentBuiltType.primaryColor;
    builtinTypeColorPrimary = color || currentBuiltType.color;
  }

  const brands = theme.brands;

  // Skip theme color update if no built-in or custom brand colors are set
  if (
    builtinTypeColorPrimary
    || (brands !== undefined && (
      Reflect.has(brands, 'primary')
      || Reflect.has(brands, 'error')
      || Reflect.has(brands, 'success')
      || Reflect.has(brands, 'warning')
    ))
  ) {
    updateMainColorVariables(preferences);
  }

  // Update border radius
  if (Reflect.has(theme, 'radius')) {
    document.documentElement.style.setProperty('--radius', `${radius}rem`);
  }

  // Update font size
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
 * Updates primary semantic color CSS variables.
 * @param preference - Current preferences; colors are converted to HSL CSS variables.
 */
function updateMainColorVariables(preference: Preferences) {
  if (!preference.theme) {
    return;
  }

  const { brands } = preference.theme;

  if (!brands) {
    return;
  }

  const colorVariables = generatorColorVariables([
    { color: brands.primary, name: 'primary' },
    { alias: 'warning', color: brands.warning, name: 'yellow' },
    { alias: 'success', color: brands.success, name: 'green' },
    { alias: 'error', color: brands.error, name: 'red' },
  ]);

  // Map generated variables to semantic CSS variable names
  const colorMappings = {
    '--taman-color-green-500': '--taman-brand-success',
    '--taman-color-primary-500': '--taman-brand-primary',
    '--taman-color-red-500': '--taman-brand-error',
    '--taman-color-yellow-500': '--taman-brand-warning',
  };

  // Apply color variable updates
  Object.entries(colorMappings).forEach(([sourceVar, targetVar]) => {
    const colorValue = colorVariables[sourceVar];
    if (colorValue) {
      document.documentElement.style.setProperty(targetVar, colorValue);
    }
  });

  executeUpdateCSSVariables(colorVariables);
}

export { updateCSSVariables };
