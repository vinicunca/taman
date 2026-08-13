<script lang="ts" setup>
import { useTamanDialog, useTamanToast } from '@taman/common-ui';
import { ref } from 'vue';

const { toaster } = useTamanToast();

const list = ref<Array<number>>([]);

const [DialogAutoHeight, dialogAutoHeightApi] = useTamanDialog({
  onCancel() {
    dialogAutoHeightApi.close();
  },
  onConfirm() {
    toaster.info('onConfirm');
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      handleUpdate();
    }
  },
});

function handleUpdate(len?: number) {
  dialogAutoHeightApi.setState({ confirmDisabled: true, loading: true });
  setTimeout(() => {
    list.value = Array.from(
      { length: len ?? Math.floor(Math.random() * 10) + 1 },
      (_v, k) => k + 1,
    );
    dialogAutoHeightApi.setState({ confirmDisabled: false, loading: false });
  }, 2000);
}
</script>

<template>
  <DialogAutoHeight title="Auto calculate height">
    <div
      v-for="item in list"
      :key="item"
      class="bg-background-muted flex-center h-55 w-full even:bg-orange"
    >
      {{ item }}
    </div>

    <template #leading-footer>
      <PButton
        @click="handleUpdate()"
      >
        Click to update data
      </PButton>
    </template>
  </DialogAutoHeight>
</template>
