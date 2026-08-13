// @unocss-include

import type { PThemeAuthForm } from 'pohon-ui';

export const authForm = {
  slots: {
    root: 'w-full space-y-6',
    header: 'flex flex-col text-center',
    leading: 'mb-2',
    leadingIcon: 'size-8 shrink-0 inline-block',
    title: 'text-xl text-pretty font-semibold color-text-highlighted',
    description: 'mt-1 text-base text-pretty color-text-muted',
    body: 'gap-y-6 flex flex-col',
    providers: 'space-y-3',
    checkbox: '',
    select: 'w-full',
    password: 'w-full',
    otp: 'w-full',
    input: 'w-full',
    separator: '',
    form: 'space-y-5',
    footer: 'text-sm text-center color-text-muted mt-2',
  },
} satisfies PThemeAuthForm;
