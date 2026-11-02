// @unocss-include
import type { PThemeTextarea } from 'pohon-ui';
import { defu } from 'defu';
import { themeInput } from './theme.input.ts';

export const themeTextarea = defu(
  {
    slots: {
      leading: 'flex items-start start-0 absolute',
      trailing: 'flex items-start end-0 absolute',
    },
    variants: {
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
  },
  themeInput,
) as PThemeTextarea;
