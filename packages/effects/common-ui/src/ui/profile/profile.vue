<script setup lang="ts">
import type { Props } from './types';

import { preferences } from '@taman-core/preferences';
import {
  Card,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  VbenAvatar,
} from '@vben-core/shadcn-ui';

import { Page } from '../../components';

defineOptions({
  name: 'ProfileUI',
});

withDefaults(defineProps<Props>(), {
  title: '关于项目',
  tabs: () => [],
});

const tabsValue = defineModel<string>('modelValue');
</script>

<template>
  <Page auto-content-height>
    <div class="flex size-full">
      <Card class="flex-none w-1/6">
        <div class="mt-4 flex-col-center gap-4 h-40">
          <VbenAvatar
            :src="userInfo?.avatar ?? preferences.app.defaultAvatar"
            class="size-20"
          />
          <span class="text-lg font-600">
            {{ userInfo?.realName ?? '' }}
          </span>
          <span class="text-sm color-text/80">
            {{ userInfo?.username ?? '' }}
          </span>
        </div>
        <Separator class="my-4" />
        <Tabs
          v-model="tabsValue"
          orientation="vertical"
          class="m-4"
        >
          <TabsList class="bg-card grid grid-cols-1 w-full">
            <TabsTrigger
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
              class="h-12 justify-start data-[state=active]:text-primary-foreground data-[state=active]:bg-primary"
            >
              {{ tab.label }}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>
      <Card class="ml-4 p-8 flex-auto w-5/6">
        <slot name="content" />
      </Card>
    </div>
  </Page>
</template>
