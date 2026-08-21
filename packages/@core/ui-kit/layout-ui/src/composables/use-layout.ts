import type { TamanLayoutType } from '@taman-core/typings';

import type { TamanLayoutProps } from '../taman-core-layout';

import { computed } from 'vue';

export function useLayout(props: TamanLayoutProps) {
  const currentLayout = computed(() =>
    props.isMobile ? 'sidebar-nav' : (props.layout as TamanLayoutType),
  );

  /**
   * Full-screen content without sidebar, footer, header, or tab bar
   */
  const isFullContent = computed(() => currentLayout.value === 'full-content');

  /**
   * Whether mixed sidebar navigation is active
   */
  const isSidebarMixedNav = computed(
    () => currentLayout.value === 'sidebar-mixed-nav',
  );

  /**
   * Whether top header navigation is active
   */
  const isHeaderNav = computed(() => currentLayout.value === 'header-nav');

  /**
   * Whether mixed navigation is active
   */
  const isMixedNav = computed(
    () =>
      currentLayout.value === 'mixed-nav'
      || currentLayout.value === 'header-sidebar-nav',
  );

  /**
   * Whether header-mixed navigation is active
   */
  const isHeaderMixedNav = computed(
    () => currentLayout.value === 'header-mixed-nav',
  );

  return {
    currentLayout,
    isFullContent,
    isHeaderMixedNav,
    isHeaderNav,
    isMixedNav,
    isSidebarMixedNav,
  };
}
