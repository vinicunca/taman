// @unocss-include

import type { PThemeFieldGroup } from 'pohon-ui';

export const fieldGroupVariant = {
  fieldGroup: {
    horizontal: 'first:not-[*:only-child]:rounded-e-none last:not-[*:only-child]:rounded-s-none not-last:not-first:rounded-none focus-visible:z-1',
    vertical: 'first:not-[*:only-child]:rounded-b-none last:not-[*:only-child]:rounded-t-none not-last:not-first:rounded-none focus-visible:z-1',
  },
};

export const fieldGroupVariantWithRoot = {
  fieldGroup: {
    horizontal: {
      root: 'group has-focus-visible:z-1',
      base: 'group-not-[*:only-child]:group-first:rounded-e-none group-not-[*:only-child]:group-last:rounded-s-none group-not-last:group-not-first:rounded-none',
    },
    vertical: {
      root: 'group has-focus-visible:z-1',
      base: 'group-not-[*:only-child]:group-first:rounded-b-none group-not-[*:only-child]:group-last:rounded-t-none group-not-last:group-not-first:rounded-none',
    },
  },
};

export const fieldGroup = {
  base: 'relative',
  variants: {
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
    orientation: {
      horizontal: 'inline-flex -space-x-px',
      vertical: 'flex flex-col -space-y-px',
    },
  },
} satisfies PThemeFieldGroup;
