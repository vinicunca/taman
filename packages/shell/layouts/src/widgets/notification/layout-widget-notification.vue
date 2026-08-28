<script lang="ts" setup>
import type { LayoutWidgetNotificationItem } from './layout-widget-notification.types';
import { TamanButtonIcon, TamanScrollbar } from '@taman-core/taman-ui';
import { $t } from '@taman/locales';
import { useToggle } from '@vueuse/core';
import PButton from 'pohon-ui/components/Button.vue';
import PPopover from 'pohon-ui/components/Popover.vue';

defineOptions({
  name: 'LayoutWidgetNotification',
});

withDefaults(
  defineProps<{
    /** Show dot */
    dot?: boolean;
    /** Message list */
    notifications?: Array<LayoutWidgetNotificationItem>;
  }>(),
  {
    dot: false,
    notifications: () => [],
  },
);

const emits = defineEmits<{
  clear: [];
  makeAll: [];
  onClick: [LayoutWidgetNotificationItem];
  read: [LayoutWidgetNotificationItem];
  remove: [LayoutWidgetNotificationItem];
  viewAll: [];
}>();

const [open, toggle] = useToggle();

function close() {
  open.value = false;
}

function handleViewAll() {
  emits('viewAll');
  close();
}

function handleMakeAll() {
  emits('makeAll');
}

function handleClear() {
  emits('clear');
}

defineExpose({ toggle });
</script>

<template>
  <PPopover
    v-model:open="open"
    content-class="relative right-2 w-90 p-0"
  >
    <div
      class="mr-2 flex-center h-full"
      @click.stop="toggle()"
    >
      <TamanButtonIcon
        icon="lucide:bell"
        class="bell-button text-foreground relative"
      >
        <span
          v-if="dot"
          class="rounded-sm bg-primary size-2 right-0.5 top-0.5 absolute"
        />
      </TamanButtonIcon>
    </div>

    <div class="relative">
      <div class="p-4 py-3 flex items-center justify-between">
        <div class="text-foreground">
          {{ $t('ui.widgets.notifications') }}
        </div>

        <TamanButtonIcon
          icon="lucide:mail-check"
          :disabled="notifications.length <= 0"
          :tooltip="$t('ui.widgets.markAllAsRead')"
          @click="handleMakeAll"
        />
      </div>

      <TamanScrollbar v-if="notifications.length > 0">
        <ul class="flex-col max-h-90 w-full flex!">
          <template
            v-for="item in notifications"
            :key="item.id ?? item.title"
          >
            <li
              class="hover:bg-accent p-3 border-t border-border flex gap-5 w-full cursor-pointer items-start relative"
              @click="emits('onClick', item)"
            >
              <slot
                name="content"
                :item="item"
              >
                <span
                  v-if="!item.isRead"
                  class="rounded-sm bg-primary size-2 right-2 top-2 absolute"
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
                  <p class="font-600">
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
                    <TamanButtonIcon
                      v-if="!item.isRead"
                      icon="lucide:circle-check-big"
                      size="xs"
                      variant="ghost"
                      class="px-2 h-6"
                      :tooltip="$t('common.confirm')"
                      @click.stop="emits('read', item)"
                    />

                    <TamanButtonIcon
                      v-if="item.isRead"
                      icon="lucide:circle-x"
                      size="xs"
                      variant="ghost"
                      class="text-destructive px-2 h-6"
                      :tooltip="$t('common.delete')"
                      @click.stop="emits('remove', item)"
                    />
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
      </TamanScrollbar>

      <template v-else>
        <div class="text-muted-foreground flex-center min-h-37.5 w-full">
          {{ $t('common.noData') }}
        </div>
      </template>

      <div
        class="px-4 py-3 border-t border-border flex items-center justify-between"
      >
        <PButton
          :disabled="notifications.length <= 0"
          size="sm"
          variant="ghost"
          @click="handleClear"
        >
          {{ $t('ui.widgets.clearNotifications') }}
        </PButton>
        <PButton
          size="sm"
          @click="handleViewAll"
        >
          {{ $t('ui.widgets.viewAll') }}
        </PButton>
      </div>
    </div>
  </PPopover>
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
