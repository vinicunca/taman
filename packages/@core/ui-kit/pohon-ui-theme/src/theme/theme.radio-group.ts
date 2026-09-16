// @unocss-include
import type { PThemeRadioGroup } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';
import { focusCard, focusControl } from './theme.checkbox.ts';

export const themeRadioGroup = {
  slots: {
    root: 'relative',
    fieldset: 'flex gap-x-2',
    legend: 'color-text font-500 mb-1 block',
    item: 'flex items-start',
    container: 'flex items-center',
    base: 'rounded-full ring ring-ring-accented ring-inset overflow-hidden focus-visible:outline-none',
    indicator: 'flex size-full items-center justify-center after:(content-empty rounded-full bg-background)',
    wrapper: 'w-full',
    label: 'color-text font-500 block',
    icon: 'shrink-0',
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
      list: {
        fieldset: 'flex-wrap',
        item: '',
      },
      card: {
        fieldset: 'flex-wrap',
        item: 'border border-border rounded-lg transition-colors hover:[&:not(:has(:disabled,:focus-visible,[data-state=checked]))]:bg-background-elevated/50',
      },
      table: {
        item: 'border border-border transition-colors hover:[&:not(:has(:disabled,:focus-visible,[data-state=checked]))]:bg-background-elevated/50',
      },
    },
    orientation: {
      horizontal: {
        fieldset: 'flex-row',
      },
      vertical: {
        fieldset: 'flex-col',
      },
    },
    indicator: {
      start: {
        item: 'flex-row',
        wrapper: 'ms-2',
      },
      end: {
        item: 'flex-row-reverse',
        wrapper: 'me-2',
      },
      hidden: {
        base: 'sr-only',
        wrapper: 'text-center flex flex-col gap-1 items-center',
      },
    },
    size: {
      xs: {
        fieldset: 'gap-y-0.5',
        legend: 'text-xs',
        base: 'size-3',
        item: 'text-xs',
        container: 'h-4',
        indicator: 'after:size-1',
      },
      sm: {
        fieldset: 'gap-y-0.5',
        legend: 'text-xs',
        base: 'size-3.5',
        item: 'text-xs',
        container: 'h-4',
        indicator: 'after:size-1',
      },
      md: {
        fieldset: 'gap-y-1',
        legend: 'text-sm',
        base: 'size-4',
        item: 'text-sm',
        container: 'h-5',
        indicator: 'after:size-1.5',
      },
      lg: {
        fieldset: 'gap-y-1',
        legend: 'text-sm',
        base: 'size-4.5',
        item: 'text-sm',
        container: 'h-5',
        indicator: 'after:size-1.5',
      },
      xl: {
        fieldset: 'gap-y-1.5',
        legend: 'text-base',
        base: 'size-5',
        item: 'text-base',
        container: 'h-6',
        indicator: 'after:size-2',
      },
    },
    highlight: {
      true: '',
      false: '',
    },
    disabled: {
      true: {
        item: 'opacity-75',
        base: 'cursor-not-allowed',
        label: 'cursor-not-allowed',
        description: 'cursor-not-allowed',
      },
    },
    required: {
      true: {
        legend: 'after:(color-error ms-0.5 content-["*"])',
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
      variant: ['card', 'table'],
      highlight: false,
      class: {
        item: 'hover:[&:not(:has(:disabled,:focus-visible,[data-state=checked]))]:border-border-accented',
      },
    },
    { size: 'xs', indicator: 'hidden', class: { icon: 'size-3' } },
    { size: 'sm', indicator: 'hidden', class: { icon: 'size-3.5' } },
    { size: 'md', indicator: 'hidden', class: { icon: 'size-4' } },
    { size: 'lg', indicator: 'hidden', class: { icon: 'size-4.5' } },
    { size: 'xl', indicator: 'hidden', class: { icon: 'size-5' } },
    { size: 'xs', variant: ['card', 'table'], class: { item: 'p-2.5' } },
    { size: 'sm', variant: ['card', 'table'], class: { item: 'p-3' } },
    { size: 'md', variant: ['card', 'table'], class: { item: 'p-3.5' } },
    { size: 'lg', variant: ['card', 'table'], class: { item: 'p-4' } },
    { size: 'xl', variant: ['card', 'table'], class: { item: 'p-4.5' } },
    {
      orientation: 'horizontal',
      variant: 'table',
      class: {
        item: 'first-of-type:rounded-s-lg last-of-type:rounded-e-lg',
        fieldset: 'gap-0 -space-x-px',
      },
    },
    {
      orientation: 'vertical',
      variant: 'table',
      class: {
        item: 'first-of-type:rounded-t-lg last-of-type:rounded-b-lg',
        fieldset: 'gap-0 -space-y-px',
      },
    },
    ...[
      ...POHON_THEME_BRANDS.map((color: string) => [color, color]),
      ['neutral', 'inverted'],
    ].map(([color, token]: Array<string>) => ({
      color,
      variant: 'list',
      indicator: ['start', 'end'],
      class: {
        base: focusControl(token!),
      },
    })),
    ...[
      ...POHON_THEME_BRANDS.map((color: string) => [color, color]),
      ['neutral', 'inverted'],
    ].map(([color, token]: Array<string>) => ({
      color,
      variant: ['card', 'table'],
      class: {
        item: focusCard(token!),
      },
    })),
    ...[
      ...POHON_THEME_BRANDS.map((color: string) => [color, color]),
      ['neutral', 'inverted'],
    ].map(([color, token]: Array<string>) => ({
      color,
      variant: 'list',
      indicator: 'hidden',
      class: {
        item: focusCard(token!),
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'card',
      class: {
        item: `has-data-[state=checked]:border-${color}/50 has-data-[state=checked]:bg-${color}/10`,
      },
    })),
    {
      color: 'neutral',
      variant: 'card',
      class: {
        item: 'has-data-[state=checked]:border-border-inverted/50 has-data-[state=checked]:bg-background-elevated',
      },
    },
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'table',
      class: {
        item: `has-data-[state=checked]:bg-${color}/10 has-data-[state=checked]:border-${color}/50 has-data-[state=checked]:z-1`,
      },
    })),
    {
      color: 'neutral',
      variant: 'table',
      class: {
        item: 'has-data-[state=checked]:bg-background-elevated has-data-[state=checked]:border-border-inverted/50 has-data-[state=checked]:z-1',
      },
    },
    {
      variant: ['card', 'table'],
      disabled: true,
      class: {
        item: 'cursor-not-allowed',
      },
    },
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      indicator: 'hidden',
      highlight: true,
      class: {
        item: `[&:not(:has(:disabled))]:border-${color} [&:not(:has(:disabled)):has([data-state=checked])]:border-${color}`,
      },
    })),
    {
      color: 'neutral',
      indicator: 'hidden',
      highlight: true,
      class: {
        item: '[&:not(:has(:disabled))]:border-border-inverted [&:not(:has(:disabled)):has([data-state=checked])]:border-border-inverted',
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
} satisfies PThemeRadioGroup;
