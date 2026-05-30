import {
  defineOverridesPreferences,
  definePreferencesExtension,
} from '@taman/preferences';

interface PlaygroundPreferencesExtension {
  defaultVisibleRows: number;
  enableQuickActions: boolean;
  highlightTone: 'default' | 'success' | 'warning';
  reportTitle: string;
}

/**
 * @description Project configuration file
 * Only cover part of the configuration in the project, do not cover the configuration that is not needed, and the default configuration will be automatically used
 * !!! After changing the configuration, please clear the cache, otherwise it may not take effect
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
  },
});

export type { PlaygroundPreferencesExtension };

export const preferencesExtension
  = definePreferencesExtension<PlaygroundPreferencesExtension>({
    tabLabel: 'demos.preferencesExtensionConfig.tabLabel',
    title: 'demos.preferencesExtensionConfig.title',
    fields: [
      {
        component: 'input',
        defaultValue: '',
        key: 'reportTitle',
        label: 'demos.preferencesExtensionConfig.fields.reportTitle.label',
        placeholder:
          'demos.preferencesExtensionConfig.fields.reportTitle.placeholder',
      },
      {
        component: 'number',
        componentProps: {
          max: 8,
          min: 1,
          step: 1,
        },
        defaultValue: 4,
        key: 'defaultVisibleRows',
        label:
          'demos.preferencesExtensionConfig.fields.defaultVisibleRows.label',
        tip: 'demos.preferencesExtensionConfig.fields.defaultVisibleRows.tip',
      },
      {
        component: 'switch',
        defaultValue: true,
        key: 'enableQuickActions',
        label:
          'demos.preferencesExtensionConfig.fields.enableQuickActions.label',
      },
      {
        component: 'select',
        defaultValue: 'default',
        key: 'highlightTone',
        label: 'demos.preferencesExtensionConfig.fields.highlightTone.label',
        options: [
          {
            label:
              'demos.preferencesExtensionConfig.fields.highlightTone.options.default',
            value: 'default',
          },
          {
            label:
              'demos.preferencesExtensionConfig.fields.highlightTone.options.success',
            value: 'success',
          },
          {
            label:
              'demos.preferencesExtensionConfig.fields.highlightTone.options.warning',
            value: 'warning',
          },
        ],
      },
    ],
  });
