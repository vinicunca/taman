import type { SetupVxeTable } from './types';

import { defineComponent, watch } from 'vue';

import { usePreferences } from '@taman/preferences';

import {
  VxeButton,
  VxeCheckbox,
  VxeIcon,
  VxeInput,
  VxeLoading,
  VxeModal,
  VxeNumberInput,
  VxePager,
  VxeRadioGroup,
  VxeSelect,
  VxeTooltip,
  VxeUI,
  VxeUpload,
} from 'vxe-pc-ui';
import enUS from 'vxe-pc-ui/lib/language/en-US'; // Default locale
import {
  VxeColgroup,
  VxeColumn,
  VxeGrid,
  VxeTable,
  VxeToolbar,
} from 'vxe-table';

import { injectPluginsOptions } from '../plugins-context';
import { extendsDefaultFormatter } from './extends';

// Whether vxe-table has been initialized
let isInit = false;

let tableFormFactory: ((...args: any[]) => any) | undefined;

function normalizeVxeLocale<T extends Record<string, any>>(localeModule: T) {
  return (
    localeModule &&
    typeof localeModule === 'object' &&
    'default' in localeModule
      ? localeModule.default
      : localeModule
  ) as T;
}

export function useTableForm(...args: any[]) {
  const pluginsOptions = injectPluginsOptions();
  const contextFormFactory = pluginsOptions?.form?.useVbenForm;

  const factory = tableFormFactory || contextFormFactory;
  if (!factory) {
    throw new Error(
      'useTableForm is not initialized. Please provide useVbenForm via setupVbenVxeTable() or providePluginsOptions()',
    );
  }

  return factory(...args);
}

// Some components must be registered or vxe-table throws; these are no-op stubs to avoid errors and reduce bundle size
const createVirtualComponent = (name = '') => {
  return defineComponent({
    name,
  });
};

export function initVxeTable() {
  if (isInit) {
    return;
  }

  VxeUI.component(VxeTable);
  VxeUI.component(VxeColumn);
  VxeUI.component(VxeColgroup);
  VxeUI.component(VxeGrid);
  VxeUI.component(VxeToolbar);

  VxeUI.component(VxeButton);
  // VxeUI.component(VxeButtonGroup);
  VxeUI.component(VxeCheckbox);
  // VxeUI.component(VxeCheckboxGroup);
  VxeUI.component(createVirtualComponent('VxeForm'));
  // VxeUI.component(VxeFormGather);
  // VxeUI.component(VxeFormItem);
  VxeUI.component(VxeIcon);
  VxeUI.component(VxeInput);
  // VxeUI.component(VxeList);
  VxeUI.component(VxeLoading);
  VxeUI.component(VxeModal);
  VxeUI.component(VxeNumberInput);
  // VxeUI.component(VxeOptgroup);
  // VxeUI.component(VxeOption);
  VxeUI.component(VxePager);
  // VxeUI.component(VxePulldown);
  // VxeUI.component(VxeRadio);
  // VxeUI.component(VxeRadioButton);
  VxeUI.component(VxeRadioGroup);
  VxeUI.component(VxeSelect);
  // VxeUI.component(VxeSwitch);
  // VxeUI.component(VxeTextarea);
  VxeUI.component(VxeTooltip);
  VxeUI.component(VxeUpload);

  isInit = true;
}

export function setupVbenVxeTable(setupOptions: SetupVxeTable) {
  const { configVxeTable, useVbenForm: useVbenFormFromParam } = setupOptions;

  initVxeTable();

  // Prefer useVbenForm from params; otherwise clear so context injection applies
  if (useVbenFormFromParam) {
    tableFormFactory = useVbenFormFromParam;
  }
  const { isDark, locale } = usePreferences();

  const localMap = {
    'en-US': normalizeVxeLocale(enUS),
    'id-ID': normalizeVxeLocale(enUS),
  };

  watch(
    [() => isDark.value, () => locale.value],
    ([isDarkValue, localeValue]) => {
      VxeUI.setTheme(isDarkValue ? 'dark' : 'light');
      VxeUI.setI18n(localeValue, localMap[localeValue]);
      VxeUI.setLanguage(localeValue);
    },
    {
      immediate: true,
    },
  );

  extendsDefaultFormatter(VxeUI);

  configVxeTable(VxeUI);
}
