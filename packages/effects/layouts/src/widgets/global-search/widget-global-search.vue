<script lang="ts" setup>
import type { TamanMenuRecordRaw } from '@taman/types';
import { $t } from '@taman/locales';

const props = defineProps<{
  menus: Array<TamanMenuRecordRaw>;
}>();
</script>

<template>
  <PModal>
    <PButton
      :label="$t('ui.widgets.search.title')"
      color="neutral"
      variant="subtle"
      icon="lucide-search"
      size="sm"
      class="pohon:rounded-full"
    >
      <template #trailing>
        <span class="ms-auto gap-0.5 hidden items-center lg:flex">
          <PKbd
            variant="subtle"
            value="meta"
          />
          <PKbd
            variant="subtle"
            value="k"
          />
        </span>
      </template>
    </PButton>

    <template #content>
      <!-- <PCommandPalette
        :groups="groups"
        placeholder="Search users..."
        class="h-80"
      /> -->

      hhrr
    </template>
  </PModal>
</template>
