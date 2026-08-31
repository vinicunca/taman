<script lang="ts" setup>
import { AppCard, AppCardAction, AppPage } from '@taman/app-ui';
import { useTamanForm, z } from '#/adapter/form';
import { getAllMenusApi } from '#/api';
import { $t } from '#/locales';

const toast = useToast();
const [FormAllFields] = useTamanForm({
  // 3 columns on large screens, 2 on medium, 1 on small
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  // Shared by all form items; can be overridden per form
  commonConfig: {
    // Show a colon after the label
    colon: true,
    // All form items
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',

  schema: [
    {
      component: 'Input',
      fieldName: 'username',
      label: 'String',
      componentProps: {
        placeholder: 'Please enter your username',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'desc',
      // Description shown in the UI
      label: 'String with description',
      description: 'This is a description of the form field',
    },
    {
      // Component must be registered in #/adapter.ts with proper types
      component: 'SelectFetch',
      // Props passed to the component
      componentProps: {
        // Transform menu API response to options format
        afterFetch: (data: Array<{ name: string; path: string }>) => {
          return data.map((item) => ({
            label: item.name,
            value: item.path,
          }));
        },
        api: getAllMenusApi,
        autoSelect: 'first',
      },
      // Field name
      fieldName: 'api',
      // Label shown in the UI
      label: 'SelectFetch',
    },
  ],

  handleSubmit: onSubmit,
});

function onSubmit(values: Record<string, any>) {

}

function handleSetFormValue() {
  toast.add({
    color: 'neutral',
    title: 'Changed',
    duration: 2_000,
  });
}
</script>

<template>
  <AppPage
    content-class="flex flex-col gap-4"
    :description="$t('examples.form.allFields.description')"
    :title="$t('examples.form.allFields.title')"
  >
    <template #trailingHeader>
      <PButton
        color="neutral"
        size="sm"
        variant="outline"
      >
        {{ $t('page.viewDocs') }}
      </PButton>
    </template>

    <AppCard :title="$t('examples.form.allFields.title')">
      <template #trailingHeader>
        <AppCardAction>
          <PButton
            @click="handleSetFormValue"
          >
            {{ $t('examples.form.setFormValues') }}
          </PButton>
        </AppCardAction>
      </template>

      <FormAllFields />
    </AppCard>
  </AppPage>
</template>
