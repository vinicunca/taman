// @unocss-include
import type { PThemeSwitch } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeSwitch = {
  slots: {
    root: 'flex items-start relative',
    base: 'border-2 border-transparent rounded-full inline-flex shrink-0 transition-[background-color]-280 items-center focus-visible:(outline-2 outline-offset-2) data-[state=unchecked]:bg-background-accented',
    container: 'flex items-center',
    thumb: 'group rounded-full bg-background flex pointer-events-none ring-0 shadow-lg transition-transform-280 items-center justify-center data-[state=unchecked]:translate-x-0 data-[state=unchecked]:rtl:-translate-x-0',
    icon: 'opacity-0 shrink-0 size-10/12 transition-[color,opacity]-280 absolute group-data-[state=unchecked]:color-text-dimmed',
    wrapper: 'ms-2',
    label: 'color-text font-500 block',
    description: 'color-text-muted',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        base: `data-[state=checked]:bg-${color} focus-visible:outline-${color}`,
        icon: `group-data-[state=checked]:color-${color}`,
      }])),
      neutral: {
        base: 'focus-visible:outline-border-inverted data-[state=checked]:bg-background-inverted',
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
        label: 'after:(color-error ms-0.5 content-["*"])',
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
