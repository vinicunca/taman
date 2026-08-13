// @unocss-include

import type { PThemeInputTags } from 'pohon-ui';
import { isString, omit } from '@taman-core/shared/utils';
import { defu } from 'defu';
import { input } from './input.ts';

const inputSlots = omit(input.slots, ['root', 'base']);

export const inputTags = {
  slots: {
    ...inputSlots,
    root: [input.slots.root, 'flex-wrap'],
    base: 'rounded-md transition-colors',
    item: 'px-1.5 py-0.5 rounded-sm font-medium inline-flex items-center gap-0.5 ring ring-inset ring-ring-accented bg-background-elevated color-text data-[disabled]:cursor-not-allowed data-[disabled]:opacity-75 wrap-anywhere data-[state="active"]:bg-background-accented',
    itemText: '',
    itemDelete: 'inline-flex items-center rounded-xs color-text-dimmed hover:color-text hover:bg-background-accented/75 disabled:pointer-events-none transition-colors',
    itemDeleteIcon: 'shrink-0',
    input: 'flex-1 border-0 bg-transparent placeholder:color-text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75',
  },

  variants: defu(
    {
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
      variant: Object.fromEntries(
        Object.entries(input.variants.variant).map(([key, value]) => [key, replaceFocus(value)]),
      ),
    },
    input.variants,
  ),

  compoundVariants: [
    ...input.compoundVariants.map((item) => ({
      ...item,
      class: isString(item.class) ? replaceFocus(item.class) : item.class,
    })),
  ],
} satisfies PThemeInputTags;

function replaceFocus(str: string): string {
  return str
    .replace(/focus:/g, 'has-focus:')
    .replace(/focus-visible:/g, 'has-focus-visible:');
}
