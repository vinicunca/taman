// @unocss-include

export const toaster = {
  slots: {
    viewport: 'fixed flex flex-col w-[calc(100%-2rem)] sm:w-96 z-toaster data-[expanded=true]:h-$height focus:outline-none',
    base: 'pointer-events-auto pohon:absolute inset-x-0 z-$index [transform:var(--transform)]  data-[expanded=false]:data-[front=false]:h-$front-height data-[expanded=false]:data-[front=false]:*:opacity-0 data-[front=false]:*:transition-opacity data-[front=false]:*:duration-100 data-[state=closed]:animate-toast-closed data-[state=closed]:data-[expanded=false]:data-[front=false]:animate-toast-collapsed-closed data-[state=open]:data-[pulsing=odd]:animate-toast-pulse-a data-[state=open]:data-[pulsing=even]:animate-toast-pulse-b data-[swipe=move]:transition-none transition-[transform,height]-280 ease-out',
  },
  variants: {
    position: {
      'top-left': {
        viewport: 'left-4',
      },
      'top-center': {
        viewport: 'left-1/2 transform -translate-x-1/2',
      },
      'top-right': {
        viewport: 'right-4',
      },
      'bottom-left': {
        viewport: 'left-4',
      },
      'bottom-center': {
        viewport: 'left-1/2 transform -translate-x-1/2',
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
};
