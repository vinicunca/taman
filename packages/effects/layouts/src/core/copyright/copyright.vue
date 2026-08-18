<script lang="ts" setup>
interface Props {
  companyName?: string;
  companySiteLink?: string;
  date?: string;
}

defineOptions({
  name: 'Copyright',
});

withDefaults(
  defineProps<Props>(),
  {
    companyName: 'Ngibur Admin',
    companySiteLink: '',
    date: '2024',
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
