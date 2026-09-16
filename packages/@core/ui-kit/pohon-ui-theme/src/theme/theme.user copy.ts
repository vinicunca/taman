// @unocss-include
import type {
  PThemeUser,
} from 'pohon-ui';

export const themeUser = {
  slots: {
    root: 'group/user relative',
    name: 'font-500',
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
        root: 'outline-primary/25 rounded-md transition has-[>a:focus-visible]:outline-3',
        name: 'color-text peer-hover:color-text-highlighted peer-focus-visible:color-text-highlighted transition-colors',
        description: 'peer-hover:color-text-toned peer-focus-visible:color-text-toned transition-colors',
        avatar: 'transform transition-transform ease-out group-has-focus-visible/user:scale-115 group-hover/user:scale-115 motion-reduce:transition-none',
      },
      false: {
        name: 'color-text-highlighted',
      },
    },
    size: {
      '3xs': {
        root: 'gap-1',
        wrapper: 'flex gap-1 items-center',
        name: 'text-xs',
        description: 'text-xs',
      },
      '2xs': {
        root: 'gap-1.5',
        wrapper: 'flex gap-1.5 items-center',
        name: 'text-xs',
        description: 'text-xs',
      },
      'xs': {
        root: 'gap-1.5',
        wrapper: 'flex gap-1.5 items-center',
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
