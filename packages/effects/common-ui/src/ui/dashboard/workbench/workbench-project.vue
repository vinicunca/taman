<script setup lang="ts">
import type { WorkbenchProjectItem } from '../typing';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@vben-core/shadcn-ui';

interface Props {
  items?: Array<WorkbenchProjectItem>;
  title: string;
}

defineOptions({
  name: 'WorkbenchProject',
});

withDefaults(defineProps<Props>(), {
  items: () => [],
});

defineEmits(['click']);
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg">
        {{ title }}
      </CardTitle>
    </CardHeader>
    <CardContent class="p-0 flex flex-wrap">
      <template
        v-for="(item, index) in items"
        :key="item.title"
      >
        <div
          :class="{
            'border-r-0': index % 3 === 2,
            'border-b-0': index < 3,
            'pb-4': index > 2,
            'rounded-bl-xl': index === items.length - 3,
            'rounded-br-xl': index === items.length - 1,
          }"
          class="group p-4 border-r border-t border-border w-full cursor-pointer transition-all lg:w-1/3 md:w-1/2 hover:shadow-xl"
        >
          <div class="flex items-center">
            <VbenIcon
              :color="item.color"
              :icon="item.icon"
              class="size-8 transition-all duration-300 group-hover:scale-110"
              @click="$emit('click', item)"
            />
            <span class="text-lg font-medium ml-4">{{ item.title }}</span>
          </div>
          <div class="color-text/80 mt-4 flex h-10">
            {{ item.content }}
          </div>
          <div class="color-text/80 flex justify-between">
            <span>{{ item.group }}</span>
            <span>{{ item.date }}</span>
          </div>
        </div>
      </template>
    </CardContent>
  </Card>
</template>
