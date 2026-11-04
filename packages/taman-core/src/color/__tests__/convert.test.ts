import { mapValues } from '@vinicunca/perkakas';
import { getColors } from 'theme-colors';
import { describe, expect, it } from 'vitest';
import { colordx } from '../color';

describe('color conversion functions', () => {
  it('should correctly convert color to HEX format', () => {
    const color = 'oklch(0.5524 0.2034 257.88)';

    const hexColor = colordx(color).toHex();
    expect(hexColor).toEqual('#006be5');
  });

  it('should correctly convert color to OKLCH format', () => {
    const color = '#ff0000';
    const expectedOklch = 'oklch(0.62796 0.25768 29.23388)';

    const oklchColor = colordx(color).toOklchString();
    expect(oklchColor).toEqual(expectedOklch);
  });

  it('should generate shades from an oklch color without rounding RGB before mixing', () => {
    const color = colordx('oklch(0.5524 0.2034 257.88)');

    const hexColor = color.toHex();
    const hexMap = getColors(hexColor);

    const oklchMap = mapValues(hexMap, (value) => {
      return color.mix(colordx(value)).toOklchString();
    });

    expect(oklchMap).toEqual({
      50: 'oklch(0.74859 0.1106 252.41061)',
      100: 'oklch(0.73644 0.11566 252.74309)',
      200: 'oklch(0.70263 0.13244 253.02792)',
      300: 'oklch(0.66978 0.14805 253.47317)',
      400: 'oklch(0.60693 0.17786 255.20202)',
      500: 'oklch(0.55212 0.20315 257.86136)',
      600: 'oklch(0.5316 0.19516 257.80969)',
      700: 'oklch(0.46991 0.17007 257.47591)',
      800: 'oklch(0.43851 0.15752 257.29537)',
      900: 'oklch(0.40654 0.14471 257.0732)',
      950: 'oklch(0.38436 0.13599 256.92561)',
    });
  });
});
