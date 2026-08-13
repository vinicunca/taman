// @unocss-include

import type { PThemeSelectMenu } from 'pohon-ui';
import { isString } from '@taman-core/shared/utils';
import { defu } from 'defu';
import { select } from './select.ts';

export const selectMenu = {
  slots: {
    ...select.slots,
    input: 'border-b border-border',
    focusScope: 'flex flex-col min-h-0',
    content: [select.slots.content, 'max-h-[min(15rem,var(--akar-combobox-content-available-height))] origin-$akar-combobox-content-transform-origin akar:w-$akar-combobox-trigger-width'],
    trailingClear: 'p-0',
    viewport: 'flex-1 relative overflow-y-auto scroll-py-1',
  },
  variants: defu(
    {
      virtualize: {
        true: {
          viewport: 'p-1 isolate',
        },
        false: {
          viewport: 'divide-y divide-divide',
        },
      },
    },
    select.variants,
  ),
  compoundVariants: [
    ...select.compoundVariants.map((item) => ({
      ...item,
      class: isString(item.class) ? replaceFocus(item.class) : item.class,
    })),
  ],
} satisfies PThemeSelectMenu;

function replaceFocus(str: string): string {
  return str
    .replace(/focus:/g, 'focus-visible:');
}
