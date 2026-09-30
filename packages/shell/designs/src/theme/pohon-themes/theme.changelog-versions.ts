// @unocss-include

import type { PThemeChangelogVersions } from 'pohon-ui';

export const themeChangelogVersions = {
  slots: {
    root: 'relative',
    container: 'flex flex-col gap-y-8 lg:gap-y-16 sm:gap-y-12',
    indicator: 'bg-border h-full w-px hidden start-32 inset-y-3 absolute overflow-hidden -ms-[8.5px] lg:block',
    beam: 'will-change-[height] bg-primary w-full start-0 top-0 absolute',
  },
} satisfies PThemeChangelogVersions;
