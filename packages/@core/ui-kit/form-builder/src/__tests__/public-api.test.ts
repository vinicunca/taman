import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import * as api from '../index';

/**
 * Runtime keys (Object.keys) cannot see `export type` re-exports, so the
 * runtime absence check alone would miss a type-only leak like
 * `export type { PohonFormRef }`. Pin the barrel SOURCE as well: none of
 * these identifiers may appear in src/index.ts at all. The barrel's module
 * specifiers ('./types', './plugin', './use-taman-form', './form-api')
 * contain none of these names, so a word-boundary match is leak <=> match.
 */
const FORBIDDEN_IDENTIFIERS = [
  'PohonFormRef',
  'FormRenderer',
  'FieldRenderer',
  'FieldRepeater',
  'FormActions',
  'composeZodSchema',
  'applyTransformsIn',
  'applyTransformsOut',
  'useDependencies',
  'useAsyncValidate',
  'getPath',
  'setPath',
  'deletePath',
  'deepAssign',
];

describe('public API surface', () => {
  it('exports the spec §1 surface', () => {
    expect(api.useTamanForm).toBeTypeOf('function');
    expect(api.createFormBuilder).toBeTypeOf('function');
    expect(api.defineFieldComponents).toBeTypeOf('function');
    expect(api.defineFields).toBeTypeOf('function');
  });

  it('does not leak internals (renderer, schema composer, pohon contract)', () => {
    const keys = Object.keys(api);
    for (const forbidden of FORBIDDEN_IDENTIFIERS) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it('does not re-export internals from the barrel source, even type-only', () => {
    // happy-dom rewrites import.meta.url to an http:// URL, so resolve the
    // barrel relative to vitest's real test-file path instead.
    const barrelSource = readFileSync(
      resolve(dirname(expect.getState().testPath!), '../index.ts'),
      'utf8',
    );
    for (const forbidden of FORBIDDEN_IDENTIFIERS) {
      expect(
        new RegExp(`\\b${forbidden}\\b`).test(barrelSource),
        `barrel must not mention "${forbidden}"`,
      ).toBe(false);
    }
  });

  it('does not use a bare `export *` to route around the forbidden-identifier checks', () => {
    // The checks above scan the barrel for named forbidden identifiers, but
    // an `export * from './internal-module'` would re-export everything
    // (including future internals) without ever naming them here, evading
    // both the runtime-keys check and the source-text check above.
    //
    // Requiring `from` immediately after the `*` targets exactly that form.
    // `export * as ns from '...'` is deliberately allowed: it binds the
    // whole module under one namespace instead of splicing its names into
    // this barrel, so it cannot leak an internal name (e.g. the `z` zod
    // namespace re-export).
    const barrelSource = readFileSync(
      resolve(dirname(expect.getState().testPath!), '../index.ts'),
      'utf8',
    );
    expect(/export\s+(?:type\s+)?\*\s+from\b/.test(barrelSource)).toBe(false);
  });
});
