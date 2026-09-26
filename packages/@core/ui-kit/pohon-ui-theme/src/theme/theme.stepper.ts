// @unocss-include
import type { PThemeStepper } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeStepper = {
  slots: {
    root: 'flex gap-4',
    header: 'flex',
    item: 'group text-center w-full relative',
    container: 'relative',
    trigger: 'color-text-muted font-600 text-center align-middle rounded-full bg-background-elevated flex items-center justify-center group-data-[state=active]:color-text-inverted group-data-[state=completed]:color-text-inverted focus-visible:outline-3',
    indicator: 'flex size-full items-center justify-center',
    icon: 'shrink-0',
    separator: 'rounded-full bg-background-accented absolute group-data-[disabled]:opacity-75',
    wrapper: '',
    title: 'color-text font-500',
    description: 'color-text-muted text-wrap',
    content: 'size-full',
  },

  variants: {
    orientation: {
      horizontal: {
        root: 'flex-col',
        container: 'flex justify-center',
        separator: 'h-0.5 top-[calc(50%-2px)]',
        wrapper: 'mt-1',
      },
      vertical: {
        header: 'flex-col gap-4',
        item: 'text-start flex',
        separator: 'w-0.5 start-[calc(50%-1px)] -bottom-[10px]',
      },
    },

    size: {
      xs: {
        trigger: 'text-xs size-6',
        icon: 'size-3',
        title: 'text-xs',
        description: 'text-xs',
        wrapper: 'mt-1.5',
      },
      sm: {
        trigger: 'text-sm size-8',
        icon: 'size-4',
        title: 'text-xs',
        description: 'text-xs',
        wrapper: 'mt-2',
      },
      md: {
        trigger: 'text-base size-10',
        icon: 'size-5',
        title: 'text-sm',
        description: 'text-sm',
        wrapper: 'mt-2.5',
      },
      lg: {
        trigger: 'text-lg size-12',
        icon: 'size-6',
        title: 'text-base',
        description: 'text-base',
        wrapper: 'mt-3',
      },
      xl: {
        trigger: 'text-xl size-14',
        icon: 'size-7',
        title: 'text-lg',
        description: 'text-lg',
        wrapper: 'mt-3.5',
      },
    },

    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        trigger: `group-data-[state=completed]:bg-${color} group-data-[state=active]:bg-${color} outline-${color}/25`,
        separator: `group-data-[state=completed]:bg-${color}`,
      }])),
      neutral: {
        trigger: 'outline-outline-inverted/25 group-data-[state=active]:bg-background-inverted group-data-[state=completed]:bg-background-inverted',
        separator: 'group-data-[state=completed]:bg-background-inverted',
      },
    },
  },

  compoundVariants: [
    {
      orientation: 'horizontal',
      size: 'xs',
      class: { separator: 'start-[calc(50%+16px)] end-[calc(-50%+16px)]' },
    },
    {
      orientation: 'horizontal',
      size: 'sm',
      class: { separator: 'start-[calc(50%+20px)] end-[calc(-50%+20px)]' },
    },
    {
      orientation: 'horizontal',
      size: 'md',
      class: { separator: 'start-[calc(50%+28px)] end-[calc(-50%+28px)]' },
    },
    {
      orientation: 'horizontal',
      size: 'lg',
      class: { separator: 'start-[calc(50%+32px)] end-[calc(-50%+32px)]' },
    },
    {
      orientation: 'horizontal',
      size: 'xl',
      class: { separator: 'start-[calc(50%+36px)] end-[calc(-50%+36px)]' },
    },
    {
      orientation: 'vertical',
      size: 'xs',
      class: { separator: 'top-[30px]', item: 'gap-1.5' },
    },
    {
      orientation: 'vertical',
      size: 'sm',
      class: { separator: 'top-[38px]', item: 'gap-2' },
    },
    {
      orientation: 'vertical',
      size: 'md',
      class: { separator: 'top-[46px]', item: 'gap-2.5' },
    },
    {
      orientation: 'vertical',
      size: 'lg',
      class: { separator: 'top-[54px]', item: 'gap-3' },
    },
    {
      orientation: 'vertical',
      size: 'xl',
      class: { separator: 'top-[62px]', item: 'gap-3.5' },
    },
  ],
} satisfies PThemeStepper;
