// @unocss-include
import type { PThemePageCard } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const pageCard = {
  slots: {
    root: 'relative flex rounded-lg',
    spotlight: 'absolute inset-0 rounded-[inherit] pointer-events-none bg-background/90',
    container: 'relative flex flex-col flex-1 lg:grid gap-x-8 gap-y-4 p-4 sm:p-6',
    wrapper: 'flex flex-col flex-1 items-start',
    header: 'mb-4',
    body: 'flex-1',
    footer: 'pt-4 mt-auto',
    leading: 'inline-flex items-center mb-2.5',
    leadingIcon: 'size-5 shrink-0 color-primary',
    title: 'text-base text-pretty font-600 color-text-highlighted',
    description: 'text-[15px] text-pretty',
  },
  variants: {
    orientation: {
      horizontal: {
        container: 'lg:grid-cols-2 lg:items-center',
      },
      vertical: {
        container: '',
      },
    },
    reverse: {
      true: {
        wrapper: 'order-last',
      },
    },
    variant: {
      solid: {
        root: 'bg-background-inverted color-text-inverted',
        title: 'color-text-inverted',
        description: 'color-text-dimmed',
      },
      outline: {
        root: 'bg-background ring ring-ring',
        description: 'color-text-muted',
      },
      soft: {
        root: 'bg-background-elevated/50',
        description: 'color-text-toned',
      },
      subtle: {
        root: 'bg-background-elevated/50 ring ring-ring',
        description: 'color-text-toned',
      },
      ghost: {
        description: 'color-text-muted',
      },
      naked: {
        container: 'p-0 sm:p-0',
        description: 'color-text-muted',
      },
    },
    to: {
      true: {
        root: 'has-focus-visible:ring-2 has-focus-visible:ring-primary transition',
      },
    },
    title: {
      true: {
        description: 'mt-1',
      },
    },
    highlight: {
      true: {
        root: 'ring-2',
      },
    },
    highlightColor: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, ''])),
      neutral: '',
    },
    spotlight: {
      true: {
        root: '[--spotlight-size:400px] before:absolute before:-inset-px before:pointer-events-none before:rounded-[inherit] before:bg-[radial-gradient(var(--spotlight-size)_var(--spotlight-size)_at_calc(var(--spotlight-x,0px))_calc(var(--spotlight-y,0px)),var(--spotlight-color),transparent_70%)]',
      },
    },
    spotlightColor: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, ''])),
      neutral: '',
    },
  },
  compoundVariants: [
    {
      variant: 'solid',
      to: true,
      class: {
        root: 'hover:bg-background-inverted/90',
      },
    },
    {
      variant: 'outline',
      to: true,
      class: {
        root: 'hover:bg-background-elevated/50',
      },
    },
    {
      variant: 'soft',
      to: true,
      class: {
        root: 'hover:bg-background-elevated',
      },
    },
    {
      variant: 'subtle',
      to: true,
      class: {
        root: 'hover:bg-background-elevated',
      },
    },
    {
      variant: 'subtle',
      to: true,
      highlight: false,
      class: {
        root: 'hover:ring-ring-accented',
      },
    },
    {
      variant: 'ghost',
      to: true,
      class: {
        root: 'hover:bg-background-elevated/50',
      },
    },
    ...POHON_THEME_BRANDS.map((highlightColor: string) => ({
      highlightColor,
      highlight: true,
      class: {
        root: `ring-${highlightColor}`,
      },
    })),
    {
      highlightColor: 'neutral',
      highlight: true,
      class: {
        root: 'ring-ring-inverted',
      },
    },
    ...POHON_THEME_BRANDS.map((spotlightColor: string) => ({
      spotlightColor,
      spotlight: true,
      class: {
        root: `[--spotlight-color:var(--ui-${spotlightColor})]`,
      },
    })),
    {
      spotlightColor: 'neutral',
      spotlight: true,
      class: {
        root: '[--spotlight-color:var(--ui-bg-background-inverted)]',
      },
    },
  ],
} satisfies PThemePageCard;
