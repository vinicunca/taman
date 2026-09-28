// @unocss-include

import type { VariantProps } from 'unocss-variants';
import { createUv } from 'unocss-variants';

const uv = createUv();

export const sheetVariants = uv({
  variants: {
    side: {
      top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
      right: 'inset-y-0 right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      bottom: 'inset-x-0 bottom-0 border-t border-border data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
      left: 'inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
    },
  },
  defaultVariants: {
    side: 'right',
  },
});

export type SheetVariants = VariantProps<typeof sheetVariants>;
