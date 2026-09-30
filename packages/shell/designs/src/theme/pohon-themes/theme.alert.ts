// @unocss-include
import type { PThemeAlert } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeAlert = {
  slots: {
    root: 'p-4 rounded-lg flex gap-2.5 w-full relative overflow-hidden',
    wrapper: 'flex flex-1 flex-col min-w-0',
    title: 'text-sm font-500',
    description: 'text-sm opacity-90',
    icon: 'shrink-0 size-5',
    avatar: 'shrink-0',
    avatarSize: '2xl',
    actions: 'flex shrink-0 flex-wrap gap-1.5',
    close: 'p-variant:p-0',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, ''])),
      neutral: '',
    },
    variant: {
      solid: '',
      outline: '',
      soft: '',
      subtle: '',
    },
    orientation: {
      horizontal: {
        root: 'items-center',
        actions: 'items-center',
      },
      vertical: {
        root: 'items-start',
        actions: 'mt-2.5 items-start',
      },
    },
    title: {
      true: {
        description: 'mt-1',
      },
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'solid',
      class: {
        root: `bg-${color} color-text-inverted`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'outline',
      class: {
        root: `color-${color} ring ring-inset ring-${color}/25`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'soft',
      class: {
        root: `bg-${color}/10 color-${color}`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'subtle',
      class: {
        root: `bg-${color}/10 color-${color} ring ring-inset ring-${color}/25`,
      },
    })),
    {
      color: 'neutral',
      variant: 'solid',
      class: {
        root: 'color-text-inverted bg-background-inverted',
      },
    },
    {
      color: 'neutral',
      variant: 'outline',
      class: {
        root: 'color-text-highlighted bg-background ring ring-inset ring-ring',
      },
    },
    {
      color: 'neutral',
      variant: 'soft',
      class: {
        root: 'color-text-highlighted bg-background-elevated/50',
      },
    },
    {
      color: 'neutral',
      variant: 'subtle',
      class: {
        root: 'color-text-highlighted bg-background-elevated/50 ring ring-inset ring-ring-accented',
      },
    },
  ],
} satisfies PThemeAlert;
