// @unocss-include
import type { PThemeAccordion } from 'pohon-ui';

export const themeAccordion = {
  slots: {
    root: 'w-full',
    item: 'border-border border-b last:border-b-0',
    header: 'flex',
    trigger: 'group outline-primary/25 text-sm font-500 py-3.5 rounded-md flex flex-1 gap-1.5 min-w-0 items-center focus-visible:outline-3',
    content: 'data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up focus:outline-none data-[state=closed]:overflow-hidden',
    body: 'text-sm pb-3.5',
    leadingIcon: 'shrink-0 size-5',
    trailingIcon: 'ms-auto shrink-0 size-5 transition-transform-280 ease-out group-data-[state=open]:rotate-180 motion-reduce:transition-none',
    label: 'text-start break-words',
  },
  variants: {
    disabled: {
      true: {
        trigger: 'opacity-75 cursor-not-allowed',
      },
    },
  },
} satisfies PThemeAccordion;
