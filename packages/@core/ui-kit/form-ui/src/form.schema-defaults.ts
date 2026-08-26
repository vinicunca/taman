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

export function getCustomDefaultValue(rule: unknown): unknown {
  const rawRule = toRaw(rule);

  if (rawRule instanceof ZodString || rawRule instanceof ZodStringFormat) {
    return '';
  }

  if (rawRule instanceof ZodNumber) {
    return null;
  }

  if (rawRule instanceof ZodObject) {
    const defaultValues: Record<string, unknown> = {};
    for (const [key, valueSchema] of Object.entries(rawRule.shape)) {
      defaultValues[key] = getCustomDefaultValue(valueSchema);
    }
    return defaultValues;
  }

  if (rawRule instanceof ZodIntersection) {
    return getDefaultsForSchema(rawRule);
  }

  return undefined;
}
