<script lang="ts" setup>
import { useTamanDialog } from '@taman/common-ui';
import { ref, watch } from 'vue';

const blur = ref(5);
const [DialogBlur, dialogBlurApi] = useTamanDialog({
  overlayBlur: blur.value,
});
watch(blur, (val) => {
  dialogBlurApi.setState({
    overlayBlur: val,
  });
});
</script>

<template>
  <DialogBlur title="Blur demo">
    <p>Adjust the slider to change the blur level: {{ blur }}</p>
    <PSlider
      v-model="blur"
      class="mt-4"
      :max="30"
      :min="0"
    />
  </DialogBlur>
</template>
