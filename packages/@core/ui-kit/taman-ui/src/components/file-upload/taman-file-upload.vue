<script setup lang="ts" generic="Multiple extends boolean = false">
import type { TamanFileUploadProps } from './taman-file-upload.types';
import { useForwardProps } from '@taman-core/composables';
import { reactiveOmit } from '@vueuse/core';
import PButton from 'pohon-ui/components/Button.vue';
import PFileUpload from 'pohon-ui/components/FileUpload.vue';
import { toFileList } from './taman-file-upload.utils';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<TamanFileUploadProps<Multiple>>(),
  {
    icon: 'lucide:image',
  },
);

const modelValue = defineModel<
  (Multiple extends true ? Array<File> : File) | null
>();

const rootProps = useForwardProps(
  reactiveOmit(props, 'labelActions', 'labelPreview', 'labelAddMore'),
);
</script>

<template>
  <PFileUpload
    v-model="(modelValue as any)"
    v-bind="rootProps"
  >
    <template #actions="{ open }">
      <PButton
        :label="props.labelActions"
        icon="lucide:upload"
        color="neutral"
        variant="outline"
        @click="open()"
      />
    </template>

    <template #files-top="{ open, files }">
      <div
        v-if="toFileList(files).length"
        class="mb-2 flex items-center justify-between"
      >
        <p class="font-bold">
          {{ props.labelPreview }} ({{ toFileList(files).length }})
        </p>

        <PButton
          v-if="props.multiple"
          icon="lucide-plus"
          :label="props.labelAddMore"
          class="-my-2"
          color="neutral"
          variant="outline"
          @click="open()"
        />
      </div>
    </template>
  </PFileUpload>
</template>
