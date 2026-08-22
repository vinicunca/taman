import type {
  ArrayToStringFields,
  FormBaseComponentType,
  FormFieldMappingTime,
  FormSchema,
  FormSchemaContext,
  FormValues,
} from './form.types';

import { clone, formatDate, isFunction } from '@taman-core/shared/utils';

import {
  getFormArraySchemaChildren,
  resolveArrayChildFieldName,
} from './form-render/form-render.schema';
import {
  deleteValueByFieldName,
  getValueByFieldName,
  resolveValueFormatFieldName,
  setValueByFieldName,
} from './form.field-name';

type AnyFormSchema<TValues extends FormValues> = FormSchema<
  FormBaseComponentType,
  Record<string, any>,
  TValues
>;

function processFields(
  fields: Array<string>,
  separator: string,
  values: Record<string, any>,
) {
  for (const field of fields) {
    const value = values[field];
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      values[field] = value.join(separator);
      continue;
    }
    if (typeof value !== 'string') {
      continue;
    }
    if (value === '') {
      values[field] = [];
      continue;
    }
    const escapedSeparator = separator.replaceAll(
      /[.*+?^${}()|[\]\\]/g,
      String.raw`\$&`,
    );
    values[field] = value.split(new RegExp(escapedSeparator));
  }
}

function applyArrayToStringFields(
  values: Record<string, any>,
  arrayToStringFields?: ArrayToStringFields,
) {
  if (!arrayToStringFields || !Array.isArray(arrayToStringFields)) {
    return;
  }

  if (arrayToStringFields.every((item) => typeof item === 'string')) {
    const fieldsConfig = arrayToStringFields as Array<string>;
    const lastItem = fieldsConfig.at(-1) ?? '';
    const hasSeparator = lastItem.length === 1;
    const fields = hasSeparator ? fieldsConfig.slice(0, -1) : fieldsConfig;
    processFields(fields, hasSeparator ? lastItem : ',', values);
    return;
  }

  for (const fieldConfig of arrayToStringFields) {
    if (!Array.isArray(fieldConfig)) {
      continue;
    }
    const [fields, separator = ','] = fieldConfig;
    if (!Array.isArray(fields)) {
      console.warn(
        `Invalid field configuration: fields should be an array of strings, got ${typeof fields}`,
      );
      continue;
    }
    processFields(fields, separator, values);
  }
}

function applyRangeTimeFields(
  values: Record<string, any>,
  fieldMappingTime?: FormFieldMappingTime,
) {
  if (!fieldMappingTime || !Array.isArray(fieldMappingTime)) {
    return;
  }

  for (const [
    field,
    [startTimeKey, endTimeKey],
    format = 'YYYY-MM-DD',
  ] of fieldMappingTime) {
    if (startTimeKey && endTimeKey && values[field] === null) {
      Reflect.deleteProperty(values, startTimeKey);
      Reflect.deleteProperty(values, endTimeKey);
    }
    if (!values[field]) {
      Reflect.deleteProperty(values, field);
      continue;
    }

    const [startTime, endTime] = values[field];
    if (format === null) {
      values[startTimeKey] = startTime;
      values[endTimeKey] = endTime;
    } else if (isFunction(format)) {
      values[startTimeKey] = format(startTime, startTimeKey);
      values[endTimeKey] = format(endTime, endTimeKey);
    } else {
      const [startTimeFormat, endTimeFormat] = Array.isArray(format)
        ? format
        : [format, format];
      values[startTimeKey] = startTime
        ? formatDate(startTime, startTimeFormat)
        : undefined;
      values[endTimeKey] = endTime
        ? formatDate(endTime, endTimeFormat)
        : undefined;
    }
    Reflect.deleteProperty(values, field);
  }
}

function applyValueFormatBySchemas<TValues extends FormValues>(
  schemas: Array<AnyFormSchema<TValues>>,
  values: Record<string, any>,
  parentPath?: string,
  parentContext?: FormSchemaContext<TValues>,
) {
  for (const schema of schemas) {
    const fieldName = parentPath
      ? resolveArrayChildFieldName(parentPath, schema.fieldName)
      : schema.fieldName;
    const row
      = parentPath && parentContext?.rowPath
        ? getValueByFieldName(values, parentContext.rowPath)
        : parentContext?.row;
    const schemaContext: FormSchemaContext<TValues> = {
      ...parentContext,
      fieldName,
      originalFieldName: schema.fieldName,
      rootValues: values as TValues,
      row,
    };

    const children = getFormArraySchemaChildren<AnyFormSchema<TValues>>(schema);
    if (children.length > 0) {
      const arrayValue = getValueByFieldName(values, fieldName);
      if (Array.isArray(arrayValue)) {
        arrayValue.forEach((rowValue, index) => {
          const rowPath = `${fieldName}[${index}]`;
          applyValueFormatBySchemas(children, values, rowPath, {
            arrayField: fieldName,
            row: rowValue,
            rowIndex: index,
            rowPath,
          });
        });
      }
    }

    if (!schema.valueFormat) {
      continue;
    }
    const value = getValueByFieldName(values, fieldName);
    deleteValueByFieldName(values, fieldName);
    const formattedValue = schema.valueFormat(
      value,
      (key, nextValue) => {
        setValueByFieldName(
          values,
          resolveValueFormatFieldName(key, parentPath),
          nextValue,
        );
      },
      values as TValues,
      schemaContext,
    );
    if (formattedValue !== undefined) {
      setValueByFieldName(values, fieldName, formattedValue);
    }
  }
}

export function applyFormValueFormats<TValues extends FormValues>(
  originValues: Record<string, any>,
  schemas: Array<AnyFormSchema<TValues>>,
) {
  const values = clone(originValues);
  applyValueFormatBySchemas(schemas, values);
  return values;
}

export function formatFormValues<TValues extends FormValues>(
  originValues: Readonly<Record<string, any>>,
  schemas: Array<AnyFormSchema<TValues>>,
  fieldMappingTime?: FormFieldMappingTime,
  arrayToStringFields?: ArrayToStringFields,
) {
  const values = clone(originValues);
  applyArrayToStringFields(values, arrayToStringFields);
  applyRangeTimeFields(values, fieldMappingTime);
  applyValueFormatBySchemas(schemas, values);
  return values;
}

export function transformRangeTimeValues(
  originValues: Record<string, any>,
  fieldMappingTime?: FormFieldMappingTime,
  arrayToStringFields?: ArrayToStringFields,
) {
  const values = clone(originValues);
  applyArrayToStringFields(values, arrayToStringFields);
  applyRangeTimeFields(values, fieldMappingTime);
  return values;
}
