import { globalShareState } from '@taman-core/shared/global-state';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';

import {
  COMPONENT_BIND_EVENT_MAP,
  COMPONENT_MAP,
  rehydrateFormComponentMaps,
  setupTamanForm,
} from '../src/form.config';

const builtInCheckbox = COMPONENT_MAP.VbenCheckbox;
const componentMapReference = COMPONENT_MAP;
const bindEventMapReference = COMPONENT_BIND_EVENT_MAP;

function resetFormConfig() {
  globalShareState.setComponents({});
  setupTamanForm({ config: {} });
}

beforeEach(resetFormConfig);
afterEach(resetFormConfig);

describe('setupTamanForm', () => {
  it('rebuilds user mappings while preserving built-ins and record identity', () => {
    const FirstInput = defineComponent({});
    const SecondInput = defineComponent({});

    globalShareState.setComponents({ FirstInput });
    setupTamanForm({ config: { baseModelPropName: 'value' } });

    expect(COMPONENT_MAP.FirstInput).toBe(FirstInput);
    expect(COMPONENT_BIND_EVENT_MAP.FirstInput).toBe('value');

    globalShareState.setComponents({ SecondInput });
    setupTamanForm({ config: {} });

    expect(COMPONENT_MAP).toBe(componentMapReference);
    expect(COMPONENT_BIND_EVENT_MAP).toBe(bindEventMapReference);
    expect(Reflect.has(COMPONENT_MAP, 'FirstInput')).toBe(false);
    expect(Reflect.has(COMPONENT_BIND_EVENT_MAP, 'FirstInput')).toBe(false);
    expect(COMPONENT_MAP.SecondInput).toBe(SecondInput);
    expect(COMPONENT_BIND_EVENT_MAP.SecondInput).toBeUndefined();
    expect(COMPONENT_MAP.VbenCheckbox).toBe(builtInCheckbox);
    expect(COMPONENT_BIND_EVENT_MAP.VbenCheckbox).toBe('checked');
  });

  it('prefers component mappings over the base model prop name', () => {
    const CustomInput = defineComponent({});
    globalShareState.setComponents({ CustomInput });

    setupTamanForm({
      config: {
        baseModelPropName: 'value',
        modelPropNameMap: { CustomInput: 'checked' },
      },
    });

    expect(COMPONENT_BIND_EVENT_MAP.CustomInput).toBe('checked');
  });

  it('restores adapter components from share state after the map is reset', () => {
    const SelectFetch = defineComponent({ name: 'SelectFetch' });
    globalShareState.setComponents({ SelectFetch });
    setupTamanForm({ config: {} });
    expect(COMPONENT_MAP.SelectFetch).toBe(SelectFetch);

    Reflect.deleteProperty(COMPONENT_MAP, 'SelectFetch');
    expect(COMPONENT_MAP.SelectFetch).toBeUndefined();

    rehydrateFormComponentMaps();
    expect(COMPONENT_MAP.SelectFetch).toBe(SelectFetch);
    expect(COMPONENT_MAP).toBe(componentMapReference);
  });
});
