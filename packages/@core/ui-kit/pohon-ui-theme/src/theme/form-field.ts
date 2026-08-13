// @unocss-include

export const formField = {
  slots: {
    root: '',
    wrapper: '',
    labelWrapper: 'flex content-center items-center justify-between gap-1',
    label: 'block font-medium color-text',
    container: 'relative',
    description: 'color-text-muted',
    error: 'mt-2 color-error',
    hint: 'color-text-muted',
    help: 'mt-2 color-text-muted',
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
        label: 'after:(color-error ms-0.5 content-[\'*\'])',
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
