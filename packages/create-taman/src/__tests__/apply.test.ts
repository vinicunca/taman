import type { TemplateManifest } from '../types';
import { describe, expect, it } from 'vitest';
import { applyManifest, findLeftovers } from '../apply';

const pkg = (value: object) => `${JSON.stringify(value, null, 2)}\n`;
const names = { name: 'my-app', nameSnake: 'my_app', scope: 'acme' };

const manifest: TemplateManifest = {
  remove: ['internal/**', 'CLAUDE.md'],
  rename: [{ file: 'package.json', from: '"name": "@taman/monorepo"', to: '"name": "{{name}}"' }],
  scopeFrom: '@taman/',
  scripts: ['publint'],
  workspacePackages: ['internal/*'],
};

function snapshot() {
  return new Map<string, string | Uint8Array>([
    ['package.json', pkg({ name: '@taman/monorepo', private: true, scripts: { dev: 'nx', publint: 'publint' }, devDependencies: { '@vinicunca/tsconfig': 'workspace:*' } })],
    ['pnpm-workspace.yaml', 'packages:\n  - internal/*\n  - apps/*\n\ncatalog:\n  vue: ^3.5.0\n'],
    ['internal/tsconfig/package.json', pkg({ name: '@vinicunca/tsconfig', version: '1.0.1' })],
    ['apps/web/package.json', pkg({ name: '@taman/web', private: true })],
    ['apps/web/src/main.ts', 'import \'@taman/web\';\n'],
    ['CLAUDE.md', '# repo notes'],
  ]);
}

describe('applyManifest', () => {
  it('produces a renamed project without the removed parts', () => {
    const { files, errors, warnings } = applyManifest(snapshot(), manifest, names);

    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect([...files.keys()].sort()).toEqual(['apps/web/package.json', 'apps/web/src/main.ts', 'package.json', 'pnpm-workspace.yaml']);

    const root = JSON.parse(files.get('package.json') as string);
    expect(root.name).toBe('my-app');
    expect(root.scripts).toEqual({ dev: 'nx' });
    expect(root.devDependencies['@vinicunca/tsconfig']).toBe('catalog:');

    expect(JSON.parse(files.get('apps/web/package.json') as string).name).toBe('@acme/web');
    expect(files.get('apps/web/src/main.ts')).toBe('import \'@acme/web\';\n');
    expect(files.get('pnpm-workspace.yaml')).not.toContain('internal/*');
    expect(files.get('pnpm-workspace.yaml')).toContain('  \'@vinicunca/tsconfig\': ^1.0.1');
  });

  it('re-sorts dependency keys the scope rename moved', () => {
    const files = snapshot();
    files.set('apps/web/package.json', pkg({
      name: '@taman/web',
      private: true,
      dependencies: { '@internationalized/date': '^3.0.0', '@taman/utils': 'workspace:*', 'vue': 'catalog:' },
    }));
    files.set('packages/utils/package.json', pkg({ name: '@taman/utils', private: true }));

    const { files: result } = applyManifest(files, manifest, names);

    expect(Object.keys(JSON.parse(result.get('apps/web/package.json') as string).dependencies)).toEqual([
      '@acme/utils',
      '@internationalized/date',
      'vue',
    ]);
  });

  it('drops catalog entries only removed packages used', () => {
    const files = snapshot();
    files.set('pnpm-workspace.yaml', 'packages:\n  - internal/*\n  - apps/*\n\ncatalog:\n  clsx: ^2.0.0\n  tsdown: ^0.22.0\n  vue: ^3.5.0\n\noverrides:\n  clsx: \'catalog:\'\n');
    files.set('internal/tsconfig/package.json', pkg({ name: '@vinicunca/tsconfig', version: '1.0.1', devDependencies: { tsdown: 'catalog:' } }));
    files.set('apps/web/package.json', pkg({ name: '@taman/web', private: true, dependencies: { vue: 'catalog:' } }));

    const catalog = applyManifest(files, manifest, names).files.get('pnpm-workspace.yaml') as string;

    expect(catalog).toContain('  vue: ^3.5.0');
    expect(catalog).toContain('  clsx: ^2.0.0');
    expect(catalog).not.toContain('tsdown');
  });

  it('collects manifest drift as errors', () => {
    const drifted = { ...manifest, rename: [{ file: 'package.json', from: '"name": "@taman/other"', to: 'x' }] };

    expect(applyManifest(snapshot(), drifted, names).errors).toEqual(['rename: ""name": "@taman/other"" not found in package.json']);
  });

  it('reports remove globs and workspace entries that match nothing', () => {
    const drifted = { ...manifest, remove: [...manifest.remove, 'tooling/**'], workspacePackages: ['internal/*', 'tooling/*'] };

    expect(applyManifest(snapshot(), drifted, names).errors).toEqual([
      'remove: "tooling/**" matches no files',
      'workspacePackages: "- tooling/*" is not in pnpm-workspace.yaml',
    ]);
  });

  it('reports text files where the old scope survives', () => {
    const files = new Map<string, string | Uint8Array>([
      ['a.ts', 'import \'@taman/web\';\n'],
      ['b.ts', 'import \'@acme/web\';\n'],
      ['c.bin', new Uint8Array([64, 116, 97])],
    ]);

    expect(findLeftovers(files, '@taman/')).toEqual(['a.ts']);
  });
});
