// @unocss-include
import type {
  PThemeCard,
} from 'pohon-ui';

export const themeCard = {
  slots: {
    root: 'rounded-lg overflow-hidden',
    header: 'p-4 sm:px-6',
    title: 'color-text-highlighted font-600',
    description: 'color-text-muted text-sm mt-1',
    body: 'p-4 sm:p-6',
    footer: 'p-4 sm:px-6',
  },
  variants: {
    variant: {
      solid: {
        root: 'bg-background-inverted color-text-inverted',
        title: 'color-text-inverted',
        description: 'color-text-dimmed',
      },
      outline: {
        root: 'bg-background ring-ring divide-divide ring divide-y',
      },
      soft: {
        root: 'bg-background-elevated/50 divide-divide divide-y',
      },
      subtle: {
        root: 'bg-background-elevated/50 ring-ring divide-divide ring divide-y',
      },
    },
  },
} satisfies PThemeCard;
