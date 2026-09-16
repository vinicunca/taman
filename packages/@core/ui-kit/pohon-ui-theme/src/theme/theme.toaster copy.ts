// @unocss-include
import type { PThemeToaster } from 'pohon-ui';

export const themeToaster = {
  slots: {
    viewport: 'flex flex-col w-[calc(100%-2rem)] fixed z-[100] focus:outline-none data-[expanded=true]:h-$height sm:w-96',
    base: 'data-[state=closed]:animate-toast-closed data-[state=closed]:data-[expanded=false]:data-[front=false]:animate-toast-collapsed-closed motion-safe:data-[state=open]:data-[pulsing=even]:animate-toast-pulse-b motion-safe:data-[state=open]:data-[pulsing=odd]:animate-toast-pulse-a pointer-events-auto transition-[transform,height]-280 ease-out [transform:var(--transform)] inset-x-0 z-$index data-[swipe=move]:transition-none motion-reduce:transition-none data-[expanded=false]:data-[front=false]:h-$front-height data-[front=false]:*:transition-opacity data-[front=false]:*:duration-100 pohon:absolute data-[expanded=false]:data-[front=false]:*:opacity-0',
  },
  variants: {
    position: {
      'top-left': {
        viewport: 'left-4',
      },
      'top-center': {
        viewport: 'transform left-1/2 -translate-x-1/2',
      },
      'top-right': {
        viewport: 'right-4',
      },
      'bottom-left': {
        viewport: 'left-4',
      },
      'bottom-center': {
        viewport: 'transform left-1/2 -translate-x-1/2',
      },
      'bottom-right': {
        viewport: 'right-4',
      },
    },
    swipeDirection: {
      up: 'pohon:data-[swipe=end]:(animate-out slide-out-top)',
      right: 'pohon:data-[swipe=end]:(animate-out slide-out-right)',
      down: 'pohon:data-[swipe=end]:(animate-out slide-out-bottom)',
      left: 'pohon:data-[swipe=end]:(animate-out slide-out-left)',
    },
  },
  compoundVariants: [
    {
      position: ['top-left', 'top-center', 'top-right'],
      class: {
        viewport: 'top-4',
        base: 'top-0 data-[state=open]:(animate-in animate-duration-280 slide-in-from-top)',
      },
    },
    {
      position: ['bottom-left', 'bottom-center', 'bottom-right'],
      class: {
        viewport: 'bottom-4',
        base: 'bottom-0 data-[state=open]:(animate-in animate-duration-280 slide-in-from-bottom)',
      },
    },
    {
      swipeDirection: ['left', 'right'],
      class: 'data-[swipe=move]:translate-x-$akar-toast-swipe-move-x data-[swipe=end]:translate-x-$akar-toast-swipe-end-x data-[swipe=cancel]:translate-x-0',
    },
    {
      swipeDirection: ['up', 'down'],
      class: 'data-[swipe=move]:translate-y-$akar-toast-swipe-move-y data-[swipe=end]:translate-y-$akar-toast-swipe-end-y data-[swipe=cancel]:translate-y-0',
    },
  ],
} satisfies PThemeToaster;
