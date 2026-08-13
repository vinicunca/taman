import type { ZodObject, ZodType } from 'zod';

import type { FieldConfig } from './types';

import { z } from 'zod';

export interface SchemaRuntime {
  dynamicRule?: (name: string) => undefined | ZodType;
  isExcluded?: (name: string) => boolean;
}

interface SchemaTree { [key: string]: SchemaTree | ZodType }

function isZodType(value: SchemaTree | ZodType): value is ZodType {
  return value instanceof z.ZodType;
}

function collisionError(path: Array<string>): Error {
  return new Error(
    `[form-builder] Field name collision at "${path.join('.')}": a rule and a nested field group cannot share a path segment`,
  );
}

function insertRule(
  tree: SchemaTree,
  segments: Array<string>,
  rule: ZodType,
  ancestors: Array<string> = [],
): void {
  const [head, ...rest] = segments;
  const path = [...ancestors, head];
  const existing = tree[head];
  if (rest.length === 0) {
    if (existing && !isZodType(existing)) {
      throw collisionError(path);
    }
    tree[head] = rule;
    return;
  }
  if (existing && isZodType(existing)) {
    throw collisionError(path);
  }
  const node: SchemaTree = existing ?? {};
  tree[head] = node;
  insertRule(node, rest, rule, path);
}

function buildObject(tree: SchemaTree): ZodObject<any> {
  const shape: Record<string, ZodType> = {};
  for (const [key, node] of Object.entries(tree)) {
    shape[key] = isZodType(node) ? node : buildObject(node);
  }
  return z.object(shape);
}

function effectiveRule(
  field: FieldConfig,
  runtime?: SchemaRuntime,
): undefined | ZodType {
  const override = field.name ? runtime?.dynamicRule?.(field.name) : undefined;
  if (override) {
    return override;
  }
  if (field.rules) {
    return field.rules;
  }
  if (field.repeat) {
    let arraySchema = z.array(composeZodSchema(field.repeat.fields));
    if (field.repeat.min !== undefined) {
      arraySchema = arraySchema.min(field.repeat.min);
    }
    if (field.repeat.max !== undefined) {
      arraySchema = arraySchema.max(field.repeat.max);
    }
    return arraySchema;
  }
  return undefined;
}

export function composeZodSchema(
  fields: ReadonlyArray<FieldConfig>,
  runtime?: SchemaRuntime,
): ZodObject<any> {
  const tree: SchemaTree = {};
  for (const field of fields) {
    if (!field.name) {
      continue;
    }
    if (runtime?.isExcluded?.(field.name)) {
      continue;
    }
    const rule = effectiveRule(field, runtime);
    if (!rule) {
      continue;
    }
    insertRule(tree, field.name.split('.'), rule);
  }
  return buildObject(tree);
}

export function isRequiredRule(rule: undefined | ZodType): boolean {
  if (!rule) {
    return false;
  }
  return !rule.safeParse(undefined).success;
}

export function assertUniqueFieldNames(fields: ReadonlyArray<FieldConfig>): void {
  const seen = new Set<string>();
  for (const field of fields) {
    if (!field.name) {
      continue;
    }
    if (seen.has(field.name)) {
      throw new Error(`[form-builder] Duplicate field name "${field.name}"`);
    }
    seen.add(field.name);
  }
}
