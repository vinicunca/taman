// @unocss-include

import type { PThemeSelectMenu } from 'pohon-ui';
import { defuFn } from 'defu';
import { themeSelect } from './theme.select.ts';

export const themeSelectMenu = defuFn(
  {
    slots: {
      input: 'border-b border-border',
      focusScope: 'flex flex-col min-h-0',
      viewport: 'flex-1 relative overflow-y-auto scroll-py-1',
      content: (content: string) => [
        content,
        'max-h-[min(15rem,var(--akar-combobox-content-available-height,15rem))] origin-$akar-combobox-content-transform-origin w-$akar-combobox-trigger-width',
      ],
      trailingClear: 'pohon:p-0',
    },
    variants: {
      virtualize: {
        true: {
          viewport: 'p-1 isolate',
        },
        false: {
          viewport: 'divide-divide divide-y',
        },
      },
    },
  },
  themeSelect,
) as PThemeSelectMenu;
