import type { TamanBuiltinThemeType, TamanTimezoneOption } from '@taman-core/typings';

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
    color: 'hsl(240 5% 26%)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'zinc',
  },
  {
    color: 'hsl(181 84% 32%)',
    type: 'deep-green',
  },
  {
    color: 'hsl(211 91% 39%)',
    type: 'deep-blue',
  },
  {
    color: 'hsl(18 89% 40%)',
    type: 'orange',
  },
  {
    color: 'hsl(0 75% 42%)',
    type: 'rose',
  },
  {
    color: 'hsl(0 0% 25%)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'neutral',
  },
  {
    color: 'hsl(215 25% 27%)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'slate',
  },
  {
    color: 'hsl(217 19% 27%)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'gray',
  },
  {
    color: '',
    type: 'custom',
  },
];

/** Timezone options */
const DEFAULT_TIME_ZONE_OPTIONS: Array<TamanTimezoneOption> = [
  {
    offset: -5,
    timezone: 'America/New_York',
    label: 'America/New_York(GMT-5)',
  },
  {
    offset: 0,
    timezone: 'Europe/London',
    label: 'Europe/London(GMT0)',
  },
  {
    offset: 8,
    timezone: 'Asia/Shanghai',
    label: 'Asia/Shanghai(GMT+8)',
  },
  {
    offset: 9,
    timezone: 'Asia/Tokyo',
    label: 'Asia/Tokyo(GMT+9)',
  },
  {
    offset: 9,
    timezone: 'Asia/Seoul',
    label: 'Asia/Seoul(GMT+9)',
  },
];

export const COLOR_PRESETS = [...BUILT_IN_THEME_PRESETS].slice(0, 7);

export { BUILT_IN_THEME_PRESETS, DEFAULT_TIME_ZONE_OPTIONS };

export type { BuiltinThemePreset };
