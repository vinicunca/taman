// @unocss-include
import type {
  PThemeBlogPost,
  PThemeBlogPosts,
} from 'pohon-ui';

export const themeBlogPosts = {
  base: 'flex flex-col gap-8 lg:gap-y-16',
  variants: {
    orientation: {
      horizontal: 'sm:(grid grid-cols-2) lg:grid-cols-3',
    },
  },
} satisfies PThemeBlogPosts;

export const themeBlogPost = {
  slots: {
    root: 'group/blog-post rounded-lg flex flex-col relative overflow-hidden',
    header: 'w-full aspect-[16/9] pointer-events-none relative overflow-hidden',
    body: 'flex flex-1 flex-col min-w-0',
    image: 'h-full w-full object-cover object-top',
    title: 'color-text-highlighted text-xl font-600 text-pretty',
    description: 'text-base mt-1 text-pretty',
    authors: 'mt-auto pt-4 flex flex-wrap gap-x-3 gap-y-1.5',
    avatar: '',
    meta: 'mb-2 flex gap-2 items-center',
    date: 'text-sm',
    badge: '',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'gap-x-8 lg:(grid grid-cols-2 items-center)',
        body: 'p-4 justify-center sm:p-6 lg:px-0',
      },
      vertical: {
        root: 'flex flex-col',
        body: 'p-4 sm:p-6',
      },
    },
    variant: {
      outline: {
        root: 'bg-background ring-ring ring',
        date: 'color-text-toned',
        description: 'color-text-muted',
      },
      soft: {
        root: 'bg-background-elevated/50',
        date: 'color-text-muted',
        description: 'color-text-toned',
      },
      subtle: {
        root: 'bg-background-elevated/50 ring-ring ring',
        date: 'color-text-muted',
        description: 'color-text-toned',
      },
      ghost: {
        date: 'color-text-toned',
        description: 'color-text-muted',
        header: 'rounded-lg shadow-lg',
      },
      naked: {
        root: 'p-0 sm:p-0',
        date: 'color-text-toned',
        description: 'color-text-muted',
        header: 'rounded-lg shadow-lg',
      },
    },
    to: {
      true: {
        root: 'outline-primary/25 transition has-[>a:focus-visible]:outline-3',
        image: 'transform transition-transform ease-out group-hover/blog-post:scale-110 motion-reduce:transition-none',
        avatar: 'outline-primary/25 rounded-full inline-flex transform transition-transform ease-out focus-visible:outline-3 hover:scale-115 motion-reduce:transition-none',
      },
    },
  },
  compoundVariants: [
    {
      variant: 'outline',
      to: true,
      class: {
        root: 'hover:bg-background-elevated/50',
      },
    },
    {
      variant: 'soft',
      to: true,
      class: {
        root: 'hover:bg-background-elevated',
      },
    },
    {
      variant: 'subtle',
      to: true,
      class: {
        root: 'hover:bg-background-elevated hover:ring-ring-accented',
      },
    },
    {
      variant: ['outline', 'subtle'],
      to: true,
      class: {
        root: 'has-[>a:focus-visible]:ring-primary',
      },
    },
    {
      variant: 'ghost',
      to: true,
      class: {
        root: 'hover:bg-background-elevated/50',
        header: 'group-hover/blog-post:shadow-none transition-[box-shadow,border-radius] ease-out',
      },
    },
    {
      variant: 'ghost',
      to: true,
      orientation: 'vertical',
      class: {
        header: 'group-hover/blog-post:rounded-b-none',
      },
    },
    {
      variant: 'ghost',
      to: true,
      orientation: 'horizontal',
      class: {
        header: 'group-hover/blog-post:rounded-e-none',
      },
    },
    {
      orientation: 'vertical',
      image: false,
      variant: 'naked',
      class: {
        body: 'p-0 sm:p-0',
      },
    },
  ],
} satisfies PThemeBlogPost;
