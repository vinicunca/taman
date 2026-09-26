// @unocss-include
import type { PThemePagination } from 'pohon-ui';

export const themePagination = {
  slots: {
    root: '',
    list: 'flex gap-1 items-center',
    ellipsis: 'pointer-events-none',
    label: 'text-center min-w-5',
    first: '',
    prev: '',
    item: '',
    next: '',
    last: '',
  },
} satisfies PThemePagination;
