import { TinyColor } from '@ctrl/tinycolor';

/**
 * Convert the color to HSL format.
 *
 * HSL is a color model, including hue, saturation, and lightness.
 *
 * @param color The input color.
 * @returns The color string in HSL format.
 */
function convertToHsl(color: string): string {
  const { a, h, l, s } = new TinyColor(color).toHsl();
  const hsl = `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
  return a < 1 ? `${hsl} ${a}` : hsl;
}

/**
 * Convert the color to HSL CSS variable.
 *
 * This function is similar to the convertToHsl function, but the returned string format is slightly different,
 * so it can be used as a CSS variable.
 *
 * @param color The input color.
 * @returns The color string in HSL format that can be used as a CSS variable.
 */
function convertToHslCssVar(color: string): string {
  const { a, h, l, s } = new TinyColor(color).toHsl();
  const hsl = `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  return a < 1 ? `${hsl} / ${a}` : hsl;
}

/**
 * Convert the color to RGB color string
 * TinyColor无法处理hsl内包含'deg'、'grad'、'rad'或'turn'的字符串
 * like hsl(231deg 98% 65%) will be parsed as rgb(0, 0, 0)
 * Here, these units are removed before conversion
 * @param str The string representing the HLS color value
 * @returns If the color value is valid, return the corresponding RGB color string; if invalid, return rgb(0, 0, 0)
 */
function convertToRgb(str: string): string {
  return new TinyColor(str.replaceAll(/deg|grad|rad|turn/g, '')).toRgbString();
}

/**
 * Check if the color is valid
 * @param color - The color to check
 * If the color is valid, return true; otherwise, return false
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
