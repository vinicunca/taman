// @unocss-include

export const formField = {
  slots: {
    root: '',
    wrapper: '',
    labelWrapper: 'flex gap-1 content-center items-center justify-between',
    label: 'color-text font-500 block',
    container: 'relative',
    description: 'color-text-muted',
    error: 'color-error mt-2',
    hint: 'color-text-muted',
    help: 'color-text-muted mt-2',
  },
  variants: {
    size: {
      xs: { root: 'text-xs' },
      sm: { root: 'text-xs' },
      md: { root: 'text-sm' },
      lg: { root: 'text-sm' },
      xl: { root: 'text-base' },
    },
    required: {
      true: {
        label: 'after:(color-error ms-0.5 content-["*"])',
      },
    },
    orientation: {
      vertical: {
        container: 'mt-1',
      },
      horizontal: {
        root: 'flex justify-between place-items-baseline gap-2',
      },
    },
  },
};
