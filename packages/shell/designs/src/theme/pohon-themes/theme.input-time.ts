// @unocss-include
import type { PThemeInputTime } from 'pohon-ui';
import { defuFn } from 'defu';
import { fieldGroupVariant } from './theme.field-group.ts';
import { themeInput } from './theme.input.ts';

export const themeInputTime = defuFn(
  {
    slots: {
      root: () => undefined,
      base: () => 'group rounded-md inline-flex select-none transition-colors items-center relative',
      segment: 'data-disabled:cursor-not-allowed data-disabled:opacity-75 text-center outline-hidden rounded-sm transition-colors data-[invalid]:color-error data-[placeholder]:color-text-dimmed data-[segment=literal]:color-text-muted',
      separatorIcon: 'color-text-muted shrink-0 size-4',
    },
    variants: {
      ...fieldGroupVariant,

      size: {
        xs: {
          base: (prev: string) => [prev, 'pohon:gap-0.25'],
          segment: 'not-[[data-segment=literal]]:w-8',
        },
        sm: {
          base: (prev: string) => [prev, 'pohon:gap-0.5'],
          segment: 'not-[[data-segment=literal]]:w-8',
        },
        md: {
          base: (prev: string) => [prev, 'pohon:gap-0.5'],
          segment: 'not-[[data-segment=literal]]:w-9',
        },
        lg: {
          base: (prev: string) => [prev, 'pohon:gap-0.75'],
          segment: 'not-[[data-segment=literal]]:w-9',
        },
        xl: {
          base: (prev: string) => [prev, 'pohon:gap-0.75'],
          segment: 'not-[[data-segment=literal]]:w-10',
        },
      },
      variant: (prev: Record<string, string>) => Object.fromEntries(
        Object.entries(prev).map(([key, value]) => [
          key,
          replaceFocus(value),
        ]),
      ),
    },

    compoundVariants: (prev: Array<Record<string, any>>) => [
      ...prev.map((item) => ({
        ...item,
        class: typeof item.class === 'string'
          ? replaceFocus(item.class)
          : item.class,
      })),
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
  },
  themeInput,
) as PThemeInputTime;

function replaceFocus(str: string): string {
  return str
    .replace(/focus:/g, 'has-focus:')
    .replace(/focus-visible:/g, 'has-focus-visible:');
}
