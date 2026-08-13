// @unocss-include
export const contentSearchButton = {
  slots: {
    base: '',
    label: '',
    trailing: 'hidden lg:flex items-center gap-0.5 ms-auto',
  },
  variants: {
    collapsed: {
      true: {
        label: 'hidden',
        trailing: 'lg:hidden',
      },
    },
  },
};
