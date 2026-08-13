// @unocss-include
import type { PThemeUser } from 'pohon-ui';

export const user = {
  slots: {
    root: 'relative group/user',
    wrapper: '',
    name: 'font-medium',
    description: 'color-text-muted',
    avatar: 'shrink-0',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'flex items-center',
      },
      vertical: {
        root: 'flex flex-col',
      },
    },
    to: {
      true: {
        name: 'color-text peer-hover:color-text-highlighted peer-focus-visible:color-text-highlighted transition-colors',
        description: 'peer-hover:color-text-toned peer-focus-visible:color-text-toned transition-colors',
        avatar: 'transform transition-transform-200 group-hover/user:scale-115 group-has-focus-visible/user:scale-115',
      },
      false: {
        name: 'color-text-highlighted',
        description: '',
      },
    },
    size: {
      '3xs': {
        root: 'gap-1',
        wrapper: 'flex items-center gap-1',
        name: 'text-xs',
        description: 'text-xs',
      },
      '2xs': {
        root: 'gap-1.5',
        wrapper: 'flex items-center gap-1.5',
        name: 'text-xs',
        description: 'text-xs',
      },
      'xs': {
        root: 'gap-1.5',
        wrapper: 'flex items-center gap-1.5',
        name: 'text-xs',
        description: 'text-xs',
      },
      'sm': {
        root: 'gap-2',
        name: 'text-xs',
        description: 'text-xs',
      },
      'md': {
        root: 'gap-2',
        name: 'text-sm',
        description: 'text-xs',
      },
      'lg': {
        root: 'gap-2.5',
        name: 'text-sm',
        description: 'text-sm',
      },
      'xl': {
        root: 'gap-2.5',
        name: 'text-base',
        description: 'text-sm',
      },
      '2xl': {
        root: 'gap-3',
        name: 'text-base',
        description: 'text-base',
      },
      '3xl': {
        root: 'gap-3',
        name: 'text-lg',
        description: 'text-base',
      },
    },
  },
} satisfies PThemeUser;
