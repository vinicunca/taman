import type { ZodType } from 'zod';

import { toRaw } from 'vue';
import {
  object,
  string,
  ZodIntersection,
  ZodNumber,
  ZodObject,
  ZodString,
  ZodStringFormat,
} from 'zod';
import { getDefaultsForSchema } from 'zod-defaults';

export function schemaForZodDefaults(schema: ZodType): ZodType {
  const rawSchema = toRaw(schema);

  if (rawSchema instanceof ZodStringFormat) {
    return string();
  }

  if (rawSchema instanceof ZodObject) {
    const shape: Record<string, ZodType> = {};
    for (const [key, valueSchema] of Object.entries(rawSchema.shape)) {
      shape[key] = schemaForZodDefaults(valueSchema as ZodType);
    }
    return object(shape);
  }

  return rawSchema;
}

export function getCustomDefaultValue(rule: any): any {
  rule = toRaw(rule);
  if (rule instanceof ZodString || rule instanceof ZodStringFormat) {
    return ''; // The default value for strings and their format validation is an empty string.
  } else if (rule instanceof ZodNumber) {
    return null; // The default value for numbers is null (to avoid displaying 0)
  } else if (rule instanceof ZodObject) {
    // Recursively extract the default values of nested objects
    const defaultValues: Record<string, any> = {};
    for (const [key, valueSchema] of Object.entries(rule.shape)) {
      defaultValues[key] = getCustomDefaultValue(valueSchema);
    }
    return defaultValues;
  } else if (rule instanceof ZodIntersection) {
    return getDefaultsForSchema(normalizeSchemaForDefaults(rule) as any);
  } else {
    return undefined; // Other types do not provide default values
  }
}

/**
 * Rebuild the schema used by zod-defaults, replacing native format nodes that
 * zod-defaults does not recognise while retaining supported wrappers.
 */
export function normalizeSchemaForDefaults(rule: ZodType): ZodType {
  const rawRule = toRaw(rule) as any;

  if (rawRule instanceof ZodStringFormat) {
    return string();
  }

  if (rawRule instanceof ZodObject) {
    const shape = Object.fromEntries(
      Object.entries(rawRule.shape).map(([key, value]) => [
        key,
        normalizeSchemaForDefaults(value as ZodType),
      ]),
    );
    return object(shape);
  }

  if (rawRule instanceof ZodIntersection) {
    const { left, right } = (rawRule as any).def;
    return normalizeSchemaForDefaults(left as ZodType).and(
      normalizeSchemaForDefaults(right as ZodType),
    );
  }

  if (rawRule.constructor.name === 'ZodDefault') {
    const inner = normalizeSchemaForDefaults(rawRule.unwrap());
    return inner.default(rawRule.def.defaultValue);
  }

  if (rawRule.constructor.name === 'ZodPipe') {
    return normalizeSchemaForDefaults(rawRule.in).pipe(rawRule.out);
  }

  return rawRule;
}
