// @unocss-include
import type { PThemeCheckboxGroup } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';
// `table` is defined here rather than in checkbox.ts, so its focus ring is too
import { focusCard } from './theme.checkbox';

export const themeCheckboxGroup = {
  slots: {
    root: 'relative',
    fieldset: 'flex gap-x-2',
    legend: 'color-text font-500 mb-1 block',
  },
  variants: {
    orientation: {
      horizontal: {
        fieldset: 'flex-row',
      },
      vertical: {
        fieldset: 'flex-col',
      },
    },
    variant: {
      list: {
        fieldset: 'flex-wrap',
      },
      card: {
        fieldset: 'flex-wrap',
      },
      table: {
        item: 'border border-border hover:[&:not(:has(:disabled,:focus-visible,[data-state=checked]))]:bg-background-elevated/50 transition-colors',
      },
    },
    size: {
      xs: {
        fieldset: 'gap-y-0.5',
        legend: 'text-xs',
      },
      sm: {
        fieldset: 'gap-y-0.5',
        legend: 'text-xs',
      },
      md: {
        fieldset: 'gap-y-1',
        legend: 'text-sm',
      },
      lg: {
        fieldset: 'gap-y-1',
        legend: 'text-sm',
      },
      xl: {
        fieldset: 'gap-y-1.5',
        legend: 'text-base',
      },
    },
    required: {
      true: {
        legend: 'after:color-error after:(ms-0.5 content-["*"])',
      },
    },
  },
  compoundVariants: [
    ...[...POHON_THEME_BRANDS.map((color) => [color, color]), ['neutral', 'inverted']].map(([color, token]: Array<string>) => ({
      color,
      variant: 'table',
      class: {
        item: focusCard(token!),
      },
    })),
    {
      variant: 'table',
      highlight: false,
      class: {
        item: 'hover:[&:not(:has(:disabled,:focus-visible,[data-state=checked]))]:border-border-accented',
      },
    },
    { size: 'xs', variant: 'table', class: { item: 'p-2.5' } },
    { size: 'sm', variant: 'table', class: { item: 'p-3' } },
    { size: 'md', variant: 'table', class: { item: 'p-3.5' } },
    { size: 'lg', variant: 'table', class: { item: 'p-4' } },
    { size: 'xl', variant: 'table', class: { item: 'p-4.5' } },
    {
      orientation: 'horizontal',
      variant: 'table',
      class: {
        item: 'first-of-type:rounded-s-lg last-of-type:rounded-e-lg',
        fieldset: 'pohon:gap-0 -space-x-px',
      },
    },
    {
      orientation: 'vertical',
      variant: 'table',
      class: {
        item: 'first-of-type:rounded-t-lg last-of-type:rounded-b-lg',
        fieldset: 'pohon:gap-0 -space-y-px',
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
      variant: 'table',
      disabled: true,
      class: {
        item: 'cursor-not-allowed',
      },
    },
  ],
} satisfies PThemeCheckboxGroup;
