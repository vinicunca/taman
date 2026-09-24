<script setup lang="ts">
import type { WorkbenchTrendItem } from '../typing';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@vben-core/shadcn-ui';

interface Props {
  items?: Array<WorkbenchTrendItem>;
  title: string;
}

defineOptions({
  name: 'WorkbenchTrends',
});

withDefaults(defineProps<Props>(), {
  items: () => [],
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg">
        {{ title }}
      </CardTitle>
    </CardHeader>
    <CardContent class="p-5 pt-0 flex flex-wrap">
      <ul
        class="w-full divide-border divide-y"
        role="list"
      >
        <li
          v-for="item in items"
          :key="item.title"
          class="py-5 flex gap-x-6 justify-between"
        >
          <div class="flex gap-x-4 min-w-0 items-center">
            <VbenIcon
              :icon="item.avatar"
              alt=""
              class="rounded-full flex-none size-10"
            />
            <div class="flex-auto min-w-0">
              <p class="text-sm/6 color-text font-600">
                {{ item.title }}
              </p>
              <!-- eslint-disable vue/no-v-html -->
              <p
                class="text-xs/5 color-text/80 mt-1 truncate *:text-primary"
                v-html="item.content"
              />
            </div>
          </div>
          <div class="shrink-0 h-full hidden sm:flex sm:flex-col sm:items-end">
            <span class="text-xs/6 color-text/80 mt-6">
              {{ item.date }}
            </span>
          </div>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
