<script lang="ts" setup>
import type { MenuItemProps, MenuItemRegistered } from '../menu.types';

import { isHttpUrl } from '@taman-core/shared/utils';
import { TamanIcon } from '@taman-core/taman-ui';
import qs from 'qs';
import { computed, onBeforeUnmount, onMounted, reactive, useSlots } from 'vue';

import { TamanMenuBadge } from '../components';
import { useMenu, useMenuContext, useSubMenuContext } from '../composables';
import { TAMAN_MENU_ROOT_NAME } from '../menu.constants';

interface Props extends MenuItemProps {}

defineOptions({ name: 'TamanMenuItem' });

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{ click: [MenuItemRegistered] }>();

const slots = useSlots();
const rootMenu = useMenuContext();
const subMenu = useSubMenuContext();
const { parentMenu, parentPaths } = useMenu();

const active = computed(() => props.path === rootMenu?.activePath);
const menuIcon = computed(() =>
  active.value ? props.activeIcon || props.icon : props.icon,
);

const item: MenuItemRegistered = reactive({
  active,
  parentPaths: parentPaths.value,
  path: props.path || '',
  query: props.query,
});

const isHttp = computed(() => isHttpUrl(item.parentPaths.at(-1)));

const isTopLevelMenuItem = computed(
  () => parentMenu.value?.type.name === TAMAN_MENU_ROOT_NAME,
);

const collapseShowTitle = computed(
  () =>
    rootMenu.props?.collapseShowTitle
    && isTopLevelMenuItem.value
    && rootMenu.props.collapse,
);

const showTooltip = computed(
  () =>
    rootMenu.props.mode === 'vertical'
    && isTopLevelMenuItem.value
    && rootMenu.props?.collapse
    && slots.title,
);

/**
 * Menu item click handler
 */
function handleClick() {
  if (props.disabled) {
    return;
  }
  rootMenu?.handleMenuItemClick?.({
    parentPaths: parentPaths.value,
    path: props.path,
  });
  emit('click', item);
}

onMounted(() => {
  subMenu?.addSubMenu?.(item);
  rootMenu?.addMenuItem?.(item);
});

onBeforeUnmount(() => {
  subMenu?.removeSubMenu?.(item);
  rootMenu?.removeMenuItem?.(item);
});
</script>

<template>
  <router-link
    v-slot="{ href }"
    custom
    :to="
      (item.parentPaths.at(-1) ?? '')
        + (item?.query ? `?${qs.stringify(item?.query)}` : '')
    "
  >
    <a
      :href="isHttp ? item.parentPaths.at(-1) : href"
      class="taman-menu-item"
      :class="[
        rootMenu.theme,
        {
          'is-active': active,
          'is-disabled': disabled,
          'is-collapse-show-title': collapseShowTitle,
        },
      ]"
      role="menuitem"
      @click.prevent.stop="handleClick"
    >
      <PTooltip
        v-if="showTooltip"
        :ui="{
          content: rootMenu.theme,
        }"
        :content="{
          side: 'right',
        }"
      >
        <div
          class="taman-menu-tooltip__trigger"
        >
          <TamanIcon
            class="taman-menu__icon"
            :icon="menuIcon"
          />

          <slot />

          <span
            v-if="collapseShowTitle"
            class="taman-menu__name"
          >
            <slot name="title" />
          </span>
        </div>

        <template #content>
          <slot name="title" />
        </template>
      </PTooltip>

      <div
        v-show="!showTooltip"
        class="taman-menu-item__content"
      >
        <TamanMenuBadge
          v-if="rootMenu.props.mode !== 'horizontal'"
          class="right-2"
          v-bind="props"
        />

        <TamanIcon
          class="taman-menu__icon"
          :icon="menuIcon"
        />

        <slot />

        <slot name="title" />
      </div>
    </a>
  </router-link>
</template>
