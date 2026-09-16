// @unocss-include
import type { PThemeChangelogVersion, PThemeChangelogVersions } from 'pohon-ui';

export const themeChangelogVersions = {
  slots: {
    root: 'relative',
    container: 'flex flex-col gap-y-8 lg:gap-y-16 sm:gap-y-12',
    indicator: 'bg-border h-full w-px hidden start-32 inset-y-3 absolute overflow-hidden -ms-[8.5px] lg:block',
    beam: 'bg-primary will-change-[height] w-full start-0 top-0 absolute',
  },
} satisfies PThemeChangelogVersions;

export const themeChangelogVersion = {
  slots: {
    root: 'relative',
    container: 'mx-auto flex flex-col max-w-2xl',
    meta: 'mb-2 flex gap-3 items-center',
    date: 'color-text-toned text-sm/6 truncate',
    title: 'color-text-highlighted text-xl font-600 text-pretty relative',
    description: 'color-text-muted text-base mt-1 text-pretty',
    imageWrapper: 'group/changelog-version-image mt-5 rounded-lg aspect-[16/9] relative overflow-hidden',
    image: 'h-full w-full object-cover object-top',
    authors: 'flex flex-wrap gap-x-4 gap-y-1.5',
    footer: 'border-border pt-5 border-t flex items-center justify-between',
    indicator: 'gap-3 min-w-0 w-32 hidden items-center start-0 top-0 justify-end absolute lg:flex',
    dot: 'bg-background ring-ring my-1 rounded-full flex size-4 ring items-center justify-center',
    dotInner: 'bg-primary rounded-full size-2',
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
