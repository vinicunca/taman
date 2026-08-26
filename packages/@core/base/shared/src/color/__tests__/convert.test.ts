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
    const expectedOklch = 'oklch(0.62796 0.25768 29.23389)';

    const oklchColor = colordx(color).toOklchString();
    expect(oklchColor).toEqual(expectedOklch);
  });

  it('should generate the shaders when received a oklch color', () => {
    const color = colordx('oklch(0.5524 0.2034 257.88)');

    const hexColor = color.toHex();
    const hexMap = getColors(hexColor);

    const oklchMap = mapValues(hexMap, (value) => {
      return color.mix(colordx(value)).toOklchString();
    });

    expect(oklchMap).toEqual({
      50: 'oklch(0.74967 0.11056 252.14551)',
      100: 'oklch(0.73753 0.1156 252.49286)',
      200: 'oklch(0.7037 0.13152 252.82388)',
      300: 'oklch(0.67082 0.14712 253.29568)',
      400: 'oklch(0.60678 0.1775 255.23379)',
      500: 'oklch(0.55184 0.2029 257.84264)',
      600: 'oklch(0.53276 0.19495 257.73125)',
      700: 'oklch(0.4707 0.1692 257.30813)',
      800: 'oklch(0.43932 0.15663 257.10793)',
      900: 'oklch(0.40738 0.1438 256.86102)',
      950: 'oklch(0.38447 0.13641 256.9885)',
    });
  });
});
