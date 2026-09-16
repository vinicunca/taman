// @unocss-include
import type { PThemeFileUpload } from 'pohon-ui';

import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeFileUpload = {
  slots: {
    root: 'flex flex-col relative',
    base: 'bg-background border-border border rounded-lg flex flex-1 flex-col gap-2 w-full transition-[background-color] ease-out items-stretch justify-center focus-visible:outline-3',
    wrapper: 'text-center flex flex-col items-center justify-center',
    icon: 'shrink-0',
    avatar: 'shrink-0',
    label: 'color-text font-500 mt-2',
    description: 'color-text-muted mt-1',
    actions: 'mt-4 flex shrink-0 flex-wrap gap-1.5',
    files: '',
    file: 'relative',
    fileLeadingAvatar: 'shrink-0',
    fileWrapper: 'flex flex-col min-w-0',
    fileName: 'color-text truncate',
    fileSize: 'color-text-muted truncate',
    fileTrailingButton: '',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color) => [color, ''])),
      neutral: '',
    },
    variant: {
      area: {
        wrapper: 'px-4 py-3',
        base: 'p-4',
      },
      button: {
      },
    },
    size: {
      xs: {
        base: 'text-xs',
        icon: 'size-4',
        file: 'text-xs px-2 py-1 gap-1',
        fileWrapper: 'flex-row gap-1',
      },
      sm: {
        base: 'text-xs',
        icon: 'size-4',
        file: 'text-xs px-2.5 py-1.5 gap-1.5',
        fileWrapper: 'flex-row gap-1',
      },
      md: {
        base: 'text-sm',
        icon: 'size-5',
        file: 'text-xs px-2.5 py-1.5 gap-1.5',
      },
      lg: {
        base: 'text-sm',
        icon: 'size-5',
        file: 'text-sm px-3 py-2 gap-2',
        fileSize: 'text-xs',
      },
      xl: {
        base: 'text-base',
        icon: 'size-6',
        file: 'text-sm px-3 py-2 gap-2',
      },
    },
    layout: {
      list: {
        root: 'gap-2 items-start',
        files: 'flex flex-col gap-2 w-full',
        file: 'border-border border rounded-md flex min-w-0 w-full items-center',
        fileTrailingButton: 'ms-auto',
      },
      grid: {
        fileWrapper: 'hidden',
        fileLeadingAvatar: 'pohon:rounded-lg pohon:size-full',
        fileTrailingButton: 'border-border-bg pohon:p-0 border-2 pohon:rounded-full absolute -end-1.5 -top-1.5',
      },
    },
    position: {
      inside: '',
      outside: '',
    },
    dropzone: {
      true: 'data-[dragging=true]:bg-background-elevated/25 border-dashed',
    },
    interactive: {
      true: '',
    },
    highlight: {
      true: '',
    },
    multiple: {
      true: '',
    },
    disabled: {
      true: 'opacity-75 cursor-not-allowed',
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      class: `outline-${color}/25 focus-visible:outline-3 focus-visible:border-${color}`,
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      highlight: true,
      class: `border-${color}`,
    })),
    {
      color: 'neutral',
      class: 'outline-outline-inverted/25 focus-visible:outline-3 focus-visible:border-border-inverted',
    },
    {
      color: 'neutral',
      highlight: true,
      class: 'border-border-inverted',
    },
    {
      size: 'xs',
      layout: 'list',
      class: {
        fileTrailingButton: '-me-1',
      },
    },
    {
      size: 'sm',
      layout: 'list',
      class: {
        fileTrailingButton: '-me-1.5',
      },
    },
    {
      size: 'md',
      layout: 'list',
      class: {
        fileTrailingButton: '-me-1.5',
      },
    },
    {
      size: 'lg',
      layout: 'list',
      class: {
        fileTrailingButton: '-me-2',
      },
    },
    {
      size: 'xl',
      layout: 'list',
      class: {
        fileTrailingButton: '-me-2',
      },
    },
    {
      variant: 'button',
      size: 'xs',
      class: {
        base: 'p-1',
      },
    },
    {
      variant: 'button',
      size: 'sm',
      class: {
        base: 'p-1.5',
      },
    },
    {
      variant: 'button',
      size: 'md',
      class: {
        base: 'p-1.5',
      },
    },
    {
      variant: 'button',
      size: 'lg',
      class: {
        base: 'p-2',
      },
    },
    {
      variant: 'button',
      size: 'xl',
      class: {
        base: 'p-2',
      },
    },
    {
      layout: 'grid',
      multiple: true,
      class: {
        files: 'grid grid-cols-2 md:grid-cols-3 gap-4 w-full',
        file: 'pohon:p-0 aspect-square',
      },
    },
    {
      layout: 'grid',
      multiple: false,
      class: {
        file: 'pohon:absolute inset-0 pohon:p-0',
      },
    },
    {
      interactive: true,
      disabled: false,
      class: 'hover:bg-background-elevated/25',
    },
  ],
} satisfies PThemeFileUpload;
