import { extractSlots } from '../src/slots.ts';

export function templateExportName(fileName: string): string {
  const base = fileName.replace(/\.(html|txt)$/, '');
  if (!/^[a-z][a-z0-9-]*$/.test(base)) {
    throw new Error(`Invalid template filename: ${fileName}`);
  }
  return base.replace(/-([a-z0-9])/g, (_match, letter: string) => letter.toUpperCase());
}

export function assertValidTemplate(source: string, fileName: string): string[] {
  if (/%7b|%7d/i.test(source)) {
    throw new Error(`${fileName} contains URL-encoded template slots`);
  }
  const invalid = source.match(/\{\{[^}]*\}\}/g) ?? [];
  const valid = source.match(/\{\{\s*[a-z][A-Za-z0-9]*\s*\}\}/g) ?? [];
  const openings = source.match(/\{\{/g)?.length ?? 0;
  const closings = source.match(/\}\}/g)?.length ?? 0;
  if (invalid.length !== valid.length || openings !== valid.length || closings !== valid.length) {
    throw new Error(`${fileName} contains a malformed template slot`);
  }
  return extractSlots(source);
}

export function createTemplateModule(name: string, html: string, text: string): string {
  const htmlSlots = assertValidTemplate(html, `${name}.html`);
  const textSlots = assertValidTemplate(text, `${name}.txt`);
  const slots = [...new Set([...htmlSlots, ...textSlots])].sort();
  return `/* eslint-disable */\n/* cspell:disable */\nimport type { CompiledTemplate } from '../types.ts';\n\nconst template: CompiledTemplate = {\n  slots: ${JSON.stringify(slots)},\n  html: ${JSON.stringify(html)},\n  text: ${JSON.stringify(text)},\n};\n\nexport default template;\n`;
}
