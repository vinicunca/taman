import enTodo from '#/locales/langs/en-US/todo.json';
import idTodo from '#/locales/langs/id-ID/todo.json';
import { describe, expect, it } from 'vitest';

const sources: Record<string, string> = {
  ...import.meta.glob<string>('./**/*.vue', { eager: true, import: 'default', query: '?raw' }),
  ...import.meta.glob<string>('./**/*.ts', { eager: true, import: 'default', query: '?raw' }),
  ...import.meta.glob<string>('../../router/routes/modules/todo.ts', { eager: true, import: 'default', query: '?raw' }),
};

function hasKey(messages: Record<string, unknown>, path: string): boolean {
  let node: unknown = messages;
  for (const part of path.split('.')) {
    if (typeof node !== 'object' || node === null || !(part in node)) {
      return false;
    }
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string';
}

/** User-facing literals the reference feature must route through `$t`. */
function hardcodedCopy(file: string, source: string): Array<string> {
  if (file.endsWith('.test.ts')) {
    return [];
  }
  const found: Array<string> = [];
  const template = source.split('<template>')[1] ?? '';

  for (const match of template.matchAll(/(?<![:\w-])(title|description|placeholder|aria-label|submit-label)="([^"A-Z]*[A-Z][^"]*)"/gi)) {
    found.push(`${match[1]}="${match[2]}"`);
  }
  for (const match of template.matchAll(/^\s+([A-Z][^<>{}=\n]*)$/gm)) {
    found.push(match[1]!.trim());
  }
  for (const match of source.matchAll(/(\w+):\s*['`]([A-Z][a-z][^'`]*)['`]/g)) {
    if (match[1] !== 'component' && match[1] !== 'name') {
      found.push(`${match[1]}: '${match[2]}'`);
    }
  }
  return found.map((copy) => `${file}: ${copy}`);
}

describe('todo reference feature copy', () => {
  it('routes every user-facing string through the todo locale namespace', () => {
    const copy = Object.entries(sources).flatMap(([file, source]) => hardcodedCopy(file, source));

    expect(copy).toEqual([]);
  });

  it('defines every todo.* key it uses in every language', () => {
    const keys = new Set(
      Object.values(sources).flatMap((source) =>
        [...source.matchAll(/\$t\(\s*'todo\.([\w.]+)'/g)].map((match) => match[1]!),
      ),
    );
    const missing = [...keys].flatMap((key) => [
      ...(hasKey(enTodo, key) ? [] : [`en-US: todo.${key}`]),
      ...(hasKey(idTodo, key) ? [] : [`id-ID: todo.${key}`]),
    ]);

    expect(keys.size).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });
});
