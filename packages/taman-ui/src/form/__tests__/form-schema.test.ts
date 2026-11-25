import type { FormSchema } from '../form.types';

import { describe, expect, it, vi } from 'vitest';

import {
  createArrayChildSchema,
  createFormFieldSchema,
  getFormFieldSchemas,
  isFormGroupSchema,
  removeFormSchemaByFields,
  updateFormSchemaList,
} from '../form-render/form-render.schema';

describe('form schema normalization', () => {
  it('resolves common component props with the field context', () => {
    const componentProps = vi.fn(({ fieldName }) => ({
      placeholder: `Enter ${fieldName}`,
    }));

    const schema = createFormFieldSchema(
      { component: 'Input', fieldName: 'name' },
      {
        commonConfig: { componentProps },
      },
    );

    expect(componentProps).toHaveBeenCalledWith({ fieldName: 'name' });
    expect(schema.commonComponentProps).toEqual({
      placeholder: 'Enter name',
    });
  });

  it('preserves common component props objects', () => {
    const schema = createFormFieldSchema(
      { component: 'Input', fieldName: 'name' },
      {
        commonConfig: {
          componentProps: { placeholder: 'Enter a name' },
        },
      },
    );

    expect(schema.commonComponentProps).toEqual({
      placeholder: 'Enter a name',
    });
  });

  it('resolves global common component props functions', () => {
    const componentProps = vi.fn(({ fieldName }) => ({
      title: `Global ${fieldName}`,
    }));

    const schema = createFormFieldSchema(
      { component: 'Input', fieldName: 'email' },
      {
        globalCommonConfig: { componentProps },
      },
    );

    expect(componentProps).toHaveBeenCalledWith({ fieldName: 'email' });
    expect(schema.commonComponentProps).toEqual({ title: 'Global email' });
  });

  it('resolves array common props with the row context', () => {
    const componentProps = vi.fn(() => ({ placeholder: 'Contact name' }));

    const schema = createArrayChildSchema(
      { component: 'Input', fieldName: 'name' },
      {
        arrayField: 'contacts',
        commonConfig: { componentProps },
        index: 1,
      },
    );

    expect(componentProps).toHaveBeenCalledWith({
      arrayField: 'contacts',
      fieldName: 'contacts[1].name',
      originalFieldName: 'name',
      rowIndex: 1,
      rowPath: 'contacts[1]',
    });
    expect(schema.commonComponentProps).toEqual({
      placeholder: 'Contact name',
    });
  });

  it('passes row and rootValues to child render callbacks', () => {
    const rootValues = {
      contacts: [
        { name: 'a' },
        { name: 'b' },
      ],
    };
    const rowContext = { row: rootValues.contacts[1]!, rootValues };
    const help = vi.fn(() => 'help');
    const renderComponentContent = vi.fn(() => ({}));
    const suffix = vi.fn(() => 'suffix');
    const componentProps = vi.fn(() => ({}));

    const schema = createArrayChildSchema(
      {
        component: 'Input',
        componentProps,
        fieldName: 'name',
        help,
        renderComponentContent,
        suffix,
      },
      { arrayField: 'contacts', index: 1, rowContext },
    );
    (schema.help as () => unknown)();
    (schema.renderComponentContent as () => unknown)();
    (schema.suffix as () => unknown)();
    (schema.componentProps as () => unknown)();

    const expected = expect.objectContaining({
      fieldName: 'contacts[1].name',
      row: { name: 'b' },
      rootValues,
      rowIndex: 1,
      rowPath: 'contacts[1]',
    });
    for (const fn of [
      help,
      renderComponentContent,
      suffix,
      componentProps,
    ]) {
      expect(fn).toHaveBeenCalledWith(expected);
    }
  });
});

describe('form group schema', () => {
  const nameSchema: FormSchema = { component: 'Input', fieldName: 'name' };
  const contactGroup: FormSchema = {
    children: [
      { component: 'Input', fieldName: 'email' },
      { component: 'Input', fieldName: 'phone' },
    ],
    name: 'contact',
    title: 'Contact',
    type: 'group',
  };
  const tagsArray: FormSchema = {
    children: [
      { component: 'Input', fieldName: 'label' },
    ],
    fieldName: 'tags',
    type: 'array',
  };
  const schema: Array<FormSchema> = [nameSchema, contactGroup, tagsArray];

  it('distinguishes groups from fields and arrays', () => {
    expect(isFormGroupSchema(nameSchema)).toBe(false);
    expect(isFormGroupSchema(contactGroup)).toBe(true);
    expect(isFormGroupSchema(tagsArray)).toBe(false);
  });

  it('flattens groups into field schemas while keeping arrays intact', () => {
    const fields = getFormFieldSchemas(schema);

    expect(fields.map((item) => item.fieldName)).toEqual([
      'name',
      'email',
      'phone',
      'tags',
    ]);
    expect(fields[3]).toBe(schema[2]);
  });

  it('updates fields nested inside groups', () => {
    const updated = updateFormSchemaList(schema, [
      { fieldName: 'phone', label: 'Phone' },
      { fieldName: 'tags.label', label: 'Tag' },
    ]);

    expect(updated[0]).toBe(schema[0]);
    expect(updated[1]).toMatchObject({
      children: [
        { fieldName: 'email' },
        { fieldName: 'phone', label: 'Phone' },
      ],
      name: 'contact',
      type: 'group',
    });
    expect(updated[2]).toMatchObject({
      children: [
        { fieldName: 'label', label: 'Tag' },
      ],
      fieldName: 'tags',
    });
    // The original schema should not be modified.
    expect(schema[1]).not.toHaveProperty('children.1.label');
  });

  it('removes fields nested inside groups without dropping the group', () => {
    const result = removeFormSchemaByFields(schema, ['name', 'email']);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      children: [
        { fieldName: 'phone' },
      ],
      name: 'contact',
      type: 'group',
    });
    expect(result[1]).toBe(schema[2]);
  });
});
