<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useTamanDialog } from '@taman/app-ui';

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
