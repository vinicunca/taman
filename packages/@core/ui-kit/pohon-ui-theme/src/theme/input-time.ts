// @unocss-include
import type { PThemeInputTime } from 'pohon-ui';
import { omit } from '@taman-core/shared/utils';
import { defu } from 'defu';
import { input } from './input.ts';

const inputSlots = omit(input.slots, ['root', 'base']);

export const inputTime = {
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
          base: [input.variants.size.xs.base, 'gap-0.25'],
          segment: 'not-data-[segment=literal]:w-8',
        },
        sm: {
          base: [input.variants.size.sm.base, 'gap-0.5'],
          segment: 'not-data-[segment=literal]:w-8',
        },
        md: {
          base: [input.variants.size.md.base, 'gap-0.5'],
          segment: 'not-data-[segment=literal]:w-9',
        },
        lg: {
          base: [input.variants.size.lg.base, 'gap-0.75'],
          segment: 'not-data-[segment=literal]:w-9',
        },
        xl: {
          base: [input.variants.size.xl.base, 'gap-0.75'],
          segment: 'not-data-[segment=literal]:w-10',
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
} satisfies PThemeInputTime;
