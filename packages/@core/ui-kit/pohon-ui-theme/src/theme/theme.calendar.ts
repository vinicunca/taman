// @unocss-include
import type { PThemeCalendar } from 'pohon-ui';
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

export const calendar = {
  slots: {
    root: '',
    header: 'flex items-center justify-between',
    body: 'flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0',
    heading: 'flex-1 min-w-0 text-center',
    headingLabel: 'font-500 block truncate p-1.5',
    grid: 'w-full border-collapse select-none space-y-1 focus:outline-none',
    gridRow: 'grid',
    gridWeekDaysRow: 'mb-1 grid w-full grid-cols-7',
    gridBody: 'grid',
    headCell: 'rounded-md',
    headCellWeek: 'rounded-md color-text-muted',
    cell: 'relative text-center',
    cellTrigger: 'm-0.5 relative flex items-center justify-center whitespace-nowrap focus-visible:outline-3 data-[disabled]:color-text-muted data-[unavailable]:(line-through color-text-muted pointer-events-none) data-[today]:font-600 transition',
    cellWeek: 'relative text-center color-text-muted',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        headCell: `color-${color}`,
        cellTrigger: `focus-visible:ring-${color}`,
      }])),
      neutral: {
        headCell: 'color-text-highlighted',
        cellTrigger: 'focus-visible:ring-ring-inverted',
      },
    },
    variant: {
      solid: '',
      outline: '',
      soft: '',
      subtle: '',
    },
    size: {
      xs: {
        headingLabel: 'text-xs',
        cell: 'text-xs',
        cellWeek: 'text-xs',
        headCell: 'text-[10px]',
        headCellWeek: 'text-[10px]',
        body: 'space-y-2 pt-2',
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
        cellTrigger: 'rounded-full data-[outside-view]:color-text-muted',
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
    weekNumbers: {
      true: '',
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'solid',
      class: {
        cellTrigger: `pohon:data-[selected]:bg-${color} data-[selected]:color-text-inverted data-[today]:not-[[data-selected]]:color-${color} data-[highlighted]:bg-${color}/20 hover:not-[[data-selected]]:bg-${color}/20`,
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
