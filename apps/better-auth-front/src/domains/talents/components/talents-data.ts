import type { FormFieldComponents } from '#/adapter/form';

import { talentInsertSchema } from '@ngibur/db/validation';
import { defineFields } from '@taman/common-ui';

import { $t } from '#/locales';

/**
 * Pure field definitions — no side effects. Picked images stay as `File`
 * objects in the form value and are only uploaded when the user confirms
 * the drawer (see talents-form.vue), so anything they remove beforehand
 * never reaches storage.
 */
export function getTalentsFormSchema() {
  return defineFields<FormFieldComponents>([
    // {
    //   label: $t('talent.fields.legalName'),
    //   name: 'legalName',
    //   rules: talentInsertSchema.shape.legalName,
    //   component: 'Input',
    // },

    // {
    //   label: $t('talent.fields.stageName'),
    //   name: 'stageName',
    //   rules: talentInsertSchema.shape.stageName,
    //   component: 'Input',
    // },

    // {
    //   label: $t('talent.fields.bio'),
    //   name: 'bio',
    //   component: 'Textarea',
    // },

    // {
    //   label: $t('talent.fields.stageIntro'),
    //   name: 'stageIntro',
    //   component: 'Textarea',
    // },

    {
      label: $t('talent.fields.headshotUrls'),
      name: 'headshotUrls',
      component: 'UploadImages',
    },

  ]);
}
