// @unocss-include

import type { PThemeSeparator } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeSeparator = {
  slots: {
    root: 'text-center flex items-center items-center',
    border: '',
    container: 'color-text font-500 flex',
    icon: 'shrink-0 size-5',
    avatar: 'shrink-0',
    avatarSize: '2xs',
    label: 'text-sm',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, { border: `border-${color}` }])),
      neutral: { border: 'border-border' },
    },
    orientation: {
      horizontal: {
        root: 'flex-row w-full',
        border: 'w-full',
        container: 'whitespace-nowrap',
      },
      vertical: {
        root: 'flex-col h-full',
        border: 'h-full',
        container: '',
      },
    },
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
    position: {
      start: '',
      center: '',
      end: '',
    },
    type: {
      solid: {
        border: 'border-solid',
      },
      dashed: {
        border: 'border-dashed',
      },
      dotted: {
        border: 'border-dotted',
      },
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      position: 'start',
      class: { container: 'me-3' },
    },
    {
      orientation: 'horizontal',
      position: 'center',
      class: { container: 'mx-3' },
    },
    {
      orientation: 'horizontal',
      position: 'end',
      class: { container: 'ms-3' },
    },
    {
      orientation: 'vertical',
      position: 'start',
      class: { container: 'mb-2' },
    },
    {
      orientation: 'vertical',
      position: 'center',
      class: { container: 'my-2' },
    },
    {
      orientation: 'vertical',
      position: 'end',
      class: { container: 'mt-2' },
    },
    {
      orientation: 'horizontal',
      size: 'xs',
      class: { border: 'border-t' },
    },
    {
      orientation: 'horizontal',
      size: 'sm',
      class: { border: 'border-t-2' },
    },
    {
      orientation: 'horizontal',
      size: 'md',
      class: { border: 'border-t-3' },
    },
    {
      orientation: 'horizontal',
      size: 'lg',
      class: { border: 'border-t-4' },
    },
    {
      orientation: 'horizontal',
      size: 'xl',
      class: { border: 'border-t-5' },
    },
    {
      orientation: 'vertical',
      size: 'xs',
      class: { border: 'border-s' },
    },
    {
      orientation: 'vertical',
      size: 'sm',
      class: { border: 'border-s-2' },
    },
    {
      orientation: 'vertical',
      size: 'md',
      class: { border: 'border-s-3' },
    },
    {
      orientation: 'vertical',
      size: 'lg',
      class: { border: 'border-s-4' },
    },
    {
      orientation: 'vertical',
      size: 'xl',
      class: { border: 'border-s-5' },
    },
  ],
} satisfies PThemeSeparator;
