<script lang="ts" setup>
import { AppCard, AppCardAction, AppPage } from '@taman/app-ui';
import { h } from 'vue';

import { useTamanForm } from '#/adapter/form';

const [GroupForm, groupFormApi] = useTamanForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: onSubmit,
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: 'Task Name',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        items: [
          { label: 'SFT', value: 'sft' },
          { label: 'DPO', value: 'dpo' },
        ],
      },
      defaultValue: 'sft',
      fieldName: 'method',
      label: 'Training Method',
    },
    {
      type: 'group',
      name: 'training',
      title: 'Training Parameters',
      children: [
        {
          component: 'InputNumber',
          defaultValue: 32,
          fieldName: 'batchSize',
          label: 'Batch Size',
        },
        {
          component: 'InputNumber',
          defaultValue: 1e-5,
          fieldName: 'learningRate',
          label: 'Learning Rate',
        },
        {
          component: 'InputNumber',
          defaultValue: 3,
          fieldName: 'epochs',
          label: 'Epochs',
        },
        {
          component: 'InputNumber',
          defaultValue: 32_768,
          fieldName: 'maxLength',
          label: 'Sequence Length',
        },
      ],
    },
    {
      type: 'group',
      name: 'advanced',
      title: 'Advanced Options',
      extra: () =>
        h(
          'span',
          { class: 'text-muted-foreground text-xs' },
          'Default collapsed, will expand automatically when validation fails',
        ),
      defaultCollapsed: true,
      children: [
        {
          component: 'Input',
          fieldName: 'checkpoint',
          label: 'Checkpoint',
          rules: 'required',
        },
        {
          component: 'Switch',
          componentProps: {
            class: 'w-auto',
          },
          defaultValue: false,
          fieldName: 'enableEval',
          label: 'Periodic Evaluation',
        },
        {
          component: 'Textarea',
          fieldName: 'remark',
          formItemClass: 'col-span-2',
          label: 'Remark',
        },
      ],
    },
  ],
  wrapperClass: 'grid-cols-2',
});

const toast = useToast();
function onSubmit(values: Record<string, any>) {
  toast.add({
    color: 'success',
    title: `form values: ${JSON.stringify(values)}`,
    duration: 2_000,
  });
}

async function handleSubmitGroupForm() {
  const { valid } = await groupFormApi.validate();

  if (valid) {
    groupFormApi.submit();
  }
}

function handleResetGroupForm() {
  groupFormApi.reset(undefined, { force: true });
}
</script>

<template>
  <AppPage
    auto-content-height
    content-class="flex flex-col gap-4"
    title="Collapsible Form Items"
    description="Collapsible form items, collapsible parameter configuration components, and schema group folding examples<"
  >
    <AppCard title="Group Collapsible">
      <template #trailingHeader>
        <AppCardAction class="flex gap-4 items-center">
          <PButton
            @click="handleSubmitGroupForm"
          >
            Submit Form
          </PButton>
          <PButton
            @click="handleResetGroupForm"
          >
            Reset Form
          </PButton>
        </AppCardAction>
      </template>
      <p class="text-muted-foreground text-sm mb-4">
        In the schema, use <code>type: 'group'</code> to organize fields into collapsible blocks. The group itself is not a field, and the fields within the group are completely equivalent to the top-level fields;
        "Advanced Options" is default collapsed, will expand automatically when validation fails.
      </p>
      <div class="w-full overflow-hidden">
        <GroupForm />
      </div>
    </AppCard>
  </AppPage>
</template>
