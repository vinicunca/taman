import type { Preflight } from 'unocss';
import { baseColors, brandColors } from './uno.colors';

const radius = `
:root {
  --radius-sm: calc(var(--taman-radius) - 4px);
  --radius-md: calc(var(--taman-radius) - 2px);
  --radius-lg: var(--taman-radius);
  --radius-xl: calc(var(--taman-radius) + 4px);
}
`;

export const preflights: Array<Preflight> = [
  {
    layer: 'preflights',
    getCSS: () => {
      return [
        baseColors,
        brandColors,
        radius,
      ].join('\n');
    },
  },
];
