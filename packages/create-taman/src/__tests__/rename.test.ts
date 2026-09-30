import { describe, expect, it } from 'vitest';
import { applyExplicitRenames, fillPlaceholders, renameScope } from '../rename';

const names = { name: 'my-app', nameSnake: 'my_app', scope: 'acme' };

describe('fillPlaceholders', () => {
  it('fills name, scope and nameSnake', () => {
    expect(fillPlaceholders('{{name}}/{{scope}}/{{nameSnake}}', names)).toBe('my-app/acme/my_app');
  });
});

describe('applyExplicitRenames', () => {
  it('replaces every occurrence in the named file', () => {
    const files = new Map([['docker-compose.yml', 'POSTGRES_DB: taman_db\n-d taman_db\n']]);

    const result = applyExplicitRenames(files, [{ file: 'docker-compose.yml', from: 'taman_db', to: '{{nameSnake}}' }], names);

    expect(result.errors).toEqual([]);
    expect(result.files.get('docker-compose.yml')).toBe('POSTGRES_DB: my_app\n-d my_app\n');
  });

  it('reports a missing file and a missing string instead of skipping them', () => {
    const files = new Map([['a.txt', 'hello']]);

    const result = applyExplicitRenames(files, [
      { file: 'missing.txt', from: 'x', to: 'y' },
      { file: 'a.txt', from: 'absent', to: 'y' },
    ], names);

    expect(result.errors).toEqual([
      'rename: missing.txt does not exist',
      'rename: "absent" not found in a.txt',
    ]);
  });
});

describe('renameScope', () => {
  it('rewrites the scope in text files and leaves published names and binaries alone', () => {
    const binary = new Uint8Array([0, 1, 2]);
    const files = new Map<string, string | Uint8Array>([
      ['a.ts', 'import { x } from \'@taman/utils\';\nimport { y } from \'@vinicunca/taman-core\';\n'],
      ['logo.png', binary],
    ]);

    const result = renameScope(files, '@taman/', 'acme');

    expect(result.get('a.ts')).toBe('import { x } from \'@acme/utils\';\nimport { y } from \'@vinicunca/taman-core\';\n');
    expect(result.get('logo.png')).toBe(binary);
  });
});
