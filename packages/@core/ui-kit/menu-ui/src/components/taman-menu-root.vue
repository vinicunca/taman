<script lang="ts" setup>
import type { UseResizeObserverReturn } from '@vueuse/core';
import type { SetupContext, VNodeArrayChildren } from 'vue';
import type {
  MenuItemClicked,
  MenuItemRegistered,
  MenuProps,
  MenuProvider,
} from '../menu.types';
import { useResizeObserver } from '@vueuse/core';
import {
  computed,
  nextTick,
  reactive,
  ref,
  toRef,
  useSlots,
  watch,
  watchEffect,
} from 'vue';
import {
  createMenuContext,
  createSubMenuContext,
  useMenuStyle,
} from '../composables';
import { useMenuScroll } from '../composables/use-menu-scroll';
import { TAMAN_MENU_ROOT_NAME } from '../menu.constants';
import { flattedChildren } from '../menu.utils';
import TamanMenuSubMenu from './taman-menu-sub-menu.vue';

interface Props extends MenuProps {}

defineOptions({ name: TAMAN_MENU_ROOT_NAME });

const props = withDefaults(
  defineProps<Props>(),
  {
    accordion: true,
    collapse: false,
    mode: 'vertical',
    rounded: true,
    theme: 'dark',
    scrollToActive: false,
  },
);

const emit = defineEmits<{
  close: [string, Array<string>];
  open: [string, Array<string>];
  select: [string, Array<string>];
}>();

const menuStyle = useMenuStyle();
const slots: SetupContext['slots'] = useSlots();
const menu = ref<HTMLUListElement>();
const sliceIndex = ref(-1);
const openedMenus = ref<MenuProvider['openedMenus']>(
  props.defaultOpeneds && !props.collapse ? [...props.defaultOpeneds] : [],
);
const activePath = ref<MenuProvider['activePath']>(props.defaultActive);
const items = ref<MenuProvider['items']>({});
const subMenus = ref<MenuProvider['subMenus']>({});
const mouseInChild = ref(false);

const isMenuPopup = computed<MenuProvider['isMenuPopup']>(() => {
  return (
    props.mode === 'horizontal' || (props.mode === 'vertical' && props.collapse)
  );
});

const getSlot = computed(() => {
  // Update slot content
  const defaultSlots: VNodeArrayChildren = slots.default?.() ?? [];

  const originalSlot = flattedChildren(defaultSlots) as VNodeArrayChildren;
  const slotDefault
    = sliceIndex.value === -1
      ? originalSlot
      : originalSlot.slice(0, sliceIndex.value);

  const slotMore
    = sliceIndex.value === -1 ? [] : originalSlot.slice(sliceIndex.value);

  return { showSlotMore: slotMore.length > 0, slotDefault, slotMore };
});

watch(
  () => props.collapse,
  (value) => {
    if (value) {
      openedMenus.value = [];
    }
  },
);

watch(items.value, initMenu);

watch(
  () => props.defaultActive,
  (currentActive = '') => {
    if (!items.value[currentActive]) {
      activePath.value = '';
    }
    updateActiveName(currentActive);
  },
);

let resizeStopper: UseResizeObserverReturn['stop'];
watchEffect(() => {
  if (props.mode === 'horizontal') {
    resizeStopper = useResizeObserver(menu, handleResize).stop;
  } else {
    resizeStopper?.();
  }
});

// Provide menu context
createMenuContext(
  reactive({
    activePath,
    addMenuItem,
    addSubMenu,
    closeMenu,
    handleMenuItemClick,
    handleSubMenuClick,
    isMenuPopup,
    openedMenus,
    openMenu,
    props,
    removeMenuItem,
    removeSubMenu,
    subMenus,
    theme: toRef(props, 'theme'),
    items,
  }),
);

createSubMenuContext({
  addSubMenu,
  level: 1,
  mouseInChild,
  removeSubMenu,
});

function calcMenuItemWidth(menuItem: HTMLElement) {
  const computedStyle = getComputedStyle(menuItem);
  const marginLeft = Number.parseInt(computedStyle.marginLeft, 10);
  const marginRight = Number.parseInt(computedStyle.marginRight, 10);
  return menuItem.offsetWidth + marginLeft + marginRight || 0;
}

function calcSliceIndex() {
  if (!menu.value) {
    return -1;
  }
  const items = [...(menu.value?.childNodes ?? [])].filter(
    (item) =>
      // remove comment type node #12634
      item.nodeName !== '#comment'
      && (item.nodeName !== '#text' || item.nodeValue),
  ) as Array<HTMLElement>;

  const moreItemWidth = 46;
  const computedMenuStyle = getComputedStyle(menu?.value);

  const paddingLeft = Number.parseInt(computedMenuStyle.paddingLeft, 10);
  const paddingRight = Number.parseInt(computedMenuStyle.paddingRight, 10);
  const menuWidth = menu.value?.clientWidth - paddingLeft - paddingRight;

  let calcWidth = 0;
  let sliceIndex = 0;
  items.forEach((item, index) => {
    calcWidth += calcMenuItemWidth(item);
    if (calcWidth <= menuWidth - moreItemWidth) {
      sliceIndex = index + 1;
    }
  });
  return sliceIndex === items.length ? -1 : sliceIndex;
}

function debounce(fn: () => void, wait = 33.34) {
  let timer: null | ReturnType<typeof setTimeout>;
  return () => {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      fn();
    }, wait);
  };
}

let isFirstTimeRender = true;
function handleResize() {
  if (sliceIndex.value === calcSliceIndex()) {
    return;
  }
  const callback = () => {
    sliceIndex.value = -1;
    nextTick(() => {
      sliceIndex.value = calcSliceIndex();
    });
  };
  callback();
  // execute callback directly when first time resize to avoid shaking
  isFirstTimeRender ? callback() : debounce(callback)();
  isFirstTimeRender = false;
}

const enableScroll = computed(
  () => props.scrollToActive && props.mode === 'vertical' && !props.collapse,
);

useMenuScroll(activePath, {
  enable: enableScroll,
  delay: 320,
});

// Expand default menus
function initMenu() {
  const parentPaths = getActivePaths();

  // Open all submenus along the path to this item
  // expand all subMenus of the menu item
  parentPaths.forEach((path) => {
    const subMenu = subMenus.value[path];
    subMenu && openMenu(path, subMenu.parentPaths);
  });
}

function updateActiveName(val: string) {
  const itemsInData = items.value;
  const item
    = itemsInData[val]
      || (activePath.value && itemsInData[activePath.value])
      || itemsInData[props.defaultActive || ''];

  activePath.value = item ? item.path : val;
}

function handleMenuItemClick(data: MenuItemClicked) {
  const { collapse, mode } = props;
  if (mode === 'horizontal' || collapse) {
    openedMenus.value = [];
  }
  const { parentPaths, path } = data;
  if (!path || !parentPaths) {
    return;
  }

  emit('select', path, parentPaths);
}

function handleSubMenuClick({ parentPaths, path }: MenuItemRegistered) {
  const isOpened = openedMenus.value.includes(path);

  if (isOpened) {
    closeMenu(path, parentPaths);
  } else {
    openMenu(path, parentPaths);
  }
}

function close(path: string) {
  const i = openedMenus.value.indexOf(path);

  if (i !== -1) {
    openedMenus.value.splice(i, 1);
  }
}

/**
 * Close or collapse menu
 */
function closeMenu(path: string, parentPaths: Array<string>) {
  if (props.accordion) {
    openedMenus.value = subMenus.value[path]?.parentPaths ?? [];
  }

  close(path);

  emit('close', path, parentPaths);
}

/**
 * Open menu on click
 */
function openMenu(path: string, parentPaths: Array<string>) {
  if (openedMenus.value.includes(path)) {
    return;
  }
  // Accordion menu mode
  if (props.accordion) {
    const activeParentPaths = getActivePaths();
    if (activeParentPaths.includes(path)) {
      parentPaths = activeParentPaths;
    }
    openedMenus.value = openedMenus.value.filter((path: string) =>
      parentPaths.includes(path),
    );
  }
  openedMenus.value.push(path);
  emit('open', path, parentPaths);
}

function addMenuItem(item: MenuItemRegistered) {
  items.value[item.path] = item;
}

function addSubMenu(subMenu: MenuItemRegistered) {
  subMenus.value[subMenu.path] = subMenu;
}

function removeSubMenu(subMenu: MenuItemRegistered) {
  Reflect.deleteProperty(subMenus.value, subMenu.path);
}

function removeMenuItem(item: MenuItemRegistered) {
  Reflect.deleteProperty(items.value, item.path);
}

function getActivePaths() {
  const activeItem = activePath.value && items.value[activePath.value];

  if (!activeItem || props.mode === 'horizontal' || props.collapse) {
    return [];
  }

  return activeItem.parentPaths;
}
</script>

<template>
  <ul
    ref="menu"
    class="taman-menu"
    :class="[
      theme,
      `is-${mode}`,
      `is-${theme}`,
      {
        'is-rounded': rounded,
        'is-collapse': collapse,
        'is-menu-align': mode === 'horizontal',
      },
    ]"
    :style="menuStyle"
    role="menu"
  >
    <template v-if="mode === 'horizontal' && getSlot.showSlotMore">
      <template
        v-for="(item, index) in getSlot.slotDefault"
        :key="index"
      >
        <component :is="item" />
      </template>

      <TamanMenuSubMenu
        is-sub-menu-more
        path="sub-menu-more"
      >
        <template #title>
          <PIcon name="lucide:ellipsis" />
        </template>

        <template
          v-for="(item, index) in getSlot.slotMore"
          :key="index"
        >
          <component :is="item" />
        </template>
      </TamanMenuSubMenu>
    </template>

    <template v-else>
      <slot />
    </template>
  </ul>
</template>
