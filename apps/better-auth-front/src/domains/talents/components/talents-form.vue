<script lang="ts" setup>
import type { TalentFormValues } from '../talents.query';
import { useTamanDrawer } from '@taman/common-ui';
import { useAppForm } from '#/adapter/form';
import { useCreateTalentMutation } from '../talents.query';
import { getTalentsFormSchema } from './talents-data';

const formSchema = getTalentsFormSchema();

const [TalentForm, talentFormApi] = useAppForm<TalentFormValues>({
  fields: formSchema,
  showDefaultActions: false,
});

const { mutateAsync: createTalent } = useCreateTalentMutation();

const [TalentFormDrawer, talentFormDrawerApi] = useTamanDrawer({
  async onConfirm() {
    const { valid } = await talentFormApi.validate();
    if (!valid) {
      return;
    }

    talentFormDrawerApi.lock();

    try {
      // Picked files ride along in `headshotUrls`; the mutation splits them
      // into multipart parts and director stores them before writing the row.
      await createTalent(talentFormApi.getValues());
      // await talentFormDrawerApi.close();
    } catch (error) {
      // ApiError carries director's own `message` (e.g. a 400's "Validation
      // failed", or 403 "Forbidden"), so surface that rather than a generic
      // string. The drawer stays open with the user's input intact.
      console.error('[talent-form] create failed', error);
      await talentFormApi.setErrors([
        {
          message: error instanceof Error ? error.message : 'Failed to save talent',
          path: 'legalName',
        },
      ]);
    } finally {
      talentFormDrawerApi.unlock();
    }
  },
});
</script>

<template>
  <TalentFormDrawer title="Talent Form">
    <TalentForm />
  </TalentFormDrawer>
</template>
