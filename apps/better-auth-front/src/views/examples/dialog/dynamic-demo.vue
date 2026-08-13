<script lang="ts" setup>
import { useTamanDialog, useTamanToast } from '@taman/common-ui';

const { toaster } = useTamanToast();

const [DialogDynamic, dialogDynamicApi] = useTamanDialog({
  draggable: true,
  onCancel() {
    dialogDynamicApi.close();
  },
  onConfirm() {
    toaster.info('onConfirm');
  },
  title: 'Dynamic configuration example',
});

const state = dialogDynamicApi.useStore();

function handleUpdateTitle() {
  dialogDynamicApi.setState({ title: 'Internal dynamic title' });
}

function handleToggleFullscreen() {
  dialogDynamicApi.setState((prev) => {
    return { ...prev, fullscreen: !prev.fullscreen };
  });
}
</script>

<template>
  <DialogDynamic>
    <div class="flex-col-center">
      <PButton
        class="mb-3"
        @click="handleUpdateTitle()"
      >
        Internal dynamic modify title
      </PButton>
      <PButton
        class="mb-3"
        type="primary"
        @click="handleToggleFullscreen()"
      >
        {{ state.fullscreen ? 'Exit fullscreen' : 'Open fullscreen' }}
      </PButton>
    </div>
  </DialogDynamic>
</template>
