import { TinyColor } from '@ctrl/tinycolor';

/**
 * Convert a color to HSL format.
 *
 * HSL is a color model with hue, saturation, and lightness components.
 *
 * @param {string} color Input color.
 * @returns {string} HSL color string.
 */
function convertToHsl(color: string): string {
  const { a, h, l, s } = new TinyColor(color).toHsl();
  const hsl = `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
  return a < 1 ? `${hsl} ${a}` : hsl;
}

/**
 * Convert a color to an HSL CSS variable value.
 *
 * Similar to convertToHsl, but formatted for use as a CSS variable.
 *
 * @param {string} color Input color.
 * @returns {string} HSL color string suitable for CSS variables.
 */
function convertToHslCssVar(color: string): string {
  const { a, h, l, s } = new TinyColor(color).toHsl();
  const hsl = `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  return a < 1 ? `${hsl} / ${a}` : hsl;
}

/**
 * Convert a color to an RGB color string.
 * TinyColor cannot parse HSL strings containing deg, grad, rad, or turn units.
 * For example, hsl(231deg 98% 65%) would be parsed as rgb(0, 0, 0).
 * Strip those units before conversion.
 * @param str HSL color string
 * @returns RGB color string when valid, otherwise rgb(0, 0, 0)
 */
function convertToRgb(str: string): string {
  return new TinyColor(str.replaceAll(/deg|grad|rad|turn/g, '')).toRgbString();
}

/**
 * Check whether a color value is valid.
 * @param {string} color Color to validate
 * Returns true when valid, otherwise false
 */
function isValidColor(color?: string) {
  if (!color) {
    return false;
  }
  return new TinyColor(color).isValid;
}

export {
  convertToHsl,
  convertToHslCssVar,
  convertToRgb,
  isValidColor,
  TinyColor,
};
