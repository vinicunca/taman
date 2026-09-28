// @unocss-include

import type { PThemeInputTags } from 'pohon-ui';
import { defuFn } from 'defu';
import { fieldGroupVariant } from './theme.field-group.ts';
import { themeInput } from './theme.input.ts';

export const themeInputTags = defuFn(
  {
    slots: {
      root: (prev: string) => [prev, 'flex-wrap'],
      base: () => 'rounded-md transition-colors',
      item: 'px-1.5 py-0.5 rounded-sm font-500 inline-flex items-center gap-0.5 ring ring-inset ring-ring-accented bg-background-elevated color-text data-disabled:(cursor-not-allowed opacity-75) wrap-anywhere data-[state="active"]:bg-background-accented',
      itemText: '',
      itemDelete: 'inline-flex items-center rounded-xs color-text-dimmed hover:color-text hover:bg-background-accented/75 disabled:pointer-events-none transition-colors',
      itemDeleteIcon: 'shrink-0',
      input: 'flex-1 border-0 bg-transparent placeholder:color-text-dimmed focus:outline-none disabled:(cursor-not-allowed opacity-75)',
    },
    variants: {
      ...fieldGroupVariant,

      size: {
        xs: {
          item: 'text-[10px]/3',
          itemDeleteIcon: 'size-3',
        },
        sm: {
          item: 'text-[10px]/3',
          itemDeleteIcon: 'size-3',
        },
        md: {
          item: 'text-xs',
          itemDeleteIcon: 'size-3.5',
        },
        lg: {
          item: 'text-xs',
          itemDeleteIcon: 'size-3.5',
        },
        xl: {
          item: 'text-sm',
          itemDeleteIcon: 'size-4',
        },
      },
      variant: (prev: Record<string, string>) => Object.fromEntries(
        Object.entries(prev).map(([key, value]) => [key, replaceFocus(value)]),
      ),
    },
    compoundVariants: (prev: Array<Record<string, any>>) => prev.map((item) => ({
      ...item,
      class: typeof item.class === 'string' ? replaceFocus(item.class) : item.class,
    })),
  },
  themeInput,
) as PThemeInputTags;

function replaceFocus(str: string): string {
  return str
    .replace(/focus:/g, 'has-focus:')
    .replace(/focus-visible:/g, 'has-focus-visible:');
}
