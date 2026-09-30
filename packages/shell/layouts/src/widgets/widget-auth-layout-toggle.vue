<script setup lang="ts">
import type { DropdownMenuItem } from '@vinicunca/taman-ui';
import type { TamanAuthPageLayoutType } from '@taman/types';
import {
  preferences,
  updatePreferences,
  usePreferences,
} from '@vinicunca/taman-core/preferences';
import { TamanButtonIcon } from '@vinicunca/taman-ui';
import { computed } from 'vue';
import { $t } from '@taman/locales';

defineOptions({
  name: 'WidgetAuthLayoutToggle',
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
    <TamanButtonIcon
      :icon="{
        'panel-left': 'lucide:panel-left',
        'panel-center': 'lucide:inspection-panel',
        'panel-right': 'lucide:panel-right',
      }[preferences.app.authPageLayout]"
    />
  </PDropdownMenu>
</template>
