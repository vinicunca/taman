<script lang="ts" setup>
interface Props {
  companyName?: string;
  companySiteLink?: string;
  date?: string;
  icp?: string;
  icpLink?: string;
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
    icp: '',
    icpLink: '',
  },
);
</script>

<template>
  <div class="text-base flex-center">
    <!-- ICP Link -->
    <a
      v-if="icp"
      :href="icpLink || 'javascript:void(0)'"
      class="mx-1 hover:color-primary"
      target="_blank"
    >
      {{ icp }}
    </a>

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
