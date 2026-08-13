<script setup lang="ts">
import type { DropdownMenuItem } from '@taman-core/taman-ui';
import type { TamanAuthPageLayoutType } from '@taman/types';
import { $t } from '@taman/locales';
import {
  preferences,
  updatePreferences,
  usePreferences,
} from '@taman/preferences';
import { computed } from 'vue';

defineOptions({
  name: 'AuthenticationLayoutToggle',
});

const { authPanelCenter, authPanelLeft, authPanelRight } = usePreferences();

const items = computed<Array<DropdownMenuItem>>(() => {
  return [
    {
      icon: 'lucide:panel-left',
      label: $t('authentication.layout.alignLeft'),
      type: 'checkbox',
      checked: authPanelLeft.value,
      onUpdateChecked: () => handleUpdate('panel-left'),
    },
    {
      icon: 'lucide:inspection-panel',
      label: $t('authentication.layout.center'),
      type: 'checkbox',
      checked: authPanelCenter.value,
      onUpdateChecked: () => handleUpdate('panel-center'),
    },
    {
      icon: 'lucide:panel-right',
      label: $t('authentication.layout.alignRight'),
      type: 'checkbox',
      checked: authPanelRight.value,
      onUpdateChecked: () => handleUpdate('panel-right'),
    },
  ];
});

function handleUpdate(value: string | undefined) {
  if (!value) {
    return;
  }

  updatePreferences({
    app: {
      authPageLayout: value as TamanAuthPageLayoutType,
    },
  });
}
</script>

<template>
  <PDropdownMenu
    :items="items"
  >
    <PButton
      class="pohon:rounded-full"
      size="sm"
      variant="ghost"
      color="neutral"
      :icon="{
        'panel-left': 'lucide:panel-left',
        'panel-center': 'lucide:inspection-panel',
        'panel-right': 'lucide:panel-right',
      }[preferences.app.authPageLayout]"
    />
  </PDropdownMenu>
</template>
