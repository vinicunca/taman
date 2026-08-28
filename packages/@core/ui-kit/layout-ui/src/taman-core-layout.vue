<script setup lang="ts">
import type { CSSProperties } from 'vue';
import type { TamanLayoutProps } from './taman-core-layout';
import {
  SCROLL_FIXED_CLASS,
  useLayoutFooterStyle,
  useLayoutHeaderStyle,
  useLayoutViewportHeight,
} from '@taman-core/composables';
import { ELEMENT_ID_LAYOUT_SCROLL, ELEMENT_ID_MAIN_CONTENT } from '@taman-core/shared/constants';
import { TamanButtonIcon } from '@taman-core/taman-ui';
import { useEventListener, useScroll } from '@vueuse/core';
import { computed, ref, useTemplateRef, watch } from 'vue';
import {
  TamanCoreLayoutContent,
  TamanCoreLayoutFooter,
  TamanCoreLayoutHeader,
  TamanCoreLayoutSidebar,
  TamanCoreLayoutTabbar,
} from './components';
import { useLayout } from './composables/use-layout';
import { resolveHeaderHiddenOnScroll } from './header-scroll-state';

defineOptions({
  name: 'TamanCoreLayout',
});

const props = withDefaults(
  defineProps<TamanLayoutProps>(),
  {
    contentCompact: 'wide',
    contentCompactWidth: 1200,
    contentPadding: 0,
    contentPaddingBottom: 0,
    contentPaddingLeft: 0,
    contentPaddingRight: 0,
    contentPaddingTop: 0,
    footerEnable: false,
    footerFixed: true,
    footerHeight: 32,
    headerHeight: 50,
    headerHidden: false,
    headerMode: 'fixed',
    headerToggleSidebarButton: true,
    headerVisible: true,
    isMobile: false,
    layout: 'sidebar-nav',
    sidebarCollapsedButton: true,
    sidebarCollapseShowTitle: false,
    sidebarExtraCollapsedWidth: 60,
    sidebarFixedButton: true,
    sidebarHidden: false,
    sidebarMixedWidth: 80,
    sidebarTheme: 'dark',
    sidebarThemeSub: 'dark',
    sidebarWidth: 180,
    sideCollapseWidth: 60,
    tabbarEnable: true,
    tabbarHeight: 40,
    zIndex: 200,
  },
);

const emits = defineEmits<{
  'sideMouseLeave': [];
  'toggleSidebar': [];
  'update:sidebarWidth': [value: number];
}>();

const sidebarDraggable = defineModel<boolean>('sidebarDraggable', {
  default: true,
});
const sidebarCollapse = defineModel<boolean>('sidebarCollapse', {
  default: false,
});
const sidebarExtraVisible = defineModel<boolean>('sidebarExtraVisible');
const sidebarExtraCollapse = defineModel<boolean>('sidebarExtraCollapse', {
  default: false,
});
const sidebarExpandOnHover = defineModel<boolean>('sidebarExpandOnHover', {
  default: false,
});
const sidebarEnable = defineModel<boolean>('sidebarEnable', { default: true });

const HEADER_TRIGGER_DISTANCE = 12;

// Sidebar expanded on hover
const sidebarExpandOnHovering = ref(false);
const mobileSidebarOpen = ref(false);
const headerIsHidden = ref(false);
const mainRef = useTemplateRef('mainRef');
const contentRef = useTemplateRef('contentRef');
let lastMouseY: null | number = null;

const {
  arrivedState,
  directions,
  y: scrollY,
} = useScroll(contentRef, {
  onScroll: handleLayoutScroll,
});

useLayoutViewportHeight();
const { setLayoutHeaderHeight } = useLayoutHeaderStyle();
const { setLayoutFooterHeight } = useLayoutFooterStyle();

const {
  currentLayout,
  isFullContent,
  isHeaderMixedNav,
  isHeaderNav,
  isMixedNav,
  isSidebarMixedNav,
} = useLayout(props);

/**
 * Whether the header auto-hides
 */
const isHeaderAutoActive = computed(
  () =>
    props.headerMode === 'auto' && !isMixedNav.value && !isFullContent.value,
);

const isHeaderOverlayModeActive = computed(
  () =>
    (props.headerMode === 'auto' || props.headerMode === 'auto-scroll')
    && !isMixedNav.value
    && !isFullContent.value,
);

const headerHasShadow = computed(() => scrollY.value > 20);

const headerWrapperHeight = computed(() => {
  let height = 0;
  if (props.headerVisible && !props.headerHidden) {
    height += props.headerHeight;
  }
  if (props.tabbarEnable) {
    height += props.tabbarHeight;
  }
  return height;
});

const getSideCollapseWidth = computed(() => {
  const {
    sidebarCollapseShowTitle,
    sidebarExtraCollapsedWidth,
    sideCollapseWidth,
  } = props;

  return sidebarCollapseShowTitle
    || isSidebarMixedNav.value
    || isHeaderMixedNav.value
    ? sidebarExtraCollapsedWidth
    : sideCollapseWidth;
});

const activeSidebarCollapse = computed({
  get: () =>
    props.isMobile ? !mobileSidebarOpen.value : sidebarCollapse.value,
  set: (value: boolean) => {
    if (props.isMobile) {
      mobileSidebarOpen.value = !value;
      return;
    }
    sidebarCollapse.value = value;
  },
});

/**
 * Whether the sidebar region is visible
 */
const sidebarEnableState = computed(() => {
  return !isHeaderNav.value && sidebarEnable.value;
});

/**
 * Sidebar top offset
 */
const sidebarMarginTop = computed(() => {
  const { headerHeight, isMobile } = props;
  return isMixedNav.value && !isMobile ? headerHeight : 0;
});

/**
 * Computed sidebar width
 */
const getSidebarWidth = computed(() => {
  const { isMobile, sidebarHidden, sidebarMixedWidth, sidebarWidth } = props;
  let width = 0;

  if (sidebarHidden) {
    return width;
  }

  if (
    !sidebarEnableState.value
    || (sidebarHidden
      && !isSidebarMixedNav.value
      && !isMixedNav.value
      && !isHeaderMixedNav.value)
  ) {
    return width;
  }

  if ((isHeaderMixedNav.value || isSidebarMixedNav.value) && !isMobile) {
    width = sidebarMixedWidth;
  } else if (activeSidebarCollapse.value) {
    width = isMobile ? 0 : getSideCollapseWidth.value;
  } else {
    width = sidebarWidth;
  }
  return width;
});

/**
 * Extra sidebar panel width
 */
const sidebarExtraWidth = computed(() => {
  const { sidebarExtraCollapsedWidth, sidebarWidth } = props;

  return sidebarExtraCollapse.value ? sidebarExtraCollapsedWidth : sidebarWidth;
});

/**
 * Whether a sidebar layout is active (including mixed sidebar)
 */
const isSideMode = computed(
  () =>
    currentLayout.value === 'mixed-nav'
    || currentLayout.value === 'sidebar-mixed-nav'
    || currentLayout.value === 'sidebar-nav'
    || currentLayout.value === 'header-mixed-nav'
    || currentLayout.value === 'header-sidebar-nav',
);

/**
 * Whether the header is fixed
 */
const headerFixed = computed(() => {
  const { headerMode } = props;
  return (
    isMixedNav.value
    || headerMode === 'fixed'
    || headerMode === 'auto-scroll'
    || headerMode === 'auto'
  );
});

const showSidebar = computed(() => {
  return isSideMode.value && sidebarEnable.value && !props.sidebarHidden;
});

/**
 * Overlay mask visibility
 */
const maskVisible = computed(
  () => !activeSidebarCollapse.value && props.isMobile,
);

const mainStyle = computed(() => {
  let width = '100%';
  let sidebarAndExtraWidth = 'unset';
  if (
    headerFixed.value
    && currentLayout.value !== 'header-nav'
    && currentLayout.value !== 'mixed-nav'
    && currentLayout.value !== 'header-sidebar-nav'
    && showSidebar.value
    && !props.isMobile
  ) {
    // fixed模式下生效
    const isSideNavEffective
      = (isSidebarMixedNav.value || isHeaderMixedNav.value)
        && sidebarExpandOnHover.value
        && sidebarExtraVisible.value;

    if (isSideNavEffective) {
      const sideCollapseWidth = props.sidebarMixedWidth;
      const sideWidth = sidebarExtraCollapse.value
        ? props.sidebarExtraCollapsedWidth
        : props.sidebarWidth;

      // 100% - 侧边菜单混合宽度 - 菜单宽度
      sidebarAndExtraWidth = `${sideCollapseWidth + sideWidth}px`;
      width = `calc(100% - ${sidebarAndExtraWidth})`;
    } else {
      let sidebarWidth = getSidebarWidth.value;
      if (sidebarExpandOnHovering.value && !sidebarExpandOnHover.value) {
        sidebarWidth
          = isSidebarMixedNav.value || isHeaderMixedNav.value
            ? props.sidebarMixedWidth
            : getSideCollapseWidth.value;
      }
      sidebarAndExtraWidth = `${sidebarWidth}px`;
      width = `calc(100% - ${sidebarAndExtraWidth})`;
    }
  }
  return {
    sidebarAndExtraWidth,
    width,
  };
});

// Compute tab bar styles
const tabbarStyle = computed<CSSProperties>(() => {
  let width: string;
  let marginLeft = 0;

  // If it is not a mixed navigation, the width of the tab bar is 100%
  if (!isMixedNav.value || props.sidebarHidden) {
    width = '100%';
  } else if (sidebarEnable.value) {
    // When the mouse is on the sidebar, and the sidebar is expanded, the width is the sidebar width
    const onHoveringWidth = sidebarExpandOnHover.value
      ? props.sidebarWidth
      : getSideCollapseWidth.value;

    // Set marginLeft, determine based on whether the sidebar is collapsed
    marginLeft = activeSidebarCollapse.value
      ? getSideCollapseWidth.value
      : onHoveringWidth;

    // Set the width of the tab bar, the calculation method is 100% minus the width of the sidebar
    width = `calc(100% - ${activeSidebarCollapse.value ? getSidebarWidth.value : onHoveringWidth}px)`;
  } else {
    // By default, the width of the tab bar is 100%
    width = '100%';
  }

  return {
    marginLeft: `${marginLeft}px`,
    width,
  };
});

const layoutScrollStyle = computed((): CSSProperties => {
  const fixed = headerFixed.value;

  if (!fixed) {
    return {
      marginTop: 0,
      paddingTop: 0,
    };
  }

  if (isHeaderOverlayModeActive.value) {
    return {
      marginTop: 0,
      paddingTop: isFullContent.value ? 0 : `${headerWrapperHeight.value}px`,
    };
  }

  return {
    marginTop:
      fixed
      && !isFullContent.value
      && !headerIsHidden.value
      && (!isHeaderAutoActive.value || scrollY.value < headerWrapperHeight.value)
        ? `${headerWrapperHeight.value}px`
        : 0,
    paddingTop: 0,
  };
});

const contentStyle = computed((): CSSProperties => {
  const { footerEnable, footerFixed, footerHeight } = props;
  return {
    minHeight: footerEnable && !footerFixed ? undefined : 0,
    paddingBottom: `${footerEnable && footerFixed ? footerHeight : 0}px`,
  };
});

const headerZIndex = computed(() => {
  const { zIndex } = props;
  const offset = isMixedNav.value ? 1 : 0;
  return zIndex + offset;
});

const headerWrapperStyle = computed((): CSSProperties => {
  const fixed = headerFixed.value;
  const hidden = headerIsHidden.value || isFullContent.value;

  return {
    'height': isFullContent.value ? '0' : `${headerWrapperHeight.value}px`,
    'left': isMixedNav.value ? 0 : mainStyle.value.sidebarAndExtraWidth,
    'position': fixed ? 'fixed' : 'static',
    'top': 0,
    'transform': fixed
      ? `translate3d(0, ${hidden ? '-100%' : '0'}, 0)`
      : undefined,
    'transitionDuration': fixed ? undefined : '0ms',
    'width': mainStyle.value.width,
    'willChange': fixed ? 'transform' : undefined,
    'z-index': headerZIndex.value,
  };
});

/**
 * Sidebar z-index
 */
const sidebarZIndex = computed(() => {
  const { isMobile, zIndex } = props;
  let offset = isMobile || isSideMode.value ? 1 : -1;

  if (isMixedNav.value) {
    offset += 1;
  }

  return zIndex + offset;
});

const footerWidth = computed(() => {
  if (!props.footerFixed) {
    return '100%';
  }

  return mainStyle.value.width;
});

const maskStyle = computed<CSSProperties>(() => {
  return { zIndex: props.zIndex };
});

/**
 * Whether the sidebar logo region is displayed
 */
const sidebarHeaderHeight = computed(() => {
  if (isMixedNav.value || !props.sidebarLogoVisible) {
    return 0;
  }

  return props.headerHeight;
});

const showHeaderToggleButton = computed(() => {
  return (
    props.isMobile
    || (props.headerToggleSidebarButton
      && isSideMode.value
      && !isSidebarMixedNav.value
      && !isMixedNav.value
      && !props.isMobile)
  );
});

const showHeaderLogo = computed(() => {
  return !isSideMode.value || isMixedNav.value || props.isMobile;
});

watch(
  () => props.isMobile,
  (isMobile) => {
    if (isMobile) {
      mobileSidebarOpen.value = false;
    }
  },
  {
    immediate: true,
  },
);

watch(
  [() => headerWrapperHeight.value, () => isFullContent.value],
  ([height]) => {
    setLayoutHeaderHeight(isFullContent.value ? 0 : height);
  },
  {
    immediate: true,
  },
);

watch(
  () => props.footerHeight,
  (height: number) => {
    setLayoutFooterHeight(height);
  },
  {
    immediate: true,
  },
);

watch(
  [
    () => props.headerMode,
    () => isMixedNav.value,
    () => isFullContent.value,
  ],
  () => {
    headerIsHidden.value = false;
  },
);

useEventListener(mainRef, 'mousemove', handleHeaderMouseMove, {
  passive: true,
});

useEventListener(mainRef, 'wheel', handleLayoutWheel, {
  passive: true,
});

function handleLayoutWheel(event: WheelEvent) {
  lastMouseY = event.clientY;
}

function handleHeaderMouseMove(event: MouseEvent) {
  lastMouseY = event.clientY;

  if (!isHeaderAutoActive.value) {
    return;
  }

  updateHeaderVisibilityFromMouse(lastMouseY);
}

function updateHeaderVisibilityFromMouse(mouseY: null | number) {
  if (arrivedState.top || scrollY.value < headerWrapperHeight.value) {
    headerIsHidden.value = false;
    return;
  }

  if (mouseY === null) {
    return;
  }

  const isInTriggerZone = mouseY <= HEADER_TRIGGER_DISTANCE;
  const isInHeaderZone
    = !headerIsHidden.value && mouseY <= headerWrapperHeight.value;

  headerIsHidden.value = !(isInTriggerZone || isInHeaderZone);
}

function handleLayoutScroll() {
  if (isHeaderAutoActive.value) {
    updateHeaderVisibilityFromMouse(lastMouseY);
    return;
  }

  if (
    props.headerMode !== 'auto-scroll'
    || isMixedNav.value
    || isFullContent.value
  ) {
    return;
  }

  resolveHeaderVisibilityOnScroll();
}

function resolveHeaderVisibilityOnScroll() {
  headerIsHidden.value = resolveHeaderHiddenOnScroll({
    arrivedTop: arrivedState.top,
    currentHidden: headerIsHidden.value,
    directionDown: directions.bottom,
    directionUp: directions.top,
    headerHeight: headerWrapperHeight.value,
    scrollTop: scrollY.value,
  });
}

function handleClickMask() {
  activeSidebarCollapse.value = true;
}

function handleHeaderToggle() {
  if (props.isMobile) {
    activeSidebarCollapse.value = false;
  } else {
    emits('toggleSidebar');
  }
}

const idMainContent = ELEMENT_ID_MAIN_CONTENT;
const idLayoutScroll = ELEMENT_ID_LAYOUT_SCROLL;
const idLayoutStaticHeader = `${ELEMENT_ID_LAYOUT_SCROLL}__static_header`;
const layoutStaticHeaderTarget = `#${idLayoutStaticHeader}`;
</script>

<template>
  <div
    data-layout-region="layout"
    :data-layout="currentLayout"
    :data-mobile="isMobile"
    :data-sidebar-collapsed="activeSidebarCollapse"
    class="flex h-full min-h-0 w-full relative overflow-hidden"
  >
    <TamanCoreLayoutSidebar
      v-if="sidebarEnableState"
      v-model:draggable="sidebarDraggable"
      v-model:collapse="activeSidebarCollapse"
      v-model:expand-on-hover="sidebarExpandOnHover"
      v-model:expand-on-hovering="sidebarExpandOnHovering"
      v-model:extra-collapse="sidebarExtraCollapse"
      v-model:extra-visible="sidebarExtraVisible"
      :show-collapse-button="sidebarCollapsedButton"
      :show-fixed-button="sidebarFixedButton"
      :collapse-width="getSideCollapseWidth"
      :dom-visible="!isMobile"
      :expanded-width="sidebarWidth"
      :extra-width="sidebarExtraWidth"
      :fixed-extra="sidebarExpandOnHover"
      :header-height="sidebarHeaderHeight"
      :extra-title-height="
        isSidebarMixedNav || isHeaderMixedNav ? sidebarExtraTitleHeight : 0
      "
      :is-sidebar-mixed="isSidebarMixedNav || isHeaderMixedNav"
      :is-mobile="isMobile"
      :margin-top="sidebarMarginTop"
      :mixed-width="sidebarMixedWidth"
      :show="showSidebar"
      :theme="sidebarTheme"
      :theme-sub="sidebarThemeSub"
      :width="getSidebarWidth"
      :z-index="sidebarZIndex"
      @leave="() => emits('sideMouseLeave')"
      @update:width="(val) => emits('update:sidebarWidth', val)"
    >
      <template
        v-if="isSideMode && !isMixedNav && sidebarLogoVisible"
        #logo
      >
        <slot name="logo" />
      </template>

      <template v-if="isSidebarMixedNav || isHeaderMixedNav">
        <slot name="mixed-menu" />
      </template>
      <template v-else>
        <slot name="menu" />
      </template>

      <template #extra>
        <slot name="side-extra" />
      </template>
      <template #extra-title>
        <slot name="side-extra-title" />
      </template>
    </TamanCoreLayoutSidebar>

    <div
      ref="mainRef"
      data-layout-region="main"
      class="flex flex-1 flex-col min-h-0 relative overflow-hidden"
    >
      <Teleport
        defer
        :disabled="headerFixed"
        :to="layoutStaticHeaderTarget"
      >
        <div
          data-layout-region="header"
          :class="[
            {
              'shadow-[0_16px_24px_hsl(var(--background))]': headerHasShadow,
            },
            SCROLL_FIXED_CLASS,
          ]"
          :style="headerWrapperStyle"
          class="shrink-0 transition-transform-280 overflow-hidden"
        >
          <TamanCoreLayoutHeader
            v-if="headerVisible"
            :full-width="!isSideMode"
            :height="headerHeight"
            :is-mobile="isMobile"
            :show="!isFullContent && !headerHidden"
            :sidebar-width="sidebarWidth"
            :theme="headerTheme"
            :width="mainStyle.width"
            :z-index="headerZIndex"
            :logo-visible="sidebarLogoVisible"
          >
            <template
              v-if="showHeaderLogo"
              #logo
            >
              <slot name="logo" />
            </template>

            <template #toggle-button>
              <TamanButtonIcon
                v-if="showHeaderToggleButton"
                data-layout-action="toggle-sidebar"
                :icon="isMobile ? !activeSidebarCollapse : showSidebar ? 'lucide:panel-left-close' : 'lucide:panel-left-open'"
                @click="handleHeaderToggle"
              />
            </template>

            <slot name="header" />
          </TamanCoreLayoutHeader>

          <TamanCoreLayoutTabbar
            v-if="tabbarEnable"
            :height="tabbarHeight"
            :style="tabbarStyle"
          >
            <slot name="tabbar" />
          </TamanCoreLayoutTabbar>
        </div>
      </Teleport>

      <div
        :id="idLayoutScroll"
        ref="contentRef"
        data-layout-region="scroll"
        :style="layoutScrollStyle"
        class="bg-background-accented flex flex-1 flex-col min-h-0 overflow-x-hidden overflow-y-auto"
      >
        <div
          :id="idLayoutStaticHeader"
          class="contents"
        />

        <TamanCoreLayoutContent
          :id="idMainContent"
          :content-compact="contentCompact"
          :content-compact-width="contentCompactWidth"
          :padding="contentPadding"
          :padding-bottom="contentPaddingBottom"
          :padding-left="contentPaddingLeft"
          :padding-right="contentPaddingRight"
          :padding-top="contentPaddingTop"
          :style="contentStyle"
        >
          <slot name="content" />

          <template #overlay>
            <slot name="content-overlay" />
          </template>
        </TamanCoreLayoutContent>

        <TamanCoreLayoutFooter
          v-if="footerEnable"
          :fixed="footerFixed"
          :height="footerHeight"
          :show="!isFullContent"
          :width="footerWidth"
          :z-index="zIndex"
        >
          <slot name="footer" />
        </TamanCoreLayoutFooter>
      </div>
    </div>

    <slot name="extra" />

    <Transition name="mobile-sidebar-mask">
      <div
        v-if="maskVisible"
        data-layout-region="sidebar-mask"
        :style="maskStyle"
        class="bg-background-elevated/75 size-full left-0 top-0 fixed"
        @click="handleClickMask"
      />
    </Transition>
  </div>
</template>

<style scoped>
.mobile-sidebar-mask-enter-active,
.mobile-sidebar-mask-leave-active {
  transition: opacity 300ms ease;
}

.mobile-sidebar-mask-enter-from,
.mobile-sidebar-mask-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .mobile-sidebar-mask-enter-active,
  .mobile-sidebar-mask-leave-active {
    transition-duration: 0ms;
  }
}
</style>
