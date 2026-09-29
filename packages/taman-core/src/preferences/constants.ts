import type { TamanBuiltinThemeType } from '../typings';

interface BuiltinThemePreset {
  color: string;
  darkPrimaryColor?: string;
  primaryColor?: string;
  type: TamanBuiltinThemeType;
}

const BUILT_IN_THEME_PRESETS: Array<BuiltinThemePreset> = [
  {
    color: 'oklch(0.5524 0.2034 257.88)',
    type: 'default',
  },
  {
    color: 'oklch(0.5946 0.2002 282.19)',
    type: 'violet',
  },
  {
    color: 'oklch(0.6384 0.1931 11.76)',
    type: 'pink',
  },
  {
    color: 'oklch(0.8228 0.1423 85.03)',
    type: 'yellow',
  },
  {
    color: 'oklch(0.5871 0.2218 270.38)',
    type: 'sky-blue',
  },
  {
    color: 'oklch(0.7599 0.1637 162.66)',
    type: 'green',
  },
  {
    color: 'oklch(0.3701 0.0113 285.84)',
    darkPrimaryColor: 'oklch(0.9848 0 0)',
    primaryColor: 'oklch(0.2103 0.0059 285.88)',
    type: 'zinc',
  },
  {
    color: 'oklch(0.6049 0.101 196.78)',
    type: 'deep-green',
  },
  {
    color: 'oklch(0.5001 0.1646 255.84)',
    type: 'deep-blue',
  },
  {
    color: 'oklch(0.5522 0.1722 38.86)',
    type: 'orange',
  },
  {
    color: 'oklch(0.5092 0.1934 27.66)',
    type: 'rose',
  },
  {
    color: 'oklch(0.3705 0 0)',
    darkPrimaryColor: 'oklch(0.9848 0 0)',
    primaryColor: 'oklch(0.2103 0.0059 285.88)',
    type: 'neutral',
  },
  {
    color: 'oklch(0.3752 0.0394 256.85)',
    darkPrimaryColor: 'oklch(0.9848 0 0)',
    primaryColor: 'oklch(0.2103 0.0059 285.88)',
    type: 'slate',
  },
  {
    color: 'oklch(0.376 0.0308 259.85)',
    darkPrimaryColor: 'oklch(0.9848 0 0)',
    primaryColor: 'oklch(0.2103 0.0059 285.88)',
    type: 'gray',
  },
  {
    color: '',
    type: 'custom',
  },
];

export const COLOR_PRESETS = [...BUILT_IN_THEME_PRESETS].slice(0, 7);

export { BUILT_IN_THEME_PRESETS };

export type { BuiltinThemePreset };
