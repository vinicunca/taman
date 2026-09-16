// @unocss-include
import type {
  PThemeCalendar,
} from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

const daySizes = {
  xs: 'size-6',
  sm: 'size-7',
  md: 'size-8',
  lg: 'size-9',
  xl: 'size-10',
};

const pickerSizes = {
  xs: 'h-6 px-2',
  sm: 'h-7 px-2',
  md: 'h-8 px-3',
  lg: 'h-9 px-4',
  xl: 'h-10 px-5',
};

export const themeCalendar = {
  slots: {
    header: 'flex items-center justify-between',
    body: 'pt-4 flex flex-col space-y-4 sm:(flex-row space-x-4 space-y-0)',
    heading: 'text-center flex-1 min-w-0',
    headingLabel: 'font-500 p-1.5 block truncate',
    grid: 'w-full select-none border-collapse space-y-1 focus:outline-none',
    gridRow: 'grid',
    gridWeekDaysRow: 'mb-1 grid grid-cols-7 w-full',
    gridBody: 'grid',
    headCell: 'rounded-md',
    headCellWeek: 'color-text-muted rounded-md',
    cell: 'text-center relative',
    cellTrigger: 'data-[disabled]:color-text-muted data-[unavailable]:color-text-muted m-0.5 flex whitespace-nowrap transition items-center justify-center relative data-[today]:font-600 focus-visible:outline-3 data-[unavailable]:(line-through pointer-events-none)',
    cellWeek: 'color-text-muted text-center relative',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color) => [color, {
        headCell: `color-${color}`,
        cellTrigger: `outline-${color}/25`,
      }])),
      neutral: {
        headCell: 'color-text-highlighted',
        cellTrigger: 'outline-outline-inverted/25',
      },
    },
    size: {
      xs: {
        headingLabel: 'text-xs',
        cell: 'text-xs',
        cellWeek: 'text-xs',
        headCell: 'text-[10px]',
        headCellWeek: 'text-[10px]',
        body: 'pt-2 space-y-2',
      },
      sm: {
        headingLabel: 'text-xs',
        headCell: 'text-xs',
        headCellWeek: 'text-xs',
        cellWeek: 'text-xs',
        cell: 'text-xs',
      },
      md: {
        headingLabel: 'text-sm',
        headCell: 'text-xs',
        headCellWeek: 'text-xs',
        cellWeek: 'text-xs',
        cell: 'text-sm',
      },
      lg: {
        headingLabel: 'text-base',
        headCell: 'text-base',
        headCellWeek: 'text-base',
        cellWeek: 'text-base',
        cell: 'text-base',
      },
      xl: {
        headingLabel: 'text-lg',
        headCell: 'text-lg',
        headCellWeek: 'text-lg',
        cellWeek: 'text-lg',
        cell: 'text-lg',
      },
    },
    view: {
      day: {
        gridRow: 'grid-cols-7 place-items-center',
        cellTrigger: 'data-[outside-view]:color-text-muted rounded-full',
      },
      month: {
        gridRow: 'grid-cols-4',
        cellTrigger: 'rounded-md',
      },
      year: {
        gridRow: 'grid-cols-4',
        cellTrigger: 'rounded-md',
      },
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'solid',
      class: {
        cellTrigger: `data-[selected]:bg-${color} data-[selected]:color-text-inverted data-[today]:not-[[data-selected]]:color-${color} data-[highlighted]:bg-${color}/20 hover:not-[[data-selected]]:bg-${color}/20`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'outline',
      class: {
        cellTrigger: `data-[selected]:ring data-[selected]:ring-inset data-[selected]:ring-${color}/50 data-[selected]:color-${color} data-[today]:not-[[data-selected]]:color-${color} data-[highlighted]:bg-${color}/10 hover:not-[[data-selected]]:bg-${color}/10`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'soft',
      class: {
        cellTrigger: `data-[selected]:bg-${color}/10 data-[selected]:color-${color} data-[today]:not-[[data-selected]]:color-${color} data-[highlighted]:bg-${color}/20 hover:not-[[data-selected]]:bg-${color}/20`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'subtle',
      class: {
        cellTrigger: `data-[selected]:bg-${color}/10 data-[selected]:color-${color} data-[selected]:ring data-[selected]:ring-inset data-[selected]:ring-${color}/25 data-[today]:not-[[data-selected]]:color-${color} data-[highlighted]:bg-${color}/20 hover:not-[[data-selected]]:bg-${color}/20`,
      },
    })),
    {
      color: 'neutral',
      variant: 'solid',
      class: {
        cellTrigger: 'data-[selected]:bg-background-inverted data-[selected]:color-text-inverted data-[today]:not-[[data-selected]]:color-text-highlighted data-[highlighted]:bg-background-inverted/20 hover:not-[[data-selected]]:bg-background-inverted/10',
      },
    },
    {
      color: 'neutral',
      variant: 'outline',
      class: {
        cellTrigger: 'data-[selected]:ring data-[selected]:ring-inset data-[selected]:ring-ring-accented data-[selected]:color-text data-[selected]:bg-background data-[today]:not-[[data-selected]]:color-text-highlighted data-[highlighted]:bg-background-inverted/10 hover:not-[[data-selected]]:bg-background-inverted/10',
      },
    },
    {
      color: 'neutral',
      variant: 'soft',
      class: {
        cellTrigger: 'data-[selected]:bg-background-elevated data-[selected]:color-text data-[today]:not-[[data-selected]]:color-text-highlighted data-[highlighted]:bg-background-inverted/20 hover:not-[[data-selected]]:bg-background-inverted/10',
      },
    },
    {
      color: 'neutral',
      variant: 'subtle',
      class: {
        cellTrigger: 'data-[selected]:bg-background-elevated data-[selected]:color-text data-[selected]:ring data-[selected]:ring-inset data-[selected]:ring-ring-accented data-[today]:not-[[data-selected]]:color-text-highlighted data-[highlighted]:bg-background-inverted/20 hover:not-[[data-selected]]:bg-background-inverted/10',
      },
    },

    ...Object.entries(daySizes).map(([size, cellTrigger]) => ({
      size,
      view: 'day',
      class: { cellTrigger },
    })),
    ...Object.entries(pickerSizes).map(([size, cellTrigger]) => ({
      size,
      view: ['month', 'year'],
      class: { cellTrigger },
    })),
    {
      view: 'day',
      weekNumbers: true,
      class: {
        gridRow: 'grid-cols-8',
        gridWeekDaysRow: 'grid-cols-8 [&>*:first-child]:col-start-2',
      },
    },
  ],
} satisfies PThemeCalendar;
