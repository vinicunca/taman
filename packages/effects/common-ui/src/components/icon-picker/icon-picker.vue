<script setup lang="ts">
import type { IconPickerProps } from './types';

import { isFunction } from '@taman-core/shared/utils';
import { $t } from '@taman/locales';
import {
  Button,
  Input,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
  VbenPopover,
} from '@vben-core/shadcn-ui';
import { objectOmit, refDebounced, watchDebounced } from '@vueuse/core';
import { computed, ref, useAttrs, watch, watchEffect } from 'vue';

import { usePagination } from '../../../../composables/src';
import { fetchIconsData } from './icons';

const props = withDefaults(defineProps<IconPickerProps>(), {
  prefix: 'ant-design',
  pageSize: 36,
  icons: () => [],
  iconSlot: 'default',
  iconClass: 'size-4',
  autoFetchApi: true,
  modelValueProp: 'modelValue',
  inputComponent: undefined,
  type: 'input',
});

const emit = defineEmits<{
  change: [string];
}>();

const attrs = useAttrs();

const modelValue = defineModel({ default: '', type: String });

const visible = ref(false);
const currentSelect = ref('');
const keyword = ref('');
const keywordDebounce = refDebounced(keyword, 300);
const innerIcons = ref<Array<string>>([]);

watchDebounced(
  () => props.prefix,
  async (prefix) => {
    if (prefix && prefix !== 'svg' && props.autoFetchApi) {
      innerIcons.value = await fetchIconsData(prefix);
    }
  },
  { immediate: true, debounce: 500, maxWait: 1000 },
);

const currentList = computed(() => {
  try {
    if (props.prefix) {
      if (
        props.prefix !== 'svg'
        && props.autoFetchApi
        && props.icons.length === 0
      ) {
        return innerIcons.value;
      }
      const icons = listIcons('', props.prefix);
      if (icons.length === 0) {
        console.warn(`No icons found for prefix: ${props.prefix}`);
      }
      return icons;
    } else {
      return props.icons;
    }
  } catch (error) {
    console.error('Failed to load icons:', error);
    return [];
  }
});

const showList = computed(() => {
  return currentList.value.filter((item) =>
    item.includes(keywordDebounce.value),
  );
});

const { paginationList, total, setCurrentPage, currentPage } = usePagination(
  showList,
  props.pageSize,
);

watchEffect(() => {
  currentSelect.value = modelValue.value;
});

watch(
  () => currentSelect.value,
  (v) => {
    emit('change', v);
  },
);

function handleClick(icon: string) {
  currentSelect.value = icon;
  modelValue.value = icon;
  close();
}

function handlePageChange(page: number) {
  setCurrentPage(page);
}

function toggleOpenState() {
  visible.value = !visible.value;
}

function open() {
  visible.value = true;
}

function close() {
  visible.value = false;
}

function onKeywordChange(v: string) {
  keyword.value = v;
}

const searchInputProps = computed(() => {
  return {
    placeholder: $t('ui.iconPicker.search'),
    [props.modelValueProp]: keyword.value,
    [`onUpdate:${props.modelValueProp}`]: onKeywordChange,
    class: 'mx-2',
  };
});

function updateCurrentSelect(v: string) {
  currentSelect.value = v;
  if (props.modelValueProp === 'modelValue') {
    modelValue.value = v;
  }
  const eventKey = `onUpdate:${props.modelValueProp}`;
  if (attrs[eventKey] && isFunction(attrs[eventKey])) {
    attrs[eventKey](v);
  }
}
const getBindAttrs = computed(() => {
  return objectOmit(attrs, [`onUpdate:${props.modelValueProp}`]);
});

defineExpose({ toggleOpenState, open, close });
</script>

<template>
  <VbenPopover
    v-model:open="visible"
    :content-props="{ align: 'end', alignOffset: -11, sideOffset: 8 }"
    content-class="p-0 pt-3 w-full"
    trigger-class="w-full"
  >
    <template #trigger>
      <template v-if="props.type === 'input'">
        <component
          :is="inputComponent"
          v-if="props.inputComponent"
          :[modelValueProp]="currentSelect"
          :placeholder="$t('ui.iconPicker.placeholder')"
          role="combobox"
          :aria-label="$t('ui.iconPicker.placeholder')"
          aria-expanded="visible"
          :[`onUpdate:${modelValueProp}`]="updateCurrentSelect"
          v-bind="getBindAttrs"
        >
          <template #[iconSlot]>
            <VbenIcon
              :icon="currentSelect || Grip"
              class="size-4"
              aria-hidden="true"
            />
          </template>
        </component>
        <div
          v-else
          class="w-full relative"
        >
          <Input
            v-bind="$attrs"
            v-model="currentSelect"
            :placeholder="$t('ui.iconPicker.placeholder')"
            class="pr-8 h-8 w-full"
            role="combobox"
            :aria-label="$t('ui.iconPicker.placeholder')"
            aria-expanded="visible"
          />
          <VbenIcon
            :icon="currentSelect || Grip"
            class="size-6 right-1 top-1 absolute"
            aria-hidden="true"
          />
        </div>
      </template>
      <VbenIcon
        v-else
        :icon="currentSelect || Grip"
        class="size-4"
        v-bind="$attrs"
      />
    </template>
    <div class="mb-2 flex w-full">
      <component
        :is="inputComponent"
        v-if="inputComponent"
        v-bind="searchInputProps"
      />
      <Input
        v-else
        v-model="keyword"
        class="mx-2 h-8 w-full"
        :placeholder="$t('ui.iconPicker.search')"
      />
    </div>

    <template v-if="paginationList.length > 0">
      <div class="grid grid-cols-6 max-h-90 w-full justify-items-center">
        <VbenIconButton
          v-for="(item, index) in paginationList"
          :key="index"
          :tooltip="item"
          tooltip-side="top"
          @click="handleClick(item)"
        >
          <VbenIcon
            :class="{
              'text-primary transition-all': currentSelect === item,
            }"
            :icon="item"
          />
        </VbenIconButton>
      </div>
      <div
        v-if="total >= pageSize"
        class="py-2 pr-3 border-t flex flex-center justify-end overflow-hidden"
      >
        <Pagination
          :items-per-page="36"
          :sibling-count="1"
          :total="total"
          show-edges
          size="small"
          @update:page="handlePageChange"
        >
          <PaginationContent
            v-slot="{ items }"
            class="flex gap-1 w-full items-center"
          >
            <PaginationFirst class="size-5" />
            <PaginationPrevious class="size-5" />
            <template v-for="(item, index) in items">
              <PaginationItem
                v-if="item.type === 'page'"
                :key="index"
                :value="item.value"
                as-child
              >
                <Button
                  :variant="item.value === currentPage ? 'default' : 'outline'"
                  class="text-sm p-0 size-5"
                >
                  {{ item.value }}
                </Button>
              </PaginationItem>
              <PaginationEllipsis
                v-else
                :key="item.type"
                :index="index"
                class="size-5"
              />
            </template>
            <PaginationNext class="size-5" />
            <PaginationLast class="size-5" />
          </PaginationContent>
        </Pagination>
      </div>
    </template>

    <template v-else>
      <div class="text-muted-foreground flex-col-center min-h-37.5 w-full">
        <EmptyIcon class="size-10" />
        <div class="text-sm mt-1">
          {{ $t('common.noData') }}
        </div>
      </div>
    </template>
  </VbenPopover>
</template>
