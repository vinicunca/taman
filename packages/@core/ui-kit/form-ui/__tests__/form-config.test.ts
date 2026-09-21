import { globalShareState } from '@taman-core/shared/global-state';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { defineComponent } from 'vue';

import {
  COMPONENT_MAP,
  rehydrateFormComponentMaps,
  setupTamanForm,
} from '../src/form.config';

const builtInCheckbox = COMPONENT_MAP.Checkbox;
const componentMapReference = COMPONENT_MAP;

function resetFormConfig() {
  globalShareState.setComponents({});
  setupTamanForm({});
}

beforeEach(resetFormConfig);
afterEach(resetFormConfig);

describe('setupTamanForm', () => {
  it('rebuilds user mappings while preserving built-ins and record identity', () => {
    const FirstInput = defineComponent({});
    const SecondInput = defineComponent({});

    globalShareState.setComponents({ FirstInput });
    setupTamanForm({});

    expect(COMPONENT_MAP.FirstInput).toBe(FirstInput);

    globalShareState.setComponents({ SecondInput });
    setupTamanForm({});

    expect(COMPONENT_MAP).toBe(componentMapReference);
    expect(Reflect.has(COMPONENT_MAP, 'FirstInput')).toBe(false);
    expect(COMPONENT_MAP.SecondInput).toBe(SecondInput);
    expect(COMPONENT_MAP.Checkbox).toBe(builtInCheckbox);
  });

  it('restores adapter components from share state after the map is reset', () => {
    const SelectFetch = defineComponent({ name: 'SelectFetch' });
    globalShareState.setComponents({ SelectFetch });
    setupTamanForm({});
    expect(COMPONENT_MAP.SelectFetch).toBe(SelectFetch);

    Reflect.deleteProperty(COMPONENT_MAP, 'SelectFetch');
    expect(COMPONENT_MAP.SelectFetch).toBeUndefined();

    rehydrateFormComponentMaps();
    expect(COMPONENT_MAP.SelectFetch).toBe(SelectFetch);
    expect(COMPONENT_MAP).toBe(componentMapReference);
  });
});
