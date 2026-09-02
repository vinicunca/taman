import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';

import TamanFileUpload from '../../taman-ui/src/components/file-upload/taman-file-upload.vue';

vi.mock('pohon-ui/components/FileUpload.vue', () => ({
  default: defineComponent({
    name: 'PFileUpload',
    props: {
      modelValue: { default: null },
    },
    emits: ['update:modelValue'],
    setup(props, { emit, slots }) {
      return () =>
        h('div', [
          h(
            'button',
            {
              class: 'select-file',
              onClick: () => {
                emit(
                  'update:modelValue',
                  new File(['x'], 'photo.png', { type: 'image/png' }),
                );
              },
            },
            'select',
          ),
          slots['files-top']?.({
            files: props.modelValue,
            open: () => {},
            removeFile: () => {},
          }),
        ]);
    },
  }),
}));

vi.mock('pohon-ui/components/Button.vue', () => ({
  default: defineComponent({
    name: 'PButton',
    setup(_, { attrs, slots }) {
      return () => h('button', attrs, slots.default?.());
    },
  }),
}));

describe('taman-file-upload v-model', () => {
  it('keeps a selected file on the parent model', async () => {
    const modelValue = ref<File | null>(null);
    const Harness = defineComponent({
      setup() {
        return () =>
          h(TamanFileUpload, {
            'modelValue': modelValue.value,
            'onUpdate:modelValue': (value: File | null) => {
              modelValue.value = value;
            },
          });
      },
    });

    const wrapper = mount(Harness);
    await wrapper.get('.select-file').trigger('click');
    await nextTick();

    expect(modelValue.value).toBeInstanceOf(File);
    expect(modelValue.value?.name).toBe('photo.png');
  });
});
