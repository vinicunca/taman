// @unocss-include

import type { PThemeEditor } from 'pohon-ui';

export const themeEditor = {
  slots: {
    root: '',
    content: 'flex-1 size-full relative',
    base: [
      'outline-none w-full *:(my-5 first:mt-0 last:mb-0) sm:px-8 selection:bg-primary/20',
      // Paragraph
      '[&_p]:leading-7',
      // Links
      '[&_a]:(color-primary font-500 border-b border-transparent hover:border-primary transition-colors)',
      // Code inside links
      '[&_a>code]:border-dashed [&_a:hover>code]:border-primary [&_a:hover>code]:color-primary',
      '[&_a:hover>code]:(color-primary border-primary) [&_a>code]:(border-dashed transition-colors)',
      // Mentions
      '[&_.mention]:(color-primary font-500)',
      // Headings - shared styles
      '[&_:is(h1,h2,h3,h4,h5,h6)]:(color-text-highlighted font-700)',
      // Headings - unique styles
      '[&_h1]:text-3xl',
      '[&_h2]:text-2xl',
      '[&_h3]:text-xl',
      '[&_h4]:text-lg',
      '[&_h5]:text-base',
      '[&_h6]:text-base',
      // Code inside headings
      '[&_:is(h1,h2,h3,h4,h5,h6)>code]:(border-dashed font-700)',
      '[&_h2>code]:text-xl/6',
      '[&_h3>code]:text-lg/5',
      // Blockquote & HR
      '[&_blockquote]:(ps-4 border-s-4 border-border-accented italic)',
      '[&_[data-type=horizontalRule]]:(my-8 py-2)',
      '[&_hr]:(border-t border-border)',
      // Code blocks
      '[&_pre]:(text-sm/6 px-4 py-3 border border-border-muted rounded-md bg-background-muted whitespace-pre-wrap break-words overflow-x-auto)',
      '[&_pre_code]:(text-inherit font-inherit p-0 border-0 rounded-none bg-transparent inline)',
      // Inline code
      '[&_code]:(text-sm color-text-highlighted font-500 font-mono px-1.5 py-0.5 border border-border-muted rounded-md bg-background-muted inline-block)',
      // Lists
      '[&_:is(ul,ol)]:ps-6',
      '[&_ul]:list-disc [&_ul]:marker:color-border-accented',
      '[&_ol]:list-decimal [&_ol]:marker:color-text-muted',
      '[&_li]:(ps-1.5 my-1.5)',
      // Images
      '[&_img.ProseMirror-selectednode]:(outline-2 outline-primary) [&_img]:(rounded-md max-w-full block)',
      // Selected nodes
      '[&_.ProseMirror-selectednode:not(img):not(pre):not([data-node-view-wrapper])]:bg-primary/20',
    ],
  },
  variants: {
    placeholderMode: {
      firstLine: {
        base: '[&_:is(p,h1,h2,h3,h4,h5,h6).is-editor-empty:first-child]:before:(color-text-dimmed h-0 pointer-events-none content-[attr(data-placeholder)] content-empty float-start)',
      },
      everyLine: {
        base: '[&_:is(p,h1,h2,h3,h4,h5,h6).is-empty]:before:(color-text-dimmed h-0 pointer-events-none content-[attr(data-placeholder)] content-empty float-start)',
      },
    },
  },
} satisfies PThemeEditor;
