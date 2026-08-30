<script setup lang="ts">
import type { DropdownMenuItem } from '@taman-core/taman-ui';
import { tamanConfirm } from '@taman-core/popup-ui';
import { $t } from '@taman/locales';
import PAvatar from 'pohon-ui/components/Avatar.vue';
import PBadge from 'pohon-ui/components/Badge.vue';
import PButton from 'pohon-ui/components/Button.vue';
import PDropdownMenu from 'pohon-ui/components/DropdownMenu.vue';
import { computed } from 'vue';

interface Props {
  avatar?: string | null;
  menus?: Array<DropdownMenuItem>;
  name?: string;
  description?: string;
  badge?: string;
}

defineOptions({
  name: 'LayoutWidgetUserDropdown',
});

const props = withDefaults(
  defineProps<Props>(),
  {
    avatar: '',
    description: '',
    menus: () => [],
  },
);

const emits = defineEmits<{
  clearPreferencesAndLogout: [];
  logout: [];
}>();

const dropdownItems = computed<Array<DropdownMenuItem>>(() => {
  const items: Array<DropdownMenuItem> = [
    {
      label: props.name,
      avatar: {
        src: props.avatar ?? undefined,
        alt: props.name,
      },
      type: 'label',
      slot: 'user' as const,
    },
  ];

  if (props.menus.length) {
    items.push({ type: 'separator' });
    items.push(...props.menus);
  }

  // {
  //   label: $t('common.logout'),
  //   icon: 'lucide:log-out',
  //   kbds: ['option', 'q'],
  //   onSelect: handleLogout,
  // },

  return items;
});

async function handleLogout() {
  tamanConfirm({
    content: $t('ui.widgets.logoutTip'),
    title: $t('common.logout'),
    icon: 'question',
  }).then(() => {
    emits('logout');
  });
}

// defineShortcuts(extractShortcuts(items.value));
</script>

<template>
  <PDropdownMenu
    :items="dropdownItems"
    :ui="{
      content: 'min-w-60',
    }"
    class="ml-4"
  >
    <PButton
      :avatar="{
        src: props.avatar ?? undefined,
        alt: props.name,
      }"
      class="pohon:rounded-full"
      size="2xl"
      variant="ghost"
      color="neutral"
    />

    <template #user>
      <PAvatar
        :src="props.avatar ?? undefined"
        :alt="props.name"
        size="3xl"
      />

      <div class="flex flex-col gap-1">
        <p class="text-sm font-500 flex gap-2 items-center">
          {{ props.name }}

          <slot name="badge">
            <PBadge
              v-if="props.badge"
              variant="subtle"
              size="sm"
            >
              {{ props.badge }}
            </PBadge>
          </slot>
        </p>

        <p class="text-xs color-text-muted font-400">
          {{ props.description }}
        </p>
      </div>
    </template>
  </PDropdownMenu>
</template>
