// @unocss-include
import type { PThemeColorPicker } from 'pohon-ui';

export const themeColorPicker = {
  slots: {
    root: 'data-[disabled]:opacity-75',
    picker: 'flex gap-4',
    selector: 'rounded-md touch-none',
    selectorBackground: 'rounded-md h-full w-full relative',
    selectorThumb: 'rounded-full size-4 cursor-pointer ring-2 ring-white absolute data-[disabled]:cursor-not-allowed -translate-x-1/2 -translate-y-1/2',
    track: 'rounded-md w-[8px] relative touch-none',
    trackThumb: 'rounded-full size-4 cursor-pointer ring-2 ring-white transform absolute data-[disabled]:cursor-not-allowed -translate-x-[4px] -translate-y-1/2 rtl:translate-x-[4px]',
  },
  variants: {
    size: {
      xs: {
        selector: 'h-38 w-38',
        track: 'h-38',
      },
      sm: {
        selector: 'h-40 w-40',
        track: 'h-40',
      },
      md: {
        selector: 'h-42 w-42',
        track: 'h-42',
      },
      lg: {
        selector: 'h-44 w-44',
        track: 'h-44',
      },
      xl: {
        selector: 'h-46 w-46',
        track: 'h-46',
      },
    },
  },
} satisfies PThemeColorPicker;
