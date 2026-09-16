// @unocss-include
import type {
  PThemeChatMessage,
  PThemeChatMessages,
  PThemeChatPalette,
  PThemeChatPrompt,
  PThemeChatReasoning,
  PThemeChatShimmer,
  PThemeChatTool,
} from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeChatMessages = {
  slots: {
    root: 'px-2.5 flex flex-1 flex-col gap-1 w-full [&>article]:last-of-type:min-h-(--last-message-height)',
    indicator: '*:bg-background-elevated py-3 flex gap-1 h-6 items-center *:rounded-full *:size-2 motion-safe:[&>*:nth-child(1)]:animate-[bounce_1s_infinite] motion-safe:[&>*:nth-child(2)]:animate-[bounce_1s_0.15s_infinite] motion-safe:[&>*:nth-child(3)]:animate-[bounce_1s_0.3s_infinite]',
    viewport: 'inset-x-0 top-[86%] absolute data-[state=closed]:animate-[fade-out_200ms_var(--ease-out)] data-[state=open]:animate-[fade-in_200ms_var(--ease-out)]',
    autoScroll: 'rounded-full translate-x-1/2 bottom-0 right-1/2 absolute',
  },
} satisfies PThemeChatMessages;

export const themeChatMessage = {
  slots: {
    root: 'group/message w-full relative',
    header: 'mb-1.5 flex',
    container: 'flex items-start relative',
    body: 'min-w-0',
    leading: 'inline-flex min-h-6 items-center justify-center',
    leadingIcon: 'shrink-0',
    leadingAvatar: 'shrink-0',
    leadingAvatarSize: '',
    files: 'flex gap-1.5 items-center',
    content: 'wrap-break-word text-pretty relative *:first:mt-0 *:last:mb-0',
    actions: 'flex transition-opacity ease-out items-center bottom-0 absolute [@media(hover:hover)]:opacity-0 group-hover/message:opacity-100',
  },
  variants: {
    side: {
      right: {
        container: 'ms-auto max-w-[75%] justify-end',
        header: 'justify-end',
        actions: 'right-0',
      },
    },
    compact: {
      true: {
        root: 'scroll-mt-3',
        container: 'pb-3 gap-1.5',
        content: 'space-y-2',
        leadingIcon: 'size-5',
        leadingAvatarSize: '2xs',
      },
      false: {
        root: 'scroll-mt-4 sm:scroll-mt-6',
        container: 'pb-8 gap-3',
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
        body: 'w-full',
        content: 'w-full',
      },
    },
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      variant: 'solid',
      class: {
        content: `bg-${color} color-text-inverted`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      variant: 'outline',
      class: {
        content: `color-${color} ring ring-${color}/25`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      variant: 'soft',
      class: {
        content: `bg-${color}/10 color-${color}`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      variant: 'subtle',
      class: {
        content: `bg-${color}/10 color-${color} ring ring-${color}/25`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
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

export const themeChatTool = {
  slots: {
    trigger: 'group color-text-muted disabled:hover:color-text-muted hover:color-text text-sm flex gap-1.5 min-w-0 w-full transition-colors items-center disabled:cursor-default',
    leading: 'shrink-0 size-4 relative',
    leadingIcon: 'shrink-0 size-4',
    chevronIcon: 'shrink-0 size-4 transition-transform-280 ease-out group-data-[state=open]:rotate-180 motion-reduce:transition-none',
    label: 'truncate',
    suffix: 'color-text-dimmed ms-1',
    trailingIcon: 'shrink-0 size-4 transition-transform-280 ease-out group-data-[state=open]:rotate-180 motion-reduce:transition-none',
    content: 'data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down data-[state=closed]:overflow-hidden',
    body: 'color-text-dimmed text-sm whitespace-pre-wrap',
    actions: 'flex gap-1.5 items-center justify-end',
  },
  variants: {
    variant: {
      inline: {
        trigger: 'outline-primary/25 rounded-sm focus-visible:outline-3',
        body: 'pt-2',
        actions: 'pt-2',
      },
      card: {
        root: 'ring-ring outline-primary/25 has-focus-visible:ring-primary rounded-md ring overflow-hidden has-focus-visible:outline-3',
        trigger: 'px-2 py-1 focus:outline-none',
        trailingIcon: 'ms-auto',
        body: 'border-border p-2 border-t max-h-[200px] overflow-y-auto focus:outline-none',
        actions: 'border-border p-2 border-t',
      },
    },
    loading: {
      true: {
        leadingIcon: 'animate-spin',
      },
    },
    alone: {
      false: {
        leadingIcon: 'transition-opacity-280 ease-out inset-0 absolute group-data-[state=open]:opacity-0 group-hover:opacity-0',
        chevronIcon: 'opacity-0 transition-[transform,opacity]-280 ease-out inset-0 absolute group-data-[state=open]:opacity-100 group-hover:opacity-100 motion-reduce:transition-none',
      },
    },
  },
} satisfies PThemeChatTool;

export const themeChatShimmer = {
  base: 'motion-reduce:color-text-muted text-transparent will-change-[background-position] bg-[image:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--ui-color-text-highlighted),#0000_calc(50%+var(--spread))),linear-gradient(var(--ui-color-text-muted),var(--ui-color-text-muted))] bg-size-[calc(200%+var(--spread)*2+2px)_100%,auto] bg-clip-text bg-no-repeat motion-safe:animate-[shimmer_var(--duration)_linear_infinite] motion-reduce:bg-none motion-safe:rtl:animate-[shimmer-rtl_var(--duration)_linear_infinite]',
} satisfies PThemeChatShimmer;

export const themeChatReasoning = {
  slots: {
    trigger: 'group color-text-muted disabled:hover:color-text-muted hover:color-text outline-primary/25 text-sm rounded-sm flex gap-1.5 min-w-0 w-full transition-colors items-center focus-visible:outline-3 disabled:cursor-default',
    leading: 'shrink-0 size-4 relative',
    leadingIcon: 'shrink-0 size-4',
    chevronIcon: 'shrink-0 size-4 transition-transform-280 ease-out group-data-[state=open]:rotate-180 motion-reduce:transition-none',
    label: 'truncate',
    trailingIcon: 'shrink-0 size-4 transition-transform-280 ease-out group-data-[state=open]:rotate-180 motion-reduce:transition-none',
    content: 'outline-primary/25 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down rounded-sm has-focus-visible:outline-3 data-[state=closed]:overflow-hidden',
    body: 'color-text-dimmed text-sm pt-2 max-h-[200px] whitespace-pre-wrap overflow-y-auto focus:outline-none',
  },
  variants: {
    chevron: {
      leading: {
        leadingIcon: 'group-hover:opacity-0',
      },
    },
    alone: {
      false: {
        leadingIcon: 'transition-opacity-280 ease-out inset-0 absolute group-data-[state=open]:opacity-0',
        chevronIcon: 'opacity-0 transition-[transform,opacity]-280 ease-out inset-0 absolute group-data-[state=open]:opacity-100 group-hover:opacity-100 motion-reduce:transition-none',
      },
    },
  },
} satisfies PThemeChatReasoning;

// Highlight the prompt like a focused input when the text surface (native textarea or editor's contenteditable) is focused, without reacting to header/footer controls.
function focusHighlight(utilities: string) {
  return ['textarea', '[contenteditable]']
    .flatMap((element) => utilities.split(' ').map((utility) => `has-[${element}:focus-visible]:${utility}`))
    .join(' ');
}

export const themeChatPrompt = {
  slots: {
    root: 'px-2.5 py-2 rounded-lg flex flex-col gap-2 w-full items-stretch relative backdrop-blur-sm',
    header: 'flex gap-1.5 items-center',
    body: 'gap-1.5 items-start',
    footer: 'flex gap-1.5 items-center justify-between',
    base: 'px-0',
  },
  variants: {
    variant: {
      outline: {
        root: 'bg-background/75 ring-ring ring',
      },
      soft: {
        root: 'bg-background-elevated/50',
      },
      subtle: {
        root: 'bg-background-elevated/50 ring-ring ring',
      },
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: ['outline', 'subtle'],
      class: { root: `outline-${color}/25 ${focusHighlight(`outline-3 ring-${color}`)}` },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'soft',
      class: { root: `outline-${color}/25 ${focusHighlight('outline-3')}` },
    })),
    {
      color: 'neutral',
      variant: ['outline', 'subtle'],
      class: { root: `outline-outline-inverted/25 ${focusHighlight('outline-3 ring-ring-inverted')}` },
    },
    {
      color: 'neutral',
      variant: 'soft',
      class: { root: `outline-outline-inverted/25 ${focusHighlight('outline-3')}` },
    },
  ],
} satisfies PThemeChatPrompt;

export const themeChatPalette = {
  slots: {
    root: 'flex flex-1 flex-col min-h-0 min-w-0 relative',
    prompt: 'border-border px-0 border-t rounded-t-none',
    content: 'py-3 flex flex-1 flex-col overflow-y-auto',
  },
} satisfies PThemeChatPalette;
