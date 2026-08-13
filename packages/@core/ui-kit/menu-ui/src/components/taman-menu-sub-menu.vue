<script lang="ts" setup>
import type { PopoverProps } from '@taman-core/taman-ui';

import type { MenuItemRegistered, MenuProvider, SubMenuProps } from '../menu.types';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

import {
  createSubMenuContext,
  useMenu,
  useMenuContext,
  useMenuStyle,
  useSubMenuContext,
} from '../composables';
import { TAMAN_MENU_ROOT_NAME, TAMAN_MENU_SUB_MENU_NAME } from '../menu.constants';
import CollapseTransition from './collapse-transition.vue';
import TamanMenuSubMenuContent from './taman-menu-sub-menu-content.vue';

interface Props extends SubMenuProps {
  isSubMenuMore?: boolean;
}

defineOptions({
  name: TAMAN_MENU_SUB_MENU_NAME,
});

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  isSubMenuMore: false,
});

const { parentMenu, parentPaths } = useMenu();
const rootMenu = useMenuContext();
const subMenu = useSubMenuContext();
const subMenuStyle = useMenuStyle(subMenu);

const mouseInChild = ref(false);

const items = ref<MenuProvider['items']>({});
const subMenus = ref<MenuProvider['subMenus']>({});
const timer = ref<null | ReturnType<typeof setTimeout>>(null);

createSubMenuContext({
  addSubMenu,
  handleMouseleave,
  level: (subMenu?.level ?? 0) + 1,
  mouseInChild,
  removeSubMenu,
});

const opened = computed(() => {
  return rootMenu?.openedMenus.includes(props.path);
});

const isTopLevelMenuSubmenu = computed(
  () => parentMenu.value?.type.name === TAMAN_MENU_ROOT_NAME,
);

const mode = computed(() => rootMenu?.props.mode ?? 'vertical');
const rounded = computed(() => rootMenu?.props.rounded);
const currentLevel = computed(() => subMenu?.level ?? 0);
const isFirstLevel = computed(() => {
  return currentLevel.value === 1;
});

const contentProps = computed<PopoverProps['content']>(() => {
  const isHorizontal = mode.value === 'horizontal';
  const side = isHorizontal && isFirstLevel.value ? 'bottom' : 'right';

  return {
    collisionPadding: { top: 20 },
    side,
    sideOffset: isHorizontal ? 5 : 12,
  };
});

const active = computed(() => {
  let isActive = false;

  Object.values(items.value).forEach((item) => {
    if (item.active) {
      isActive = true;
    }
  });

  Object.values(subMenus.value).forEach((subItem) => {
    if (subItem.active) {
      isActive = true;
    }
  });
  return isActive;
});

function addSubMenu(subMenu: MenuItemRegistered) {
  subMenus.value[subMenu.path] = subMenu;
}

function removeSubMenu(subMenu: MenuItemRegistered) {
  Reflect.deleteProperty(subMenus.value, subMenu.path);
}

/**
 * Toggle submenu open/closed on click
 */
function handleClick() {
  const mode = rootMenu?.props.mode;
  if (
    // Do not expand when the menu is disabled
    props.disabled
    || (rootMenu?.props.collapse && mode === 'vertical')
    // Do not expand in horizontal mode
    || mode === 'horizontal'
  ) {
    return;
  }

  rootMenu?.handleSubMenuClick({
    active: active.value,
    parentPaths: parentPaths.value,
    path: props.path,
  });
}

function handleMouseenter(event: FocusEvent | MouseEvent, showTimeout = 300) {
  if (event.type === 'focus') {
    return;
  }

  if (
    (!rootMenu?.props.collapse && rootMenu?.props.mode === 'vertical')
    || props.disabled
  ) {
    if (subMenu) {
      subMenu.mouseInChild.value = true;
    }
    return;
  }
  if (subMenu) {
    subMenu.mouseInChild.value = true;
  }

  timer.value && window.clearTimeout(timer.value);
  timer.value = setTimeout(() => {
    rootMenu?.openMenu(props.path, parentPaths.value);
  }, showTimeout);
  parentMenu.value?.vnode.el?.dispatchEvent(new MouseEvent('mouseenter'));
}

function handleMouseleave(deepDispatch = false) {
  if (
    !rootMenu?.props.collapse
    && rootMenu?.props.mode === 'vertical'
    && subMenu
  ) {
    subMenu.mouseInChild.value = false;
    return;
  }

  timer.value && window.clearTimeout(timer.value);

  if (subMenu) {
    subMenu.mouseInChild.value = false;
  }
  timer.value = setTimeout(() => {
    !mouseInChild.value && rootMenu?.closeMenu(props.path, parentPaths.value);
  }, 300);

  if (deepDispatch) {
    subMenu?.handleMouseleave?.(true);
  }
}

const menuIcon = computed(() =>
  active.value ? props.activeIcon || props.icon : props.icon,
);

const item = reactive({
  active,
  parentPaths,
  path: props.path,
});

onMounted(() => {
  subMenu?.addSubMenu?.(item);
  rootMenu?.addSubMenu?.(item);
});

onBeforeUnmount(() => {
  subMenu?.removeSubMenu?.(item);
  rootMenu?.removeSubMenu?.(item);
});
</script>

<template>
  <li
    class="taman-sub-menu"
    :class="[
      {
        'is-active': active,
        'is-disabled': disabled,
        'is-opened': opened,
      },
    ]"
    @focus="handleMouseenter"
    @mouseenter="handleMouseenter"
    @mouseleave="() => handleMouseleave()"
  >
    <template v-if="rootMenu.isMenuPopup">
      <PPopover
        :ui="{
          content: [
            rootMenu.theme,
            'taman-menu__popup-container',
            `is-${rootMenu.theme}`,
            opened ? '' : 'hidden',
            'overflow-auto',
            'max-h-[calc(var(--akar-hover-card-content-available-height)-20px)]',
            mode === 'horizontal' ? 'is-horizontal' : '',
          ],
        }"
        :content="contentProps"
        mode="hover"
        open
        :open-delay="0"
      >
        <TamanMenuSubMenuContent
          :class="{
            'is-active': active,
          }"
          :icon="menuIcon"
          :is-menu-more="isSubMenuMore"
          :is-top-level-menu-submenu="isTopLevelMenuSubmenu"
          :level="currentLevel"
          :path="path"
          @click.stop="handleClick"
        >
          <template #title>
            <slot name="title" />
          </template>
        </TamanMenuSubMenuContent>

        <template #content>
          <div
            class="taman-menu__popup"
            :class="[`is-${mode}`]"
            @focus="(e) => handleMouseenter(e, 100)"
            @mouseenter="(e) => handleMouseenter(e, 100)"
            @mouseleave="() => handleMouseleave(true)"
          >
            <ul
              class="taman-menu"
              :class="{
                'is-rounded': rounded,
              }"
              :style="subMenuStyle"
            >
              <slot />
            </ul>
          </div>
        </template>
      </PPopover>
    </template>

    <template v-else>
      <TamanMenuSubMenuContent
        :class="{
          'is-active': active,
        }"
        :icon="menuIcon"
        :is-menu-more="isSubMenuMore"
        :is-top-level-menu-submenu="isTopLevelMenuSubmenu"
        :level="currentLevel"
        :path="path"
        @click.stop="handleClick"
      >
        <slot name="content" />
        <template #title>
          <slot name="title" />
        </template>
      </TamanMenuSubMenuContent>

      <CollapseTransition>
        <ul
          v-show="opened"
          class="taman-menu"
          :class="{
            'is-rounded': rounded,
          }"
          :style="subMenuStyle"
        >
          <slot />
        </ul>
      </CollapseTransition>
    </template>
  </li>
</template>
