<script setup lang="ts">
import type { DropdownMenuItem } from '@taman-core/taman-ui';
import { tamanConfirm } from '@taman-core/popup-ui';
import { computed } from 'vue';

interface Props {
  avatar?: string | null;
  menus?: Array<DropdownMenuItem>;
  name?: string;
  description?: string;
}

defineOptions({
  name: 'UserDropdown',
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

const items = computed<Array<DropdownMenuItem>>(() => {
  return [
    {
      label: props.name,
      avatar: {
        src: props.avatar ?? undefined,
        alt: props.name,
      },
      type: 'label',
      slot: 'user' as const,
    },

    ...props.menus,

    {
      type: 'separator',
    },

    {
      label: 'Logout',
      icon: 'lucide:log-out',
      kbds: ['option', 'q'],
      onSelect: handleLogout,
    },
  ];
});

async function handleLogout() {
  const isConfirmed = await tamanConfirm({
    content: 'Are you sure you want to logout?',
    title: 'Logout',
    icon: 'question',
  });

  if (isConfirmed) {
    emits('logout');
  }
}

defineShortcuts(extractShortcuts(items.value));
</script>

<template>
  <!-- TODO: implement Lock Dialog -->
  <PDropdownMenu
    :items="items"
    :ui="{
      content: 'min-w-60',
    }"
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
        <p class="text-sm font-500">
          {{ props.name }}
        </p>
        <p class="text-xs color-text-muted font-400">
          {{ props.description }}
        </p>
      </div>
    </template>
  </PDropdownMenu>
</template>
