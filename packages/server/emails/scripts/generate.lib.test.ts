// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { assertValidTemplate, createTemplateModule, templateExportName } from './generate.lib.ts';

describe('templateExportName', () => {
  it.each([
    ['invitation', 'invitation'],
    ['verify-email', 'verifyEmail'],
    ['reset-password.html', 'resetPassword'],
    ['reset-password.txt', 'resetPassword'],
  ])('%s → %s', (name, expected) => {
    expect(templateExportName(name)).toBe(expected);
  });

  it('rejects file names that cannot become identifiers', () => {
    expect(() => templateExportName('Reset Password.html')).toThrow(/Invalid template filename/);
  });
});

describe('assertValidTemplate', () => {
  it('accepts well-formed slots and returns them sorted', () => {
    expect(assertValidTemplate('<a href="{{actionUrl}}">{{ heading }}</a>{{heading}}', 'x.html')).toEqual(['actionUrl', 'heading']);
  });

  it('rejects URL-encoded placeholders', () => {
    expect(() => assertValidTemplate('<a href="%7B%7BactionUrl%7D%7D">', 'x.html')).toThrow(/URL-encoded/);
  });

  it('rejects malformed placeholders', () => {
    expect(() => assertValidTemplate('<p>{{ action-url }}</p>', 'x.html')).toThrow(/malformed/);
    expect(() => assertValidTemplate('<p>{{heading</p>', 'x.html')).toThrow(/malformed/);
  });
});

describe('createTemplateModule', () => {
  it('emits a typed module with sorted slots and the exact html and text', () => {
    const html = '<a href="{{actionUrl}}">{{ heading }}</a>';
    const text = '{{heading}} {{actionUrl}}';
    const source = createTemplateModule('verify-email', html, text);

    expect(source).toContain('/* eslint-disable */');
    expect(source).toContain('/* cspell:disable */');
    expect(source).toContain('import type { CompiledTemplate } from \'../types.ts\';');
    expect(source).toContain('const template: CompiledTemplate = {');
    expect(source).toContain('  slots: ["actionUrl","heading"],');
    expect(source).toContain(`  html: ${JSON.stringify(html)},`);
    expect(source).toContain(`  text: ${JSON.stringify(text)},`);
    expect(source.endsWith('export default template;\n')).toBe(true);
  });

  it('refuses to emit a module for a mangled template', () => {
    expect(() => createTemplateModule('x', '<a href="%7B%7BactionUrl%7D%7D">', '')).toThrow(/URL-encoded/);
  });
});
