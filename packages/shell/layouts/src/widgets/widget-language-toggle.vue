<script setup lang="ts">
import type { DropdownMenuItem } from '@taman-core/taman-ui';
import type { SupportedLanguagesType } from '@taman/locales';
import { TamanButtonIcon } from '@taman-core/taman-ui';
import { SUPPORTED_LANGUAGES } from '@taman/constants';
import { loadLocaleMessages } from '@taman/locales';
import { preferences, updatePreferences } from '@taman/preferences';
import { computed } from 'vue';

defineOptions({
  name: 'WidgetLanguageToggle',
});

const items = computed<Array<DropdownMenuItem>>(() => {
  return SUPPORTED_LANGUAGES.map((lang) => (
    {
      ...lang,
      type: 'checkbox',
      checked: lang.value === preferences.app.locale,
      onUpdateChecked: () => handleUpdate(lang.value),
    }),
  );
});

async function handleUpdate(value: string | undefined) {
  if (!value) {
    return;
  }

  const locale = value as SupportedLanguagesType;

  updatePreferences({
    app: {
      locale,
    },
  });

  await loadLocaleMessages(locale);
}
</script>

<template>
  <PDropdownMenu
    :items="items"
  >
    <TamanButtonIcon
      :tooltip-text="$t('preferences.widget.languageToggle')"
      icon="lucide:languages"
    />
  </PDropdownMenu>
</template>
