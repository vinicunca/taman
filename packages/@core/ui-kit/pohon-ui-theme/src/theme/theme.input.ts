// @unocss-include
import type { PThemeInput } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';
import { fieldGroupVariantWithRoot } from './theme.field-group.ts';

export const themeInput = {
  slots: {
    root: 'inline-flex items-center relative',
    base: 'placeholder:color-text-dimmed appearance-none border-0 rounded-md w-full transition-colors disabled:(opacity-75 cursor-not-allowed)',
    leading: 'flex items-center start-0 inset-y-0 absolute',
    leadingIcon: 'color-text-dimmed shrink-0',
    leadingAvatar: 'shrink-0',
    leadingAvatarSize: '',
    trailing: 'flex items-center end-0 inset-y-0 absolute',
    trailingIcon: 'color-text-dimmed shrink-0',
  },
  variants: {
    ...fieldGroupVariantWithRoot,
    size: {
      xs: {
        base: 'text-sm/4 px-2 py-1 gap-1',
        leading: 'ps-2',
        trailing: 'pe-2',
        leadingIcon: 'size-4',
        leadingAvatarSize: '3xs',
        trailingIcon: 'size-4',
      },
      sm: {
        base: 'text-sm/4 px-2.5 py-1.5 gap-1.5',
        leading: 'ps-2.5',
        trailing: 'pe-2.5',
        leadingIcon: 'size-4',
        leadingAvatarSize: '3xs',
        trailingIcon: 'size-4',
      },
      md: {
        base: 'text-base/5 px-2.5 py-1.5 gap-1.5',
        leading: 'ps-2.5',
        trailing: 'pe-2.5',
        leadingIcon: 'size-5',
        leadingAvatarSize: '2xs',
        trailingIcon: 'size-5',
      },
      lg: {
        base: 'text-base/5 px-3 py-2 gap-2',
        leading: 'ps-3',
        trailing: 'pe-3',
        leadingIcon: 'size-5',
        leadingAvatarSize: '2xs',
        trailingIcon: 'size-5',
      },
      xl: {
        base: 'text-base px-3 py-2 gap-2',
        leading: 'ps-3',
        trailing: 'pe-3',
        leadingIcon: 'size-6',
        leadingAvatarSize: 'xs',
        trailingIcon: 'size-6',
      },
    },
    variant: {
      outline: 'color-text-highlighted bg-background ring-ring-accented ring ring-inset',
      soft: 'color-text-highlighted bg-background-elevated/50 hover:bg-background-elevated focus:bg-background-elevated disabled:bg-background-elevated/50',
      subtle: 'color-text-highlighted bg-background-elevated ring-ring-accented ring ring-inset',
      ghost: 'color-text-highlighted hover:bg-background-elevated focus:bg-background-elevated bg-transparent disabled:bg-transparent dark:disabled:bg-transparent',
      none: 'color-text-highlighted bg-transparent focus:outline-none',
    },
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color) => [color, ''])),
      neutral: '',
    },
    leading: {
      true: '',
    },
    trailing: {
      true: '',
    },
    loading: {
      true: '',
    },
    highlight: {
      true: '',
    },
    fixed: {
      false: '',
    },
    type: {
      file: 'file:color-text-muted file:font-500 file:me-1.5 file:outline-none',
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      variant: ['outline', 'subtle'],
      class: `outline-${color}/25 focus-visible:outline-3 focus-visible:ring-${color}`,
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      variant: ['soft', 'ghost'],
      class: `outline-${color}/25 focus-visible:outline-3`,
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      highlight: true,
      class: `ring ring-inset pohon:ring-${color}`,
    })),
    {
      color: 'neutral',
      variant: ['outline', 'subtle'],
      class: 'outline-outline-inverted/25 focus-visible:outline-3 focus-visible:ring-ring-inverted',
    },
    {
      color: 'neutral',
      variant: ['soft', 'ghost'],
      class: 'outline-outline-inverted/25 focus-visible:outline-3',
    },
    {
      color: 'neutral',
      highlight: true,
      class: 'ring ring-inset ring-ring-inverted',
    },
    {
      leading: true,
      size: 'xs',
      class: 'ps-7',
    },
    {
      leading: true,
      size: 'sm',
      class: 'ps-8',
    },
    {
      leading: true,
      size: 'md',
      class: 'ps-9',
    },
    {
      leading: true,
      size: 'lg',
      class: 'ps-10',
    },
    {
      leading: true,
      size: 'xl',
      class: 'ps-11',
    },
    {
      trailing: true,
      size: 'xs',
      class: 'pe-7',
    },
    {
      trailing: true,
      size: 'sm',
      class: 'pe-8',
    },
    {
      trailing: true,
      size: 'md',
      class: 'pe-9',
    },
    {
      trailing: true,
      size: 'lg',
      class: 'pe-10',
    },
    {
      trailing: true,
      size: 'xl',
      class: 'pe-11',
    },
    {
      loading: true,
      leading: true,
      class: {
        leadingIcon: 'animate-spin',
      },
    },
    {
      loading: true,
      leading: false,
      trailing: true,
      class: {
        trailingIcon: 'animate-spin',
      },
    },
    {
      fixed: false,
      size: 'xs',
      class: 'md:text-xs',
    },
    {
      fixed: false,
      size: 'sm',
      class: 'md:text-xs',
    },
    {
      fixed: false,
      size: 'md',
      class: 'md:text-sm',
    },
    {
      fixed: false,
      size: 'lg',
      class: 'md:text-sm',
    },
  ],
} satisfies PThemeInput;
