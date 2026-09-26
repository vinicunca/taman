// @unocss-include
import type { PThemeMarquee } from 'pohon-ui';

export const themeMarquee = {
  slots: {
    root: 'group flex gap-$gap [--duration:20s] [--gap:--spacing(16)] items-center relative overflow-hidden',
    content: 'flex shrink-0 gap-$gap min-w-max items-center justify-around',
  },
  variants: {
    orientation: {
      horizontal: {
        content: 'w-full',
      },
      vertical: {
        content: 'h-full',
      },
    },
    pauseOnHover: {
      true: {
        content: 'group-hover:[animation-play-state:paused]',
      },
    },
    reverse: {
      true: {
        content: '![animation-direction:reverse]',
      },
    },
    overlay: {
      true: {
        root: 'after:(pointer-events-none content-empty absolute z-2 from-background to-transparent) before:(pointer-events-none content-empty absolute z-2 from-background to-transparent)',
      },
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      class: {
        root: 'flex-row',
        content: 'flex-row motion-safe:animate-marquee motion-safe:rtl:animate-marquee backface-hidden',
      },
    },
    {
      orientation: 'horizontal',
      overlay: true,
      class: {
        root: 'backface-hidden after:(h-full w-1/3 content-empty end-0 inset-y-0 bg-gradient-to-l) before:(h-full w-1/3 content-empty start-0 inset-y-0 bg-gradient-to-r) rtl:after:bg-gradient-to-r rtl:before:bg-gradient-to-l',
      },
    },
    {
      orientation: 'vertical',
      class: {
        root: 'flex-col',
        content: 'flex-col motion-safe:animate-marquee-vertical pohon:h-fit backface-hidden',
      },
    },
    {
      orientation: 'vertical',
      overlay: true,
      class: {
        root: 'backface-hidden after:(h-1/3 w-full content-empty inset-x-0 bottom-0 bg-gradient-to-t) before:(h-1/3 w-full content-empty inset-x-0 top-0 bg-gradient-to-b)',
      },
    },
  ],
} satisfies PThemeMarquee;
