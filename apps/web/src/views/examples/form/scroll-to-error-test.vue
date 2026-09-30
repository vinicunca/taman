<script lang="ts" setup>
import { AppCard, AppCardAction, AppPage } from '@taman/app-ui';
import { ref } from 'vue';

import { useTamanForm } from '#/adapter/form';

const scrollEnabled = ref(true);

const [Form, formApi] = useTamanForm({
  scrollToFirstError: scrollEnabled.value,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter username',
      },
      fieldName: 'username',
      label: 'Username',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter email',
      },
      fieldName: 'email',
      label: 'Email',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter phone number',
      },
      fieldName: 'phone',
      label: 'Phone number',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter address',
      },
      fieldName: 'address',
      label: 'Address',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter remark',
      },
      fieldName: 'remark',
      label: 'Remark',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter company name',
      },
      fieldName: 'company',
      label: 'Company name',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter position',
      },
      fieldName: 'position',
      label: 'Position',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        items: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
        ],
        placeholder: 'Please select gender',
      },
      fieldName: 'gender',
      label: 'Gender',
      rules: 'selectRequired',
    },
  ],
  showDefaultActions: false,
});

// Test validateAndSubmit (validate and submit)
async function testValidateAndSubmit() {
  await formApi.validateAndSubmit();
}

// Test validate (manually validate the entire form)
async function testValidate() {
  await formApi.validate();
}

// Test validateField (validate a single field)
async function testValidateField() {
  await formApi.validateField('username');
}

// Toggle scroll-to-error behavior
function toggleScrollToError() {
  formApi.setState({ scrollToFirstError: scrollEnabled.value });
}

// Fill partial data for testing
async function fillPartialData() {
  await formApi.reset();
  await formApi.setFieldValue('username', '测试用户');
  await formApi.setFieldValue('email', 'test@example.com');
}
</script>

<template>
  <AppPage
    description="Test the function of automatically scrolling to the first error field when the form validation fails."
    title="Scroll to Error Test"
  >
    <AppCard title="Function Test">
      <template #trailingHeader>
        <AppCardAction>
          <PSwitch
            v-model="scrollEnabled"
            label="enable scroll to error"
            @change="toggleScrollToError"
          />
        </AppCardAction>
      </template>

      <div class="space-y-4">
        <div class="p-4 rounded-sm bg-blue-50 dark:bg-blue-900">
          <h3 class="font-medium mb-2">
            Test Description:
          </h3>
          <ul class="text-sm list-disc list-inside space-y-1">
            <li>All validation methods will automatically scroll to the first error field when validation fails</li>
            <li>The automatic scroll function can be enabled or disabled by the switch in the upper right corner</li>
          </ul>
        </div>

        <div class="p-4 border rounded-sm">
          <h4 class="font-medium mb-3">
            Validation Method Test:
          </h4>
          <div class="flex flex-wrap gap-2">
            <PButton
              @click="testValidateAndSubmit"
            >
              Test validateAndSubmit()
            </PButton>
            <PButton @click="testValidate">
              Test validate()
            </PButton>
            <PButton @click="testValidateField">
              Test validateField()
            </PButton>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            <p>• validateAndSubmit(): Validate the form and submit</p>
            <p>• validate(): Manually validate the entire form</p>
            <p>• validateField(): Validate a single field (here test the username field)</p>
          </div>
        </div>

        <div class="p-4 border rounded-sm">
          <h4 class="font-medium mb-3">
            Data Filling Test:
          </h4>
          <div class="flex flex-wrap gap-2">
            <PButton @click="fillPartialData">
              Fill Partial Data
            </PButton>
            <PButton @click="() => formApi.reset()">
              Clear Form
            </PButton>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            <p>• After filling partial data and validating, it will scroll to the first error field</p>
          </div>
        </div>

        <Form />
      </div>
    </AppCard>
  </AppPage>
</template>
