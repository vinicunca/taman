import { flushPromises, mount } from '@vue/test-utils';
import { afterAll, it } from 'vitest';
import { nextTick } from 'vue';

import { encodeFormValues } from '../form.codec';
import { setupTamanForm } from '../form.config';
import { useTamanForm } from '../form.use-taman-form';
import { TestInput } from './benchmark-fixtures';

interface ContactValues {
  enabled: boolean;
  metadata: {
    permissions: Array<string>;
    team: string;
  };
  name: string;
  phone: string;
  tags: Array<string>;
}

interface PerformanceFormValues extends Record<string, unknown> {
  contacts: Array<ContactValues>;
  settings: {
    alerts: boolean;
    locale: string;
    sections: Array<string>;
  };
}

const ROW_COUNT = 100;

function createFormValues(): PerformanceFormValues {
  return {
    contacts: Array.from({ length: ROW_COUNT }, (_, index) => ({
      enabled: index % 2 === 0,
      metadata: {
        permissions: ['read', 'write', 'review'],
        team: `team-${index % 10}`,
      },
      name: ` Contact ${index} `,
      phone: `10086-${index}`,
      tags: ['primary', 'on-call', `group-${index % 5}`],
    })),
    settings: {
      alerts: true,
      locale: 'zh-CN',
      sections: ['profile', 'security', 'notifications'],
    },
  };
}

const codec = {
  decode: (values: Readonly<PerformanceFormValues>) => ({ ...values }),
  encode: (values: Readonly<PerformanceFormValues>) => ({
    ...values,
    contacts: values.contacts.map((contact) => ({
      ...contact,
      name: contact.name.trim(),
    })),
  }),
};

const formValues = createFormValues();
setupTamanForm({ rules: {} });
const [CodecForm, codecFormApi] = useTamanForm<PerformanceFormValues>({
  codec,
  schema: [
    {
      component: TestInput,
      defaultValue: formValues.contacts,
      fieldName: 'contacts',
    },
    {
      component: TestInput,
      defaultValue: formValues.settings,
      fieldName: 'settings',
    },
  ],
  showDefaultActions: false,
});
const codecWrapper = mount(CodecForm);
const [ArrayForm, arrayFormApi] = useTamanForm({
  schema: [
    {
      children: [
        {
          component: TestInput,
          fieldName: 'name',
          label: 'Name',
        },
      ],
      defaultValue: Array.from({ length: ROW_COUNT }, (_, index) => ({
        name: `Contact ${index}`,
      })),
      fieldName: 'contacts',
      type: 'array',
    },
  ],
});
const arrayWrapper = mount(ArrayForm);
await flushPromises();
const arraySchemaPatches = [false, true].map((disabled) => ({
  componentProps: { disabled },
  fieldName: 'contacts.name',
}));
let arrayEditIteration = 0;
let arraySchemaIteration = 0;

afterAll(() => {
  arrayWrapper.unmount();
  codecWrapper.unmount();
});

it('form codec performance', async ({ bench }) => {
  // `bench` here is the Vitest 5 test-context API, not a test alias.
  // eslint-disable-next-line test/consistent-test-it
  await bench.compare(
    bench(
      'encode 100 nested rows without isolation',
      () => {
        encodeFormValues(codec, formValues);
      },
    ),
    bench(
      'encode 100 nested rows with isolated input',
      () => {
        codecFormApi.formatValues(formValues);
      },
    ),
    bench(
      'create submit snapshot for 100 nested rows',
      async () => {
        await codecFormApi.getValueSnapshot();
      },
    ),
    { time: 1000, warmupTime: 200 },
  );
});

it('form array performance', async ({ bench }) => {
  // `bench` here is the Vitest 5 test-context API, not a test alias.
  // eslint-disable-next-line test/consistent-test-it
  await bench.compare(
    bench(
      'edit one field in a 100-row array',
      async () => {
        arrayEditIteration += 1;
        await arrayFormApi.setFieldValue(
          'contacts[50].name',
          `Contact ${arrayEditIteration}`,
        );
        await nextTick();
      },
    ),
    bench(
      'append and remove one row from a 100-row array',
      async () => {
        arrayFormApi.form.pushFieldValue('contacts', { name: 'Temporary' });
        await nextTick();
        await arrayFormApi.form.removeFieldValue('contacts', ROW_COUNT);
        await nextTick();
      },
    ),
    bench(
      'update one child schema across 100 rows',
      async () => {
        arraySchemaIteration += 1;
        arrayFormApi.updateSchema([
          arraySchemaPatches[arraySchemaIteration % 2] ?? {},
        ]);
        await nextTick();
      },
    ),
    { time: 1000, warmupTime: 200 },
  );
});
