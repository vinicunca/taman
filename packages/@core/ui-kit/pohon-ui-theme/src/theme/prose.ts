// @unocss-include

import type { PThemeProse } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const prose = {
  a: {
    base: 'color-primary border-b border-transparent hover:border-primary font-medium focus-visible:outline-primary focus-visible:has-[>code]:outline-0 [&>code]:border-dashed hover:[&>code]:border-primary hover:[&>code]:color-primary focus-visible:[&>code]:border-primary focus-visible:[&>code]:color-primary transition-colors [&>code]:transition-colors',
  },
  accordion: {
    slots: {
      root: 'my-5',
      trigger: 'text-base',
    },
  },
  accordionItem: {
    base: 'pb-4 color-text-muted *:first:mt-0 *:last:mb-0 *:my-1.5',
  },
  badge: {
    base: 'rounded-full',
  },
  blockquote: {
    base: 'border-s-4 border-border-accented ps-4 italic',
  },
  callout: {
    slots: {
      base: 'group relative block px-4 py-3 rounded-md text-sm/6 my-5 last:mb-0 [&_code]:text-xs/5 [&_code]:bg-background [&_pre]:bg-background [&>div]:my-2.5 [&_ul]:my-2.5 [&_ol]:my-2.5 *:last:mb-0! [&_ul]:ps-4.5 [&_ol]:ps-4.5 [&_li]:my-0 transition-colors',
      icon: 'size-4 shrink-0 align-sub me-2 inline-block transition-colors',
      externalIcon: 'size-4 align-top absolute right-2 top-2 pointer-events-none transition-colors',
    },
    variants: {
      color: {
        ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
          base: `border border-${color}/25 bg-${color}/10 color-${color}-600 dark:color-${color}-300 [&_a]:color-${color} [&_a]:hover:border-${color} [&_a]:focus-visible:outline-${color} [&_code]:color-${color}-600 dark:[&_code]:color-${color}-300 [&_code]:border-${color}/25 [&_a]:hover:[&>code]:border-${color} [&_a]:hover:[&>code]:color-${color} [&_a]:focus-visible:[&>code]:border-${color} [&_a]:focus-visible:[&>code]:color-${color} [&>ul]:marker:color-${color}/50`,
          icon: `color-${color}`,
          externalIcon: `color-${color}-600 dark:color-${color}-300`,
        }])),
        neutral: {
          base: 'border border-border-muted bg-background-muted color-text',
          icon: 'color-text-highlighted',
          externalIcon: 'color-text-dimmed',
        },
      },
      to: {
        true: 'border-dashed',
      },
    },
    compoundVariants: [
      ...POHON_THEME_BRANDS.map((color: string) => ({
        color,
        to: true,
        class: {
          base: `hover:border-${color} has-focus-visible:border-${color}`,
          externalIcon: `group-hover:color-${color}`,
        },
      })),
      {
        color: 'neutral',
        to: true,
        class: {
          base: 'hover:border-border-inverted has-focus-visible:border-border-inverted',
          externalIcon: 'group-hover:color-text-highlighted',
        },
      },
    ],
  },
  card: {
    slots: {
      base: 'group relative block my-5 p-4 sm:p-6 border border-border rounded-md bg-background transition-colors',
      icon: 'size-6 mb-2 block',
      title: 'color-text-highlighted font-semibold',
      description: 'text-[15px] color-text-muted *:first:mt-0 *:last:mb-0 *:my-1',
      externalIcon: 'size-4 align-top absolute right-2 top-2 color-text-dimmed pointer-events-none transition-colors',
    },
    variants: {
      color: {
        ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
          icon: `color-${color}`,
        }])),
        neutral: {
          icon: 'color-text-highlighted',
        },
      },
      to: {
        true: '',
      },
      title: {
        true: {
          description: 'mt-1',
        },
      },
    },
    compoundVariants: [
      ...POHON_THEME_BRANDS.map((color: string) => ({
        color,
        to: true,
        class: {
          base: `hover:bg-${color}/10 hover:border-${color} has-focus-visible:border-${color}`,
          externalIcon: `group-hover:color-${color}`,
        },
      })),
      {
        color: 'neutral',
        to: true,
        class: {
          base: 'hover:bg-background-elevated/50 hover:border-border-inverted has-focus-visible:border-border-inverted',
          externalIcon: 'group-hover:color-text-highlighted',
        },
      },
    ],
  },
  cardGroup: {
    base: 'grid grid-cols-1 sm:grid-cols-2 gap-5 my-5 *:my-0',
  },
  code: {
    base: 'px-1.5 py-0.5 text-sm font-mono font-medium rounded-md inline-block',
    variants: {
      color: {
        ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, `border border-${color}/25 bg-${color}/10 color-${color}`])),
        neutral: 'border border-border-muted color-text-highlighted bg-background-muted',
      },
    },
  },
  codeCollapse: {
    slots: {
      root: 'relative [&_pre]:h-[200px] bg-background-muted',
      footer: 'h-16 absolute inset-x-px bottom-px rounded-b-md flex items-center justify-center',
      trigger: 'group',
      triggerIcon: 'group-data-[state=open]:rotate-180',
    },
    variants: {
      open: {
        true: {
          root: '[&_pre]:h-auto [&_pre]:min-h-[200px] [&_pre]:max-h-[80vh] [&_pre]:pb-12',
        },
        false: {
          root: '[&_pre]:overflow-hidden',
          footer: 'bg-linear-to-t from-text-muted',
        },
      },
    },
  },
  codeGroup: {
    slots: {
      root: 'relative group *:not-first:my-0! *:not-first:static! my-5',
      list: 'relative flex items-center gap-1 border border-border-muted bg-background border-b-0 rounded-t-md overflow-x-auto p-2',
      indicator: 'absolute left-0 inset-y-2 w-$akar-tabs-indicator-size translate-x-$akar-tabs-indicator-position transition-[transform,width] duration-200 bg-background-elevated rounded-md shadow-xs',
      trigger: 'relative inline-flex items-center gap-1.5 color-text data-[state=active]:color-text-highlighted hover:bg-background-elevated/50 px-2 py-1.5 text-sm rounded-md disabled:cursor-not-allowed disabled:opacity-75 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus:outline-none transition-colors',
      triggerIcon: 'size-4 shrink-0',
      triggerLabel: 'truncate',
    },
  },
  codePreview: {
    slots: {
      root: 'my-5',
      preview: 'flex justify-center border border-border-muted relative p-4 rounded-md',
      code: '[&>div>pre]:rounded-t-none [&>div]:my-0',
    },
    variants: {
      code: {
        true: {
          preview: 'border-b-0 rounded-b-none',
        },
      },
    },
  },
  codeTree: {
    slots: {
      root: 'relative lg:h-[450px] my-5 grid lg:grid-cols-3 border border-border-muted rounded-md',
      list: 'isolate relative p-2 border-b lg:border-b-0 lg:border-e border-border-muted overflow-y-auto',
      item: '',
      listWithChildren: 'ms-4.5 border-s border-border',
      itemWithChildren: 'ps-1.5 -ms-px',
      link: 'relative group peer w-full px-2.5 py-1.5 before:inset-y-px before:inset-x-0 flex items-center gap-1.5 text-sm before:absolute before:-z-1 before:rounded-md focus:outline-none focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2',
      linkLeadingIcon: 'size-4 shrink-0',
      linkLabel: 'truncate',
      linkTrailing: 'ms-auto inline-flex gap-1.5 items-center',
      linkTrailingIcon: 'size-5 transform transition-transform duration-200 shrink-0 group-[data-expanded]:rotate-180',
      content: 'overflow-hidden lg:col-span-2 flex flex-col [&>div]:my-0 [&>div]:flex-1 [&>div]:flex [&>div]:flex-col [&>div>div]:border-0 [&>div>pre]:border-b-0 [&>div>pre]:border-s-0 [&>div>pre]:border-e-0 [&>div>pre]:rounded-l-none [&>div>pre]:flex-1 [&>div]:overflow-y-auto',
    },
    variants: {
      active: {
        true: {
          link: 'color-text-highlighted before:bg-background-elevated',
        },
        false: {
          link: 'hover:color-text-highlighted hover:before:bg-background-elevated/50 transition-colors before:transition-colors',
        },
      },
    },
  },
  collapsible: {
    slots: {
      root: 'my-5',
      trigger: 'group relative rounded-xs inline-flex items-center gap-1.5 color-text-muted hover:color-text text-sm focus-visible:ring-2 focus-visible:ring-primary focus:outline-none transition-colors',
      triggerIcon: 'size-4 shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200',
      triggerLabel: 'truncate',
      content: '*:first:mt-2.5 *:last:mb-0 *:my-1.5',
    },
  },
  em: {
    base: '',
  },
  field: {
    slots: {
      root: 'my-5',
      container: 'flex items-center gap-3 font-mono text-sm',
      name: 'font-semibold color-primary',
      wrapper: 'flex-1 flex items-center gap-1.5 text-xs',
      required: 'rounded-sm bg-error/10 text-error px-1.5 py-0.5',
      type: 'rounded-sm bg-background-elevated color-text-toned px-1.5 py-0.5',
      description: 'mt-3 color-text-muted text-sm [&_code]:text-xs/4',
    },
  },
  fieldGroup: {
    base: 'my-5 divide-y divide-divide *:not-last:pb-5',
  },
  h1: {
    slots: {
      base: 'text-4xl color-text-highlighted font-bold mb-8 scroll-mt-[calc(45px+var(--ui-header-height))] lg:scroll-mt-$ui-header-height',
      link: 'inline-flex items-center gap-2',
    },
  },
  h2: {
    slots: {
      base: 'relative text-2xl color-text-highlighted font-bold mt-12 mb-6 scroll-mt-[calc(48px+45px+var(--ui-header-height))] lg:scroll-mt-[calc(48px+var(--ui-header-height))] [&>a]:focus-visible:outline-primary [&>a>code]:border-dashed hover:[&>a>code]:border-primary hover:[&>a>code]:color-primary [&>a>code]:text-xl/7 [&>a>code]:font-bold transition-colors [&>a>code]:transition-colors',
      leading: 'absolute -ms-8 top-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 p-1 bg-background-elevated hover:color-primary rounded-md hidden lg:flex color-text-muted transition',
      leadingIcon: 'size-4 shrink-0',
      link: 'group lg:ps-2 lg:-ms-2',
    },
  },
  h3: {
    slots: {
      base: 'relative text-xl color-text-highlighted font-bold mt-8 mb-3 scroll-mt-[calc(32px+45px+var(--ui-header-height))] lg:scroll-mt-[calc(32px+var(--ui-header-height))] [&>a]:focus-visible:outline-primary [&>a>code]:border-dashed hover:[&>a>code]:border-primary hover:[&>a>code]:color-primary [&>a>code]:text-lg/6 [&>a>code]:font-bold transition-colors [&>a>code]:transition-colors',
      leading: 'absolute -ms-8 top-0.5 opacity-0 group-hover:opacity-100 group-focus:opacity-100 p-1 bg-background-elevated hover:color-primary rounded-md hidden lg:flex color-text-muted transition',
      leadingIcon: 'size-4 shrink-0',
      link: 'group lg:ps-2 lg:-ms-2',
    },
  },
  h4: {
    slots: {
      base: 'text-lg color-text-highlighted font-bold mt-6 mb-2 scroll-mt-[calc(24px+45px+var(--ui-header-height))] lg:scroll-mt-[calc(24px+var(--ui-header-height))] [&>a]:focus-visible:outline-primary',
      link: '',
    },
  },
  hr: {
    base: 'border-t border-border my-12',
  },
  icon: {
    base: 'size-4 shrink-0 align-sub',
  },
  img: {
    slots: {
      base: 'rounded-md',
      overlay: 'fixed inset-0 bg-background/75 backdrop-blur-sm will-change-opacity',
      content: 'fixed inset-0 flex items-center justify-center cursor-zoom-out focus:outline-none',
      zoomedImage: 'w-full h-auto max-w-[95vw] max-h-[95vh] object-contain rounded-md',
    },
    variants: {
      zoom: {
        true: 'will-change-transform',
      },
      open: {
        true: '',
      },
      width: {
        false: 'w-full',
      },
    },
    compoundVariants: [
      {
        zoom: true,
        open: false,
        class: 'cursor-zoom-in',
      },
    ],
  },
  kbd: {
    base: 'align-text-top',
  },
  li: {
    base: 'my-1.5 ps-1.5 leading-7 [&>ul]:my-0',
  },
  ol: {
    base: 'list-decimal ps-6 my-5 marker:color-text-muted',
  },
  p: {
    base: 'my-5 leading-7 text-pretty',
  },
  pre: {
    slots: {
      root: 'relative my-5 group',
      header: 'flex items-center gap-1.5 border border-border-muted bg-background border-b-0 relative rounded-t-md px-4 py-3',
      filename: 'color-text text-sm/6',
      icon: 'size-4 shrink-0',
      copy: 'absolute top-[11px] right-[11px] lg:opacity-0 lg:group-hover:opacity-100 transition',
      base: 'group font-mono text-sm/6 border border-border-muted bg-background-muted rounded-md px-4 py-3 whitespace-pre-wrap wrap-break-word overflow-x-auto focus:outline-none **:[.line]:block **:[.line.highlight]:-mx-4 **:[.line.highlight]:px-4 **:[.line.highlight]:bg-background-accented/50!',
    },
    variants: {
      filename: {
        true: {
          root: '[&>pre]:rounded-t-none [&>pre]:my-0 my-5',
        },
      },
    },
  },
  prompt: {
    slots: {
      root: 'relative flex flex-wrap items-center gap-2 border border-border-muted bg-background-muted rounded-md px-4 py-3 my-5 last:mb-0',
      icon: 'size-4 shrink-0 color-text-highlighted',
      content: 'min-w-0',
      description: 'text-sm/6 color-text font-medium',
      actions: 'flex flex-wrap items-center gap-1.5 ms-auto',
    },
  },
  steps: {
    base: 'ms-4 border-s border-border ps-8 [counter-reset:step]',
    variants: {
      level: {
        2: '[&>h2]:[counter-increment:step] [&>h2]:relative [&>h2]:before:absolute [&>h2]:before:size-8 [&>h2]:before:bg-background-elevated [&>h2]:before:rounded-full [&>h2]:before:font-semibold [&>h2]:before:text-sm [&>h2]:before:tabular-nums [&>h2]:before:inline-flex [&>h2]:before:items-center [&>h2]:before:justify-center [&>h2]:before:ring-4 [&>h2]:before:ring-background [&>h2]:before:-ms-[48.5px] [&>h2]:before:mt-0 [&>h2]:before:content-[counter(step)] [&>h2>a>span.absolute]:hidden',
        3: '[&>h3]:[counter-increment:step] [&>h3]:relative [&>h3]:before:absolute [&>h3]:before:size-7 [&>h3]:before:inset-x-0.5 [&>h3]:before:bg-background-elevated [&>h3]:before:rounded-full [&>h3]:before:font-semibold [&>h3]:before:text-sm [&>h3]:before:tabular-nums [&>h3]:before:inline-flex [&>h3]:before:items-center [&>h3]:before:justify-center [&>h3]:before:ring-4 [&>h3]:before:ring-background [&>h3]:before:-ms-[48.5px] [&>h3]:before:content-[counter(step)] [&>h3>a>span.absolute]:hidden',
        4: '[&>h4]:[counter-increment:step] [&>h4]:relative [&>h4]:before:absolute [&>h4]:before:size-7 [&>h4]:before:inset-x-0.5 [&>h4]:before:bg-background-elevated [&>h4]:before:rounded-full [&>h4]:before:font-semibold [&>h4]:before:text-sm [&>h4]:before:tabular-nums [&>h4]:before:inline-flex [&>h4]:before:items-center [&>h4]:before:justify-center [&>h4]:before:ring-4 [&>h4]:before:ring-background [&>h4]:before:-ms-[48.5px] [&>h4]:before:content-[counter(step)] [&>h4>a>span.absolute]:hidden',
      },
    },
  },
  strong: {
    base: '',
  },
  table: {
    slots: {
      root: 'relative my-5 overflow-x-auto',
      base: 'w-full border-separate border-spacing-0 rounded-md',
    },
  },
  tabs: {
    slots: {
      root: 'my-5 gap-4',
    },
  },
  tabsItem: {
    base: '*:first:mt-0 *:last:mb-0 *:my-1.5',
  },
  tbody: {
    base: '',
  },
  td: {
    base: 'py-3 px-4 text-sm align-top border-e border-b first:border-s border-border-muted [&_code]:text-xs/5 [&_p]:my-0 [&_p]:leading-6 [&_ul]:my-0 [&_ol]:my-0 [&_ul]:ps-4.5 [&_ol]:ps-4.5 [&_li]:leading-6 [&_li]:my-0.5',
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
  },
  th: {
    base: 'py-3 px-4 font-semibold text-sm border-e border-b first:border-s border-t border-border-muted',
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
  },
  thead: {
    base: 'bg-background-muted',
  },
  tr: {
    base: '[&:first-child>th:first-child]:rounded-tl-md [&:first-child>th:last-child]:rounded-tr-md [&:last-child>td:first-child]:rounded-bl-md [&:last-child>td:last-child]:rounded-br-md',
  },
  ul: {
    base: 'list-disc ps-6 my-5 marker:text-(--ui-border-border-accented)',
  },
} satisfies PThemeProse;
