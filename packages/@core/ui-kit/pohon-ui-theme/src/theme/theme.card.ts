// @unocss-include
import type {
  PThemeCard,
} from 'pohon-ui';

export const themeCard = {
  slots: {
    root: 'rounded-lg overflow-hidden',
    header: 'p-4 sm:px-6',
    title: 'color-text-highlighted font-600',
    description: 'text-sm color-text-muted mt-1',
    body: 'p-4 sm:p-6',
    footer: 'p-4 sm:px-6',
  },
  variants: {
    variant: {
      solid: {
        root: 'color-text-inverted bg-background-inverted',
        title: 'color-text-inverted',
        description: 'color-text-dimmed',
      },
      outline: {
        root: 'bg-background ring ring-ring divide-divide divide-y',
      },
      soft: {
        root: 'bg-background-elevated/50 divide-divide divide-y',
      },
      subtle: {
        root: 'bg-background-elevated/50 ring ring-ring divide-divide divide-y',
      },
    },
  },
} satisfies PThemeCard;
