import type { PThemeCheckbox } from 'pohon-ui';
// @unocss-include
import { POHON_THEME_BRANDS } from '../constants.ts';

// `list` puts focus on the control, which is the click target there. `card` and `table`
// render the root as a label wrapping everything, so focus belongs on the card itself,
// as it does whenever the control is `sr-only`.
export const focusControl = (color: string) => `outline-${color}/25 focus-visible:outline-solid focus-visible:outline-3 focus-visible:ring-${color}`;
export const focusCard = (color: string) => `outline-${color}/25 has-focus-visible:outline-3 not-has-disabled:has-focus-visible:border-${color} has-focus-visible:z-1`;

export const themeCheckbox = {
  slots: {
    root: 'flex items-start relative',
    container: 'flex items-center',
    base: 'ring-ring-accented rounded-sm ring ring-inset overflow-hidden focus-visible:outline-none',
    indicator: 'color-text-inverted flex size-full items-center justify-center',
    icon: 'shrink-0',
    wrapper: 'w-full',
    label: 'color-text font-500 block',
    description: 'color-text-muted',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        indicator: `bg-${color}`,
      }])),
      neutral: {
        indicator: 'bg-background-inverted',
      },
    },
    variant: {
      card: {
        root: 'border-border border rounded-lg hover:[&:not(:has(:disabled,:focus-visible,[data-state=checked]))]:bg-background-elevated/50 transition-colors',
      },
    },
    indicator: {
      start: {
        root: 'flex-row',
        wrapper: 'ms-2',
      },
      end: {
        root: 'flex-row-reverse',
        wrapper: 'me-2',
      },
      hidden: {
        base: 'sr-only',
        wrapper: 'text-center flex flex-col gap-1 items-center',
      },
    },
    size: {
      xs: {
        base: 'size-3',
        icon: 'size-2.5',
        container: 'h-4',
        wrapper: 'text-xs',
      },
      sm: {
        base: 'size-3.5',
        icon: 'size-3',
        container: 'h-4',
        wrapper: 'text-xs',
      },
      md: {
        base: 'size-4',
        icon: 'size-3.5',
        container: 'h-5',
        wrapper: 'text-sm',
      },
      lg: {
        base: 'size-4.5',
        icon: 'size-4',
        container: 'h-5',
        wrapper: 'text-sm',
      },
      xl: {
        base: 'size-5',
        icon: 'size-4.5',
        container: 'h-6',
        wrapper: 'text-base',
      },
    },
    required: {
      true: {
        label: 'after:color-error after:(ms-0.5 content-["*"])',
      },
    },
    disabled: {
      true: {
        root: 'opacity-75',
        base: 'cursor-not-allowed',
        label: 'cursor-not-allowed',
        description: 'cursor-not-allowed',
      },
    },
  },
  compoundVariants: [
    {
      indicator: 'hidden',
      class: {
        container: 'h-auto',
      },
    },
    {
      variant: 'card',
      highlight: false,
      class: {
        root: 'hover:[&:not(:has(:disabled,:focus-visible,[data-state=checked]))]:border-border-accented',
      },
    },
    { size: 'xs', indicator: 'hidden', class: { icon: 'size-3' } },
    { size: 'sm', indicator: 'hidden', class: { icon: 'size-3.5' } },
    { size: 'md', indicator: 'hidden', class: { icon: 'size-4' } },
    { size: 'lg', indicator: 'hidden', class: { icon: 'size-4.5' } },
    { size: 'xl', indicator: 'hidden', class: { icon: 'size-5' } },
    { size: 'xs', variant: 'card', class: { root: 'p-2.5' } },
    { size: 'sm', variant: 'card', class: { root: 'p-3' } },
    { size: 'md', variant: 'card', class: { root: 'p-3.5' } },
    { size: 'lg', variant: 'card', class: { root: 'p-4' } },
    { size: 'xl', variant: 'card', class: { root: 'p-4.5' } },
    ...[
      ...POHON_THEME_BRANDS.map((color) => [color, color]),
      ['neutral', 'inverted'],
    ].map(([color, token]) => ({
      color,
      variant: 'list',
      indicator: ['start', 'end'],
      class: {
        base: focusControl(token!),
      },
    })),
    ...[
      ...POHON_THEME_BRANDS.map((color) => [color, color]),
      ['neutral', 'inverted'],
    ].map(([color, token]) => ({
      color,
      variant: 'card',
      class: {
        root: focusCard(token!),
      },
    })),
    ...[
      ...POHON_THEME_BRANDS.map((color) => [color, color]),
      ['neutral', 'inverted'],
    ].map(([color, token]) => ({
      color,
      variant: 'list',
      indicator: 'hidden',
      class: {
        root: focusCard(token!),
      },
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      variant: 'card',
      class: {
        root: `has-data-[state=checked]:border-${color}/50 has-data-[state=checked]:bg-${color}/10`,
      },
    })),
    {
      color: 'neutral',
      variant: 'card',
      class: {
        root: 'has-data-[state=checked]:border-border-inverted/50 has-data-[state=checked]:bg-background-elevated',
      },
    },
    {
      variant: 'card',
      disabled: true,
      class: {
        root: 'cursor-not-allowed',
      },
    },
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      indicator: 'hidden',
      highlight: true,
      class: {
        root: `[&:not(:has(:disabled))]:border-${color} [&:not(:has(:disabled)):has([data-state=checked])]:border-${color}`,
      },
    })),
    {
      color: 'neutral',
      indicator: 'hidden',
      highlight: true,
      class: {
        root: '[&:not(:has(:disabled))]:border-border-inverted [&:not(:has(:disabled)):has([data-state=checked])]:border-border-inverted',
      },
    },
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      highlight: true,
      class: {
        base: `ring-${color}`,
      },
    })),
    {
      color: 'neutral',
      highlight: true,
      class: {
        base: 'ring-ring-inverted',
      },
    },
  ],
} satisfies PThemeCheckbox;
