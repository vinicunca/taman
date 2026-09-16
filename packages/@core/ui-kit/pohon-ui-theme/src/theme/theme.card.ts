// @unocss-include

export const card = {
  slots: {
    root: 'rounded-xl overflow-hidden',
    header: 'p-4 sm:px-6',
    title: 'color-text-highlighted font-600',
    description: 'mt-1 color-text-muted text-sm',
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
        root: 'bg-card color-card-foreground ring ring-border divide-y divide-border',
      },
      soft: {
        root: 'bg-background-elevated/50 divide-y divide-border',
      },
      subtle: {
        root: 'bg-background-elevated/50 ring ring-border divide-y divide-border',
      },
    },
  },
};
