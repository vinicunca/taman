// @unocss-include

import type { PThemeChatTool } from 'pohon-ui';

export const chatTool = {
  slots: {
    root: '',
    trigger: 'group flex w-full items-center gap-1.5 color-text-muted text-sm disabled:cursor-default disabled:hover:color-text-muted hover:color-text focus-visible:outline-offset-2 focus-visible:outline-primary min-w-0 transition-colors',
    leading: 'relative size-4 shrink-0',
    leadingIcon: 'size-4 shrink-0',
    chevronIcon: 'size-4 shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200',
    label: 'truncate',
    suffix: 'color-text-dimmed ms-1',
    trailingIcon: 'size-4 shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200',
    content: 'data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] overflow-hidden',
    body: 'text-sm color-text-dimmed whitespace-pre-wrap',
  },
  variants: {
    variant: {
      inline: {
        body: 'pt-2',
      },
      card: {
        root: 'rounded-md ring ring-ring overflow-hidden',
        trigger: 'px-2 py-1',
        trailingIcon: 'ms-auto',
        body: 'border-t border-border p-2 max-h-[200px] overflow-y-auto',
      },
    },
    chevron: {
      leading: {
        leadingIcon: 'group-hover:opacity-0',
      },
      trailing: '',
    },
    loading: {
      true: {
        leadingIcon: 'animate-spin',
      },
    },
    alone: {
      false: {
        leadingIcon: 'absolute inset-0 group-data-[state=open]:opacity-0 transition-opacity duration-200',
        chevronIcon: 'absolute inset-0 opacity-0 group-hover:opacity-100 group-data-[state=open]:opacity-100 transition-[rotate,opacity] duration-200',
      },
    },
  },
} satisfies PThemeChatTool;
