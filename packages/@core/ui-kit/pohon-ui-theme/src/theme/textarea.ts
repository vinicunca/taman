// @unocss-include

import type { PThemeTextarea } from 'pohon-ui';
import { defu } from 'defu';
import { input } from './input.ts';

export const textarea = {
  slots: {
    ...input.slots,
    leading: 'absolute start-0 flex items-start',
    trailing: 'absolute end-0 flex items-start',
  },
  variants: defu(
    {
      autoresize: {
        true: {
          base: 'resize-none',
        },
      },
      size: {
        xs: {
          leading: 'ps-2 inset-y-1',
          trailing: 'pe-2 inset-y-1',
        },
        sm: {
          leading: 'ps-2.5 inset-y-1.5',
          trailing: 'pe-2.5 inset-y-1.5',
        },
        md: {
          leading: 'ps-2.5 inset-y-1.5',
          trailing: 'pe-2.5 inset-y-1.5',
        },
        lg: {
          leading: 'ps-3 inset-y-2',
          trailing: 'pe-3 inset-y-2',
        },
        xl: {
          leading: 'ps-3 inset-y-2',
          trailing: 'pe-3 inset-y-2',
        },
      },
    },
    input.variants,
  ),
  compoundVariants: input.compoundVariants,
} satisfies PThemeTextarea;
