import type { TamanLayoutProps } from '../taman-layout';
import { TAMAN_LAYOUT_TYPE } from '@taman-core/typings';
import { computed } from 'vue';

export function useLayout(props: TamanLayoutProps) {
  const currentLayout = computed(() =>
    props.isMobile ? TAMAN_LAYOUT_TYPE.SIDEBAR_NAV : props.layout,
  );

  /**
   * Whether to display the content in full screen, without requiring side, bottom, top, or tab areas.
   */
  const isFullContent = computed(() => currentLayout.value === TAMAN_LAYOUT_TYPE.FULL_CONTENT);

  /**
   * Whether to display the sidebar mixed mode
   */
  const isSidebarMixedNav = computed(
    () => currentLayout.value === TAMAN_LAYOUT_TYPE.SIDEBAR_MIXED_NAV,
  );

  /**
   * Whether to display the header navigation mode
   */
  const isHeaderNav = computed(() => currentLayout.value === TAMAN_LAYOUT_TYPE.HEADER_NAV);

  /**
   * Whether to display the mixed navigation mode
   */
  const isMixedNav = computed(
    () =>
      currentLayout.value === TAMAN_LAYOUT_TYPE.MIXED_NAV
      || currentLayout.value === TAMAN_LAYOUT_TYPE.HEADER_SIDEBAR_NAV,
  );

  /**
   * Whether to display the header mixed mode
   */
  const isHeaderMixedNav = computed(
    () => currentLayout.value === TAMAN_LAYOUT_TYPE.HEADER_MIXED_NAV,
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
