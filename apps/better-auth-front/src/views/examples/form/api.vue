<script lang="ts" setup>
import type { TamanFormSchema } from '#/adapter/form';

import { AppCard, AppPage } from '@taman/app-ui';
import { ref } from 'vue';

import { useTamanForm } from '#/adapter/form';

const isReverseActionButtons = ref(false);

const [BaseForm, formApi] = useTamanForm({
  actionButtonsReverse: isReverseActionButtons.value,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: onSubmit,
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter your username.',
      },
      fieldName: 'field1',
      label: 'field1',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter your username.',
      },
      fieldName: 'field2',
      label: 'field2',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        items: [
          {
            label: 'Option 1',
            value: '1',
          },
          {
            label: 'Option 2',
            value: '2',
          },
        ],
        placeholder: 'Please select',
        showSearch: true,
      },
      fieldName: 'fieldOptions',
      label: 'Dropdown',
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

const toast = useToast();
function onSubmit(values: Record<string, any>) {
  toast.add({
    color: 'success',
    title: `form values: ${JSON.stringify(values)}`,
    duration: 2_000,
  });
}

function handleClick(
  action:
    | 'batchAddSchema'
    | 'batchDeleteSchema'
    | 'componentRef'
    | 'disabled'
    | 'hiddenAction'
    | 'hiddenResetButton'
    | 'hiddenSubmitButton'
    | 'labelWidth'
    | 'resetDisabled'
    | 'resetLabelWidth'
    | 'reverseActionButtons'
    | 'showAction'
    | 'showResetButton'
    | 'showSubmitButton'
    | 'updateResetButton'
    | 'updateSchema'
    | 'updateSubmitButton',
) {
  switch (action) {
    case 'batchAddSchema': {
      formApi.setState((prev) => {
        const currentSchema = prev?.schema ?? [];
        const newSchema: Array<TamanFormSchema> = [];
        for (let i = 0; i < 3; i++) {
          newSchema.push({
            component: 'Input',
            componentProps: {
              placeholder: 'Please enter',
            },
            fieldName: `field${i}${Date.now()}`,
            label: 'field+',
          });
        }
        return {
          schema: [...currentSchema, ...newSchema],
        };
      });
      break;
    }

    case 'batchDeleteSchema': {
      formApi.setState((prev) => {
        const currentSchema = prev?.schema ?? [];
        return {
          schema: currentSchema.slice(0, -3),
        };
      });
      break;
    }
    case 'componentRef': {
      const selectRef = formApi.getFieldComponentRef<{ triggerRef?: { focus?: () => void } }>('fieldOptions');

      selectRef?.triggerRef?.focus?.({ focusVisible: true });
      break;
    }
    case 'disabled': {
      formApi.setState({ commonConfig: { disabled: true } });
      break;
    }
    case 'hiddenAction': {
      formApi.setState({ showDefaultActions: false });
      break;
    }
    case 'hiddenResetButton': {
      formApi.setState({ resetButtonOptions: { show: false } });
      break;
    }
    case 'hiddenSubmitButton': {
      formApi.setState({ submitButtonOptions: { show: false } });
      break;
    }
    case 'labelWidth': {
      formApi.setState({
        commonConfig: {
          labelWidth: 150,
        },
      });
      break;
    }
    case 'resetDisabled': {
      formApi.setState({ commonConfig: { disabled: false } });
      break;
    }
    case 'resetLabelWidth': {
      formApi.setState({
        commonConfig: {
          labelWidth: 100,
        },
      });
      break;
    }
    case 'reverseActionButtons': {
      isReverseActionButtons.value = !isReverseActionButtons.value;
      formApi.setState({ actionButtonsReverse: isReverseActionButtons.value });
      break;
    }
    case 'showAction': {
      formApi.setState({ showDefaultActions: true });
      break;
    }
    case 'showResetButton': {
      formApi.setState({ resetButtonOptions: { show: true } });
      break;
    }
    case 'showSubmitButton': {
      formApi.setState({ submitButtonOptions: { show: true } });
      break;
    }

    case 'updateResetButton': {
      formApi.setState({
        resetButtonOptions: { disabled: true },
      });
      break;
    }
    case 'updateSchema': {
      formApi.updateSchema([
        {
          componentProps: {
            items: [
              {
                label: 'Option 1',
                value: '1',
              },
              {
                label: 'Option 2',
                value: '2',
              },
              {
                label: 'Option 3',
                value: '3',
              },
            ],
          },
          fieldName: 'fieldOptions',
        },
      ]);
      toast.add({
        color: 'success',
        title: 'Field `fieldOptions` dropdown options updated successfully.',
        duration: 2_000,
      });
      break;
    }
    case 'updateSubmitButton': {
      formApi.setState({
        submitButtonOptions: { loading: true },
      });
      break;
    }
  }
}
</script>

<template>
  <AppPage
    description="Form component API operation example."
    title="Form Components"
  >
    <div class="mb-5 flex flex-wrap gap-2">
      <PButton @click="handleClick('updateSchema')">
        update Schema
      </PButton>
      <PButton @click="handleClick('labelWidth')">
        Change labelWidth
      </PButton>
      <PButton @click="handleClick('resetLabelWidth')">
        Reset labelWidth
      </PButton>
      <PButton @click="handleClick('disabled')">
        Disable form
      </PButton>
      <PButton @click="handleClick('resetDisabled')">
        Reset disable
      </PButton>
      <PButton @click="handleClick('reverseActionButtons')">
        Reverse action buttons position
      </PButton>
      <PButton @click="handleClick('hiddenAction')">
        Hide action buttons
      </PButton>
      <PButton @click="handleClick('showAction')">
        Show action buttons
      </PButton>
      <PButton @click="handleClick('hiddenResetButton')">
        Hide reset buttons
      </PButton>
      <PButton @click="handleClick('showResetButton')">
        Show reset buttons
      </PButton>
      <PButton @click="handleClick('hiddenSubmitButton')">
        Hide submit buttons
      </PButton>
      <PButton @click="handleClick('showSubmitButton')">
        Show submit buttons
      </PButton>
      <PButton @click="handleClick('updateResetButton')">
        Update reset buttons
      </PButton>
      <PButton @click="handleClick('updateSubmitButton')">
        Update submit buttons
      </PButton>
      <PButton @click="handleClick('batchAddSchema')">
        Batch add form items
      </PButton>
      <PButton @click="handleClick('batchDeleteSchema')">
        Batch delete form items
      </PButton>
      <PButton @click="handleClick('componentRef')">
        Get focus of dropdown component
      </PButton>
    </div>
    <AppCard title="Example">
      <BaseForm />
    </AppCard>
  </AppPage>
</template>
