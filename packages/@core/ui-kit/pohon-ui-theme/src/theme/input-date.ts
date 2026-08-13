// @unocss-include

import type { PThemeInputDate } from 'pohon-ui';
import { omit } from '@taman-core/shared/utils';
import { defu } from 'defu';
import { input } from './input.ts';

const inputSlots = omit(input.slots, ['root', 'base']);

export const inputDate = {
  slots: {
    ...inputSlots,
    base: 'group relative inline-flex items-center rounded-md select-none transition-colors',
    segment: 'rounded text-center outline-hidden data-placeholder:color-text-dimmed data-[segment=literal]:color-text-muted data-invalid:text-error data-disabled:cursor-not-allowed data-disabled:opacity-75 transition-colors',
    separatorIcon: 'shrink-0 size-4 color-text-muted',
  },
  variants: defu(
    {
      size: {
        xs: {
          base: [input.variants.size.xs.base, 'akar:gap-0.25'],
          segment: 'data-[segment=day]:w-6 data-[segment=month]:w-6 data-[segment=year]:w-9',
        },
        sm: {
          base: [input.variants.size.sm.base, 'akar:gap-0.5'],
          segment: 'data-[segment=day]:w-6 data-[segment=month]:w-6 data-[segment=year]:w-9',
        },
        md: {
          base: [input.variants.size.md.base, 'akar:gap-0.5'],
          segment: 'data-[segment=day]:w-7 data-[segment=month]:w-7 data-[segment=year]:w-11',
        },
        lg: {
          base: [input.variants.size.lg.base, 'akar:gap-0.75'],
          segment: 'data-[segment=day]:w-7 data-[segment=month]:w-7 data-[segment=year]:w-11',
        },
        xl: {
          base: [input.variants.size.xl.base, 'akar:gap-0.75'],
          segment: 'data-[segment=day]:w-8 data-[segment=month]:w-8 data-[segment=year]:w-13',
        },
      },
    },
    input.variants,
  ),
  compoundVariants: [
    ...input.compoundVariants,
    {
      variant: 'outline',
      class: {
        segment: 'focus:bg-background-elevated',
      },
    },
    {
      variant: 'soft',
      class: {
        segment: 'focus:bg-background-accented/50 group-hover:focus:bg-background-accented',
      },
    },
    {
      variant: 'subtle',
      class: {
        segment: 'focus:bg-background-accented',
      },
    },
    {
      variant: 'ghost',
      class: {
        segment: 'focus:bg-background-elevated group-hover:focus:bg-background-accented',
      },
    },
    {
      variant: 'none',
      class: {
        segment: 'focus:bg-background-elevated',
      },
    },
  ],
} satisfies PThemeInputDate;
