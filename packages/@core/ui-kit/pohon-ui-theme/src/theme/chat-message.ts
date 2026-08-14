// @unocss-include

import type { PThemeChatMessage } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const chatMessage = {
  slots: {
    root: 'group/message relative w-full',
    header: 'mb-1.5',
    container: 'relative flex items-start',
    leading: 'inline-flex items-center justify-center min-h-6',
    leadingIcon: 'shrink-0',
    leadingAvatar: 'shrink-0',
    leadingAvatarSize: '',
    files: 'flex items-center gap-1.5',
    content: 'relative text-pretty min-w-0 *:first:mt-0 *:last:mb-0',
    actions: '[@media(hover:hover)]:opacity-0 group-hover/message:opacity-100 absolute bottom-0 flex items-center transition-opacity',
  },
  variants: {
    variant: {
      solid: '',
      outline: '',
      soft: '',
      subtle: '',
      naked: '',
    },
    side: {
      left: {},
      right: {
        container: 'justify-end ms-auto max-w-[75%]',
        files: 'justify-end',
      },
    },
    leading: {
      true: '',
    },
    actions: {
      true: '',
    },
    compact: {
      true: {
        root: 'scroll-mt-3',
        container: 'gap-1.5 pb-3',
        content: 'space-y-2',
        leadingIcon: 'size-5',
        leadingAvatarSize: '2xs',
      },
      false: {
        root: 'scroll-mt-4 sm:scroll-mt-6',
        container: 'gap-3 pb-8',
        content: 'space-y-4',
        leadingIcon: 'size-8',
        leadingAvatarSize: 'md',
      },
    },
  },
  compoundVariants: [
    {
      compact: true,
      actions: true,
      class: {
        container: 'pb-8',
      },
    },
    {
      leading: true,
      compact: false,
      side: 'left',
      class: {
        actions: 'left-11',
      },
    },
    {
      leading: true,
      compact: true,
      side: 'left',
      class: {
        actions: 'left-6.5',
      },
    },
    {
      variant: ['solid', 'outline', 'soft', 'subtle'],
      compact: false,
      class: {
        content: 'px-4 py-3 rounded-lg min-h-12',
        leading: 'mt-2',
      },
    },
    {
      variant: ['solid', 'outline', 'soft', 'subtle'],
      compact: true,
      class: {
        content: 'px-2 py-1 rounded-lg min-h-8',
        leading: 'mt-1',
      },
    },
    {
      variant: 'naked',
      side: 'left',
      class: {
        content: 'w-full',
      },
    },
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'solid',
      class: {
        content: `bg-${color} color-text-inverted`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'outline',
      class: {
        content: `color-${color} ring ring-${color}/25`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'soft',
      class: {
        content: `bg-${color}/10 color-${color}`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'subtle',
      class: {
        content: `bg-${color}/10 text-${color} ring ring-${color}/25`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'naked',
      class: {
        content: `color-${color}`,
      },
    })),
    {
      color: 'neutral',
      variant: 'solid',
      class: {
        content: 'bg-background-inverted color-text-inverted',
      },
    },
    {
      color: 'neutral',
      variant: 'outline',
      class: {
        content: 'bg-background ring ring-ring',
      },
    },
    {
      color: 'neutral',
      variant: 'soft',
      class: {
        content: 'bg-background-elevated/50',
      },
    },
    {
      color: 'neutral',
      variant: 'subtle',
      class: {
        content: 'bg-background-elevated/50 ring ring-ring',
      },
    },
  ],
} satisfies PThemeChatMessage;
