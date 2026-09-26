// @unocss-include
import type { PThemeChangelogVersion } from 'pohon-ui';

export const themeChangelogVersion = {
  slots: {
    root: 'relative',
    container: 'mx-auto flex flex-col max-w-2xl',
    meta: 'mb-2 flex gap-3 items-center',
    date: 'text-sm/6 color-text-toned truncate',
    title: 'text-xl color-text-highlighted font-600 text-pretty relative',
    description: 'text-base color-text-muted mt-1 text-pretty',
    imageWrapper: 'group/changelog-version-image mt-5 rounded-lg aspect-[16/9] relative overflow-hidden',
    image: 'h-full w-full object-cover object-top',
    authors: 'flex flex-wrap gap-x-4 gap-y-1.5',
    footer: 'pt-5 border-t border-border flex items-center justify-between',
    indicator: 'gap-3 min-w-0 w-32 hidden items-center start-0 top-0 justify-end absolute lg:flex',
    dot: 'my-1 rounded-full bg-background flex size-4 ring ring-ring items-center justify-center',
    dotInner: 'rounded-full bg-primary size-2',
  },
  variants: {
    body: {
      false: {
        footer: 'mt-5',
      },
    },
    badge: {
      false: {
        meta: 'lg:hidden',
      },
    },
    to: {
      true: {
        title: 'outline-primary/25 rounded-xs transition has-focus-visible:outline-3',
        image: 'transform transition-transform ease-out group-has-focus-visible/changelog-version-image:scale-105 group-hover/changelog-version-image:scale-105 motion-reduce:transition-none',
      },
    },
    hidden: {
      true: {
        date: 'lg:hidden',
      },
    },
  },
} satisfies PThemeChangelogVersion;
