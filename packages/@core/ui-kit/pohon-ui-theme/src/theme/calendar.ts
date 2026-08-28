// @unocss-include
import type { PThemeCalendar } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const calendar = {
  slots: {
    root: '',
    header: 'flex items-center justify-between',
    body: 'flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0',
    heading: 'text-center font-medium truncate mx-auto',
    grid: 'w-full border-collapse select-none space-y-1 focus:outline-none',
    gridRow: 'grid grid-cols-7 place-items-center',
    gridWeekDaysRow: 'mb-1 grid w-full grid-cols-7',
    gridBody: 'grid',
    headCell: 'rounded-md',
    headCellWeek: 'rounded-md color-text-muted',
    cell: 'relative text-center',
    cellTrigger: 'm-0.5 relative flex items-center justify-center rounded-full whitespace-nowrap focus-visible:ring-2 focus:outline-none data-disabled:color-text-muted data-unavailable:line-through data-unavailable:color-text-muted data-unavailable:pointer-events-none data-today:font-600 data-[outside-view]:color-text-muted transition',
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
        heading: 'text-xs',
        cell: 'text-xs',
        cellWeek: 'text-xs',
        headCell: 'text-[10px]',
        headCellWeek: 'text-[10px]',
        cellTrigger: 'size-7',
        body: 'space-y-2 pt-2',
      },
      sm: {
        heading: 'text-xs',
        headCell: 'text-xs',
        headCellWeek: 'text-xs',
        cellWeek: 'text-xs',
        cell: 'text-xs',
        cellTrigger: 'size-7',
      },
      md: {
        heading: 'text-sm',
        headCell: 'text-xs',
        headCellWeek: 'text-xs',
        cellWeek: 'text-xs',
        cell: 'text-sm',
        cellTrigger: 'size-8',
      },
      lg: {
        heading: 'text-base',
        headCell: 'text-base',
        headCellWeek: 'text-base',
        cellTrigger: 'size-9 text-base',
      },
      xl: {
        heading: 'text-lg',
        headCell: 'text-lg',
        headCellWeek: 'text-lg',
        cellTrigger: 'size-10 text-lg',
      },
    },
    weekNumbers: {
      true: {
        gridRow: 'grid-cols-8',
        gridWeekDaysRow: 'grid-cols-8 [&>*:first-child]:col-start-2',
      },
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'solid',
      class: {
        cellTrigger: `data-[selected]:bg-${color} data-[selected]:color-text-inverted data-today:not-data-[selected]:color-${color} data-[highlighted]:bg-${color}/20 hover:not-data-[selected]:bg-${color}/20`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'outline',
      class: {
        cellTrigger: `data-[selected]:ring data-[selected]:ring-inset data-[selected]:ring-${color}/50 data-[selected]:color-${color} data-today:not-data-[selected]:color-${color} data-[highlighted]:bg-${color}/10 hover:not-data-[selected]:bg-${color}/10`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'soft',
      class: {
        cellTrigger: `data-[selected]:bg-${color}/10 data-[selected]:color-${color} data-today:not-data-[selected]:color-${color} data-[highlighted]:bg-${color}/20 hover:not-data-[selected]:bg-${color}/20`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'subtle',
      class: {
        cellTrigger: `data-[selected]:bg-${color}/10 data-[selected]:color-${color} data-[selected]:ring data-[selected]:ring-inset data-[selected]:ring-${color}/25 data-today:not-data-[selected]:color-${color} data-[highlighted]:bg-${color}/20 hover:not-data-[selected]:bg-${color}/20`,
      },
    })),
    {
      color: 'neutral',
      variant: 'solid',
      class: {
        cellTrigger: 'data-[selected]:bg-background-inverted data-[selected]:color-text-inverted data-today:not-data-[selected]:color-text-highlighted data-[highlighted]:bg-background-inverted/20 hover:not-data-[selected]:bg-background-inverted/10',
      },
    },
    {
      color: 'neutral',
      variant: 'outline',
      class: {
        cellTrigger: 'data-[selected]:ring data-[selected]:ring-inset data-[selected]:ring-ring-accented data-[selected]:color-text data-[selected]:bg-background data-today:not-data-[selected]:color-text-highlighted data-[highlighted]:bg-background-inverted/10 hover:not-data-[selected]:bg-background-inverted/10',
      },
    },
    {
      color: 'neutral',
      variant: 'soft',
      class: {
        cellTrigger: 'data-[selected]:bg-background-elevated data-[selected]:color-text data-today:not-data-[selected]:color-text-highlighted data-[highlighted]:bg-background-inverted/20 hover:not-data-[selected]:bg-background-inverted/10',
      },
    },
    {
      color: 'neutral',
      variant: 'subtle',
      class: {
        cellTrigger: 'data-[selected]:bg-background-elevated data-[selected]:color-text data-[selected]:ring data-[selected]:ring-inset data-[selected]:ring-ring-accented data-today:not-data-[selected]:color-text-highlighted data-[highlighted]:bg-background-inverted/20 hover:not-data-[selected]:bg-background-inverted/10',
      },
    },
  ],
} satisfies PThemeCalendar;
