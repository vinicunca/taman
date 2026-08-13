// @unocss-include
import type { PThemePricingTable } from 'pohon-ui';

export const pricingTable = {
  slots: {
    root: 'w-full relative',
    table: 'w-full table-fixed border-separate border-spacing-x-0 hidden md:table h-fit',
    list: 'md:hidden flex flex-col gap-6 w-full',
    item: 'p-6 flex flex-col border border-border rounded-lg',
    caption: 'sr-only',
    thead: '',
    tbody: '',
    tr: '',
    th: 'py-4 font-normal text-left rtl:text-right border-b border-border',
    td: 'px-6 py-4 text-center border-b border-border',
    tier: 'p-6 text-left rtl:text-right font-normal align-top h-full',
    tierWrapper: 'flex flex-col md:h-full',
    tierTitleWrapper: 'flex items-center gap-3',
    tierTitle: 'text-lg font-semibold color-text-highlighted',
    tierDescription: 'text-sm font-normal color-text-muted mt-1',
    tierBadge: 'truncate',
    tierPriceWrapper: 'flex items-center gap-1 mt-4',
    tierPrice: 'color-text-highlighted text-3xl sm:text-4xl font-semibold',
    tierDiscount: 'color-text-muted line-through text-xl sm:text-2xl',
    tierBilling: 'flex flex-col justify-between min-w-0',
    tierBillingPeriod: 'color-text-toned truncate text-xs font-medium',
    tierBillingCycle: 'color-text-muted truncate text-xs font-medium',
    tierButton: 'mt-6 md:mt-auto md:pt-6',
    tierFeatureIcon: 'size-5 shrink-0',
    section: 'mt-6 flex flex-col gap-2',
    sectionTitle: 'font-semibold text-sm color-text-highlighted',
    feature: 'flex items-center justify-between gap-1',
    featureTitle: 'text-sm color-text',
    featureValue: 'text-sm color-text-muted flex justify-center min-w-5',
  },
  variants: {
    section: {
      true: {
        tr: '*:pt-8',
      },
    },
    active: {
      true: {
        tierFeatureIcon: 'color-primary',
      },
    },
    highlight: {
      true: {
        tier: 'bg-background-elevated/50 border-x border-t border-border rounded-t-lg',
        td: 'bg-background-elevated/50 border-x border-border',
        item: 'bg-background-elevated/50',
      },
    },
  },
} satisfies PThemePricingTable;
