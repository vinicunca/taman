<script setup lang="ts">
import type { FileUploadProps } from 'pohon-ui';
import { useForwardProps } from '@taman/composables';
import { reactiveOmit } from '@vueuse/core';
import { $t } from '#/locales';

const props = defineProps<FileUploadProps<true>>();

const buttonProps = useForwardProps(
  reactiveOmit(props, 'icon', 'accept', 'label'),
);

const modelValue = defineModel<Array<File> | null>();
</script>

<template>
  <PFileUpload
    v-model="modelValue"
    :label="props.label ?? $t('form.uploadImages.label')"
    icon="lucide:image"
    multiple
    :interactive="false"
    accept="image/*"
    v-bind="{ ...buttonProps, ...$attrs }"
  >
    <template #actions="{ open }">
      <PButton
        :label="$t('form.uploadImages.buttonUpload')"
        icon="lucide:upload"
        color="neutral"
        variant="outline"
        @click="open()"
      />
    </template>

    <template #files-top="{ open, files }">
      <div
        v-if="files?.length"
        class="mb-2 flex items-center justify-between"
      >
        <p class="font-bold">
          {{ $t('form.uploadImages.files') }} ({{ files?.length }})
        </p>

        <PButton
          icon="lucide-plus"
          :label="$t('form.uploadImages.addMore')"
          class="-my-2"
          color="neutral"
          variant="outline"
          @click="open()"
        />
      </div>
    </template>
  </PFileUpload>
</template>
