<script setup lang="ts">
import type { DropdownMenuItem } from '@taman-core/taman-ui';
import type { SupportedLanguagesType } from '@taman/locales';
import { SUPPORTED_LANGUAGES } from '@taman/constants';
import { loadLocaleMessages } from '@taman/locales';
import { preferences, updatePreferences } from '@taman/preferences';
import { computed } from 'vue';

defineOptions({
  name: 'LanguageToggle',
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
    <PButton
      class="pohon:rounded-full"
      size="sm"
      variant="ghost"
      color="neutral"
      icon="lucide:languages"
    />
  </PDropdownMenu>
</template>
