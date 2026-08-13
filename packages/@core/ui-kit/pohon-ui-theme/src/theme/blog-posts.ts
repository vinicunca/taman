// @unocss-include

import type { PThemeBlogPosts } from 'pohon-ui';

export const blogPosts = {
  base: 'flex flex-col gap-8 lg:gap-y-16',
  variants: {
    orientation: {
      horizontal: 'sm:grid sm:grid-cols-2 lg:grid-cols-3',
      vertical: '',
    },
  },
} satisfies PThemeBlogPosts;
