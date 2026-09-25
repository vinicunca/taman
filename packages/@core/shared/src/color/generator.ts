import { getColors } from 'theme-colors';
import { colordx } from './color';

interface ColorItem {
  color: string;
  name: string;
}

export function generatorColorVariables(colorItems: Array<ColorItem>) {
  const colorVariables: Record<string, string> = {};

  colorItems.forEach(({ color, name }) => {
    if (color) {
      const hexColor = colordx(color).toHex();
      const colorsMap = getColors(hexColor);

      const colorShades = Object.keys(colorsMap);

      colorShades.forEach((shade) => {
        const colorValue = colorsMap[shade];

        if (colorValue) {
          const oklchColor = colordx(colorValue).toOklchString();

          colorVariables[`--taman-color-${name}-${shade}`] = oklchColor;

          if (shade === '500') {
            colorVariables[`--taman-color-${name}`] = oklchColor;
          }
        }
      });
    }
  });

  return colorVariables;
}
