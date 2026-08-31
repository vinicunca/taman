// @unocss-include
import type { PThemeSwitch } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const switchTheme = {
  slots: {
    root: 'relative flex items-start',
    base: 'inline-flex items-center shrink-0 rounded-full border-2 border-transparent focus-visible:outline-2 focus-visible:outline-offset-2 data-[state=unchecked]:bg-background-accented transition-[background] duration-200',
    container: 'flex items-center',
    thumb: 'group pointer-events-none rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 data-[state=unchecked]:translate-x-0 data-[state=unchecked]:rtl:-translate-x-0 flex items-center justify-center',
    icon: 'absolute shrink-0 group-data-[state=unchecked]:color-text-dimmed opacity-0 size-10/12 transition-[color,opacity] duration-200',
    wrapper: 'ms-2',
    label: 'block font-medium color-text',
    description: 'color-text-muted',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        base: `data-[state=checked]:bg-${color} focus-visible:outline-${color}`,
        icon: `group-data-[state=checked]:color-${color}`,
      }])),
      neutral: {
        base: 'data-[state=checked]:bg-background-inverted focus-visible:outline-inverted',
        icon: 'group-data-[state=checked]:color-text-highlighted',
      },
    },
    size: {
      xs: {
        base: 'w-7',
        container: 'h-4',
        thumb: 'size-3 data-[state=checked]:translate-x-3 data-[state=checked]:rtl:-translate-x-3',
        wrapper: 'text-xs',
      },
      sm: {
        base: 'w-8',
        container: 'h-4',
        thumb: 'size-3.5 data-[state=checked]:translate-x-3.5 data-[state=checked]:rtl:-translate-x-3.5',
        wrapper: 'text-xs',
      },
      md: {
        base: 'w-9',
        container: 'h-5',
        thumb: 'size-4 data-[state=checked]:translate-x-4 data-[state=checked]:rtl:-translate-x-4',
        wrapper: 'text-sm',
      },
      lg: {
        base: 'w-10',
        container: 'h-5',
        thumb: 'size-4.5 data-[state=checked]:translate-x-4.5 data-[state=checked]:rtl:-translate-x-4.5',
        wrapper: 'text-sm',
      },
      xl: {
        base: 'w-11',
        container: 'h-6',
        thumb: 'size-5 data-[state=checked]:translate-x-5 data-[state=checked]:rtl:-translate-x-5',
        wrapper: 'text-base',
      },
    },
    checked: {
      true: {
        icon: 'group-data-[state=checked]:opacity-100',
      },
    },
    unchecked: {
      true: {
        icon: 'group-data-[state=unchecked]:opacity-100',
      },
    },
    loading: {
      true: {
        icon: 'animate-spin',
      },
    },
    required: {
      true: {
        label: 'after:content-[\'*\'] after:ms-0.5 after:text-error',
      },
    },
    disabled: {
      true: {
        root: 'opacity-50',
        base: 'cursor-not-allowed',
        label: 'cursor-not-allowed',
        description: 'cursor-not-allowed',
      },
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      highlight: true,
      class: {
        base: `ring ring-${color}`,
      },
    })),
    {
      color: 'neutral',
      highlight: true,
      class: {
        base: 'ring ring-ring-inverted',
      },
    },
  ],
} satisfies PThemeSwitch;
