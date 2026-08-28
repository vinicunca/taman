// @unocss-include
import { POHON_THEME_BRANDS } from '../constants.ts';

export const table = {
  slots: {
    root: 'relative overflow-auto h-full min-h-0',
    base: 'min-w-full overflow-clip table-fixed border-separate border-spacing-0',
    caption: 'sr-only',
    thead: 'relative [&>tr]:bg-background-elevated [&>tr]:after:content-none',
    tbody: 'isolate [&>tr]:data-[selectable=true]:hover:bg-background-elevated/50 [&>tr]:data-[selectable=true]:focus-visible:outline-primary divide-y divide-divide [&>tr]:last:[&>td]:border-b-0',
    tfoot: 'relative',
    tr: 'data-[selected=true]:bg-background-elevated/50',
    th: 'px-4 py-3.5 text-sm color-text-highlighted text-left rtl:text-right font-600 [&:has([role=checkbox])]:pe-0 py-2 first:rounded-l-lg last:rounded-r-lg border-y border-border first:border-l last:border-r',
    td: 'p-4 text-sm color-text-muted whitespace-nowrap [&:has([role=checkbox])]:pe-0 border-b border-border',
    separator: 'absolute z-1 left-0 w-full h-px bg-border-accented',
    empty: 'py-6 text-center text-sm color-text-muted',
    loading: 'py-6 text-center',
  },
  variants: {
    pinned: {
      true: {
        th: 'sticky bg-background/75 z-1',
        td: 'sticky bg-background/75 z-1',
      },
    },
    sticky: {
      true: {
        thead: 'sticky top-0 inset-x-0 bg-background/75 backdrop-blur z-1',
        tfoot: 'sticky bottom-0 inset-x-0 bg-background/75 backdrop-blur z-1',
      },
      header: {
        thead: 'sticky top-0 inset-x-0 bg-background/75 backdrop-blur z-1',
      },
      footer: {
        tfoot: 'sticky bottom-0 inset-x-0 bg-background/75 backdrop-blur z-1',
      },
    },
    loading: {
      true: {
        thead: 'after:absolute after:z-1 after:h-px',
      },
    },
    externalScroll: {
      true: {
        root: 'overflow-visible',
      },
    },
    loadingAnimation: {
      'carousel': '',
      'carousel-inverse': '',
      'swing': '',
      'elastic': '',
    },
    loadingColor: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, ''])),
      neutral: '',
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((loadingColor: string) => ({
      loading: true,
      loadingColor,
      class: {
        thead: `after:bg-${loadingColor}`,
      },
    })),
    {
      loading: true,
      loadingColor: 'neutral',
      class: {
        thead: 'after:bg-background-inverted',
      },
    },
    {
      loading: true,
      loadingAnimation: 'carousel',
      class: {
        thead: 'after:animate-[carousel_2s_ease-in-out_infinite] rtl:after:animate-[carousel-rtl_2s_ease-in-out_infinite]',
      },
    },
    {
      loading: true,
      loadingAnimation: 'carousel-inverse',
      class: {
        thead: 'after:animate-[carousel-inverse_2s_ease-in-out_infinite] rtl:after:animate-[carousel-inverse-rtl_2s_ease-in-out_infinite]',
      },
    },
    {
      loading: true,
      loadingAnimation: 'swing',
      class: {
        thead: 'after:animate-[swing_2s_ease-in-out_infinite]',
      },
    },
    {
      loading: true,
      loadingAnimation: 'elastic',
      class: {
        thead: 'after:animate-[elastic_2s_ease-in-out_infinite]',
      },
    },
  ],
};
