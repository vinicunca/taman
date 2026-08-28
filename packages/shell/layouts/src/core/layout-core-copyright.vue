<script lang="ts" setup>
interface Props {
  companyName?: string;
  companySiteLink?: string;
  date?: string;
}

defineOptions({
  name: 'LayoutCoreCopyright',
});

withDefaults(
  defineProps<Props>(),
  {
    companyName: 'Taman Admin',
    companySiteLink: '',
    date: '2026',
  },
);
</script>

<template>
  <div class="text-base flex-center">
    <!-- Copyright Text -->
    Copyright © {{ date }}

    <!-- Company Link -->
    <a
      v-if="companyName"
      :href="companySiteLink || 'javascript:void(0)'"
      class="color-primary mx-1 transition-colors hover:color-primary-400"
      target="_blank"
    >
      {{ companyName }}
    </a>
  </div>
</template>
