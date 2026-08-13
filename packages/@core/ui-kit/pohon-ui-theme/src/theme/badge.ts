// @unocss-include
import type { PThemeBadge } from 'pohon-ui';
import { BRANDS } from '../constants.ts';
import { fieldGroupVariant } from './field-group.ts';

export const badge = {
  slots: {
    base: 'font-medium inline-flex items-center',
    label: 'truncate',
    leadingIcon: 'shrink-0',
    leadingAvatar: 'shrink-0',
    leadingAvatarSize: '',
    trailingIcon: 'shrink-0',
  },
  variants: {
    ...fieldGroupVariant,
    color: {
      ...Object.fromEntries(BRANDS.map((color: string) => [color, ''])),
      neutral: '',
    },
    variant: {
      solid: '',
      outline: '',
      soft: '',
      subtle: '',
    },
    size: {
      xs: {
        base: 'text-[8px]/3 px-1 py-0.5 gap-1 rounded-sm',
        leadingIcon: 'size-3',
        leadingAvatarSize: '3xs',
        trailingIcon: 'size-3',
      },
      sm: {
        base: 'text-[10px]/3 px-1.5 py-1 gap-1 rounded-sm',
        leadingIcon: 'size-3',
        leadingAvatarSize: '3xs',
        trailingIcon: 'size-3',
      },
      md: {
        base: 'text-xs px-2 py-1 gap-1 rounded-md',
        leadingIcon: 'size-4',
        leadingAvatarSize: '3xs',
        trailingIcon: 'size-4',
      },
      lg: {
        base: 'text-sm px-2 py-1 gap-1.5 rounded-md',
        leadingIcon: 'size-5',
        leadingAvatarSize: '2xs',
        trailingIcon: 'size-5',
      },
      xl: {
        base: 'text-base px-2.5 py-1 gap-1.5 rounded-md',
        leadingIcon: 'size-6',
        leadingAvatarSize: '2xs',
        trailingIcon: 'size-6',
      },
    },
    square: {
      true: '',
    },
  },
  compoundVariants: [
    ...BRANDS.map((color: string) => ({
      color,
      variant: 'solid',
      class: `bg-${color} color-text-inverted`,
    })),
    ...BRANDS.map((color: string) => ({
      color,
      variant: 'outline',
      class: `color-${color} ring ring-inset ring-${color}/50`,
    })),
    ...BRANDS.map((color: string) => ({
      color,
      variant: 'soft',
      class: `bg-${color}/10 color-${color}`,
    })),
    ...BRANDS.map((color: string) => ({
      color,
      variant: 'subtle',
      class: `bg-${color}/10 color-${color} ring ring-inset ring-${color}/25`,
    })),
    {
      color: 'neutral',
      variant: 'solid',
      class: 'color-text-inverted bg-background-inverted',
    },
    {
      color: 'neutral',
      variant: 'outline',
      class: 'ring ring-inset ring-ring-accented color-text bg-background',
    },
    {
      color: 'neutral',
      variant: 'soft',
      class: 'color-text bg-background-elevated',
    },
    {
      color: 'neutral',
      variant: 'subtle',
      class: 'ring ring-inset ring-ring-accented color-text bg-background-elevated',
    },
    {
      size: 'xs',
      square: true,
      class: 'pohon:p-0.5',
    },
    {
      size: 'sm',
      square: true,
      class: 'pohon:p-1',
    },
    {
      size: 'md',
      square: true,
      class: 'pohon:p-1',
    },
    {
      size: 'lg',
      square: true,
      class: 'pohon:p-1',
    },
    {
      size: 'xl',
      square: true,
      class: 'pohon:p-1',
    },
  ],
} satisfies PThemeBadge;
