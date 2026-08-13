<script lang="ts" setup>
import type { NotificationItem } from './types';

import {
  VbenButton,
  VbenIconButton,
  VbenPopover,
  VbenScrollbar,
} from '@vben-core/shadcn-ui';
import { Bell, CircleCheckBig, CircleX, MailCheck } from '@vben/icons';
import { $t } from '@taman/locales';
import { useToggle } from '@vueuse/core';

defineOptions({ name: 'NotificationPopup' });

withDefaults(
  defineProps<{
    /** Show unread dot indicator */
    dot?: boolean;
    /** Notification items */
    notifications?: Array<NotificationItem>;
  }>(),
  {
    dot: false,
    notifications: () => [],
  },
);

const emit = defineEmits<{
  clear: [];
  makeAll: [];
  onClick: [NotificationItem];
  read: [NotificationItem];
  remove: [NotificationItem];
  viewAll: [];
}>();

const [open, toggle] = useToggle();

function close() {
  open.value = false;
}

function handleViewAll() {
  emit('viewAll');
  close();
}

function handleMakeAll() {
  emit('makeAll');
}

function handleClear() {
  emit('clear');
}
</script>

<template>
  <VbenPopover
    v-model:open="open"
    content-class="relative right-2 w-90 p-0"
  >
    <template #trigger>
      <div
        class="mr-2 flex-center h-full"
        @click.stop="toggle()"
      >
        <VbenIconButton class="bell-button color-text relative">
          <span
            v-if="dot"
            class="bg-primary rounded-sm size-2 right-0.5 top-0.5 absolute"
          />
          <Bell class="size-4" />
        </VbenIconButton>
      </div>
    </template>

    <div class="relative">
      <div class="p-4 py-3 flex items-center justify-between">
        <div class="color-text">
          {{ $t('ui.widgets.notifications') }}
        </div>
        <VbenIconButton
          :disabled="notifications.length <= 0"
          :tooltip="$t('ui.widgets.markAllAsRead')"
          @click="handleMakeAll"
        >
          <MailCheck class="size-4" />
        </VbenIconButton>
      </div>
      <VbenScrollbar v-if="notifications.length > 0">
        <ul class="flex-col max-h-90 w-full flex!">
          <template
            v-for="item in notifications"
            :key="item.id ?? item.title"
          >
            <li
              class="p-3 border-t border-border flex gap-5 w-full cursor-pointer items-start relative hover:bg-background-accented"
              @click="emit('onClick', item)"
            >
              <slot
                name="content"
                :item="item"
              >
                <span
                  v-if="!item.isRead"
                  class="bg-primary rounded-sm size-2 right-2 top-2 absolute"
                />

                <span
                  class="rounded-full flex shrink-0 size-10 relative overflow-hidden"
                >
                  <img
                    :src="item.avatar"
                    class="size-full aspect-square object-cover"
                  >
                </span>
                <div class="leading-none flex flex-col gap-1">
                  <p class="font-semibold">
                    {{ item.title }}
                  </p>
                  <p class="text-muted-foreground text-xs my-1 line-clamp-2">
                    {{ item.message }}
                  </p>
                  <p class="text-muted-foreground text-xs line-clamp-2">
                    {{ item.date }}
                  </p>
                </div>
                <div
                  class="flex flex-row gap-1 right-3 top-1/2 absolute -translate-y-1/2"
                >
                  <slot
                    name="action"
                    :item="item"
                  >
                    <slot
                      name="action-prepend"
                      :item="item"
                    />
                    <VbenIconButton
                      v-if="!item.isRead"
                      size="xs"
                      variant="ghost"
                      class="px-2 h-6"
                      :tooltip="$t('common.confirm')"
                      @click.stop="emit('read', item)"
                    >
                      <CircleCheckBig class="size-4" />
                    </VbenIconButton>
                    <VbenIconButton
                      v-if="item.isRead"
                      size="xs"
                      variant="ghost"
                      class="text-destructive px-2 h-6"
                      :tooltip="$t('common.delete')"
                      @click.stop="emit('remove', item)"
                    >
                      <CircleX class="size-4" />
                    </VbenIconButton>
                    <slot
                      name="action-append"
                      :item="item"
                    />
                  </slot>
                </div>
              </slot>
            </li>
          </template>
        </ul>
      </VbenScrollbar>

      <template v-else>
        <div class="text-muted-foreground flex-center min-h-37.5 w-full">
          {{ $t('common.noData') }}
        </div>
      </template>

      <div
        class="px-4 py-3 border-t border-border flex items-center justify-between"
      >
        <VbenButton
          :disabled="notifications.length <= 0"
          size="sm"
          variant="ghost"
          @click="handleClear"
        >
          {{ $t('ui.widgets.clearNotifications') }}
        </VbenButton>
        <VbenButton
          size="sm"
          @click="handleViewAll"
        >
          {{ $t('ui.widgets.viewAll') }}
        </VbenButton>
      </div>
    </div>
  </VbenPopover>
</template>

<style scoped>
:deep(.bell-button) {
  &:hover {
    svg {
      animation: bell-ring 1s both;
    }
  }
}

@keyframes bell-ring {
  0%,
  100% {
    transform-origin: top;
  }

  15% {
    transform: rotateZ(10deg);
  }

  30% {
    transform: rotateZ(-10deg);
  }

  45% {
    transform: rotateZ(5deg);
  }

  60% {
    transform: rotateZ(-5deg);
  }

  75% {
    transform: rotateZ(2deg);
  }
}
</style>
