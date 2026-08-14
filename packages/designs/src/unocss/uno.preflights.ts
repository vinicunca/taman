import type { Preflight } from 'unocss';
import { baseColors, brandColors } from './uno.colors';

export const preflights: Array<Preflight> = [
  {
    layer: 'preflights',
    getCSS: () => {
      return [
        baseColors,
        brandColors,
      ].join('\n');
    },
  },
];
