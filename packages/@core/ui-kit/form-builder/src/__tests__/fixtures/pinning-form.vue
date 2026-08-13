<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { z } from 'zod';

const state = reactive<Record<string, any>>({ user: { email: '' }, age: undefined });

const schema = z.object({
  user: z.object({ email: z.string().min(1, 'email required') }),
  age: z.number({ error: 'age required' }),
});

const formRef = ref();
const submitted = ref<any>(null);

function onSubmit(event: any) {
  submitted.value = event.data;
}

defineExpose({ formRef, state, submitted });
</script>

<template>
  <PForm ref="formRef" :state="state" :schema="schema" @submit="onSubmit">
    <PFormField name="user.email" label="Email">
      <PInput v-model="state.user.email" />
    </PFormField>
    <PFormField name="age" label="Age">
      <PInputNumber v-model="state.age" />
    </PFormField>
    <PButton type="submit">Save</PButton>
  </PForm>
</template>
