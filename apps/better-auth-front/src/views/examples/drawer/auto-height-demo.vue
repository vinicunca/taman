<script lang="ts" setup>
import { useTamanDrawer, useTamanToast } from '@taman/app-ui';
import { ref } from 'vue';

const list = ref<Array<number>>([]);
const { toaster } = useTamanToast();

const [Drawer, drawerApi] = useTamanDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm() {
    toaster.info('onConfirm');
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      handleUpdate(10);
    }
  },
});

function handleUpdate(len: number) {
  drawerApi.setState({ loading: true });
  setTimeout(() => {
    list.value = Array.from({ length: len }, (_v, k) => k + 1);
    drawerApi.setState({ loading: false });
  }, 2000);
}
</script>

<template>
  <Drawer title="Automatically calculate height">
    <div
      v-for="item in list"
      :key="item"
      class="bg-background-muted flex-center h-55 w-full even:bg-background-accented"
    >
      {{ item }}
    </div>

    <template #prepend-footer>
      <PButton
        variant="link"
        @click="handleUpdate(6)"
      >
        Update data
      </PButton>
    </template>
  </Drawer>
</template>
